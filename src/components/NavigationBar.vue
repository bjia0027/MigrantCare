<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <!-- Logo -->
      <a class="navbar-brand d-flex align-items-center" href="#" @click="navigateTo('home')">
        <div class="logo-icon">
          <i class="fas fa-heart text-primary me-2"></i>
        </div>
        <span class="fw-bold text-primary">MigrantCare</span>
      </a>

      <!-- Mobile toggle button -->
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

      <!-- Navigation items -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentPage === 'health' }"
              href="#"
              @click="navigateTo('health')"
            >
              <i class="fas fa-heartbeat me-1"></i>
              {{ texts.health }}
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentPage === 'resources' }"
              href="#"
              @click="navigateTo('resources')"
            >
              <i class="fas fa-search-location me-1"></i>
              {{ texts.resources }}
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentPage === 'forum' }"
              href="#"
              @click="navigateTo('forum')"
            >
              <i class="fas fa-comments me-1"></i>
              {{ texts.forum }}
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentPage === 'appointments' }"
              href="#"
              @click="navigateTo('appointments')"
            >
              <i class="fas fa-calendar-alt me-1"></i>
              {{ texts.appointments }}
            </a>
          </li>
        </ul>

        <!-- User authentication section -->
        <div class="d-flex align-items-center gap-3">
          <!-- Language Switcher -->
          <div class="dropdown me-3">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="langDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fas fa-globe me-1"></i>
              {{ lang === 'zh' ? '中文' : 'English' }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="langDropdown">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="switchLang('zh')">中文</a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="switchLang('en')">English</a>
              </li>
            </ul>
          </div>

          <div v-if="!isLoggedIn" class="auth-buttons">
            <button class="btn btn-outline-primary me-2" @click="navigateTo('login')">
              <i class="fas fa-sign-in-alt me-1"></i>
              {{ texts.login }}
            </button>
            <button class="btn btn-primary" @click="navigateTo('register')">
              <i class="fas fa-user-plus me-1"></i>
              {{ texts.register }}
            </button>
          </div>

          <!-- Logged in user section -->
          <div v-else class="dropdown">
            <button
              class="btn btn-light dropdown-toggle d-flex align-items-center"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="user-avatar me-2">
                <i class="fas fa-user-circle text-primary"></i>
              </div>
              <span class="user-name">{{ currentUser.username }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <a class="dropdown-item" href="#" @click="navigateTo('profile')">
                  <i class="fas fa-user me-2"></i>
                  {{ texts.profile }}
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="navigateTo('settings')">
                  <i class="fas fa-cog me-2"></i>
                  {{ texts.settings }}
                </a>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click="logout">
                  <i class="fas fa-sign-out-alt me-2"></i>
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
import { defineEmits, computed } from 'vue'

const emit = defineEmits(['navigate', 'login', 'logout', 'langChange'])

// Props for current page and user state
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
    default: () => ({ username: 'Guest' }),
  },
  lang: {
    type: String,
    default: 'zh',
  },
})

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      health: '健康信息',
      resources: '资源查找',
      forum: '社区论坛',
      appointments: '预约管理',
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
  emit('navigate', page)
}

const logout = () => {
  emit('logout')
}

const switchLang = (newLang) => {
  emit('langChange', newLang)
}
</script>

<style scoped>
.navbar {
  border-bottom: 2px solid #e9ecef;
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

.user-name {
  font-weight: 500;
  color: #495057;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
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
