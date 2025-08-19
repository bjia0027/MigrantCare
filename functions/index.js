const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')
const cors = require('cors')

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

admin.initializeApp()

sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key')

const requestHistory = new Map()

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
      }

      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const idToken = authHeader.split('Bearer ')[1]

      try {
        await admin.auth().verifyIdToken(idToken)
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { to, subject, text, html, attachments, requestId } = req.body

      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      if (requestHistory.has(requestId)) {
        const existingResult = requestHistory.get(requestId)
        if (existingResult.success) {
          return res.status(200).json(existingResult)
        } else {
          return res.status(500).json(existingResult)
        }
      }

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
          console.error('Attachment processing error:', attachmentError)

          const failureResult = {
            success: false,
            error: 'Failed to process attachments',
            details: attachmentError.message,
          }
          requestHistory.set(requestId, failureResult)
          return res.status(500).json(failureResult)
        }
      }

      const msg = {
        to,
        from: 'noreply@migrantcare.com',
        subject,
        text,
        html,
        attachments: processedAttachments,
      }

      await sgMail.send(msg)

      const successResult = {
        success: true,
        message: 'Email sent successfully',
        timestamp: new Date().toISOString(),
      }
      requestHistory.set(requestId, successResult)

      return res.status(200).json(successResult)
    } catch (error) {
      console.error('Email sending error:', error)

      const failureResult = {
        success: false,
        error: 'Failed to send email',
        details: error.message,
      }
      requestHistory.set(requestId, failureResult)

      try {
        const fallbackMsg = {
          to: req.body.to,
          from: 'noreply@migrantcare.com',
          subject: req.body.subject,
          text: req.body.text + '\n\n[Note: Original attachments could not be included]',
          html:
            req.body.html + '<p><em>[Note: Original attachments could not be included]</em></p>',
        }

        await sgMail.send(fallbackMsg)

        const fallbackResult = {
          success: true,
          message: 'Email sent without attachments',
          warning: 'Attachments could not be processed',
        }
        requestHistory.set(requestId, fallbackResult)
        return res.status(200).json(fallbackResult)
      } catch (fallbackError) {
        console.error('Fallback email error:', fallbackError)
        return res.status(500).json(failureResult)
      }
    }
  })
})

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
