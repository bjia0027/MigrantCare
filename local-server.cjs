// Local server to test cloud functions
const express = require('express')
const cors = require('cors')
const app = express()
const port = 5001

// Set environment variables
process.env.SENDGRID_API_KEY = 'SG.test-api-key'
process.env.GOOGLE_APPLICATION_CREDENTIALS = './test-credentials.json'

// Middleware
app.use(cors())
app.use(express.json())

// Mock Firebase Admin
const mockAdmin = {
  initializeApp: () => {},
  auth: () => ({
    verifyIdToken: async (token) => {
      if (token === 'valid-token') {
        return { uid: 'test-user', email: 'test@example.com' }
      }
      throw new Error('Invalid token')
    }
  }),
  firestore: () => ({
    collection: () => ({
      add: async (data) => ({ id: 'mock-doc-id' }),
      where: () => ({
        where: () => ({
          get: async () => ({ docs: [] })
        }),
        get: async () => ({ docs: [] })
      }),
      orderBy: () => ({
        limit: () => ({
          offset: () => ({
            get: async () => ({ docs: [] })
          })
        })
      })
    })
  })
}

// Mock SendGrid
const mockSgMail = {
  setApiKey: () => {},
  send: async () => [{ headers: { 'x-message-id': 'test-message-id' } }]
}

// Mock Joi - Create chainable methods
const createChainableMock = () => {
  const mock = {
    email: () => mock,
    min: () => mock,
    max: () => mock,
    required: () => mock,
    optional: () => mock,
    valid: () => mock,
    uuid: () => mock,
    iso: () => mock,
    items: () => mock
  }
  return mock
}

const mockJoi = {
  object: (schema) => {
    const obj = {
      validate: (data) => {
        if (!data.recipient || !data.subject || !data.body || !data.requestId) {
          return {
            error: {
              details: [{ message: 'Missing required fields' }]
            }
          }
        }
        return { value: data }
      },
      optional: () => obj,
      required: () => obj
    }
    return obj
  },
  string: () => createChainableMock(),
  array: () => createChainableMock(),
  date: () => createChainableMock(),
  number: () => createChainableMock(),
  ref: (path) => ({ toString: () => path })
}

// Override require to use mocks
const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id === 'firebase-admin') return mockAdmin
  if (id === '@sendgrid/mail') return mockSgMail
  if (id === 'joi') return mockJoi
  return originalRequire.apply(this, arguments)
}

// Load functions
try {
  const functions = require('./functions/index.js')
  
  // Create HTTP wrapper for cloud functions
  const wrapCloudFunction = (cloudFunction) => {
    return async (req, res) => {
      try {
        await cloudFunction(req, res)
      } catch (error) {
        console.error('Function error:', error)
        res.status(500).json({ error: error.message })
      }
    }
  }
  
  // Mount cloud functions as HTTP endpoints
  app.post('/sendEmail', wrapCloudFunction(functions.sendEmail))
  app.get('/getAppointmentReports', wrapCloudFunction(functions.getAppointmentReports))
  app.get('/auditLog', wrapCloudFunction(functions.auditLog))
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      functions: ['sendEmail', 'getAppointmentReports', 'auditLog']
    })
  })
  
  // Start server
  app.listen(port, () => {
    console.log('🚀 Local Cloud Functions Server Started!')
    console.log('==================================================')
    console.log(`📍 Server running at: http://localhost:${port}`)
    console.log('\n📋 Available Endpoints:')
    console.log(`  POST http://localhost:${port}/sendEmail`)
    console.log(`  GET  http://localhost:${port}/getAppointmentReports`)
    console.log(`  GET  http://localhost:${port}/auditLog`)
    console.log(`  GET  http://localhost:${port}/health`)
    console.log('\n🔧 Test Commands:')
    console.log('  # Health Check')
    console.log(`  curl http://localhost:${port}/health`)
    console.log('\n  # Send Email (with auth)')
    console.log(`  curl -X POST http://localhost:${port}/sendEmail \\`)
    console.log('    -H "Content-Type: application/json" \\')
    console.log('    -H "Authorization: Bearer valid-token" \\')
    console.log('    -d "{\\"recipient\\":\\"test@example.com\\",\\"subject\\":\\"Test\\",\\"body\\":\\"Hello\\",\\"requestId\\":\\"550e8400-e29b-41d4-a716-446655440000\\"}"')
    console.log('\n  # Get Reports (with auth)')
    console.log(`  curl "http://localhost:${port}/getAppointmentReports?startDate=2023-12-01&endDate=2023-12-31" \\`)
    console.log('    -H "Authorization: Bearer valid-token"')
    console.log('\n✨ Server ready for testing!')
  })
  
} catch (error) {
  console.error('❌ Failed to load functions:', error.message)
  process.exit(1)
}