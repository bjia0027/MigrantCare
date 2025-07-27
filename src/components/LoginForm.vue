<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <!-- 登录/注册切换 -->
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

        <!-- 登录模式 -->
        <div v-if="isLoginMode" class="login-form">
          <form @submit.prevent="submitLogin">
            <!-- 登录类型选择 -->
            <div class="mb-3">
              <label class="form-label">{{ texts.loginType }}</label>
              <div class="login-type-selector">
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="loginType"
                    id="userLogin"
                    value="user"
                    v-model="loginForm.loginType"
                  />
                  <label class="form-check-label" for="userLogin">
                    {{ texts.normalUser }}
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="loginType"
                    id="adminLogin"
                    value="admin"
                    v-model="loginForm.loginType"
                  />
                  <label class="form-check-label" for="adminLogin">
                    {{ texts.admin }}
                  </label>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12">
                <label for="loginUsername" class="form-label">{{ texts.username }}</label>
                <input
                  type="text"
                  class="form-control"
                  id="loginUsername"
                  v-model="loginForm.username"
                  required
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
                />
              </div>
            </div>

            <!-- 管理员登录提示 -->
            <div v-if="loginForm.loginType === 'admin'" class="alert alert-info">
              <strong>{{ texts.adminLoginInfo }}</strong
              ><br />
              {{ texts.username }}：admin<br />
              {{ texts.password }}：Admin123!
            </div>

            <!-- 普通用户登录提示 -->
            <div v-if="loginForm.loginType === 'user'" class="alert alert-info">
              <strong>{{ texts.testUserLoginInfo }}</strong
              ><br />
              {{ texts.username }}：testuser<br />
              {{ texts.password }}：Test123!<br />
              {{ texts.orRegisterNew }}
            </div>

            <div class="text-center">
              <button type="submit" class="btn btn-primary btn-lg">
                {{ loginForm.loginType === 'admin' ? texts.adminLogin : texts.userLoginBtn }}
              </button>
            </div>
          </form>
        </div>

        <!-- 注册模式 (原有的表单) -->
        <div v-else class="register-form">
          <form @submit.prevent="submitForm">
            <!-- 实时验证区域 -->
            <div class="validation-section mb-4">
              <h6 class="text-primary mb-3">{{ texts.realTimeValidation }}</h6>
              <div class="row mb-3">
                <div class="col-12 col-md-6">
                  <label for="email" class="form-label">{{ texts.email }}</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{
                      'is-valid': emailValidation.isValid && formData.email,
                      'is-invalid': !emailValidation.isValid && formData.email,
                    }"
                    id="email"
                    v-model="formData.email"
                    @input="validateEmailRealTime"
                    :placeholder="texts.emailPlaceholder"
                  />
                  <div v-if="emailValidation.isValid && formData.email" class="valid-feedback">
                    {{ texts.emailValid }}
                  </div>
                  <div v-if="!emailValidation.isValid && formData.email" class="invalid-feedback">
                    {{ texts.emailInvalid }}
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="phone" class="form-label">{{ texts.phone }}</label>
                  <input
                    type="tel"
                    class="form-control"
                    :class="{
                      'is-valid': phoneValidation.isValid && formData.phone,
                      'is-invalid': !phoneValidation.isValid && formData.phone,
                    }"
                    id="phone"
                    v-model="formData.phone"
                    @input="validatePhoneRealTime"
                    :placeholder="texts.phonePlaceholder"
                  />
                  <div v-if="phoneValidation.isValid && formData.phone" class="valid-feedback">
                    {{ texts.phoneValid }}
                  </div>
                  <div v-if="!phoneValidation.isValid && formData.phone" class="invalid-feedback">
                    {{ texts.phoneInvalid }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <label for="username" class="form-label">{{ texts.username }}</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  @blur="() => validateName(true)"
                  @input="() => validateName(false)"
                  v-model="formData.username"
                />
                <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label for="age" class="form-label">{{ texts.age }}</label>
                <input
                  type="number"
                  class="form-control"
                  :class="{
                    'is-valid': ageValidation.isValid && formData.age,
                    'is-invalid': !ageValidation.isValid && formData.age,
                  }"
                  id="age"
                  v-model="formData.age"
                  @input="validateAgeRealTime"
                  :placeholder="texts.agePlaceholder"
                  min="18"
                  max="100"
                />
                <div v-if="ageValidation.isValid && formData.age" class="valid-feedback">
                  {{ texts.ageValid }}
                </div>
                <div v-if="!ageValidation.isValid && formData.age" class="invalid-feedback">
                  {{ texts.ageInvalid }}
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <label for="gender" class="form-label">{{ texts.gender }}</label>
                <select
                  class="form-select"
                  id="gender"
                  v-model="formData.gender"
                  @blur="() => validateGender(true)"
                >
                  <option value="">{{ texts.selectGender }}</option>
                  <option value="male">{{ texts.male }}</option>
                  <option value="female">{{ texts.female }}</option>
                  <option value="other">{{ texts.other }}</option>
                </select>
                <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-check mt-4">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="isAustralian"
                    v-model="formData.isAustralian"
                  />
                  <label class="form-check-label" for="isAustralian">{{
                    texts.australianResident
                  }}</label>
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <label for="password" class="form-label">{{ texts.password }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  @blur="() => validatePassword(true)"
                  @input="() => validatePassword(false)"
                  v-model="formData.password"
                />
                <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label for="confirmPassword" class="form-label">{{ texts.confirmPassword }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  @blur="() => validateConfirmPassword(true)"
                  @input="() => validateConfirmPassword(false)"
                  v-model="formData.confirmPassword"
                />
                <div v-if="errors.confirmPassword" class="text-danger">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="reason" class="form-label">{{ texts.reasonForJoining }}</label>
              <textarea
                class="form-control"
                :class="{
                  'is-valid': commentsValidation.isValid && formData.reason,
                  'is-invalid': !commentsValidation.isValid && formData.reason,
                }"
                id="reason"
                rows="3"
                v-model="formData.reason"
                @input="validateCommentsRealTime"
                @blur="() => validateReason(true)"
                :placeholder="texts.commentsPlaceholder"
                maxlength="500"
              ></textarea>
              <div v-if="commentsValidation.isValid && formData.reason" class="valid-feedback">
                {{ texts.commentsValid }}
              </div>
              <div v-if="!commentsValidation.isValid && formData.reason" class="invalid-feedback">
                {{ commentsValidation.message }}
              </div>
              <small class="form-text text-muted">
                {{ texts.charactersCount }}: {{ formData.reason.length }}/500
              </small>
              <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">
                {{ texts.registerAccount }}
              </button>
              <button type="button" class="btn btn-secondary" @click="clearForm">
                {{ texts.clear }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 已注册用户展示 -->
    <div class="row mt-5" v-if="submittedCards.length && !isLoginMode">
      <div class="d-flex flex-wrap justify-content-start">
        <div
          v-for="(card, index) in submittedCards"
          :key="index"
          class="card m-2"
          style="width: 18rem"
        >
          <div class="card-header">User Information</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Username: {{ card.username }}</li>
            <li class="list-group-item">Password: {{ card.password }}</li>
            <li class="list-group-item">
              Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
            </li>
            <li class="list-group-item">Gender: {{ card.gender }}</li>
            <li class="list-group-item">Reason: {{ card.reason }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue Logic
import { ref, computed } from 'vue'
import {
  validateUsername,
  validatePassword as secureValidatePassword,
  validateAndSanitizeInput,
  checkRateLimit,
  filterContent,
} from '../utils/security.js'

// Emit events to parent component
const emit = defineEmits(['login'])

// Props for language support
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

// 登录/注册模式切换
const isLoginMode = ref(true)

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  loginType: 'user', // 'user' 或 'admin'
})

// 注册表单数据 (原有的)
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: '',
  email: '',
  phone: '',
  age: null,
})

const submittedCards = ref([])

const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  isAustralian: null,
  gender: null,
  reason: null,
})

// ValidationDemo 集成的验证状态
const emailValidation = ref({
  isValid: false,
  message: '',
})

const phoneValidation = ref({
  isValid: false,
  message: '',
})

const ageValidation = ref({
  isValid: false,
  message: '',
})

const commentsValidation = ref({
  isValid: false,
  message: '',
})

// ValidationDemo 验证函数
const validateEmailRealTime = () => {
  const email = formData.value.email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    emailValidation.value = { isValid: false, message: '' }
  } else if (!emailPattern.test(email)) {
    emailValidation.value = { isValid: false, message: texts.value.emailInvalid }
  } else {
    emailValidation.value = { isValid: true, message: texts.value.emailValid }
  }
}

const validatePhoneRealTime = () => {
  const phone = formData.value.phone
  // 澳洲手机号格式: 04开头，总共10位数字
  const phonePattern = /^04\d{8}$/

  if (!phone) {
    phoneValidation.value = { isValid: false, message: '' }
  } else if (!phonePattern.test(phone)) {
    phoneValidation.value = { isValid: false, message: texts.value.phoneInvalid }
  } else {
    phoneValidation.value = { isValid: true, message: texts.value.phoneValid }
  }
}

const validateAgeRealTime = () => {
  const age = formData.value.age

  if (!age) {
    ageValidation.value = { isValid: false, message: '' }
  } else if (age < 18 || age > 100) {
    ageValidation.value = { isValid: false, message: texts.value.ageInvalid }
  } else {
    ageValidation.value = { isValid: true, message: texts.value.ageValid }
  }
}

const validateCommentsRealTime = () => {
  const comments = formData.value.reason

  if (!comments) {
    commentsValidation.value = { isValid: false, message: '' }
  } else if (comments.length < 10) {
    commentsValidation.value = {
      isValid: false,
      message:
        texts.value.lang === 'zh'
          ? '评论至少需要10个字符'
          : 'Comment must be at least 10 characters',
    }
  } else if (comments.length > 500) {
    commentsValidation.value = {
      isValid: false,
      message:
        texts.value.lang === 'zh'
          ? '评论不能超过500个字符'
          : 'Comment cannot exceed 500 characters',
    }
  } else {
    commentsValidation.value = { isValid: true, message: texts.value.commentsValid }
  }
}

// 登录提交
const submitLogin = () => {
  // 验证输入
  if (!loginForm.value.username || !loginForm.value.password) {
    alert(texts.value.fillUsernamePassword)
    return
  }

  // 速率限制检查
  if (!checkRateLimit(loginForm.value.username, 5, 15 * 60 * 1000)) {
    alert(texts.value.rateLimitExceeded)
    return
  }

  // 安全验证用户名
  const usernameValidation = validateUsername(loginForm.value.username)
  if (!usernameValidation.isValid) {
    alert(texts.value.usernameFormatError + usernameValidation.errors.join(', '))
    return
  }

  // 验证密码格式（对于新用户）
  if (loginForm.value.loginType === 'user') {
    const passwordValidation = secureValidatePassword(loginForm.value.password)
    if (!passwordValidation.isValid && loginForm.value.username !== 'testuser') {
      alert(texts.value.passwordFormatError + passwordValidation.errors.join(', '))
      return
    }
  }

  // 触发登录事件，传递安全处理后的登录数据
  emit('login', {
    username: usernameValidation.sanitized,
    password: loginForm.value.password, // 密码不转义，保持原样
    loginType: loginForm.value.loginType,
    isNewUser: false,
  })
}

// 注册提交
const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateAustralian()
  validateGender(true)
  validateReason(true)

  if (
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.isAustralian &&
    !errors.value.gender &&
    !errors.value.reason
  ) {
    submittedCards.value.push({ ...formData.value })
    // 触发登录事件，作为新用户注册
    emit('login', {
      username: formData.value.username,
      email: formData.value.username + '@example.com',
      isNewUser: true,
    })
    clearForm()
  }
}

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      userLogin: '用户登录',
      userRegister: '用户注册',
      login: '登录',
      register: '注册',
      loginType: '登录类型',
      normalUser: '普通用户',
      admin: '管理员',
      username: '用户名',
      password: '密码',
      adminLoginInfo: '管理员登录信息：',
      testUserLoginInfo: '测试用户登录信息：',
      orRegisterNew: '或者直接注册新账户',
      adminLogin: '管理员登录',
      userLoginBtn: '用户登录',
      registerAccount: '注册账户',
      clear: '清除',
      gender: '性别',
      selectGender: '选择性别',
      male: '男性',
      female: '女性',
      other: '其他',
      confirmPassword: '确认密码',
      australianResident: '澳洲居民？',
      reasonForJoining: '加入原因',
      fillUsernamePassword: '请填写用户名和密码！',
      rateLimitExceeded: '登录尝试过于频繁，请15分钟后再试！',
      usernameFormatError: '用户名格式不正确：',
      passwordFormatError: '密码格式不正确：',
      wrongCredentials: '用户名或密码错误！',
      // 验证错误消息
      passwordMinLength: '密码至少需要{0}个字符。',
      passwordNeedUppercase: '密码必须包含至少一个大写字母。',
      passwordNeedLowercase: '密码必须包含至少一个小写字母。',
      passwordNeedNumber: '密码必须包含至少一个数字。',
      passwordNeedSpecialChar: '密码必须包含至少一个特殊字符。',
      passwordsNotMatch: '密码不匹配。',
      pleaseSelectGender: '请选择性别。',
      realTimeValidation: '实时验证',
      email: '邮箱',
      emailPlaceholder: '请输入邮箱',
      emailValid: '邮箱格式正确',
      emailInvalid: '请输入有效的邮箱地址',
      phone: '手机号',
      phonePlaceholder: '请输入手机号',
      phoneValid: '手机号格式正确',
      phoneInvalid: '请输入有效的手机号',
      age: '年龄',
      agePlaceholder: '请输入年龄',
      ageValid: '年龄有效',
      ageInvalid: '请输入有效的年龄',
      commentsPlaceholder: '请输入您的评论',
      commentsValid: '评论有效',
      charactersCount: '字符数',
    },
    en: {
      userLogin: 'User Login',
      userRegister: 'User Registration',
      login: 'Login',
      register: 'Register',
      loginType: 'Login Type',
      normalUser: 'Regular User',
      admin: 'Administrator',
      username: 'Username',
      password: 'Password',
      adminLoginInfo: 'Admin Login Information:',
      testUserLoginInfo: 'Test User Login Information:',
      orRegisterNew: 'Or register a new account',
      adminLogin: 'Admin Login',
      userLoginBtn: 'User Login',
      registerAccount: 'Register Account',
      clear: 'Clear',
      gender: 'Gender',
      selectGender: 'Select Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      confirmPassword: 'Confirm Password',
      australianResident: 'Australian Resident?',
      reasonForJoining: 'Reason for joining',
      fillUsernamePassword: 'Please fill in username and password!',
      rateLimitExceeded: 'Too many login attempts, please try again in 15 minutes!',
      usernameFormatError: 'Username format error: ',
      passwordFormatError: 'Password format error: ',
      wrongCredentials: 'Incorrect username or password!',
      // Validation error messages
      passwordMinLength: 'Password must be at least {0} characters long.',
      passwordNeedUppercase: 'Password must contain at least one uppercase letter.',
      passwordNeedLowercase: 'Password must contain at least one lowercase letter.',
      passwordNeedNumber: 'Password must contain at least one number.',
      passwordNeedSpecialChar: 'Password must contain at least one special character.',
      passwordsNotMatch: 'Passwords do not match.',
      pleaseSelectGender: 'Please select a gender.',
      realTimeValidation: 'Real-time Validation',
      email: 'Email',
      emailPlaceholder: 'Enter email',
      emailValid: 'Email format is correct',
      emailInvalid: 'Please enter a valid email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      phoneValid: 'Phone number format is correct',
      phoneInvalid: 'Please enter a valid phone number',
      age: 'Age',
      agePlaceholder: 'Enter age',
      ageValid: 'Age is valid',
      ageInvalid: 'Please enter a valid age',
      commentsPlaceholder: 'Enter your comment',
      commentsValid: 'Comment is valid',
      charactersCount: 'Characters',
    },
  }
  return translations[props.lang] || translations.zh
})

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    gender: '',
    email: '',
    phone: '',
    age: null,
  }
  // 清除验证状态
  emailValidation.value = { isValid: false, message: '' }
  phoneValidation.value = { isValid: false, message: '' }
  ageValidation.value = { isValid: false, message: '' }
  commentsValidation.value = { isValid: false, message: '' }
}

const validateName = (blur) => {
  // 使用安全验证函数
  const validation = validateUsername(formData.value.username)

  if (!validation.isValid) {
    if (blur) {
      errors.value.username = validation.errors.join(', ')
    }
  } else {
    errors.value.username = null
    // 更新为安全处理后的用户名
    formData.value.username = validation.sanitized
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = texts.value.passwordMinLength.replace('{0}', minLength)
  } else if (!hasUppercase) {
    if (blur) errors.value.password = texts.value.passwordNeedUppercase
  } else if (!hasLowercase) {
    if (blur) errors.value.password = texts.value.passwordNeedLowercase
  } else if (!hasNumber) {
    if (blur) errors.value.password = texts.value.passwordNeedNumber
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = texts.value.passwordNeedSpecialChar
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = texts.value.passwordsNotMatch
  } else {
    errors.value.confirmPassword = null
  }
}

const validateAustralian = () => {
  // 澳洲居民选项不再是必填的，用户可以选择或不选择
  errors.value.isAustralian = null
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) errors.value.gender = texts.value.pleaseSelectGender
  } else {
    errors.value.gender = null
  }
}

const validateReason = (blur) => {
  // 使用安全验证和内容过滤
  const validation = validateAndSanitizeInput(formData.value.reason, {
    minLength: 10,
    maxLength: 500,
    required: true,
  })

  if (!validation.isValid) {
    if (blur) {
      errors.value.reason = validation.errors.join(', ')
    }
  } else {
    errors.value.reason = null
    // 更新为安全处理后的内容
    formData.value.reason = filterContent(validation.sanitized)
  }
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}
.list-group-item {
  padding: 10px;
}

/* Auth form styles */
.auth-tabs {
  text-align: center;
  margin-bottom: 2rem;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.tab-buttons .btn {
  border-radius: 50px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-type-selector {
  margin-top: 0.5rem;
}

.form-check-inline {
  margin-right: 2rem;
}

.form-check-label {
  font-weight: 500;
  color: #495057;
  cursor: pointer;
}

.form-check-input:checked ~ .form-check-label {
  color: #0d6efd;
}

.login-form,
.register-form {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.alert {
  border-radius: 0.75rem;
  border: none;
}

.btn-lg {
  padding: 0.75rem 2rem;
  border-radius: 50px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tab-buttons {
    flex-direction: column;
    align-items: center;
  }

  .tab-buttons .btn {
    width: 200px;
  }

  .form-check-inline {
    margin-right: 0;
    margin-bottom: 1rem;
    display: block;
  }

  .login-form,
  .register-form {
    padding: 1.5rem;
  }
}
</style>
