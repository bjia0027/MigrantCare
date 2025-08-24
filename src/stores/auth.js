import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'



export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authReady = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.uid || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')
  const userDisplayName = computed(() => user.value?.displayName || '')
  const isAdmin = computed(() => {
    if (!user.value) return false
    return user.value.role === 'admin' || user.value.email === 'admin@migrantcare.com'
  })

  function initAuthListener() {
    return new Promise((resolve) => {
      console.log('Initializing auth listener...')
      loading.value = true
      
      // 设置超时，确保页面不会无限等待
      const timeout = setTimeout(() => {
        console.log('Auth initialization timeout, proceeding without auth')
        authReady.value = true
        loading.value = false
        user.value = null
        resolve(null)
      }, 5000)
      
      try {
        onAuthStateChanged(auth, async (userData) => {
          clearTimeout(timeout)
          console.log('Auth state changed:', userData ? 'User logged in' : 'User logged out')
          
          if (userData) {
            // 立即就绪并放行路由，不阻塞在 Firestore 档案加载
            user.value = userData
            user.value.role = userData.email === 'admin@migrantcare.com' ? 'admin' : 'user'
            authReady.value = true
            loading.value = false
            resolve(userData)

            // 异步拉取并合并 Firestore 用户档案（不阻塞导航）
            ;(async () => {
              try {
                const userDocRef = doc(db, 'users', userData.uid)
                const userDocSnap = await getDoc(userDocRef)
                if (userDocSnap.exists()) {
                  const userProfile = userDocSnap.data()
                  // 保留 Firebase Auth 用户对象，只添加额外属性
                  user.value = userData
                  // 如果邮箱是特定管理员邮箱或 Firestore 中为 admin，则设为 admin
                  const roleFromEmail = userData.email === 'admin@migrantcare.com' ? 'admin' : 'user'
                  const roleFromProfile = userProfile.role
                  const mergedRole =
                    roleFromEmail === 'admin' || roleFromProfile === 'admin' || user.value.role === 'admin'
                      ? 'admin'
                      : roleFromProfile || roleFromEmail || 'user'
                  user.value.role = mergedRole
                  user.value.displayName = userProfile.displayName || userData.displayName
                  user.value.preferences = userProfile.preferences
                  user.value.profile = userProfile.profile
                  user.value.isActive = userProfile.isActive
                }
              } catch (error) {
                console.error('Error fetching user profile:', error)
              }
            })()
          } else {
            user.value = null
            authReady.value = true
            loading.value = false
            resolve(null)
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        console.error('Error setting up auth listener:', error)
        authReady.value = true
        loading.value = false
        user.value = null
        resolve(null)
      }
    })
  }

  async function register(email, password) {
    loading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // 创建用户档案到 Firestore
      const userProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        role: 'user',
        createdAt: new Date(),
        isActive: true,
        preferences: {
          language: 'zh',
          notifications: true
        },
        profile: {
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: null,
          gender: '',
          address: ''
        }
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)
      
      return userCredential.user
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // 检查用户是否已存在于 Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (!userDocSnap.exists()) {
        // 为新的 Google 用户创建档案
        const userProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          role: 'user',
          createdAt: new Date(),
          isActive: true,
          preferences: {
            language: 'zh',
            notifications: true
          },
          profile: {
            firstName: '',
            lastName: '',
            phone: '',
            dateOfBirth: null,
            gender: '',
            address: ''
          }
        }
        
        await setDoc(userDocRef, userProfile)
      }
      
      return userCredential.user
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email) {
    loading.value = true
    error.value = null
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getIdToken() {
    if (!user.value) return null
    try {
      return await user.value.getIdToken()
    } catch (err) {
      error.value = translateFirebaseError(err.code)
      throw err
    }
  }

  function translateFirebaseError(errorCode, lang = 'zh') {
    const errorMessages = {
      zh: {
        'auth/email-already-in-use': '该邮箱已被注册',
        'auth/invalid-email': '邮箱格式不正确',
        'auth/user-disabled': '该用户已被禁用',
        'auth/user-not-found': '用户不存在',
        'auth/wrong-password': '密码错误',
        'auth/weak-password': '密码强度不足',
        'auth/popup-closed-by-user': '登录窗口被关闭',
        'auth/cancelled-popup-request': '登录请求已取消',
        'auth/popup-blocked': '登录窗口被浏览器阻止',
        'auth/operation-not-allowed': '此操作不被允许',
        'auth/account-exists-with-different-credential': '此邮箱已使用其他方式登录',
        'auth/network-request-failed': '网络请求失败',
        'auth/too-many-requests': '请求次数过多，请稍后再试',
        'auth/requires-recent-login': '需要重新登录',
        'auth/invalid-credential': '无效的凭证',
        'auth/invalid-verification-code': '无效的验证码',
        'auth/invalid-verification-id': '无效的验证ID',
        'auth/missing-verification-code': '缺少验证码',
        'auth/missing-verification-id': '缺少验证ID',
      },
      en: {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email format',
        'auth/user-disabled': 'This user has been disabled',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/weak-password': 'Password is too weak',
        'auth/popup-closed-by-user': 'Login window was closed',
        'auth/cancelled-popup-request': 'Login request was cancelled',
        'auth/popup-blocked': 'Login window was blocked by browser',
        'auth/operation-not-allowed': 'This operation is not allowed',
        'auth/account-exists-with-different-credential':
          'This email is already used with different login method',
        'auth/network-request-failed': 'Network request failed',
        'auth/too-many-requests': 'Too many requests, please try again later',
        'auth/requires-recent-login': 'Please login again',
        'auth/invalid-credential': 'Invalid credentials',
        'auth/invalid-verification-code': 'Invalid verification code',
        'auth/invalid-verification-id': 'Invalid verification ID',
        'auth/missing-verification-code': 'Missing verification code',
        'auth/missing-verification-id': 'Missing verification ID',
      },
    }

    const messages = errorMessages[lang] || errorMessages.zh
    return (
      messages[errorCode] ||
      (lang === 'zh' ? '认证过程中发生错误' : 'An error occurred during authentication')
    )
  }

  return {
    user,
    loading,
    error,
    authReady,
    isAuthenticated,
    userEmail,
    userId,
    userPhotoURL,
    userDisplayName,
    isAdmin,
    initAuthListener,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken,
  }
})
