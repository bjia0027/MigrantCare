// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore, enableNetwork, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo-app-id',
}

const shouldUseEmulator =
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
  (import.meta.env.DEV && (firebaseConfig.projectId === 'demo-project' || firebaseConfig.apiKey === 'demo-api-key'))

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  useEmulator: shouldUseEmulator,
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// 开发环境下使用会话持久化（关闭页面即登出）
if (import.meta.env.DEV) {
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      console.log('Auth persistence set to SESSION for development environment')
    })
    .catch((err) => {
      console.warn('Failed to set SESSION persistence in development:', err?.message || err)
    })
}

// Configure Firestore settings with better error handling
try {
  console.log('Initializing Firestore...')

  if (shouldUseEmulator) {
    // 连接本地 Firestore Emulator
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8080)
      console.log('Connected to Firestore Emulator at 127.0.0.1:8080')
    } catch (e) {
      console.warn('Failed to connect Firestore Emulator:', e?.message || e)
    }
  } else {
    // Only enable network if not using emulator
    enableNetwork(db)
      .then(() => {
        console.log('Firestore network enabled successfully')
      })
      .catch((error) => {
        console.warn('Firestore network enable failed, but app will continue:', error.message)
      })
  }
} catch (error) {
  console.warn('Firestore initialization warning (app will continue):', error.message)
}

export { auth, db, storage }
