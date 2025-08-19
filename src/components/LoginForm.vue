<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <div class="auth-tabs mb-4">
          <h1 class="text-center">{{ isLoginMode ? texts.userLogin : texts.userRegister }}</h1>
          <div class="tab-buttons">
            <button
              :class="['btn', isLoginMode ? 'btn-primary' : 'btn-outline-primary']"
              @click="isLoginMode = true"
            >
              {{ texts.login }}
            </button>
            <button
              :class="['btn', !isLoginMode ? 'btn-primary' : 'btn-outline-primary']"
              @click="isLoginMode = false"
            >
              {{ texts.register }}
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="assertive">
          {{ errorMessage }}
        </div>

        <div v-if="isLoginMode" class="login-form">
          <form @submit.prevent="handleLogin">
            <div class="row mb-3">
              <div class="col-12">
                <label for="loginEmail" class="form-label">{{ texts.email }}</label>
                <input
                  type="email"
                  class="form-control"
                  id="loginEmail"
                  v-model="loginForm.email"
                  required
                  aria-required="true"
                />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12">
                <label for="loginPassword" class="form-label">{{ texts.password }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="loginPassword"
                  v-model="loginForm.password"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div class="mb-3 text-end">
              <a href="#" @click.prevent="showResetPassword = true">{{ texts.forgotPassword }}</a>
            </div>

            <div class="alert alert-info">
              <strong>{{ texts.testUserLoginInfo }}</strong
              ><br />
              {{ texts.email }}：test@example.com<br />
              {{ texts.password }}：Test123!<br />
              {{ texts.adminEmail }}：admin@migrantcare.com<br />
              {{ texts.adminPassword }}：Admin123!<br />
              {{ texts.orRegisterNew }}
            </div>

            <div class="text-center mb-3">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ texts.login }}
              </button>
            </div>

            <div class="social-login text-center">
              <p>{{ texts.orLoginWith }}</p>
              <button
                type="button"
                class="btn btn-outline-danger"
                @click="handleGoogleLogin"
                :disabled="loading"
              >
                <i class="fab fa-google me-2"></i> Google
              </button>
            </div>
          </form>
        </div>

        <div v-else class="register-form">
          <form @submit.prevent="handleRegister">
            <div class="row mb-3">
              <div class="col-12">
                <label for="registerEmail" class="form-label">{{ texts.email }}</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{
                    'is-valid': emailValidation.isValid && registerForm.email,
                    'is-invalid': !emailValidation.isValid && registerForm.email,
                  }"
                  id="registerEmail"
                  v-model="registerForm.email"
                  @input="validateEmailRealTime"
                  required
                  aria-required="true"
                />
                <div v-if="emailValidation.isValid && registerForm.email" class="valid-feedback">
                  {{ texts.emailValid }}
                </div>
                <div v-if="!emailValidation.isValid && registerForm.email" class="invalid-feedback">
                  {{ texts.emailInvalid }}
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12">
                <label for="registerPassword" class="form-label">{{ texts.password }}</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{
                    'is-valid': passwordValidation.isValid && registerForm.password,
                    'is-invalid': !passwordValidation.isValid && registerForm.password,
                  }"
                  id="registerPassword"
                  v-model="registerForm.password"
                  @input="validatePasswordRealTime"
                  required
                  aria-required="true"
                />
                <div
                  v-if="!passwordValidation.isValid && registerForm.password"
                  class="invalid-feedback"
                >
                  {{ passwordValidation.message }}
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12">
                <label for="confirmPassword" class="form-label">{{ texts.confirmPassword }}</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{
                    'is-valid': confirmPasswordValidation.isValid && registerForm.confirmPassword,
                    'is-invalid':
                      !confirmPasswordValidation.isValid && registerForm.confirmPassword,
                  }"
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  @input="validateConfirmPasswordRealTime"
                  required
                  aria-required="true"
                />
                <div
                  v-if="!confirmPasswordValidation.isValid && registerForm.confirmPassword"
                  class="invalid-feedback"
                >
                  {{ confirmPasswordValidation.message }}
                </div>
              </div>
            </div>

            <div class="text-center">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading || !canRegister"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ texts.register }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="showResetPassword" class="modal-overlay" @click="showResetPassword = false">
          <div class="modal-content" @click.stop>
            <h3>{{ texts.resetPassword }}</h3>
            <form @submit.prevent="handleResetPassword">
              <div class="mb-3">
                <label for="resetEmail" class="form-label">{{ texts.email }}</label>
                <input
                  type="email"
                  class="form-control"
                  id="resetEmail"
                  v-model="resetEmail"
                  required
                  aria-required="true"
                />
              </div>
              <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-secondary" @click="showResetPassword = false">
                  {{ texts.cancel }}
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {{ texts.sendResetLink }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue Logic
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Props for language support
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const showResetPassword = ref(false)
const resetEmail = ref('')

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
})
const emailValidation = ref({
  isValid: false,
  message: '',
})

const passwordValidation = ref({
  isValid: false,
  message: '',
})

const confirmPasswordValidation = ref({
  isValid: false,
  message: '',
})

const canRegister = computed(() => {
  return (
    emailValidation.value.isValid &&
    passwordValidation.value.isValid &&
    confirmPasswordValidation.value.isValid
  )
})
const validateEmailRealTime = () => {
  const email = registerForm.value.email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    emailValidation.value = { isValid: false, message: '' }
  } else if (!emailPattern.test(email)) {
    emailValidation.value = { isValid: false, message: texts.value.emailInvalid }
  } else {
    emailValidation.value = { isValid: true, message: texts.value.emailValid }
  }
}

const validatePasswordRealTime = () => {
  const password = registerForm.value.password

  if (!password) {
    passwordValidation.value = { isValid: false, message: '' }
    return
  }

  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasMinLength) {
    passwordValidation.value = {
      isValid: false,
      message: texts.value.passwordMinLength.replace('{0}', '8'),
    }
  } else if (!hasUppercase) {
    passwordValidation.value = {
      isValid: false,
      message: texts.value.passwordNeedUppercase,
    }
  } else if (!hasLowercase) {
    passwordValidation.value = {
      isValid: false,
      message: texts.value.passwordNeedLowercase,
    }
  } else if (!hasNumber) {
    passwordValidation.value = {
      isValid: false,
      message: texts.value.passwordNeedNumber,
    }
  } else if (!hasSpecialChar) {
    passwordValidation.value = {
      isValid: false,
      message: texts.value.passwordNeedSpecialChar,
    }
  } else {
    passwordValidation.value = { isValid: true, message: '' }
  }

  if (registerForm.value.confirmPassword) {
    validateConfirmPasswordRealTime()
  }
}

const validateConfirmPasswordRealTime = () => {
  const password = registerForm.value.password
  const confirmPassword = registerForm.value.confirmPassword

  if (!confirmPassword) {
    confirmPasswordValidation.value = { isValid: false, message: '' }
  } else if (password !== confirmPassword) {
    confirmPasswordValidation.value = {
      isValid: false,
      message: texts.value.passwordsNotMatch,
    }
  } else {
    confirmPasswordValidation.value = { isValid: true, message: '' }
  }
}

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    if (!loginForm.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email)) {
      throw { code: 'auth/invalid-email' }
    }

    if (!loginForm.value.password) {
      throw { code: 'custom/password-empty' }
    }

    await authStore.login(loginForm.value.email, loginForm.value.password)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    const errorCode = error?.code || 'unknown-error'
    errorMessage.value = translateError(errorCode)
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (error) {
    console.error('Google login error:', error)
    const errorCode = error?.code || 'unknown-error'
    errorMessage.value = translateError(errorCode)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    validateEmailRealTime()
    validatePasswordRealTime()
    validateConfirmPasswordRealTime()
    if (!emailValidation.value.isValid) {
      throw { code: 'auth/invalid-email' }
    }

    if (!passwordValidation.value.isValid) {
      throw { code: 'auth/weak-password' }
    }

    if (!confirmPasswordValidation.value.isValid) {
      throw { code: 'custom/passwords-not-match' }
    }

    await authStore.register(registerForm.value.email, registerForm.value.password)
    router.push('/')
  } catch (error) {
    console.error('Registration error:', error)
    const errorCode = error?.code || 'unknown-error'
    errorMessage.value = translateError(errorCode)
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.resetPassword(resetEmail.value)
    showResetPassword.value = false
    alert(texts.value.resetPasswordSuccess)
  } catch (error) {
    console.error('Password reset error:', error)
    errorMessage.value = translateError(error.code)
  } finally {
    loading.value = false
  }
}
const translateError = (errorCode) => {
  console.log('Translating error code:', errorCode)

  const errorMessages = {
    'auth/invalid-email': texts.value.invalidEmail,
    'auth/user-disabled': texts.value.userDisabled,
    'auth/user-not-found': texts.value.userNotFound,
    'auth/wrong-password': texts.value.wrongPassword,
    'auth/email-already-in-use': texts.value.emailAlreadyInUse,
    'auth/weak-password': texts.value.weakPassword,
    'auth/operation-not-allowed': texts.value.operationNotAllowed,
    'auth/popup-closed-by-user': texts.value.popupClosed,
    'auth/cancelled-popup-request': texts.value.popupCancelled,
    'auth/popup-blocked': texts.value.popupBlocked,
    'auth/too-many-requests': texts.value.tooManyRequests,
    'auth/network-request-failed':
      texts.value.networkError || (props.lang === 'zh' ? '网络请求失败' : 'Network request failed'),
    'auth/invalid-credential':
      texts.value.invalidCredential || (props.lang === 'zh' ? '无效的凭证' : 'Invalid credentials'),
    'custom/passwords-not-match': texts.value.passwordsNotMatch,
    'custom/email-invalid': texts.value.emailInvalid,
    'custom/password-empty': texts.value.passwordEmpty,
  }

  const translatedMessage = errorMessages[errorCode] || texts.value.unknownError
  console.log('Translated message:', translatedMessage)
  return translatedMessage
}

const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        userLogin: '用户登录',
        userRegister: '用户注册',
        login: '登录',
        register: '注册',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        forgotPassword: '忘记密码？',
        resetPassword: '重置密码',
        sendResetLink: '发送重置链接',
        cancel: '取消',
        testUserLoginInfo: '测试账户信息：',
        adminEmail: '管理员邮箱',
        adminPassword: '管理员密码',
        orRegisterNew: '或者注册新账户',
        orLoginWith: '或使用以下方式登录',
        emailValid: '邮箱格式正确',
        emailInvalid: '请输入有效的邮箱地址',
        passwordMinLength: '密码至少需要{0}个字符',
        passwordNeedUppercase: '密码必须包含至少一个大写字母',
        passwordNeedLowercase: '密码必须包含至少一个小写字母',
        passwordNeedNumber: '密码必须包含至少一个数字',
        passwordNeedSpecialChar: '密码必须包含至少一个特殊字符',
        passwordsNotMatch: '两次输入的密码不匹配',
        resetPasswordSuccess: '密码重置链接已发送到您的邮箱',
        passwordEmpty: '请输入密码',

        invalidEmail: '邮箱格式不正确',
        userDisabled: '该用户账号已被禁用',
        userNotFound: '该邮箱未注册',
        wrongPassword: '密码错误',
        emailAlreadyInUse: '该邮箱已被注册',
        weakPassword: '密码强度不足',
        operationNotAllowed: '操作不被允许',
        popupClosed: '登录窗口被关闭',
        popupCancelled: '登录请求已取消',
        popupBlocked: '登录窗口被浏览器阻止',
        tooManyRequests: '请求次数过多，请稍后再试',
        unknownError: '发生未知错误，请稍后再试',
      }
    : {
        userLogin: 'User Login',
        userRegister: 'User Registration',
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        sendResetLink: 'Send Reset Link',
        cancel: 'Cancel',
        testUserLoginInfo: 'Test Account Information:',
        adminEmail: 'Admin Email',
        adminPassword: 'Admin Password',
        orRegisterNew: 'Or register a new account',
        orLoginWith: 'Or login with',
        emailValid: 'Email format is correct',
        emailInvalid: 'Please enter a valid email address',
        passwordMinLength: 'Password must be at least {0} characters',
        passwordNeedUppercase: 'Password must contain at least one uppercase letter',
        passwordNeedLowercase: 'Password must contain at least one lowercase letter',
        passwordNeedNumber: 'Password must contain at least one number',
        passwordNeedSpecialChar: 'Password must contain at least one special character',
        passwordsNotMatch: 'Passwords do not match',
        resetPasswordSuccess: 'Password reset link has been sent to your email',
        passwordEmpty: 'Please enter a password',
        // Error messages
        invalidEmail: 'Invalid email format',
        userDisabled: 'This user account has been disabled',
        userNotFound: 'No user found with this email',
        wrongPassword: 'Incorrect password',
        emailAlreadyInUse: 'This email is already in use',
        weakPassword: 'Password is too weak',
        operationNotAllowed: 'Operation not allowed',
        popupClosed: 'Login popup was closed',
        popupCancelled: 'Login request was cancelled',
        popupBlocked: 'Login popup was blocked by the browser',
        tooManyRequests: 'Too many requests, please try again later',
        unknownError: 'An unknown error occurred, please try again later',
      }
})
</script>

<style scoped>
.auth-tabs {
  text-align: center;
}

.tab-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.login-form,
.register-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.social-login {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
