<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <!-- 品牌：改为 RouterLink 到首页 -->
      <RouterLink class="navbar-brand d-flex align-items-center" to="/">
        <div class="logo-icon">
          <i class="fas fa-heart text-primary me-2"></i>
        </div>
        <span class="fw-bold text-primary">MigrantCare</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: currentPage === 'health' }" to="/health">
              {{ texts.health }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: currentPage === 'resources' }"
              to="/resources"
            >
              {{ texts.resources }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: currentPage === 'forum' }" to="/forum">
              {{ texts.forum }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: currentPage === 'appointments' }"
              to="/appointments"
            >
              {{ texts.appointments }}
            </RouterLink>
          </li>

          <li v-if="isAdmin" class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: currentPage === 'tables' }"
              to="/tables"
            >
              {{ texts.tables }}
            </RouterLink>
          </li>
          

          <!-- 用户管理只对管理员显示，并跳转到用户管理页面 -->
          <li v-if="isAdmin" class="nav-item">
            <RouterLink class="nav-link" :class="{ active: currentPage === 'users' }" to="/users">
              {{ texts.userManagement }}
            </RouterLink>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3">
          <div class="btn-group me-3" role="group" aria-label="Language switcher">
            <button
              type="button"
              class="btn"
              :class="lang === 'zh' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchLang('zh')"
            >
              中文
            </button>
            <button
              type="button"
              class="btn"
              :class="lang === 'en' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchLang('en')"
            >
              English
            </button>
          </div>

          <div v-if="!isLoggedIn" class="auth-buttons">
            <RouterLink class="btn btn-outline-primary me-2" to="/login">
              {{ texts.login }}
            </RouterLink>
            <RouterLink class="btn btn-primary" to="/register">
              {{ texts.register }}
            </RouterLink>
          </div>

          <div v-else class="dropdown">
            <button
              class="btn btn-light dropdown-toggle d-flex align-items-center"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="user-avatar me-2">
                <div class="avatar-circle" :class="isAdmin ? 'text-warning' : 'text-primary'">
                  {{ isAdmin ? 'A' : 'U' }}
                </div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.username }}</span>
                <small class="user-role" :class="isAdmin ? 'text-warning' : 'text-muted'">
                  {{ isAdmin ? '管理员' : '普通用户' }}
                </small>
              </div>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li class="dropdown-header">
                <div class="user-details">
                  <div class="fw-bold">{{ currentUser.username }}</div>
                  <small class="text-muted">{{ currentUser.email }}</small>
                  <div>
                    <span :class="isAdmin ? 'badge bg-warning' : 'badge bg-primary'">
                      {{ isAdmin ? '管理员' : '普通用户' }}
                    </span>
                  </div>
                </div>
              </li>
              <li><hr class="dropdown-divider" /></li>

              <li v-if="isAdmin">
                <RouterLink class="dropdown-item" to="/users">
                  {{ texts.userManagement }}
                </RouterLink>
              </li>
              <li v-if="isAdmin"><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="emit('toggle-profile')">
                  {{ texts.profile }}
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="emit('toggle-settings')">
                  {{ texts.settings }}
                </a>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                  {{ texts.logout }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { Dropdown } from 'bootstrap'

const emit = defineEmits(['navigate', 'logout', 'langChange', 'toggle-profile', 'toggle-settings'])

const props = defineProps({
  currentPage: {
    type: String,
    default: 'home',
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: () => ({
      username: 'Guest',
      role: 'guest',
      email: '',
      permissions: [],
    }),
  },
  lang: {
    type: String,
    default: 'zh',
  },
})

const isAdmin = computed(() => {
  return props.isLoggedIn && props.currentUser.role === 'admin'
})

const isUser = computed(() => {
  return props.isLoggedIn && props.currentUser.role === 'user'
})

const texts = computed(() => {
  const translations = {
    zh: {
      health: '健康信息',
      resources: '资源查找',
      forum: '社区论坛',
      appointments: '预约管理',
      tables: '交互式表格',
      deployment: '部署信息',
      validationDemo: '验证演示',
      admin: '管理面板',
      userManagement: '用户管理',
      login: '登录',
      register: '注册',
      profile: '个人资料',
      settings: '设置',
      logout: '退出登录',
    },
    en: {
      health: 'Health Info',
      resources: 'Find Resources',
      forum: 'Community',
      appointments: 'Appointments',
      tables: 'Interactive Tables',
      deployment: 'Deployment Info',
      validationDemo: 'Validation Demo',
      admin: 'Admin Panel',
      userManagement: 'User Management',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
  }
  return translations[props.lang] || translations.zh
})

const navigateTo = (page) => {
  console.log('NavigationBar: navigateTo called with:', page)
  emit('navigate', page)
  console.log('NavigationBar: navigate event emitted')
}

const logout = () => {
  console.log('NavigationBar: logout method called')
  emit('logout')
  console.log('NavigationBar: logout event emitted')
}

const switchLang = (newLang) => {
  console.log('NavigationBar: switchLang called with:', newLang)
  console.log('NavigationBar: Current lang before change:', props.lang)
  emit('langChange', newLang)
  console.log('NavigationBar: langChange event emitted with:', newLang)
}

// 初始化Bootstrap下拉菜单
onMounted(() => {
  nextTick(() => {
    try {
      // 初始化所有下拉菜单
      const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]')
      dropdownElements.forEach(element => {
        new Dropdown(element)
      })
      console.log('NavigationBar: Bootstrap dropdowns initialized')
    } catch (error) {
      console.error('NavigationBar: Failed to initialize dropdowns:', error)
    }
  })
})
</script>

<style scoped>
.navbar {
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 3000; /* 确保位于任何覆盖层之上，可点击 */
}

.navbar-brand {
  font-size: 1.5rem;
  text-decoration: none;
}

.navbar-brand:hover {
  text-decoration: none;
}

.logo-icon {
  font-size: 1.8rem;
}

.nav-link {
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  color: #6c757d;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateY(-1px);
}

.nav-link.active {
  color: #0d6efd;
  background-color: #e7f3ff;
  font-weight: 600;
}

.auth-buttons .btn {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.user-avatar {
  font-size: 1.8rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  color: #495057;
  margin: 0;
}

.user-role {
  font-size: 0.75rem;
  margin: 0;
}

.user-details {
  padding: 0.25rem 0;
  text-align: center;
  min-width: 200px;
}

.user-details .fw-bold {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.user-details small {
  display: block;
  margin-bottom: 0.5rem;
}

.user-details .badge {
  font-size: 0.7rem;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  z-index: 3001; /* 确保下拉菜单显示在导航栏之上 */
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .navbar-nav {
    margin-top: 1rem;
  }

  .auth-buttons {
    margin-top: 1rem;
    width: 100%;
  }

  .auth-buttons .btn {
    width: 48%;
    margin-bottom: 0.5rem;
  }

  .dropdown {
    width: 100%;
    margin-top: 1rem;
  }

  .dropdown-toggle {
    width: 100%;
    justify-content: center;
  }
}
</style>
