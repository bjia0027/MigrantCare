<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NavigationBar from './components/NavigationBar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const lang = ref('zh')
const showProfile = ref(false)
const showSettings = ref(false)

const handleLangChange = (newLang) => {
  console.log('App.vue: handleLangChange called with:', newLang)
  console.log('App.vue: Current lang before change:', lang.value)
  lang.value = newLang
  console.log('App.vue: Current lang after change:', lang.value)
}

const currentPage = computed(() => {
  return route.path.replace('/', '') || 'home'
})

provide('authStore', authStore)

const adminAccount = {
  username: 'admin',
  password: 'Admin123!',
  role: 'admin',
  email: 'admin@migrantcare.com',
  permissions: ['manage_users', 'manage_content', 'view_analytics', 'system_settings'],
}

const regularUsers = ref([
  {
    username: 'testuser',
    password: 'Test123!',
    role: 'user',
    email: 'test@example.com',
    permissions: ['view_content', 'create_posts'],
  },
])

const systemStats = ref({
  totalUsers: 15247,
  totalPosts: 3892,
  totalAppointments: 8574,
  systemHealth: '正常',
})

const userList = ref([
  {
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    status: '活跃',
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    status: '活跃',
    joinDate: '2024-01-20',
  },
  {
    id: 3,
    username: 'user3',
    email: 'user3@example.com',
    role: 'admin',
    status: '活跃',
    joinDate: '2024-01-10',
  },
])

// 计算属性
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.email === 'admin@migrantcare.com'
})

const isUser = computed(() => {
  return authStore.isAuthenticated && !isAdmin.value
})

// 导航方法
const navigateTo = (page) => {
  router.push(`/${page}`)
}

onMounted(() => {
  authStore.initAuthListener()
})

const texts = computed(() => {
  return lang.value === 'zh'
    ? {
        welcome: '欢迎来到移民关怀平台',
        subtitle: '我们致力于为移民提供便民的医疗服务和资源。',
        healthInfo: '浏览健康信息',
        findResources: '查找资源',
        viewProfile: '查看个人资料',
        settings: '设置',
        logout: '退出登录',
        login: '登录',
        register: '注册',
        username: '用户名',
        password: '密码',
        email: '邮箱',
        confirmPassword: '确认密码',
        loginSuccess: '登录成功！',
        registerSuccess: '注册成功！',
        health: '健康信息',
        resources: '资源查找',
        forum: '社区论坛',
        appointments: '预约管理',
        admin: '管理员',
        userManagement: '用户管理',
        close: '关闭',
        language: '语言',
        profile: '个人资料',
        role: '角色',
        administrator: '管理员',
        regularUser: '普通用户',
        guest: '访客',
      }
    : {
        welcome: 'Welcome to Migrant Care',
        subtitle: 'We are dedicated to providing accessible healthcare services and resources for migrants.',
        healthInfo: 'Browse Health Info',
        findResources: 'Find Resources',
        viewProfile: 'View Profile',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        username: 'Username',
        password: 'Password',
        email: 'Email',
        confirmPassword: 'Confirm Password',
        loginSuccess: 'Login successful!',
        registerSuccess: 'Registration successful!',
        health: 'Health Info',
        resources: 'Resources',
        forum: 'Forum',
        appointments: 'Appointments',
        admin: 'Admin',
        userManagement: 'User Management',
        close: 'Close',
        language: 'Language',
        profile: 'Profile',
        role: 'Role',
        administrator: 'Administrator',
        regularUser: 'Regular User',
        guest: 'Guest',
      }
})
</script>

<template>
  <div class="app-container">
    <NavigationBar
      :current-page="currentPage"
      :is-logged-in="authStore.isAuthenticated"
      :current-user="authStore.user"
      :is-admin="isAdmin"
      :is-user="isUser"
      :lang="lang"
      @navigate="navigateTo"
      @logout="authStore.logout"
      @toggle-profile="showProfile = !showProfile"
      @toggle-settings="showSettings = !showSettings"
      @langChange="handleLangChange"
    />

    <main class="main-content">
      <router-view :lang="lang" />
    </main>

    <div v-if="showProfile" class="modal-overlay" @click="showProfile = false">
      <div class="modal-content" @click.stop>
        <h2>{{ texts.profile }}</h2>
        <div class="user-profile">
          <div class="profile-avatar">
            <img v-if="authStore.userPhotoURL" :src="authStore.userPhotoURL" alt="User avatar" class="avatar-img">
            <div v-else class="avatar-placeholder">👤</div>
          </div>
          <div class="profile-info">
            <p><strong>{{ texts.username }}:</strong> {{ authStore.userDisplayName || authStore.userEmail }}</p>
            <p><strong>{{ texts.email }}:</strong> {{ authStore.userEmail }}</p>
            <p>
              <strong>{{ texts.role }}:</strong>
              {{
                isAdmin
                  ? texts.administrator
                  : texts.regularUser
              }}
            </p>
          </div>
        </div>
        <button class="btn btn-secondary" @click="showProfile = false">
          {{ texts.close }}
        </button>
      </div>
    </div>

    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <h2>{{ texts.settings }}</h2>
        <div class="settings-section">
          <h3>{{ texts.language }}</h3>
          <div class="language-options">
            <button
              :class="['btn', lang === 'zh' ? 'btn-primary' : 'btn-outline-primary']"
              @click="lang = 'zh'"
            >
              中文
            </button>
            <button
              :class="['btn', lang === 'en' ? 'btn-primary' : 'btn-outline-primary']"
              @click="lang = 'en'"
            >
              English
            </button>
          </div>
        </div>
        <button class="btn btn-secondary" @click="showSettings = false">
          {{ texts.close }}
        </button>
      </div>
    </div>

    <div v-if="authStore.loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ lang === 'zh' ? '加载中...' : 'Loading...' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
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
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin-right: 20px;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.settings-section {
  margin-bottom: 20px;
}

.language-options {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
</style>
