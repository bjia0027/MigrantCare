<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <!-- 登录/注册切换 -->
        <div class="auth-tabs mb-4">
          <h1 class="text-center">{{ isLoginMode ? '用户登录' : '用户注册' }}</h1>
          <div class="tab-buttons">
            <button
              :class="['btn', isLoginMode ? 'btn-primary' : 'btn-outline-primary']"
              @click="isLoginMode = true"
            >
              登录
            </button>
            <button
              :class="['btn', !isLoginMode ? 'btn-primary' : 'btn-outline-primary']"
              @click="isLoginMode = false"
            >
              注册
            </button>
          </div>
        </div>

        <!-- 登录模式 -->
        <div v-if="isLoginMode" class="login-form">
          <form @submit.prevent="submitLogin">
            <!-- 登录类型选择 -->
            <div class="mb-3">
              <label class="form-label">登录类型</label>
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
                    <i class="fas fa-user me-2"></i>普通用户
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
                    <i class="fas fa-shield-alt me-2"></i>管理员
                  </label>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12">
                <label for="loginUsername" class="form-label">用户名</label>
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
                <label for="loginPassword" class="form-label">密码</label>
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
              <i class="fas fa-info-circle me-2"></i>
              <strong>管理员登录信息：</strong><br />
              用户名：admin<br />
              密码：Admin123!
            </div>

            <!-- 普通用户登录提示 -->
            <div v-if="loginForm.loginType === 'user'" class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              <strong>测试用户登录信息：</strong><br />
              用户名：testuser<br />
              密码：Test123!<br />
              或者直接注册新账户
            </div>

            <div class="text-center">
              <button type="submit" class="btn btn-primary btn-lg">
                <i class="fas fa-sign-in-alt me-2"></i>
                {{ loginForm.loginType === 'admin' ? '管理员登录' : '用户登录' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 注册模式 (原有的表单) -->
        <div v-else class="register-form">
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <label for="username" class="form-label">Username</label>
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
                <label for="gender" class="form-label">Gender</label>
                <select
                  class="form-select"
                  id="gender"
                  v-model="formData.gender"
                  @blur="() => validateGender(true)"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <label for="password" class="form-label">Password</label>
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
                <label for="confirmPassword" class="form-label">Confirm Password</label>
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
            <div class="row mb-3">
              <div class="col-12 col-md-6">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="isAustralian"
                    v-model="formData.isAustralian"
                  />
                  <label class="form-check-label" for="isAustralian">Australian Resident?</label>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <!-- 空列用于对齐 -->
              </div>
            </div>
            <div class="mb-3">
              <label for="reason" class="form-label">Reason for joining</label>
              <textarea
                class="form-control"
                id="reason"
                rows="3"
                v-model="formData.reason"
                @blur="() => validateReason(true)"
              ></textarea>
              <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">注册账户</button>
              <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
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
import { ref } from 'vue'

// Emit events to parent component
const emit = defineEmits(['login'])

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

// 登录提交
const submitLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('请填写用户名和密码！')
    return
  }

  // 触发登录事件，传递登录数据
  emit('login', {
    username: loginForm.value.username,
    password: loginForm.value.password,
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

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    gender: '',
  }
}

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters'
  } else {
    errors.value.username = null
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
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = 'Password must contain at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) errors.value.password = 'Password must contain at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) errors.value.password = 'Password must contain at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = 'Password must contain at least one special character.'
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = 'Passwords do not match.'
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
    if (blur) errors.value.gender = 'Please select a gender.'
  } else {
    errors.value.gender = null
  }
}

const validateReason = (blur) => {
  if (!formData.value.reason) {
    if (blur) errors.value.reason = 'Please provide a reason for joining.'
  } else {
    errors.value.reason = null
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
