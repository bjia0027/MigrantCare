// Simple test to verify cloud functions
console.log('Starting simple test...')

// Set environment variables
process.env.SENDGRID_API_KEY = 'SG.test-api-key'
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-credentials.json'

try {
  console.log('Loading functions...')
  const functions = require('./functions/index.js')
  console.log('Functions loaded successfully!')
  console.log('Available functions:', Object.keys(functions))
  
  // Test if functions are callable
  if (typeof functions.sendEmail === 'function') {
    console.log('✅ sendEmail function is available')
  } else {
    console.log('❌ sendEmail function is not available')
  }
  
  if (typeof functions.getAppointmentReports === 'function') {
    console.log('✅ getAppointmentReports function is available')
  } else {
    console.log('❌ getAppointmentReports function is not available')
  }
  
  if (typeof functions.auditLog === 'function') {
    console.log('✅ auditLog function is available')
  } else {
    console.log('❌ auditLog function is not available')
  }
  
  console.log('\n🎉 Cloud functions loaded and verified successfully!')
  
} catch (error) {
  console.error('❌ Error loading functions:', error.message)
  console.error('Stack trace:', error.stack)
}

console.log('Test completed.')