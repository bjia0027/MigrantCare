const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')
const cors = require('cors')
const Joi = require('joi')

// Initialize Firebase Admin
admin.initializeApp()

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key')

// CORS configuration
const corsHandler = cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://migrant-care.vercel.app',
    'https://migrantcare.com',
    'https://www.migrantcare.com',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.firebaseapp\.com$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
})

// In-memory storage for idempotency (in production, use Redis or Firestore)
const requestHistory = new Map()
const rateLimitStore = new Map()

// Utility functions
const createStructuredLog = (uid, path, status, latency, errorCode = null, requestId = null) => {
  return {
    timestamp: new Date().toISOString(),
    uid: uid || 'anonymous',
    path,
    latency,
    status,
    errorCode,
    requestId,
    level: status >= 400 ? 'error' : 'info'
  }
}

const logToFirestore = async (logData) => {
  try {
    await admin.firestore().collection('auditLogs').add(logData)
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

// Authentication middleware
const authenticateUser = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED')
  }

  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    throw new Error('INVALID_TOKEN')
  }
}

// Rate limiting middleware
const checkRateLimit = (uid, ip, endpoint, maxRequests = 10, windowMs = 60000) => {
  const key = `${uid || ip}_${endpoint}`
  const now = Date.now()
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  const record = rateLimitStore.get(key)
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Input validation schemas
const sendEmailSchema = Joi.object({
  recipient: Joi.string().email().required(),
  subject: Joi.string().min(1).max(200).required(),
  body: Joi.string().min(1).max(10000).required(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    path: Joi.string().required(),
    type: Joi.string().required(),
    size: Joi.number().max(10 * 1024 * 1024) // 10MB limit
  })).max(5).optional(),
  requestId: Joi.string().uuid().required()
})

const reportsSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').optional(),
  clinicId: Joi.string().optional()
})

const auditLogSchema = Joi.object({
  action: Joi.string().valid('login', 'logout', 'email_sent', 'data_export', 'data_change').required(),
  details: Joi.object().optional(),
  requestId: Joi.string().uuid().optional()
})

// Bulk email schema
const bulkEmailSchema = Joi.object({
  recipients: Joi.array().items(Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().optional(),
    phone: Joi.string().optional()
  })).min(1).max(1000).required(),
  subject: Joi.string().min(1).max(200).required(),
  body: Joi.string().min(1).max(10000).required(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    path: Joi.string().required(),
    type: Joi.string().required(),
    size: Joi.number().max(10 * 1024 * 1024)
  })).max(5).optional(),
  batchSize: Joi.number().min(1).max(50).default(10),
  delayBetweenBatches: Joi.number().min(1000).max(60000).default(2000),
  requestId: Joi.string().uuid().required()
})

// In-memory storage for bulk email progress
const bulkEmailProgress = new Map()

// Cloud Function 1: Send Email with Security & Idempotency
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now()
  let user = null
  let logData = null
  
  return corsHandler(req, res, async () => {
    try {
      // Method validation
      if (req.method !== 'POST') {
        const latency = Date.now() - startTime
        logData = createStructuredLog(null, '/api/send-email', 405, latency, 'METHOD_NOT_ALLOWED')
        await logToFirestore(logData)
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
      }

      // Authentication
      try {
        user = await authenticateUser(req)
      } catch (error) {
        const latency = Date.now() - startTime
        const errorCode = error.message === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'INVALID_TOKEN'
        logData = createStructuredLog(null, '/api/send-email', 401, latency, errorCode)
        await logToFirestore(logData)
        return res.status(401).json({ error: 'Authentication failed', code: errorCode })
      }

      // Rate limiting
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      if (!checkRateLimit(user.uid, clientIP, 'send-email', 5, 300000)) { // 5 emails per 5 minutes
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/send-email', 429, latency, 'RATE_LIMIT_EXCEEDED')
        await logToFirestore(logData)
        return res.status(429).json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' })
      }

      // Input validation
      const { error, value } = sendEmailSchema.validate(req.body)
      if (error) {
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/send-email', 400, latency, 'VALIDATION_ERROR')
        await logToFirestore(logData)
        return res.status(400).json({ 
          error: 'Validation failed', 
          code: 'VALIDATION_ERROR',
          details: error.details.map(d => d.message)
        })
      }

      const { recipient, subject, body, attachments, requestId } = value

      // Idempotency check
      if (requestHistory.has(requestId)) {
        const existingResult = requestHistory.get(requestId)
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/send-email', 200, latency, null, requestId)
        logData.idempotent = true
        await logToFirestore(logData)
        return res.status(200).json(existingResult)
      }

      // Process attachments from Firebase Storage
      let processedAttachments = []
      if (attachments && attachments.length > 0) {
        try {
          for (const attachment of attachments) {
            const file = admin.storage().bucket().file(attachment.path)
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 5 * 60 * 1000,
            })

            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = await response.arrayBuffer()
            processedAttachments.push({
              content: Buffer.from(buffer).toString('base64'),
              filename: attachment.filename,
              type: attachment.type,
              disposition: 'attachment',
            })
          }
        } catch (attachmentError) {
          const latency = Date.now() - startTime
          logData = createStructuredLog(user.uid, '/api/send-email', 500, latency, 'ATTACHMENT_PROCESSING_ERROR', requestId)
          await logToFirestore(logData)
          
          const failureResult = {
            success: false,
            error: 'Failed to process attachments',
            code: 'ATTACHMENT_PROCESSING_ERROR',
            requestId
          }
          requestHistory.set(requestId, failureResult)
          return res.status(500).json(failureResult)
        }
      }

      // Send email via SendGrid
      const msg = {
        to: recipient,
        from: 'noreply@migrantcare.com',
        subject,
        html: body,
        attachments: processedAttachments,
      }

      const [response] = await sgMail.send(msg)
      const messageId = response.headers['x-message-id'] || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const successResult = {
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
        requestId
      }
      
      // Store for idempotency
      requestHistory.set(requestId, successResult)
      
      // Log success
      const latency = Date.now() - startTime
      logData = createStructuredLog(user.uid, '/api/send-email', 200, latency, null, requestId)
      logData.messageId = messageId
      logData.recipient = recipient
      await logToFirestore(logData)
      
      // Log audit trail
      await logToFirestore({
        timestamp: new Date().toISOString(),
        uid: user.uid,
        action: 'email_sent',
        details: { recipient, subject, messageId },
        requestId
      })

      return res.status(200).json(successResult)
      
    } catch (error) {
      console.error('Email sending error:', error)
      
      const latency = Date.now() - startTime
      logData = createStructuredLog(user?.uid, '/api/send-email', 500, latency, 'INTERNAL_ERROR', req.body?.requestId)
      await logToFirestore(logData)
      
      const failureResult = {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        requestId: req.body?.requestId
      }
      
      if (req.body?.requestId) {
        requestHistory.set(req.body.requestId, failureResult)
      }
      
      return res.status(500).json(failureResult)
    }
  })
})

// Cloud Function 2: Appointment Reports with Business Logic
exports.getAppointmentReports = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now()
  let user = null
  
  return corsHandler(req, res, async () => {
    try {
      // Method validation
      if (req.method !== 'GET') {
        const latency = Date.now() - startTime
        const logData = createStructuredLog(null, '/api/reports/appointments', 405, latency, 'METHOD_NOT_ALLOWED')
        await logToFirestore(logData)
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
      }

      // Authentication
      try {
        user = await authenticateUser(req)
      } catch (error) {
        const latency = Date.now() - startTime
        const errorCode = error.message === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'INVALID_TOKEN'
        const logData = createStructuredLog(null, '/api/reports/appointments', 401, latency, errorCode)
        await logToFirestore(logData)
        return res.status(401).json({ error: 'Authentication failed', code: errorCode })
      }

      // Input validation
      const { error, value } = reportsSchema.validate(req.query)
      if (error) {
        const latency = Date.now() - startTime
        const logData = createStructuredLog(user.uid, '/api/reports/appointments', 400, latency, 'VALIDATION_ERROR')
        await logToFirestore(logData)
        return res.status(400).json({ 
          error: 'Validation failed', 
          code: 'VALIDATION_ERROR',
          details: error.details.map(d => d.message)
        })
      }

      const { startDate, endDate, status, clinicId } = value

      // Build Firestore query
      let query = admin.firestore().collection('appointments')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)))
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)))

      if (status) {
        query = query.where('status', '==', status)
      }
      if (clinicId) {
        query = query.where('clinicId', '==', clinicId)
      }

      const snapshot = await query.get()
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Business logic: Aggregate statistics
      const stats = {
        totalAppointments: appointments.length,
        statusBreakdown: {},
        clinicBreakdown: {},
        averageWaitTime: 0,
        topClinics: [],
        dailyTrends: {},
        completionRate: 0
      }

      // Calculate status breakdown
      appointments.forEach(apt => {
        stats.statusBreakdown[apt.status] = (stats.statusBreakdown[apt.status] || 0) + 1
        stats.clinicBreakdown[apt.clinicName || 'Unknown'] = (stats.clinicBreakdown[apt.clinicName || 'Unknown'] || 0) + 1
        
        // Daily trends
        const date = apt.createdAt.toDate().toISOString().split('T')[0]
        stats.dailyTrends[date] = (stats.dailyTrends[date] || 0) + 1
      })

      // Calculate average wait time (for completed appointments)
      const completedAppointments = appointments.filter(apt => apt.status === 'completed' && apt.waitTime)
      if (completedAppointments.length > 0) {
        const totalWaitTime = completedAppointments.reduce((sum, apt) => sum + (apt.waitTime || 0), 0)
        stats.averageWaitTime = Math.round(totalWaitTime / completedAppointments.length)
      }

      // Calculate completion rate
      const completedCount = stats.statusBreakdown.completed || 0
      stats.completionRate = appointments.length > 0 ? Math.round((completedCount / appointments.length) * 100) : 0

      // Top clinics by appointment count
      stats.topClinics = Object.entries(stats.clinicBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

      // Chart-friendly data structure
      const chartData = {
        statusChart: Object.entries(stats.statusBreakdown).map(([status, count]) => ({ status, count })),
        dailyTrendChart: Object.entries(stats.dailyTrends)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count })),
        clinicChart: stats.topClinics
      }

      const result = {
        success: true,
        data: {
          summary: stats,
          charts: chartData,
          rawCount: appointments.length,
          dateRange: { startDate, endDate },
          filters: { status, clinicId }
        },
        timestamp: new Date().toISOString()
      }

      // Log success
      const latency = Date.now() - startTime
      const logData = createStructuredLog(user.uid, '/api/reports/appointments', 200, latency)
      logData.recordsProcessed = appointments.length
      await logToFirestore(logData)

      return res.status(200).json(result)
      
    } catch (error) {
      console.error('Reports error:', error)
      
      const latency = Date.now() - startTime
      const logData = createStructuredLog(user?.uid, '/api/reports/appointments', 500, latency, 'INTERNAL_ERROR')
      await logToFirestore(logData)
      
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    }
  })
})

// Cloud Function 3: Audit Log Management
exports.auditLog = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now()
  let user = null
  
  return corsHandler(req, res, async () => {
    try {
      // Authentication
      try {
        user = await authenticateUser(req)
      } catch (error) {
        const latency = Date.now() - startTime
        const errorCode = error.message === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'INVALID_TOKEN'
        const logData = createStructuredLog(null, '/api/audit-log', 401, latency, errorCode)
        await logToFirestore(logData)
        return res.status(401).json({ error: 'Authentication failed', code: errorCode })
      }

      if (req.method === 'POST') {
        // Create audit log entry
        const { error, value } = auditLogSchema.validate(req.body)
        if (error) {
          const latency = Date.now() - startTime
          const logData = createStructuredLog(user.uid, '/api/audit-log', 400, latency, 'VALIDATION_ERROR')
          await logToFirestore(logData)
          return res.status(400).json({ 
            error: 'Validation failed', 
            code: 'VALIDATION_ERROR',
            details: error.details.map(d => d.message)
          })
        }

        const { action, details, requestId } = value
        
        const auditEntry = {
          timestamp: new Date().toISOString(),
          uid: user.uid,
          email: user.email,
          action,
          details: details || {},
          requestId,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }

        const docRef = await admin.firestore().collection('auditLogs').add(auditEntry)
        
        const latency = Date.now() - startTime
        const logData = createStructuredLog(user.uid, '/api/audit-log', 201, latency, null, requestId)
        await logToFirestore(logData)
        
        return res.status(201).json({
          success: true,
          id: docRef.id,
          timestamp: auditEntry.timestamp
        })
        
      } else if (req.method === 'GET') {
        // Query audit logs
        const { startDate, endDate, uid: filterUid, action, limit = 100, offset = 0 } = req.query
        
        // Check if user has admin privileges for viewing other users' logs
        const canViewAllLogs = user.admin || false // You can implement custom claims check here
        
        let query = admin.firestore().collection('auditLogs')
        
        // If not admin, only show own logs
        if (!canViewAllLogs) {
          query = query.where('uid', '==', user.uid)
        } else if (filterUid) {
          query = query.where('uid', '==', filterUid)
        }
        
        if (action) {
          query = query.where('action', '==', action)
        }
        
        if (startDate) {
          query = query.where('timestamp', '>=', startDate)
        }
        
        if (endDate) {
          query = query.where('timestamp', '<=', endDate)
        }
        
        query = query.orderBy('timestamp', 'desc').limit(parseInt(limit)).offset(parseInt(offset))
        
        const snapshot = await query.get()
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const result = {
          success: true,
          data: logs,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: logs.length
          },
          timestamp: new Date().toISOString()
        }
        
        const latency = Date.now() - startTime
        const logData = createStructuredLog(user.uid, '/api/audit-log', 200, latency)
        logData.recordsReturned = logs.length
        await logToFirestore(logData)
        
        return res.status(200).json(result)
        
      } else {
        const latency = Date.now() - startTime
        const logData = createStructuredLog(user.uid, '/api/audit-log', 405, latency, 'METHOD_NOT_ALLOWED')
        await logToFirestore(logData)
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
      }
      
    } catch (error) {
      console.error('Audit log error:', error)
      
      const latency = Date.now() - startTime
      const logData = createStructuredLog(user?.uid, '/api/audit-log', 500, latency, 'INTERNAL_ERROR')
      await logToFirestore(logData)
      
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    }
  })
})

// Firebase Auth triggers
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || '',
      photoURL: user.photoURL || null,
      role: 'user', // 默认角色为普通用户
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        language: 'zh',
        notifications: true,
        emailUpdates: true
      },
      profile: {
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: null,
        address: '',
        emergencyContact: ''
      }
    }

    // 检查是否为管理员邮箱
    if (user.email && (user.email.includes('admin') || user.email === 'admin@migrantcare.com')) {
      userData.role = 'admin'
    }

    await admin.firestore().collection('users').doc(user.uid).set(userData)
    
    console.log('User document created successfully:', user.uid)
    
    // 记录用户创建日志
    await admin.firestore().collection('auditLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      uid: user.uid,
      action: 'user_created',
      details: {
        email: user.email,
        role: userData.role
      },
      level: 'info'
    })
    
  } catch (error) {
    console.error('Error creating user document:', error)
    
    // 记录错误日志
    await admin.firestore().collection('auditLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      uid: user.uid,
      action: 'user_creation_failed',
      details: {
        error: error.message,
        email: user.email
      },
      level: 'error'
    })
  }
})

// Legacy functions for backward compatibility
exports.onUserDelete = functions.auth.user().onDelete((user) => {
  console.log('User deleted:', user.uid)
  return admin.firestore().collection('users').doc(user.uid).delete()
})

exports.logUserLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { uid, email } = context.auth
  const loginRecord = {
    uid,
    email,
    action: 'login',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: data.ip || 'unknown',
  }

  return admin.firestore().collection('authLogs').add(loginRecord)
})

exports.logUserLogout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { uid, email } = context.auth
  const logoutRecord = {
    uid,
    email,
    action: 'logout',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: data.ip || 'unknown',
  }

  return admin.firestore().collection('authLogs').add(logoutRecord)
})

exports.getAuthLogs = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userRecord = await admin.auth().getUser(context.auth.uid)
  if (!userRecord.customClaims || !userRecord.customClaims.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required')
  }

  const logsSnapshot = await admin
    .firestore()
    .collection('authLogs')
    .orderBy('timestamp', 'desc')
    .limit(data.limit || 100)
    .get()

  return logsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
})

// Bulk Email Function with Batch Processing and Progress Tracking
exports.bulkEmail = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now()
  let user = null
  let logData = null
  
  return corsHandler(req, res, async () => {
    try {
      // Method validation
      if (req.method !== 'POST') {
        const latency = Date.now() - startTime
        logData = createStructuredLog(null, '/api/bulk-email', 405, latency, 'METHOD_NOT_ALLOWED')
        await logToFirestore(logData)
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
      }

      // Authentication
      try {
        user = await authenticateUser(req)
      } catch (error) {
        const latency = Date.now() - startTime
        const errorCode = error.message === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'INVALID_TOKEN'
        logData = createStructuredLog(null, '/api/bulk-email', 401, latency, errorCode)
        await logToFirestore(logData)
        return res.status(401).json({ error: 'Authentication failed', code: errorCode })
      }

      // Rate limiting (stricter for bulk emails)
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      if (!checkRateLimit(user.uid, clientIP, 'bulk-email', 2, 3600000)) { // 2 bulk emails per hour
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/bulk-email', 429, latency, 'RATE_LIMIT_EXCEEDED')
        await logToFirestore(logData)
        return res.status(429).json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' })
      }

      // Input validation
      const { error, value } = bulkEmailSchema.validate(req.body)
      if (error) {
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/bulk-email', 400, latency, 'VALIDATION_ERROR')
        await logToFirestore(logData)
        return res.status(400).json({ 
          error: 'Validation failed', 
          code: 'VALIDATION_ERROR',
          details: error.details.map(d => d.message)
        })
      }

      const { recipients, subject, body, attachments, batchSize, delayBetweenBatches, requestId } = value

      // Idempotency check
      if (requestHistory.has(requestId)) {
        const existingResult = requestHistory.get(requestId)
        const latency = Date.now() - startTime
        logData = createStructuredLog(user.uid, '/api/bulk-email', 200, latency, null, requestId)
        logData.idempotent = true
        await logToFirestore(logData)
        return res.status(200).json(existingResult)
      }

      // Initialize progress tracking
      const progressData = {
        requestId,
        uid: user.uid,
        total: recipients.length,
        sent: 0,
        failed: 0,
        inProgress: true,
        startTime: new Date().toISOString(),
        batches: Math.ceil(recipients.length / batchSize),
        currentBatch: 0,
        errors: []
      }
      
      bulkEmailProgress.set(requestId, progressData)

      // Process attachments (same as single email)
      let processedAttachments = []
      if (attachments && attachments.length > 0) {
        try {
          for (const attachment of attachments) {
            const file = admin.storage().bucket().file(attachment.path)
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 5 * 60 * 1000,
            })

            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`Failed to download file: ${response.statusText}`)
            }

            const buffer = await response.arrayBuffer()
            processedAttachments.push({
              content: Buffer.from(buffer).toString('base64'),
              filename: attachment.filename,
              type: attachment.type,
              disposition: 'attachment',
            })
          }
        } catch (attachmentError) {
          const latency = Date.now() - startTime
          logData = createStructuredLog(user.uid, '/api/bulk-email', 500, latency, 'ATTACHMENT_PROCESSING_ERROR', requestId)
          await logToFirestore(logData)
          
          progressData.inProgress = false
          progressData.error = 'Failed to process attachments'
          
          const failureResult = {
            success: false,
            error: 'Failed to process attachments',
            code: 'ATTACHMENT_PROCESSING_ERROR',
            requestId,
            progress: progressData
          }
          requestHistory.set(requestId, failureResult)
          return res.status(500).json(failureResult)
        }
      }

      // Start async bulk sending process
      setImmediate(async () => {
        await processBulkEmail({
          recipients,
          subject,
          body,
          processedAttachments,
          batchSize,
          delayBetweenBatches,
          requestId,
          user,
          progressData
        })
      })

      // Return immediate response with progress tracking info
      const initialResult = {
        success: true,
        message: 'Bulk email processing started',
        requestId,
        progress: {
          total: recipients.length,
          sent: 0,
          failed: 0,
          inProgress: true
        }
      }
      
      requestHistory.set(requestId, initialResult)
      
      const latency = Date.now() - startTime
      logData = createStructuredLog(user.uid, '/api/bulk-email', 202, latency, null, requestId)
      logData.recipientCount = recipients.length
      await logToFirestore(logData)
      
      return res.status(202).json(initialResult)
      
    } catch (error) {
      console.error('Bulk email error:', error)
      
      const latency = Date.now() - startTime
      logData = createStructuredLog(user?.uid, '/api/bulk-email', 500, latency, 'INTERNAL_ERROR', req.body?.requestId)
      await logToFirestore(logData)
      
      const failureResult = {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        requestId: req.body?.requestId
      }
      
      if (req.body?.requestId) {
        requestHistory.set(req.body.requestId, failureResult)
        if (bulkEmailProgress.has(req.body.requestId)) {
          const progress = bulkEmailProgress.get(req.body.requestId)
          progress.inProgress = false
          progress.error = 'Internal server error'
        }
      }
      
      return res.status(500).json(failureResult)
    }
  })
})

// Helper function to process bulk emails in batches
const processBulkEmail = async ({
  recipients,
  subject,
  body,
  processedAttachments,
  batchSize,
  delayBetweenBatches,
  requestId,
  user,
  progressData
}) => {
  try {
    // Create batches
    const batches = []
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      progressData.currentBatch = batchIndex + 1
      
      // Process batch in parallel
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Replace variables in subject and body
          const personalizedSubject = replaceEmailVariables(subject, recipient, user)
          const personalizedBody = replaceEmailVariables(body, recipient, user)
          
          const msg = {
            to: recipient.email,
            from: 'noreply@migrantcare.com',
            subject: personalizedSubject,
            html: personalizedBody,
            attachments: processedAttachments,
          }

          const [response] = await sgMail.send(msg)
          const messageId = response.headers['x-message-id'] || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          progressData.sent++
          
          // Log individual email success
          await logToFirestore({
            timestamp: new Date().toISOString(),
            uid: user.uid,
            action: 'bulk_email_sent',
            details: { 
              recipient: recipient.email, 
              subject: personalizedSubject, 
              messageId,
              bulkRequestId: requestId
            },
            requestId: `${requestId}_${recipient.email}`
          })
          
          return { success: true, recipient: recipient.email, messageId }
          
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient.email}:`, emailError)
          progressData.failed++
          progressData.errors.push({
            recipient: recipient.email,
            error: emailError.message,
            timestamp: new Date().toISOString()
          })
          
          return { success: false, recipient: recipient.email, error: emailError.message }
        }
      })
      
      await Promise.all(batchPromises)
      
      // Delay between batches (except for the last batch)
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }
    
    // Mark as completed
    progressData.inProgress = false
    progressData.endTime = new Date().toISOString()
    
    // Update final result
    const finalResult = {
      success: true,
      message: 'Bulk email completed',
      requestId,
      progress: {
        total: progressData.total,
        sent: progressData.sent,
        failed: progressData.failed,
        inProgress: false,
        completed: true
      },
      summary: {
        totalRecipients: progressData.total,
        successfulSends: progressData.sent,
        failedSends: progressData.failed,
        batchesProcessed: progressData.batches,
        startTime: progressData.startTime,
        endTime: progressData.endTime
      }
    }
    
    requestHistory.set(requestId, finalResult)
    
    // Log completion
    await logToFirestore({
      timestamp: new Date().toISOString(),
      uid: user.uid,
      action: 'bulk_email_completed',
      details: {
        requestId,
        totalRecipients: progressData.total,
        successfulSends: progressData.sent,
        failedSends: progressData.failed
      }
    })
    
  } catch (error) {
    console.error('Bulk email processing error:', error)
    progressData.inProgress = false
    progressData.error = error.message
    
    const errorResult = {
      success: false,
      error: 'Bulk email processing failed',
      code: 'PROCESSING_ERROR',
      requestId,
      progress: progressData
    }
    
    requestHistory.set(requestId, errorResult)
  }
}

// Helper function to replace variables in email content
const replaceEmailVariables = (text, recipient, user) => {
  const now = new Date()
  const variables = {
    name: recipient.name || recipient.email.split('@')[0],
    email: recipient.email,
    phone: recipient.phone || '',
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    sender: user.name || user.email || 'MigrantCare 团队'
  }
  
  let result = text
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, variables[key])
  })
  
  return result
}

// Get bulk email progress
exports.getBulkEmailProgress = functions.https.onRequest(async (req, res) => {
  const startTime = Date.now()
  let user = null
  
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
      }

      // Authentication
      try {
        user = await authenticateUser(req)
      } catch (error) {
        return res.status(401).json({ error: 'Authentication failed', code: 'UNAUTHORIZED' })
      }

      const requestId = req.query.requestId
      if (!requestId) {
        return res.status(400).json({ error: 'Request ID is required', code: 'MISSING_REQUEST_ID' })
      }

      const progress = bulkEmailProgress.get(requestId)
      if (!progress) {
        return res.status(404).json({ error: 'Progress not found', code: 'PROGRESS_NOT_FOUND' })
      }

      // Check if user owns this request
      if (progress.uid !== user.uid) {
        return res.status(403).json({ error: 'Access denied', code: 'ACCESS_DENIED' })
      }

      return res.status(200).json({
        success: true,
        requestId,
        progress: {
          total: progress.total,
          sent: progress.sent,
          failed: progress.failed,
          inProgress: progress.inProgress,
          currentBatch: progress.currentBatch,
          totalBatches: progress.batches,
          errors: progress.errors.slice(-10) // Return last 10 errors
        }
      })
      
    } catch (error) {
      console.error('Get bulk email progress error:', error)
      return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
    }
  })
})
