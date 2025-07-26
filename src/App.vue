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
const currentUser = ref({
  username: 'Guest',
  role: 'guest', // 'user', 'admin', 'guest'
  email: '',
  permissions: [],
})
const lang = ref('zh')

// 预定义的管理员账户和用户数据
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

// 管理员数据
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
    role: 'user',
    status: '已停用',
    joinDate: '2024-02-01',
  },
])

// Navigation history and index
const navigationHistory = ref(['home'])
const currentHistoryIndex = ref(0)

// 权限检查函数
const hasPermission = (permission) => {
  if (!isLoggedIn.value) return false
  if (currentUser.value.role === 'admin') return true // 管理员拥有所有权限
  return currentUser.value.permissions?.includes(permission) || false
}

const isAdmin = computed(() => {
  return isLoggedIn.value && currentUser.value.role === 'admin'
})

const isUser = computed(() => {
  return isLoggedIn.value && currentUser.value.role === 'user'
})

// Navigation handler
const handleNavigation = (page) => {
  // 检查需要登录的页面
  const protectedPages = ['health', 'resources', 'forum', 'appointments']
  const adminPages = ['admin', 'user-management', 'system-settings']

  // 检查管理员页面权限
  if (adminPages.includes(page) && !isAdmin.value) {
    alert('您没有访问此页面的权限！')
    return
  }

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
const handleLogin = (loginData) => {
  const { username, password, loginType } = loginData

  // 检查管理员登录
  if (loginType === 'admin') {
    if (username === adminAccount.username && password === adminAccount.password) {
      isLoggedIn.value = true
      currentUser.value = {
        username: adminAccount.username,
        email: adminAccount.email,
        role: adminAccount.role,
        permissions: adminAccount.permissions,
      }
      currentPage.value = 'admin'
      return
    } else {
      alert('管理员用户名或密码错误！')
      return
    }
  }

  // 检查普通用户登录
  const user = regularUsers.value.find((u) => u.username === username && u.password === password)
  if (user) {
    isLoggedIn.value = true
    currentUser.value = {
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    }
    currentPage.value = 'home'
  } else {
    // 如果是注册的新用户数据
    if (loginData.isNewUser) {
      isLoggedIn.value = true
      currentUser.value = {
        username: loginData.username,
        email: loginData.email || loginData.username + '@example.com',
        role: 'user',
        permissions: ['view_content', 'create_posts'],
      }
      currentPage.value = 'home'
    } else {
      alert('用户名或密码错误！')
    }
  }
}

const handleLogout = () => {
  isLoggedIn.value = false
  currentUser.value = {
    username: 'Guest',
    role: 'guest',
    email: '',
    permissions: [],
  }
  currentPage.value = 'home'
}

// 管理员功能函数
const updateUserStatus = (userId, newStatus) => {
  const user = userList.value.find((u) => u.id === userId)
  if (user) {
    user.status = newStatus
  }
}

const deleteUser = (userId) => {
  userList.value = userList.value.filter((u) => u.id !== userId)
  systemStats.value.totalUsers -= 1
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

      <!-- Admin Panel -->
      <div v-else-if="currentPage === 'admin'" class="admin-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-12">
              <div class="admin-header mb-4">
                <h1 class="display-4 text-primary">
                  <i class="fas fa-shield-alt me-3"></i>
                  管理员控制面板
                </h1>
                <p class="lead">
                  欢迎回来，{{ currentUser.username }}！系统运行状态：{{ systemStats.systemHealth }}
                </p>
              </div>
            </div>
          </div>

          <!-- 系统统计卡片 -->
          <div class="row mb-5">
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-icon text-primary">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                  <h3>{{ systemStats.totalUsers.toLocaleString() }}</h3>
                  <p>注册用户</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-icon text-success">
                  <i class="fas fa-comments"></i>
                </div>
                <div class="stat-content">
                  <h3>{{ systemStats.totalPosts.toLocaleString() }}</h3>
                  <p>社区帖子</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-icon text-warning">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                  <h3>{{ systemStats.totalAppointments.toLocaleString() }}</h3>
                  <p>预约记录</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-icon text-info">
                  <i class="fas fa-server"></i>
                </div>
                <div class="stat-content">
                  <h3>{{ systemStats.systemHealth }}</h3>
                  <p>系统状态</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 管理员功能菜单 -->
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('user-management')">
                <div class="feature-icon text-primary">
                  <i class="fas fa-users-cog"></i>
                </div>
                <h4>用户管理</h4>
                <p>管理用户账户、权限和状态</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('content-management')">
                <div class="feature-icon text-success">
                  <i class="fas fa-edit"></i>
                </div>
                <h4>内容管理</h4>
                <p>管理系统内容、公告和资源</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('system-settings')">
                <div class="feature-icon text-warning">
                  <i class="fas fa-cogs"></i>
                </div>
                <h4>系统设置</h4>
                <p>配置系统参数和安全设置</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Management Page -->
      <div v-else-if="currentPage === 'user-management'" class="user-management-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-12">
              <div class="management-header mb-4">
                <h2>
                  <i class="fas fa-users-cog me-2"></i>
                  用户管理
                </h2>
                <button class="btn btn-secondary" @click="handleNavigation('admin')">
                  <i class="fas fa-arrow-left me-1"></i>
                  返回控制面板
                </button>
              </div>
            </div>
          </div>

          <!-- 用户列表 -->
          <div class="row">
            <div class="col-12">
              <div class="user-table-card">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>用户ID</th>
                        <th>用户名</th>
                        <th>邮箱</th>
                        <th>角色</th>
                        <th>状态</th>
                        <th>注册日期</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in userList" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge bg-primary">{{
                            user.role === 'user' ? '普通用户' : '管理员'
                          }}</span>
                        </td>
                        <td>
                          <span
                            :class="user.status === '活跃' ? 'badge bg-success' : 'badge bg-danger'"
                          >
                            {{ user.status }}
                          </span>
                        </td>
                        <td>{{ user.joinDate }}</td>
                        <td>
                          <button
                            v-if="user.status === '活跃'"
                            class="btn btn-sm btn-warning me-1"
                            @click="updateUserStatus(user.id, '已停用')"
                          >
                            停用
                          </button>
                          <button
                            v-else
                            class="btn btn-sm btn-success me-1"
                            @click="updateUserStatus(user.id, '活跃')"
                          >
                            启用
                          </button>
                          <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)">
                            删除
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

/* Admin Panel Styles */
.admin-header {
  text-align: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.admin-stat-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  height: 100%;
}

.admin-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-content p {
  color: #6c757d;
  margin: 0;
}

.admin-feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  height: 100%;
}

.admin-feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 2px solid #e9ecef;
}

.user-table-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #2c3e50 !important;
  color: white !important;
  border: none;
  padding: 1rem;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
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

  .admin-header {
    padding: 1.5rem 1rem;
  }

  .management-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .admin-stat-card,
  .admin-feature-card {
    margin-bottom: 1rem;
  }

  .table-responsive {
    border-radius: 1rem;
  }
}
</style>
