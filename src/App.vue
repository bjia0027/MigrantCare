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
const showProfile = ref(false)
const showSettings = ref(false)

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
      viewProfile: '查看个人资料',
      settings: '设置',
      personalInfo: '个人资料',
      username: '用户名',
      email: '邮箱',
      accountType: '账户类型',
      adminPanel: '管理员控制面板',
      adminDesc: '欢迎回来，管理员！系统运行状态：正常',
      totalUsers: '15,000+',
      totalPosts: '500+',
      totalAppointments: '8,574',
      systemStatus: '正常',
      userManagement: '用户管理',
      userManagementDesc: '管理用户账户、权限和状态',
      contentModeration: '内容管理',
      contentModerationDesc: '管理系统内容、公告和资源',
      systemSettings: '系统设置',
      systemSettingsDesc: '配置系统参数和安全设置',
      manage: '管理',
      moderate: '管理',
      configure: '配置',
      backToHome: '返回首页',
      // 用户管理页面
      backToPanel: '返回控制面板',
      userId: '用户ID',
      userRole: '角色',
      userStatus: '状态',
      registrationDate: '注册日期',
      actions: '操作',
      normalUser: '普通用户',
      admin: '管理员',
      active: '活跃',
      disabled: '已停用',
      disable: '停用',
      enable: '启用',
      delete: '删除',
      // 管理面板统计标签
      registeredUsers: '注册用户',
      communityPosts: '社区帖子',
      appointmentRecords: '预约记录',
      systemStatusLabel: '系统状态',
      // 内容管理页面
      contentManagement: '内容管理',
      announcementManagement: '系统公告管理',
      announcementDesc: '发布和管理系统公告、重要通知',
      publishAnnouncement: '发布公告',
      viewHistory: '查看历史',
      healthInfoManagement: '健康信息管理',
      healthInfoDesc: '更新健康指南、疫苗信息等内容',
      editContent: '编辑内容',
      preview: '预览',
      resourceManagement: '资源信息管理',
      resourceDesc: '管理医疗机构、社区资源信息',
      addResource: '添加资源',
      manageResources: '管理资源',
      forumModeration: '论坛内容审核',
      forumModerationDesc: '审核社区论坛帖子和评论',
      pendingReview: '待审核',
      reviewHistory: '审核历史',
      recentActivity: '最近内容活动',
      published: '发布',
      reviewed: '审核',
      added: '添加',
      updatedVaccineGuide: '更新了疫苗接种指南',
      approvedForumPosts: '审核通过3条论坛帖子',
      addedMedicalResources: '新增了5个医疗资源',
      hoursAgo: '小时前',
      daysAgo: '天前',
      // 系统设置页面
      basicSettings: '基本设置',
      siteName: '站点名称',
      siteDescription: '站点描述',
      defaultLanguage: '默认语言',
      simplifiedChinese: '简体中文',
      securitySettings: '安全设置',
      loginFailureLimit: '登录失败限制',
      failureAttempts: '连续失败次数限制',
      sessionTimeout: '会话超时时间',
      thirtyMinutes: '30分钟',
      oneHour: '1小时',
      twoHours: '2小时',
      fourHours: '4小时',
      twoFactorAuth: '启用两步验证',
      emailSettings: '邮件设置',
      smtpServer: 'SMTP服务器',
      port: '端口',
      emailNotifications: '启用邮件通知',
      systemMaintenance: '系统维护',
      databaseStatus: '数据库状态',
      normal: '正常',
      checkConnection: '检查连接',
      systemBackup: '系统备份',
      lastBackup: '上次备份',
      backupNow: '立即备份',
      clearCache: '清理系统缓存',
      saveAllSettings: '保存所有设置',
      resetToDefault: '重置为默认',
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
      viewProfile: 'View Profile',
      settings: 'Settings',
      personalInfo: 'Personal Information',
      username: 'Username',
      email: 'Email',
      accountType: 'Account Type',
      adminPanel: 'Admin Control Panel',
      adminDesc: 'Welcome back, Admin! System status: Normal',
      totalUsers: '15,000+',
      totalPosts: '500+',
      totalAppointments: '8,574',
      systemStatus: 'Normal',
      userManagement: 'User Management',
      userManagementDesc: 'Manage user accounts, permissions, and status',
      contentModeration: 'Content Management',
      contentModerationDesc: 'Manage system content, announcements, and resources',
      systemSettings: 'System Settings',
      systemSettingsDesc: 'Configure system parameters and security settings',
      manage: 'Manage',
      moderate: 'Manage',
      configure: 'Configure',
      backToHome: 'Back to Home',
      // User Management Page
      backToPanel: 'Back to Control Panel',
      userId: 'User ID',
      userRole: 'Role',
      userStatus: 'Status',
      registrationDate: 'Registration Date',
      actions: 'Actions',
      normalUser: 'Regular User',
      admin: 'Administrator',
      active: 'Active',
      disabled: 'Disabled',
      disable: 'Disable',
      enable: 'Enable',
      delete: 'Delete',
      // Admin Panel Statistics Labels
      registeredUsers: 'Registered Users',
      communityPosts: 'Community Posts',
      appointmentRecords: 'Appointment Records',
      systemStatusLabel: 'System Status',
      // Content Management Page
      contentManagement: 'Content Management',
      announcementManagement: 'System Announcement Management',
      announcementDesc: 'Publish and manage system announcements and important notices',
      publishAnnouncement: 'Publish Announcement',
      viewHistory: 'View History',
      healthInfoManagement: 'Health Information Management',
      healthInfoDesc: 'Update health guidelines, vaccination information, etc.',
      editContent: 'Edit Content',
      preview: 'Preview',
      resourceManagement: 'Resource Information Management',
      resourceDesc: 'Manage medical institutions and community resource information',
      addResource: 'Add Resource',
      manageResources: 'Manage Resources',
      forumModeration: 'Forum Content Moderation',
      forumModerationDesc: 'Review community forum posts and comments',
      pendingReview: 'Pending Review',
      reviewHistory: 'Review History',
      recentActivity: 'Recent Content Activity',
      published: 'Published',
      reviewed: 'Reviewed',
      added: 'Added',
      updatedVaccineGuide: 'Updated vaccination guidelines',
      approvedForumPosts: 'Approved 3 forum posts',
      addedMedicalResources: 'Added 5 medical resources',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      // System Settings Page
      basicSettings: 'Basic Settings',
      siteName: 'Site Name',
      siteDescription: 'Site Description',
      defaultLanguage: 'Default Language',
      simplifiedChinese: 'Simplified Chinese',
      securitySettings: 'Security Settings',
      loginFailureLimit: 'Login Failure Limit',
      failureAttempts: 'Consecutive failure attempts limit',
      sessionTimeout: 'Session Timeout',
      thirtyMinutes: '30 minutes',
      oneHour: '1 hour',
      twoHours: '2 hours',
      fourHours: '4 hours',
      twoFactorAuth: 'Enable Two-Factor Authentication',
      emailSettings: 'Email Settings',
      smtpServer: 'SMTP Server',
      port: 'Port',
      emailNotifications: 'Enable Email Notifications',
      systemMaintenance: 'System Maintenance',
      databaseStatus: 'Database Status',
      normal: 'Normal',
      checkConnection: 'Check Connection',
      systemBackup: 'System Backup',
      lastBackup: 'Last Backup',
      backupNow: 'Backup Now',
      clearCache: 'Clear System Cache',
      saveAllSettings: 'Save All Settings',
      resetToDefault: 'Reset to Default',
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
                      {{ texts.healthInfo }}
                    </button>
                    <button
                      class="btn btn-outline-primary btn-lg"
                      @click="handleNavigation('resources')"
                    >
                      {{ texts.findResources }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户信息展示 -->
          <div class="row mt-5" v-if="currentUser.username !== 'Guest'">
            <div class="col-12">
              <div class="user-welcome-card">
                <h3>{{ texts.welcome }}, {{ currentUser.username }}!</h3>
                <p>
                  {{
                    currentUser.email || (lang === 'zh' ? '暂无邮箱信息' : 'No email information')
                  }}
                </p>
                <div class="user-actions">
                  <button class="btn btn-primary me-2" @click="showProfile = !showProfile">
                    {{ texts.viewProfile }}
                  </button>
                  <button class="btn btn-outline-secondary" @click="showSettings = !showSettings">
                    {{ texts.settings }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 个人资料部分 -->
          <div class="row mt-4" v-if="showProfile && currentUser.username !== 'Guest'">
            <div class="col-12">
              <div class="profile-section">
                <h4>{{ texts.personalInfo }}</h4>
                <div class="profile-info">
                  <p>
                    <strong>{{ texts.username }}:</strong> {{ currentUser.username }}
                  </p>
                  <p>
                    <strong>{{ texts.email }}:</strong>
                    {{ currentUser.email || (lang === 'zh' ? '未设置' : 'Not set') }}
                  </p>
                  <p>
                    <strong>{{ texts.accountType }}:</strong>
                    {{ currentUser.role === 'admin' ? texts.admin : texts.normalUser }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Cards -->
          <div class="row mt-5">
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('health')">
                <h4>{{ texts.healthInfo }}</h4>
                <p>{{ texts.healthDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('resources')">
                <h4>{{ texts.findResources }}</h4>
                <p>{{ texts.resourcesDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('forum')">
                <h4>{{ texts.forum }}</h4>
                <p>{{ texts.forumDesc }}</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="feature-card h-100" @click="handleNavigation('appointments')">
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
      <HealthInfo v-else-if="currentPage === 'health'" :current-user="currentUser" :lang="lang" />

      <!-- Resource Finder Page -->
      <ResourceFinder
        v-else-if="currentPage === 'resources'"
        :current-user="currentUser"
        :lang="lang"
      />

      <!-- Community Forum Page -->
      <CommunityForum
        v-else-if="currentPage === 'forum'"
        :current-user="currentUser"
        :lang="lang"
      />

      <!-- Appointment Manager Page -->
      <AppointmentManager v-else-if="currentPage === 'appointments'" />

      <!-- Validation Demo Page -->

      <!-- Login/Register Page -->
      <div v-else-if="currentPage === 'login' || currentPage === 'register'" class="auth-page">
        <LoginForm @login="handleLogin" :lang="lang" />
      </div>

      <!-- Profile Page -->
      <div v-else-if="currentPage === 'profile'" class="profile-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-md-8 offset-md-2">
              <div class="profile-card">
                <h2 class="mb-4">个人资料</h2>
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
                <h2 class="mb-4">设置</h2>
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
                <h1 class="display-4 text-primary">{{ texts.adminPanel }}</h1>
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
                <div class="stat-content">
                  <h3>{{ systemStats.totalUsers.toLocaleString() }}</h3>
                  <p>{{ texts.registeredUsers }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-content">
                  <h3>{{ systemStats.totalPosts.toLocaleString() }}</h3>
                  <p>{{ texts.communityPosts }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-content">
                  <h3>{{ systemStats.totalAppointments.toLocaleString() }}</h3>
                  <p>{{ texts.appointmentRecords }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="admin-stat-card">
                <div class="stat-content">
                  <h3>{{ systemStats.systemHealth }}</h3>
                  <p>{{ texts.systemStatusLabel }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 管理员功能菜单 -->
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('user-management')">
                <h4>{{ texts.userManagement }}</h4>
                <p>{{ texts.userManagementDesc }}</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('content-management')">
                <h4>{{ texts.contentModeration }}</h4>
                <p>{{ texts.contentModerationDesc }}</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="admin-feature-card" @click="handleNavigation('system-settings')">
                <h4>{{ texts.systemSettings }}</h4>
                <p>{{ texts.systemSettingsDesc }}</p>
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
                <h2>{{ texts.userManagement }}</h2>
                <button class="btn btn-secondary" @click="handleNavigation('admin')">
                  {{ texts.backToPanel }}
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
                        <th>{{ texts.userId }}</th>
                        <th>{{ texts.username }}</th>
                        <th>{{ texts.email }}</th>
                        <th>{{ texts.userRole }}</th>
                        <th>{{ texts.userStatus }}</th>
                        <th>{{ texts.registrationDate }}</th>
                        <th>{{ texts.actions }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in userList" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge bg-primary">{{
                            user.role === 'user' ? texts.normalUser : texts.admin
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
                            {{ texts.disable }}
                          </button>
                          <button
                            v-else
                            class="btn btn-sm btn-success me-1"
                            @click="updateUserStatus(user.id, '活跃')"
                          >
                            {{ texts.enable }}
                          </button>
                          <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)">
                            {{ texts.delete }}
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

      <!-- Content Management Page -->
      <div v-else-if="currentPage === 'content-management'" class="content-management-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-12">
              <div class="management-header mb-4">
                <h2>{{ texts.contentManagement }}</h2>
                <button class="btn btn-secondary" @click="handleNavigation('admin')">
                  {{ texts.backToPanel }}
                </button>
              </div>
            </div>
          </div>

          <!-- 内容管理功能 -->
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="content-card">
                <h4>{{ texts.announcementManagement }}</h4>
                <p>{{ texts.announcementDesc }}</p>
                <div class="mt-3">
                  <button class="btn btn-primary btn-sm me-2">
                    {{ texts.publishAnnouncement }}
                  </button>
                  <button class="btn btn-outline-secondary btn-sm">{{ texts.viewHistory }}</button>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="content-card">
                <h4>{{ texts.healthInfoManagement }}</h4>
                <p>{{ texts.healthInfoDesc }}</p>
                <div class="mt-3">
                  <button class="btn btn-primary btn-sm me-2">{{ texts.editContent }}</button>
                  <button class="btn btn-outline-secondary btn-sm">{{ texts.preview }}</button>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="content-card">
                <h4>{{ texts.resourceManagement }}</h4>
                <p>{{ texts.resourceDesc }}</p>
                <div class="mt-3">
                  <button class="btn btn-primary btn-sm me-2">{{ texts.addResource }}</button>
                  <button class="btn btn-outline-secondary btn-sm">
                    {{ texts.manageResources }}
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="content-card">
                <h4>{{ texts.forumModeration }}</h4>
                <p>{{ texts.forumModerationDesc }}</p>
                <div class="mt-3">
                  <button class="btn btn-warning btn-sm me-2">{{ texts.pendingReview }} (3)</button>
                  <button class="btn btn-outline-secondary btn-sm">
                    {{ texts.reviewHistory }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="row">
            <div class="col-12">
              <div class="activity-card">
                <h4>{{ texts.recentActivity }}</h4>
                <div class="activity-list">
                  <div class="activity-item">
                    <span class="badge bg-success me-2">{{ texts.published }}</span>
                    <span>{{ texts.updatedVaccineGuide }}</span>
                    <small class="text-muted ms-auto">{{ texts.hoursAgo }}</small>
                  </div>
                  <div class="activity-item">
                    <span class="badge bg-warning me-2">{{ texts.reviewed }}</span>
                    <span>{{ texts.approvedForumPosts }}</span>
                    <small class="text-muted ms-auto">4{{ texts.hoursAgo }}</small>
                  </div>
                  <div class="activity-item">
                    <span class="badge bg-info me-2">{{ texts.added }}</span>
                    <span>{{ texts.addedMedicalResources }}</span>
                    <small class="text-muted ms-auto">1{{ texts.daysAgo }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings Page -->
      <div v-else-if="currentPage === 'system-settings'" class="system-settings-page">
        <div class="container mt-5">
          <div class="row">
            <div class="col-12">
              <div class="management-header mb-4">
                <h2>{{ texts.systemSettings }}</h2>
                <button class="btn btn-secondary" @click="handleNavigation('admin')">
                  {{ texts.backToPanel }}
                </button>
              </div>
            </div>
          </div>

          <!-- 系统设置选项 -->
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="settings-card">
                <h4>{{ texts.basicSettings }}</h4>
                <div class="setting-item">
                  <label class="form-label">{{ texts.siteName }}</label>
                  <input type="text" class="form-control" value="MigrantCare" />
                </div>
                <div class="setting-item">
                  <label class="form-label">{{ texts.siteDescription }}</label>
                  <textarea class="form-control" rows="2">
为澳洲移民提供全方位的健康关怀与生活支持服务</textarea
                  >
                </div>
                <div class="setting-item">
                  <label class="form-label">{{ texts.defaultLanguage }}</label>
                  <select class="form-select">
                    <option value="zh" selected>{{ texts.simplifiedChinese }}</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="settings-card">
                <h4>{{ texts.securitySettings }}</h4>
                <div class="setting-item">
                  <label class="form-label">{{ texts.loginFailureLimit }}</label>
                  <input type="number" class="form-control" value="5" min="1" max="10" />
                  <small class="form-text text-muted">{{ texts.failureAttempts }}</small>
                </div>
                <div class="setting-item">
                  <label class="form-label">{{ texts.sessionTimeout }}</label>
                  <select class="form-select">
                    <option>{{ texts.thirtyMinutes }}</option>
                    <option selected>{{ texts.oneHour }}</option>
                    <option>{{ texts.twoHours }}</option>
                    <option>{{ texts.fourHours }}</option>
                  </select>
                </div>
                <div class="setting-item">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="twoFactorAuth" checked />
                    <label class="form-check-label" for="twoFactorAuth">{{
                      texts.twoFactorAuth
                    }}</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="settings-card">
                <h4>{{ texts.emailSettings }}</h4>
                <div class="setting-item">
                  <label class="form-label">{{ texts.smtpServer }}</label>
                  <input type="text" class="form-control" value="smtp.example.com" />
                </div>
                <div class="setting-item">
                  <label class="form-label">{{ texts.port }}</label>
                  <input type="number" class="form-control" value="587" />
                </div>
                <div class="setting-item">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      checked
                    />
                    <label class="form-check-label" for="emailNotifications">{{
                      texts.emailNotifications
                    }}</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="settings-card">
                <h4>{{ texts.systemMaintenance }}</h4>
                <div class="setting-item">
                  <label class="form-label">{{ texts.databaseStatus }}</label>
                  <div class="d-flex align-items-center">
                    <span class="badge bg-success me-2">{{ texts.normal }}</span>
                    <button class="btn btn-outline-primary btn-sm">
                      {{ texts.checkConnection }}
                    </button>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="form-label">{{ texts.systemBackup }}</label>
                  <div class="d-flex align-items-center">
                    <span class="text-muted me-2">{{ texts.lastBackup }}: 2024-01-15</span>
                    <button class="btn btn-warning btn-sm">{{ texts.backupNow }}</button>
                  </div>
                </div>
                <div class="setting-item">
                  <button class="btn btn-danger">{{ texts.clearCache }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="row">
            <div class="col-12">
              <div class="text-center">
                <button class="btn btn-success btn-lg me-3">{{ texts.saveAllSettings }}</button>
                <button class="btn btn-outline-secondary btn-lg">{{ texts.resetToDefault }}</button>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  min-height: calc(100vh - 76px);
  background: #f8f9fa;
}

.home-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: calc(100vh - 76px);
}

.welcome-section {
  padding: 4rem 0;
}

.hero-content h1 {
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-content p {
  font-size: 1.25rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-buttons .btn {
  border-radius: 50px;
  padding: 1rem 2rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.hero-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  color: #333;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  color: #333;
}

.feature-card h4 {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stats-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 3rem;
  color: #333;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-item {
  padding: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

/* 用户卡片样式 */
.user-welcome-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  color: #333;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.user-welcome-card h3 {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-actions {
  margin-top: 1rem;
}

.profile-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  color: #333;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.profile-info p {
  margin-bottom: 0.5rem;
  color: #333;
}

/* 其他页面样式 */
.auth-page,
.profile-page,
.settings-page,
.user-management-page,
.content-management-page,
.system-settings-page {
  min-height: calc(100vh - 76px);
  background: #f8f9fa;
  padding: 2rem 0;
}

.profile-card,
.settings-card,
.content-card,
.activity-card,
.management-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.content-card h4,
.activity-card h4 {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
}

.content-card p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.activity-item:last-child {
  border-bottom: none;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.admin-panel {
  background: #f8f9fa;
  min-height: calc(100vh - 76px);
  padding: 2rem 0;
}

.admin-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.admin-stat-card,
.admin-action-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.admin-stat-card:hover,
.admin-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.admin-feature-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.admin-feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.admin-feature-card h4 {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stat-content {
  padding: 1rem 0;
}

.stat-content h3 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-content p {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.management-header h2 {
  color: #667eea;
  font-weight: 600;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-buttons .btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }

  .feature-card,
  .user-welcome-card {
    margin-bottom: 1rem;
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
}
</style>
