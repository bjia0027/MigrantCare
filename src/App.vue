<script setup>
import { ref, computed } from 'vue'
import NavigationBar from './components/NavigationBar.vue'
import LoginForm from './components/LoginForm.vue'
import HealthInfo from './components/HealthInfo.vue'
import ResourceFinder from './components/ResourceFinder.vue'
import CommunityForum from './components/CommunityForum.vue'
import AppointmentManager from './components/AppointmentManager.vue'

// Application state
const currentPage = ref('home')
const isLoggedIn = ref(false)
const currentUser = ref({ username: 'Guest' })
const lang = ref('zh')

// Navigation history and index
const navigationHistory = ref(['home'])
const currentHistoryIndex = ref(0)

// Navigation handler
const handleNavigation = (page) => {
  // 检查需要登录的页面
  const protectedPages = ['health', 'resources', 'forum', 'appointments']

  if (protectedPages.includes(page) && !isLoggedIn.value) {
    alert('请先登录才能使用此功能！')
    currentPage.value = 'login'
    return
  }

  // 如果不是通过后退/前进按钮导航，则更新历史记录
  if (page !== 'back' && page !== 'forward') {
    // 移除当前位置之后的历史记录
    navigationHistory.value = navigationHistory.value.slice(0, currentHistoryIndex.value + 1)
    // 添加新页面到历史记录
    navigationHistory.value.push(page)
    currentHistoryIndex.value = navigationHistory.value.length - 1
  }
  currentPage.value = page
}

// 语言切换处理
const handleLangChange = (newLang) => {
  lang.value = newLang
}

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      welcome: '欢迎来到 MigrantCare',
      subtitle: '为澳洲移民提供全方位的健康关怀与生活支持服务',
      healthInfo: '健康信息',
      healthDesc: '获取移民体检、疫苗接种和医疗保健的全面指导',
      findResources: '查找资源',
      resourcesDesc: '快速找到附近的医院、诊所和社区服务机构',
      forum: '社区论坛',
      forumDesc: '与其他移民朋友交流经验，获得支持和建议',
      appointments: '预约管理',
      appointmentsDesc: '轻松管理您的医疗预约和健康检查安排',
      serviceStats: '我们的服务数据',
      serviceUsers: '服务用户',
      partners: '合作机构',
      onlineSupport: '在线支持',
      satisfaction: '满意度',
    },
    en: {
      welcome: 'Welcome to MigrantCare',
      subtitle: 'Comprehensive health care and life support services for migrants in Australia',
      healthInfo: 'Health Information',
      healthDesc: 'Get comprehensive guidance on medical examinations, vaccinations and healthcare',
      findResources: 'Find Resources',
      resourcesDesc: 'Quickly find nearby hospitals, clinics and community services',
      forum: 'Community Forum',
      forumDesc: 'Share experiences with other migrants, get support and advice',
      appointments: 'Appointment Management',
      appointmentsDesc: 'Easily manage your medical appointments and health check schedules',
      serviceStats: 'Our Service Statistics',
      serviceUsers: 'Service Users',
      partners: 'Partner Organizations',
      onlineSupport: 'Online Support',
      satisfaction: 'Satisfaction Rate',
    },
  }
  return translations[lang.value] || translations.zh
})

// Authentication handlers
const handleLogin = (userData) => {
  isLoggedIn.value = true
  currentUser.value = userData
  currentPage.value = 'home'
}

const handleLogout = () => {
  isLoggedIn.value = false
  currentUser.value = { username: 'Guest' }
  currentPage.value = 'home'
}
</script>

<template>
  <div id="app">
    <!-- Navigation Bar -->
    <NavigationBar
      :currentPage="currentPage"
      :isLoggedIn="isLoggedIn"
      :currentUser="currentUser"
      :lang="lang"
      @navigate="handleNavigation"
      @logout="handleLogout"
      @langChange="handleLangChange"
    />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Home Page -->
      <div v-if="currentPage === 'home'" class="home-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-12">
              <div class="welcome-section text-center">
                <div class="hero-content">
                  <h1 class="display-3 text-primary mb-4">
                    <i class="fas fa-heart me-3"></i>
                    {{ texts.welcome }}
                  </h1>
                  <p class="lead mb-5">{{ texts.subtitle }}</p>
                  <div class="hero-buttons">
                    <button class="btn btn-primary btn-lg me-3" @click="handleNavigation('health')">
                      <i class="fas fa-heartbeat me-2"></i>
                      {{ texts.healthInfo }}
                    </button>
                    <button
                      class="btn btn-outline-primary btn-lg"
                      @click="handleNavigation('resources')"
                    >
                      <i class="fas fa-search-location me-2"></i>
                      {{ texts.findResources }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Cards -->
          <div class="row mt-5">
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('health')">
                <div class="feature-icon">
                  <i class="fas fa-heartbeat text-danger"></i>
                </div>
                <h4>{{ texts.healthInfo }}</h4>
                <p>{{ texts.healthDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('resources')">
                <div class="feature-icon">
                  <i class="fas fa-search-location text-primary"></i>
                </div>
                <h4>{{ texts.findResources }}</h4>
                <p>{{ texts.resourcesDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('forum')">
                <div class="feature-icon">
                  <i class="fas fa-comments text-success"></i>
                </div>
                <h4>{{ texts.forum }}</h4>
                <p>{{ texts.forumDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('appointments')">
                <div class="feature-icon">
                  <i class="fas fa-calendar-alt text-warning"></i>
                </div>
                <h4>{{ texts.appointments }}</h4>
                <p>{{ texts.appointmentsDesc }}</p>
              </div>
            </div>
          </div>

          <!-- Statistics Section -->
          <div class="row mt-5">
            <div class="col-12">
              <div class="stats-section">
                <h2 class="text-center mb-5">{{ texts.serviceStats }}</h2>
                <div class="row">
                  <div class="col-md-3 col-sm-6 mb-4">
                    <div class="stat-item text-center">
                      <h3 class="stat-number text-primary">15,000+</h3>
                      <p class="stat-label">{{ texts.serviceUsers }}</p>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-4">
                    <div class="stat-item text-center">
                      <h3 class="stat-number text-success">500+</h3>
                      <p class="stat-label">{{ texts.partners }}</p>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-4">
                    <div class="stat-item text-center">
                      <h3 class="stat-number text-warning">24/7</h3>
                      <p class="stat-label">{{ texts.onlineSupport }}</p>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-4">
                    <div class="stat-item text-center">
                      <h3 class="stat-number text-info">95%</h3>
                      <p class="stat-label">{{ texts.satisfaction }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Information Page -->
      <HealthInfo v-else-if="currentPage === 'health'" />

      <!-- Resource Finder Page -->
      <ResourceFinder v-else-if="currentPage === 'resources'" />

      <!-- Community Forum Page -->
      <CommunityForum v-else-if="currentPage === 'forum'" />

      <!-- Appointment Manager Page -->
      <AppointmentManager v-else-if="currentPage === 'appointments'" />

      <!-- Login/Register Page -->
      <div v-else-if="currentPage === 'login' || currentPage === 'register'" class="auth-page">
        <LoginForm @login="handleLogin" />
      </div>

      <!-- Profile Page -->
      <div v-else-if="currentPage === 'profile'" class="profile-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-md-8 offset-md-2">
              <div class="profile-card">
                <h2 class="mb-4">
                  <i class="fas fa-user me-2"></i>
                  个人资料
                </h2>
                <div class="profile-info">
                  <div class="info-item"><strong>用户名：</strong> {{ currentUser.username }}</div>
                  <div class="info-item"><strong>注册日期：</strong> 2024年1月1日</div>
                  <div class="info-item"><strong>会员等级：</strong> 标准会员</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Page -->
      <div v-else-if="currentPage === 'settings'" class="settings-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-md-8 offset-md-2">
              <div class="settings-card">
                <h2 class="mb-4">
                  <i class="fas fa-cog me-2"></i>
                  设置
                </h2>
                <div class="settings-options">
                  <div class="setting-item">
                    <h5>通知设置</h5>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="emailNotif" checked />
                      <label class="form-check-label" for="emailNotif"> 邮件通知 </label>
                    </div>
                  </div>
                  <div class="setting-item">
                    <h5>语言设置</h5>
                    <select class="form-select">
                      <option>简体中文</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="site-footer mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5>MigrantCare</h5>
            <p class="text-muted">为澳洲移民提供全方位的健康关怀与生活支持服务</p>
          </div>
          <div class="col-md-6 text-end">
            <p class="text-muted">&copy; 2024 MigrantCare. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5rem 2rem;
  border-radius: 2rem;
  margin-bottom: 3rem;
}

.hero-buttons .btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 50px;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.stats-section {
  background: #f8f9fa;
  padding: 3rem 2rem;
  border-radius: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

.profile-card,
.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-item,
.setting-item {
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child,
.setting-item:last-child {
  border-bottom: none;
}

.site-footer {
  background: #2c3e50;
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .welcome-section {
    padding: 3rem 1rem;
  }

  .hero-buttons .btn {
    width: 100%;
    margin-bottom: 1rem;
  }

  .feature-card {
    margin-bottom: 1rem;
  }

  .stats-section {
    padding: 2rem 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}
</style>
