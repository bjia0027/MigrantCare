import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

// Mock user data for development
const mockUsers = [
  { uid: 'user1', email: 'test@example.com', password: 'Test123!', displayName: '测试用户' },
  { uid: 'admin1', email: 'admin@migrantcare.com', password: 'Admin123!', displayName: '管理员' }
];

// Create mock user object
function createMockUser(userData) {
  return {
    uid: userData.uid,
    email: userData.email,
    displayName: userData.displayName,
    photoURL: null,
    getIdToken: async () => 'mock-token-' + userData.uid
  };
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const authReady = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || '');
  const userId = computed(() => user.value?.uid || '');
  const userPhotoURL = computed(() => user.value?.photoURL || '');
  const userDisplayName = computed(() => user.value?.displayName || '');

  function initAuthListener() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (userData) => {
        if (userData) {
          user.value = userData;
        } else {
          user.value = null;
        }
        authReady.value = true;
        resolve(userData);
      });
    });
  }

  async function register(email, password) {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        console.log('Using mock registration for development');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          throw { code: 'auth/email-already-in-use' };
        }
        
        const newUser = {
          uid: 'user' + Date.now(),
          email: email,
          password: password,
          displayName: email.split('@')[0]
        };
        
        mockUsers.push(newUser);
        user.value = createMockUser(newUser);
        console.log('Mock registration successful:', user.value);
        return user.value;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user.value = userCredential.user;
        return userCredential.user;
      }
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        console.log('Using mock authentication for development');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = mockUsers.find(u => u.email === email && u.password === password);
        if (mockUser) {
          user.value = createMockUser(mockUser);
          console.log('Mock login successful:', user.value);
          return user.value;
        } else {
          throw { code: 'auth/invalid-credential' };
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user.value = userCredential.user;
        return userCredential.user;
      }
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loginWithGoogle() {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        console.log('Using mock Google authentication for development');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGoogleUser = {
          uid: 'google-user-' + Date.now(),
          email: 'google.user@gmail.com',
          displayName: 'Google 用户',
          photoURL: 'https://via.placeholder.com/150'
        };
        
        user.value = createMockUser(mockGoogleUser);
        console.log('Mock Google login successful:', user.value);
        return user.value;
      } else {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        user.value = userCredential.user;
        return userCredential.user;
      }
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      if (isDevelopment) {
        console.log('Using mock logout for development');
        await new Promise(resolve => setTimeout(resolve, 500));
        user.value = null;
        console.log('Mock logout successful');
      } else {
        await signOut(auth);
        user.value = null;
      }
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(email) {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        console.log('Using mock password reset for development');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const existingUser = mockUsers.find(u => u.email === email);
        if (!existingUser) {
          throw { code: 'auth/user-not-found' };
        }
        
        console.log('Mock password reset email sent to:', email);
      } else {
        await sendPasswordResetEmail(auth, email);
      }
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getIdToken() {
    if (!user.value) return null;
    try {
      return await user.value.getIdToken();
    } catch (err) {
      error.value = translateFirebaseError(err.code);
      throw err;
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
        'auth/account-exists-with-different-credential': 'This email is already used with different login method',
        'auth/network-request-failed': 'Network request failed',
        'auth/too-many-requests': 'Too many requests, please try again later',
        'auth/requires-recent-login': 'Please login again',
        'auth/invalid-credential': 'Invalid credentials',
        'auth/invalid-verification-code': 'Invalid verification code',
        'auth/invalid-verification-id': 'Invalid verification ID',
        'auth/missing-verification-code': 'Missing verification code',
        'auth/missing-verification-id': 'Missing verification ID',
      }
    };
    
    const messages = errorMessages[lang] || errorMessages.zh;
    return messages[errorCode] || (lang === 'zh' ? '认证过程中发生错误' : 'An error occurred during authentication');
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
    initAuthListener,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken
  };
});