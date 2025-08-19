<template>
  <div class="container py-4">
    <div class="deployment-info">
      <h1 class="mb-4">{{ texts.deploymentInfo }}</h1>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h2 class="h5 mb-0">{{ texts.deploymentDetails }}</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h3 class="h6">{{ texts.publicUrl }}</h3>
              <p>
                <a href="https://migrant-care.vercel.app" target="_blank" class="d-flex align-items-center">
                  <span>https://migrant-care.vercel.app</span>
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
import { ref, computed, watch } from 'vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const lang = ref(props.lang)

watch(() => props.lang, (newLang) => {
  lang.value = newLang
})
const texts = computed(() => {
  return lang.value === 'zh'
    ? {
        deploymentInfo: '部署信息',
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