<template>
  <div class="admin-audit-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fas fa-shield-alt me-2 text-warning"></i>
        {{ texts.auditLog }}
      </h2>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-primary"
          @click="refreshLogs"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-sync-alt me-2"></i>
          {{ texts.refresh }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="showFilters = !showFilters"
        >
          <i class="fas fa-filter me-2"></i>
          {{ texts.filters }}
        </button>
      </div>
    </div>

    <div v-if="showFilters" class="filters-section mb-4">
      <div class="card">
        <div class="card-header bg-light">
          <h6 class="mb-0">
            <i class="fas fa-search me-2"></i>
            {{ texts.filterOptions }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label for="startDate" class="form-label">{{ texts.startDate }}</label>
              <input
                type="date"
                class="form-control"
                id="startDate"
                v-model="filters.startDate"
              />
            </div>
            <div class="col-md-3 mb-3">
              <label for="endDate" class="form-label">{{ texts.endDate }}</label>
              <input
                type="date"
                class="form-control"
                id="endDate"
                v-model="filters.endDate"
              />
            </div>
            <div class="col-md-3 mb-3">
              <label for="actionFilter" class="form-label">{{ texts.actionType }}</label>
              <select class="form-select" id="actionFilter" v-model="filters.action">
                <option value="">{{ texts.allActions }}</option>
                <option value="login">{{ texts.login }}</option>
                <option value="logout">{{ texts.logout }}</option>
                <option value="email_sent">{{ texts.emailSent }}</option>
                <option value="data_export">{{ texts.dataExport }}</option>
                <option value="data_change">{{ texts.dataChange }}</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label for="userFilter" class="form-label">{{ texts.userId }}</label>
              <input
                type="text"
                class="form-control"
                id="userFilter"
                v-model="filters.userId"
                :placeholder="texts.userIdPlaceholder"
              />
            </div>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-primary"
              @click="applyFilters"
              :disabled="isLoading"
            >
              <i class="fas fa-search me-2"></i>
              {{ texts.applyFilters }}
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="resetFilters"
            >
              <i class="fas fa-times me-2"></i>
              {{ texts.reset }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auditStats" class="stats-section mb-4">
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stat-card text-center">
            <div class="stat-number text-primary">{{ auditStats.totalLogs || 0 }}</div>
            <div class="stat-label">{{ texts.totalLogs }}</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card text-center">
            <div class="stat-number text-success">{{ auditStats.todayLogs || 0 }}</div>
            <div class="stat-label">{{ texts.todayLogs }}</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card text-center">
            <div class="stat-number text-warning">{{ auditStats.uniqueUsers || 0 }}</div>
            <div class="stat-label">{{ texts.uniqueUsers }}</div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card text-center">
            <div class="stat-number text-info">{{ auditStats.criticalEvents || 0 }}</div>
            <div class="stat-label">{{ texts.criticalEvents }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="audit-logs-table">
      <div class="card">
        <div class="card-header bg-dark text-white">
          <h6 class="mb-0">
            <i class="fas fa-list me-2"></i>
            {{ texts.auditLogs }}
            <span v-if="auditLogs.length > 0" class="badge bg-light text-dark ms-2">
              {{ auditLogs.length }}
            </span>
          </h6>
        </div>
        <div class="card-body p-0">

          <div v-if="isLoading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ texts.loading }}</span>
            </div>
            <p class="mt-2 text-muted">{{ texts.loadingLogs }}</p>
          </div>


          <div v-else-if="error" class="alert alert-danger m-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ texts.loadError }}: {{ error }}
          </div>


          <div v-else-if="auditLogs.length === 0" class="text-center p-4">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p class="text-muted">{{ texts.noLogs }}</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ texts.timestamp }}</th>
                  <th>{{ texts.user }}</th>
                  <th>{{ texts.action }}</th>
                  <th>{{ texts.details }}</th>
                  <th>{{ texts.ip }}</th>
                  <th>{{ texts.status }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in auditLogs" :key="log.id" class="audit-log-row">
                  <td>
                    <div class="timestamp-cell">
                      <div class="date">{{ formatDate(log.timestamp) }}</div>
                      <div class="time text-muted">{{ formatTime(log.timestamp) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="user-cell">
                      <div class="user-name">{{ log.email || log.uid }}</div>
                      <div class="user-id text-muted">{{ log.uid }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getActionBadgeClass(log.action)">
                      {{ getActionText(log.action) }}
                    </span>
                  </td>
                  <td>
                    <div class="details-cell">
                      <div v-if="log.details && Object.keys(log.details).length > 0">
                        <button
                          class="btn btn-sm btn-outline-info"
                          @click="showDetails(log)"
                        >
                          <i class="fas fa-eye me-1"></i>
                          {{ texts.viewDetails }}
                        </button>
                      </div>
                      <span v-else class="text-muted">{{ texts.noDetails }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="ip-address">{{ log.ip || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="badge bg-success">{{ texts.success }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auditLogs.length > 0" class="pagination-section mt-4">
      <nav aria-label="Audit logs pagination">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage <= 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">
              {{ texts.previous }}
            </button>
          </li>
          <li class="page-item active">
            <span class="page-link">{{ currentPage }}</span>
          </li>
          <li class="page-item" :class="{ disabled: auditLogs.length < pageSize }">
            <button class="page-link" @click="changePage(currentPage + 1)" :disabled="auditLogs.length < pageSize">
              {{ texts.next }}
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <div v-if="selectedLog" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>
              {{ texts.logDetails }}
            </h5>
            <button type="button" class="btn-close" @click="selectedLog = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>{{ texts.timestamp }}:</strong>
                <p>{{ formatDateTime(selectedLog.timestamp) }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>{{ texts.user }}:</strong>
                <p>{{ selectedLog.email || selectedLog.uid }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>{{ texts.action }}:</strong>
                <p>{{ getActionText(selectedLog.action) }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>{{ texts.ip }}:</strong>
                <p>{{ selectedLog.ip || 'N/A' }}</p>
              </div>
              <div class="col-12 mb-3">
                <strong>{{ texts.userAgent }}:</strong>
                <p class="text-break">{{ selectedLog.userAgent || 'N/A' }}</p>
              </div>
              <div class="col-12">
                <strong>{{ texts.details }}:</strong>
                <pre class="bg-light p-3 rounded">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="selectedLog = null">
              {{ texts.close }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../utils/apiClient'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const isLoading = ref(false)
const error = ref('')
const auditLogs = ref([])
const auditStats = ref(null)
const showFilters = ref(false)
const selectedLog = ref(null)
const currentPage = ref(1)
const pageSize = ref(50)

const filters = ref({
  startDate: '',
  endDate: '',
  action: '',
  userId: ''
})

const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        auditLog: '审计日志',
        refresh: '刷新',
        filters: '过滤器',
        filterOptions: '过滤选项',
        startDate: '开始日期',
        endDate: '结束日期',
        actionType: '操作类型',
        userId: '用户ID',
        userIdPlaceholder: '输入用户ID或邮箱',
        allActions: '所有操作',
        login: '登录',
        logout: '登出',
        emailSent: '邮件发送',
        dataExport: '数据导出',
        dataChange: '数据变更',
        applyFilters: '应用过滤器',
        reset: '重置',
        totalLogs: '总日志数',
        todayLogs: '今日日志',
        uniqueUsers: '独立用户',
        criticalEvents: '关键事件',
        auditLogs: '审计日志',
        loading: '加载中',
        loadingLogs: '正在加载审计日志...',
        loadError: '加载失败',
        noLogs: '暂无审计日志',
        timestamp: '时间戳',
        user: '用户',
        action: '操作',
        details: '详情',
        ip: 'IP地址',
        status: '状态',
        viewDetails: '查看详情',
        noDetails: '无详情',
        success: '成功',
        previous: '上一页',
        next: '下一页',
        logDetails: '日志详情',
        userAgent: '用户代理',
        close: '关闭'
      }
    : {
        auditLog: 'Audit Log',
        refresh: 'Refresh',
        filters: 'Filters',
        filterOptions: 'Filter Options',
        startDate: 'Start Date',
        endDate: 'End Date',
        actionType: 'Action Type',
        userId: 'User ID',
        userIdPlaceholder: 'Enter user ID or email',
        allActions: 'All Actions',
        login: 'Login',
        logout: 'Logout',
        emailSent: 'Email Sent',
        dataExport: 'Data Export',
        dataChange: 'Data Change',
        applyFilters: 'Apply Filters',
        reset: 'Reset',
        totalLogs: 'Total Logs',
        todayLogs: 'Today\'s Logs',
        uniqueUsers: 'Unique Users',
        criticalEvents: 'Critical Events',
        auditLogs: 'Audit Logs',
        loading: 'Loading',
        loadingLogs: 'Loading audit logs...',
        loadError: 'Load Error',
        noLogs: 'No audit logs found',
        timestamp: 'Timestamp',
        user: 'User',
        action: 'Action',
        details: 'Details',
        ip: 'IP Address',
        status: 'Status',
        viewDetails: 'View Details',
        noDetails: 'No Details',
        success: 'Success',
        previous: 'Previous',
        next: 'Next',
        logDetails: 'Log Details',
        userAgent: 'User Agent',
        close: 'Close'
      }
})

const loadAuditLogs = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
      ...filters.value
    }

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await apiClient.getAuditLog(params)
    auditLogs.value = response.data || []

    calculateStats()
  } catch (err) {
    console.error('Failed to load audit logs:', err)
    error.value = err.message || 'Failed to load audit logs'

    auditLogs.value = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        uid: 'user123',
        email: 'user@example.com',
        action: 'login',
        details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        uid: 'admin456',
        email: 'admin@example.com',
        action: 'email_sent',
        details: { recipient: 'user@example.com', subject: 'Welcome' },
        ip: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ]
    calculateStats()
  } finally {
    isLoading.value = false
  }
}

const calculateStats = () => {
  const today = new Date().toDateString()
  const todayLogs = auditLogs.value.filter(log =>
    new Date(log.timestamp).toDateString() === today
  ).length

  const uniqueUsers = new Set(auditLogs.value.map(log => log.uid)).size
  const criticalEvents = auditLogs.value.filter(log =>
    ['data_change', 'data_export'].includes(log.action)
  ).length

  auditStats.value = {
    totalLogs: auditLogs.value.length,
    todayLogs,
    uniqueUsers,
    criticalEvents
  }
}

const refreshLogs = () => {
  currentPage.value = 1
  loadAuditLogs()
}

const applyFilters = () => {
  currentPage.value = 1
  loadAuditLogs()
}

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    action: '',
    userId: ''
  }
  currentPage.value = 1
  loadAuditLogs()
}

const changePage = (page) => {
  if (page >= 1) {
    currentPage.value = page
    loadAuditLogs()
  }
}

const showDetails = (log) => {
  selectedLog.value = log
}

const getActionBadgeClass = (action) => {
  const classes = {
    login: 'bg-success',
    logout: 'bg-info',
    email_sent: 'bg-primary',
    data_export: 'bg-warning',
    data_change: 'bg-danger'
  }
  return classes[action] || 'bg-secondary'
}

const getActionText = (action) => {
  const actionTexts = {
    login: texts.value.login,
    logout: texts.value.logout,
    email_sent: texts.value.emailSent,
    data_export: texts.value.dataExport,
    data_change: texts.value.dataChange
  }
  return actionTexts[action] || action
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

// 生命周期
onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped>
.admin-audit-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stat-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  height: 100%;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audit-log-row:hover {
  background-color: #f8f9fa;
}

.timestamp-cell .date {
  font-weight: 500;
}

.timestamp-cell .time {
  font-size: 0.875rem;
}

.user-cell .user-name {
  font-weight: 500;
}

.user-cell .user-id {
  font-size: 0.875rem;
}

.details-cell {
  max-width: 200px;
}

.ip-address {
  font-family: monospace;
  font-size: 0.875rem;
}

.filters-section .card {
  border: 1px solid #dee2e6;
}

.pagination-section {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .admin-audit-container {
    padding: 15px;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
