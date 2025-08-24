<template>
  <div class="container py-4">
    <div class="deployment-info">
      <h1 class="mb-4">{{ texts.deploymentInfo }}</h1>
      
      <!-- 系统健康状态 -->
      <div class="card mb-4">
        <div class="card-header" :class="healthStatusClass">
          <div class="d-flex justify-content-between align-items-center">
            <h2 class="h5 mb-0 text-white">
              <i class="fas fa-heartbeat me-2"></i>
              {{ texts.systemHealth }}
            </h2>
            <div class="d-flex align-items-center">
              <span class="badge" :class="healthBadgeClass" v-if="healthStatus">
                {{ healthStatus.status === 'healthy' ? texts.healthy : texts.unhealthy }}
              </span>
              <button 
                class="btn btn-sm btn-outline-light ms-2" 
                @click="checkHealth" 
                :disabled="isCheckingHealth"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isCheckingHealth }"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="healthStatus" class="row">
            <div class="col-md-3">
              <h6 class="text-muted mb-1">{{ texts.status }}</h6>
              <p class="mb-0">
                <i class="fas" :class="healthStatus.status === 'healthy' ? 'fa-check-circle text-success' : 'fa-exclamation-triangle text-danger'"></i>
                {{ healthStatus.status === 'healthy' ? texts.operational : texts.error }}
              </p>
            </div>
            <div class="col-md-3" v-if="healthStatus.version">
              <h6 class="text-muted mb-1">{{ texts.version }}</h6>
              <p class="mb-0">{{ healthStatus.version }}</p>
            </div>
            <div class="col-md-3" v-if="healthStatus.buildTime">
              <h6 class="text-muted mb-1">{{ texts.buildTime }}</h6>
              <p class="mb-0">{{ formatDate(healthStatus.buildTime) }}</p>
            </div>
            <div class="col-md-3">
              <h6 class="text-muted mb-1">{{ texts.lastCheck }}</h6>
              <p class="mb-0">{{ lastCheckTime ? formatDate(lastCheckTime) : texts.never }}</p>
            </div>
          </div>
          <div v-else-if="healthError" class="alert alert-danger mb-0">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ texts.healthCheckFailed }}: {{ healthError }}
          </div>
          <div v-else class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ texts.loading }}</span>
            </div>
            <p class="mt-2 mb-0 text-muted">{{ texts.checkingHealth }}</p>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">{{ texts.deploymentDetails }}</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h3 class="h6">{{ texts.publicUrl }}</h3>
              <p>
                <a :href="deploymentUrl" target="_blank" class="d-flex align-items-center">
                  <span>{{ deploymentUrl }}</span>
                  <i class="fas fa-external-link-alt ms-2 small"></i>
                </a>
              </p>
              
              <h3 class="h6 mt-4">{{ texts.deploymentPlatform }}</h3>
              <p>
                <a href="https://vercel.com" target="_blank" class="d-flex align-items-center">
                  Vercel
                  <i class="fas fa-external-link-alt ms-2 small"></i>
                </a>
              </p>
              
              <h3 class="h6 mt-4">{{ texts.lastDeployed }}</h3>
              <p>{{ new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US') }}</p>
            </div>
            
            <div class="col-md-6">
              <h3 class="h6">{{ texts.testAccounts }}</h3>
              <div class="table-responsive">
                <table class="table table-sm table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>{{ texts.role }}</th>
                      <th>{{ texts.email }}</th>
                      <th>{{ texts.password }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ texts.admin }}</td>
                      <td>admin@migrantcare.com</td>
                      <td>Admin123!</td>
                    </tr>
                    <tr>
                      <td>{{ texts.user }}</td>
                      <td>user@example.com</td>
                      <td>User123!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-success text-white">
          <h2 class="h5 mb-0">{{ texts.features }}</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="feature-item">
                <div class="feature-icon bg-primary text-white">
                  <i class="fas fa-lock"></i>
                </div>
                <div class="feature-content">
                  <h3 class="h6">{{ texts.externalAuth }}</h3>
                  <p>{{ texts.externalAuthDesc }}</p>
                  <a href="/login" class="btn btn-sm btn-outline-primary">{{ texts.tryIt }}</a>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="feature-item">
                <div class="feature-icon bg-info text-white">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="feature-content">
                  <h3 class="h6">{{ texts.emailSending }}</h3>
                  <p>{{ texts.emailSendingDesc }}</p>
                  <a href="/resources" class="btn btn-sm btn-outline-info">{{ texts.tryIt }}</a>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mt-4">
              <div class="feature-item">
                <div class="feature-icon bg-warning text-white">
                  <i class="fas fa-table"></i>
                </div>
                <div class="feature-content">
                  <h3 class="h6">{{ texts.interactiveTables }}</h3>
                  <p>{{ texts.interactiveTablesDesc }}</p>
                  <a href="/tables" class="btn btn-sm btn-outline-warning">{{ texts.tryIt }}</a>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mt-4">
              <div class="feature-item">
                <div class="feature-icon bg-secondary text-white">
                  <i class="fas fa-cloud"></i>
                </div>
                <div class="feature-content">
                  <h3 class="h6">{{ texts.cloudDeployment }}</h3>
                  <p>{{ texts.cloudDeploymentDesc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header bg-dark text-white">
          <h2 class="h5 mb-0">{{ texts.technicalDetails }}</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h3 class="h6">{{ texts.frontendStack }}</h3>
              <ul class="list-unstyled">
                <li><i class="fab fa-vuejs text-success me-2"></i> Vue 3 (Composition API)</li>
                <li><i class="fas fa-box text-primary me-2"></i> Pinia (State Management)</li>
                <li><i class="fas fa-route text-info me-2"></i> Vue Router</li>
                <li><i class="fab fa-bootstrap text-purple me-2"></i> Bootstrap 5</li>
              </ul>
            </div>
            
            <div class="col-md-6">
              <h3 class="h6">{{ texts.backendServices }}</h3>
              <ul class="list-unstyled">
                <li><i class="fas fa-database text-warning me-2"></i> Firebase Authentication</li>
                <li><i class="fas fa-server text-danger me-2"></i> Firebase Cloud Functions</li>
                <li><i class="fas fa-hdd text-success me-2"></i> Firebase Storage</li>
                <li><i class="fas fa-envelope text-primary me-2"></i> SendGrid Email API</li>
              </ul>
            </div>
            
            <div class="col-md-6 mt-4">
              <h3 class="h6">{{ texts.cicd }}</h3>
              <p>{{ texts.cicdDesc }}</p>
            </div>
            
            <div class="col-md-6 mt-4">
              <h3 class="h6">{{ texts.security }}</h3>
              <p>{{ texts.securityDesc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import apiClient from '../utils/apiClient'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const lang = ref(props.lang)

// 动态部署地址：优先使用环境变量，其次回退到当前 origin，最后回退到本地开发地址
const deploymentUrl = computed(() => {
  const envUrl = import.meta.env.VITE_PUBLIC_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') return envUrl
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'http://localhost:5173'
})

// 健康检查相关状态
const healthStatus = ref(null)
const healthError = ref(null)
const isCheckingHealth = ref(false)
const lastCheckTime = ref(null)
const healthCheckInterval = ref(null)

watch(() => props.lang, (newLang) => {
  lang.value = newLang
})

// 健康状态样式计算
const healthStatusClass = computed(() => {
  if (!healthStatus.value) return 'bg-secondary'
  return healthStatus.value.status === 'healthy' ? 'bg-success' : 'bg-danger'
})

const healthBadgeClass = computed(() => {
  if (!healthStatus.value) return 'bg-secondary'
  return healthStatus.value.status === 'healthy' ? 'bg-light text-success' : 'bg-light text-danger'
})

// 健康检查函数
const checkHealth = async () => {
  isCheckingHealth.value = true
  healthError.value = null
  
  try {
    const response = await apiClient.checkHealth()
    healthStatus.value = response
    lastCheckTime.value = new Date()
    console.log('健康检查成功:', response)
  } catch (error) {
    console.warn('健康检查失败:', error.message)
    healthError.value = error.message || '健康检查失败'
    healthStatus.value = null
  } finally {
    isCheckingHealth.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString(lang.value === 'zh' ? 'zh-CN' : 'en-US')
}

// 启动定期健康检查
const startHealthCheck = () => {
  // 立即执行一次
  checkHealth()
  
  // 每60秒检查一次
  healthCheckInterval.value = setInterval(() => {
    checkHealth()
  }, 60000)
}

// 停止健康检查
const stopHealthCheck = () => {
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value)
    healthCheckInterval.value = null
  }
}

// 组件挂载时启动健康检查
onMounted(() => {
  startHealthCheck()
})

// 组件卸载时停止健康检查
onUnmounted(() => {
  stopHealthCheck()
})
const texts = computed(() => {
  return lang.value === 'zh'
    ? {
        deploymentInfo: '部署信息',
        systemHealth: '系统健康状态',
        status: '状态',
        healthy: '健康',
        unhealthy: '异常',
        operational: '正常运行',
        error: '错误',
        version: '版本',
        buildTime: '构建时间',
        lastCheck: '最后检查',
        never: '从未',
        loading: '加载中...',
        checkingHealth: '正在检查系统健康状态...',
        healthCheckFailed: '健康检查失败',
        deploymentDetails: '部署详情',
        publicUrl: '公共URL',
        deploymentPlatform: '部署平台',
        lastDeployed: '最后部署时间',
        testAccounts: '测试账户',
        role: '角色',
        email: '邮箱',
        password: '密码',
        admin: '管理员',
        user: '普通用户',
        features: '功能特性',
        externalAuth: '外部认证',
        externalAuthDesc: '使用Firebase Authentication实现安全、用户友好的认证系统，支持邮箱密码和Google登录。',
        emailSending: '邮件发送',
        emailSendingDesc: '使用SendGrid API实现带附件的邮件发送功能，支持多文件上传和发送历史记录。',
        interactiveTables: '交互式表格',
        interactiveTablesDesc: '实现了两个交互式表格，支持排序、搜索、分页和按列筛选功能。',
        cloudDeployment: '云端部署',
        cloudDeploymentDesc: '应用部署在Vercel平台，配置了CI/CD流程，实现了自动构建和部署。',
        technicalDetails: '技术细节',
        frontendStack: '前端技术栈',
        backendServices: '后端服务',
        cicd: 'CI/CD流程',
        cicdDesc: '通过GitHub与Vercel集成，实现代码推送后自动构建和部署。',
        security: '安全措施',
        securityDesc: '实现了Token验证、CORS配置、环境变量管理等安全措施。',
        tryIt: '立即体验',
      }
    : {
        deploymentInfo: 'Deployment Information',
        systemHealth: 'System Health Status',
        status: 'Status',
        healthy: 'Healthy',
        unhealthy: 'Unhealthy',
        operational: 'Operational',
        error: 'Error',
        version: 'Version',
        buildTime: 'Build Time',
        lastCheck: 'Last Check',
        never: 'Never',
        loading: 'Loading...',
        checkingHealth: 'Checking system health status...',
        healthCheckFailed: 'Health check failed',
        deploymentDetails: 'Deployment Details',
        publicUrl: 'Public URL',
        deploymentPlatform: 'Deployment Platform',
        lastDeployed: 'Last Deployed',
        testAccounts: 'Test Accounts',
        role: 'Role',
        email: 'Email',
        password: 'Password',
        admin: 'Administrator',
        user: 'Regular User',
        features: 'Features',
        externalAuth: 'External Authentication',
        externalAuthDesc: 'Secure and user-friendly authentication system using Firebase Authentication, supporting email/password and Google login.',
        emailSending: 'Email Sending',
        emailSendingDesc: 'Email sending with attachments using SendGrid API, supporting multiple file uploads and sending history.',
        interactiveTables: 'Interactive Tables',
        interactiveTablesDesc: 'Two interactive tables with sorting, searching, pagination, and column filtering capabilities.',
        cloudDeployment: 'Cloud Deployment',
        cloudDeploymentDesc: 'Application deployed on Vercel platform with CI/CD pipeline for automated builds and deployments.',
        technicalDetails: 'Technical Details',
        frontendStack: 'Frontend Stack',
        backendServices: 'Backend Services',
        cicd: 'CI/CD Pipeline',
        cicdDesc: 'Automated builds and deployments through GitHub integration with Vercel.',
        security: 'Security Measures',
        securityDesc: 'Implemented token validation, CORS configuration, environment variable management, and other security measures.',
        tryIt: 'Try It',
      }
})
</script>

<style scoped>
.deployment-info {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  border-bottom: none;
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .feature-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .feature-content {
    width: 100%;
  }
}
</style>