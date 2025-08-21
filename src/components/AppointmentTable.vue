<template>
  <div class="data-table-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">{{ texts.appointmentList }}</h2>
      <div class="d-flex gap-2">
        <!-- 导出按钮 -->
        <div class="btn-group" role="group" aria-label="Export options">
          <button 
            class="btn btn-outline-success" 
            @click="exportToCSV"
            :disabled="isExporting"
            :title="texts.exportCSV"
          >
            <span v-if="isExporting && exportType === 'csv'" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-file-csv me-2"></i>
            {{ texts.exportCSV }}
          </button>
          <button 
            class="btn btn-outline-danger" 
            @click="exportToPDF"
            :disabled="isExporting"
            :title="texts.exportPDF"
          >
            <span v-if="isExporting && exportType === 'pdf'" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-file-pdf me-2"></i>
            {{ texts.exportPDF }}
          </button>
        </div>
        <button 
          class="btn btn-outline-primary" 
          @click="showReports = !showReports"
          :disabled="isLoadingReports"
        >
          <i class="fas fa-chart-bar me-2"></i>
          {{ texts.viewReports }}
        </button>
      </div>
    </div>

    <!-- 预约报表区域 -->
    <div v-if="showReports" class="reports-section mb-4">
      <div class="card">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">
            <i class="fas fa-chart-line me-2"></i>
            {{ texts.appointmentReports }}
          </h5>
        </div>
        <div class="card-body">
          <!-- 日期范围选择 -->
          <div class="row mb-3">
            <div class="col-md-4">
              <label for="startDate" class="form-label">{{ texts.startDate }}</label>
              <input
                type="date"
                class="form-control"
                id="startDate"
                v-model="reportFilters.startDate"
              />
            </div>
            <div class="col-md-4">
              <label for="endDate" class="form-label">{{ texts.endDate }}</label>
              <input
                type="date"
                class="form-control"
                id="endDate"
                v-model="reportFilters.endDate"
              />
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button 
                class="btn btn-primary me-2" 
                @click="loadReports"
                :disabled="isLoadingReports || !reportFilters.startDate || !reportFilters.endDate"
              >
                <span v-if="isLoadingReports" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-sync-alt me-2"></i>
                {{ texts.generateReport }}
              </button>
              <button 
                class="btn btn-outline-secondary" 
                @click="resetReportFilters"
              >
                {{ texts.reset }}
              </button>
            </div>
          </div>

          <!-- 报表结果 -->
          <div v-if="reportData" class="reports-results">
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="stat-card text-center">
                  <div class="stat-number text-primary">{{ reportData.totalAppointments || 0 }}</div>
                  <div class="stat-label">{{ texts.totalAppointments }}</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="stat-card text-center">
                  <div class="stat-number text-success">{{ reportData.completedAppointments || 0 }}</div>
                  <div class="stat-label">{{ texts.completedAppointments }}</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="stat-card text-center">
                  <div class="stat-number text-warning">{{ reportData.pendingAppointments || 0 }}</div>
                  <div class="stat-label">{{ texts.pendingAppointments }}</div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="stat-card text-center">
                  <div class="stat-number text-danger">{{ reportData.cancelledAppointments || 0 }}</div>
                  <div class="stat-label">{{ texts.cancelledAppointments }}</div>
                </div>
              </div>
            </div>
            
            <!-- 按状态分布图表 -->
            <div v-if="reportData.statusDistribution" class="mt-4">
              <h6>{{ texts.statusDistribution }}</h6>
              <div class="progress-stacked">
                <div 
                  v-for="(item, status) in reportData.statusDistribution" 
                  :key="status"
                  class="progress-bar"
                  :class="getStatusProgressClass(status)"
                  :style="{ width: getStatusPercentage(item.count) + '%' }"
                  :title="`${getStatusText(status)}: ${item.count}`"
                >
                  {{ item.count }}
                </div>
              </div>
            </div>

            <!-- 热门诊所 -->
            <div v-if="reportData.topClinics && reportData.topClinics.length > 0" class="mt-4">
              <h6>{{ texts.topClinics }}</h6>
              <div class="list-group">
                <div 
                  v-for="clinic in reportData.topClinics.slice(0, 5)" 
                  :key="clinic.name"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ clinic.name }}
                  <span class="badge bg-primary rounded-pill">{{ clinic.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 报表错误 -->
          <div v-if="reportError" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ texts.reportError }}: {{ reportError }}
          </div>
        </div>
      </div>
    </div>

    <!-- 全局搜索 -->
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input
          type="text"
          class="form-control"
          v-model="globalSearch"
          :placeholder="texts.searchAllFields"
          aria-label="Search all fields"
        />
        <button 
          v-if="globalSearch" 
          class="btn btn-outline-secondary" 
          type="button"
          @click="globalSearch = ''"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 列筛选 -->
    <div class="row mb-3">
      <div class="col-md-3 mb-2">
        <label for="userFilter" class="form-label">{{ texts.user }}</label>
        <input
          type="text"
          class="form-control"
          id="userFilter"
          v-model="filters.user"
          :placeholder="texts.filterByUser"
        />
      </div>
      <div class="col-md-3 mb-2">
        <label for="dateFilter" class="form-label">{{ texts.date }}</label>
        <input
          type="date"
          class="form-control"
          id="dateFilter"
          v-model="filters.date"
        />
      </div>
      <div class="col-md-3 mb-2">
        <label for="statusFilter" class="form-label">{{ texts.status }}</label>
        <select
          class="form-select"
          id="statusFilter"
          v-model="filters.status"
        >
          <option value="">{{ texts.all }}</option>
          <option value="scheduled">{{ texts.scheduled }}</option>
          <option value="completed">{{ texts.completed }}</option>
          <option value="cancelled">{{ texts.cancelled }}</option>
        </select>
      </div>
      <div class="col-md-3 mb-2">
        <label for="clinicianFilter" class="form-label">{{ texts.clinician }}</label>
        <input
          type="text"
          class="form-control"
          id="clinicianFilter"
          v-model="filters.clinician"
          :placeholder="texts.filterByClinician"
        />
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th @click="sort('id')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('id')">
              ID
              <i v-if="sortColumn === 'id'" :class="getSortIconClass('id')"></i>
            </th>
            <th @click="sort('user')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('user')">
              {{ texts.user }}
              <i v-if="sortColumn === 'user'" :class="getSortIconClass('user')"></i>
            </th>
            <th @click="sort('date')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('date')">
              {{ texts.date }}
              <i v-if="sortColumn === 'date'" :class="getSortIconClass('date')"></i>
            </th>
            <th @click="sort('time')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('time')">
              {{ texts.time }}
              <i v-if="sortColumn === 'time'" :class="getSortIconClass('time')"></i>
            </th>
            <th @click="sort('status')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('status')">
              {{ texts.status }}
              <i v-if="sortColumn === 'status'" :class="getSortIconClass('status')"></i>
            </th>
            <th @click="sort('clinician')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('clinician')">
              {{ texts.clinician }}
              <i v-if="sortColumn === 'clinician'" :class="getSortIconClass('clinician')"></i>
            </th>
            <th @click="sort('type')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('type')">
              {{ texts.type }}
              <i v-if="sortColumn === 'type'" :class="getSortIconClass('type')"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredData.length === 0">
            <td colspan="7" class="text-center py-4">
              <div class="empty-state">
                <i class="fas fa-search fa-3x mb-3"></i>
                <p>{{ texts.noResults }}</p>
              </div>
            </td>
          </tr>
          <tr 
            v-for="item in paginatedData" 
            :key="item.id"
            tabindex="0"
            class="table-row"
            :class="{'table-success': item.status === 'completed', 'table-danger': item.status === 'cancelled'}"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.user }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>{{ item.time }}</td>
            <td>
              <span :class="getStatusBadgeClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td>{{ item.clinician }}</td>
            <td>{{ item.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div>
        {{ texts.showing }} {{ startIndex + 1 }}-{{ endIndex }} {{ texts.of }} {{ filteredData.length }} {{ texts.entries }}
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
              <i class="fas fa-angle-double-left"></i>
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fas fa-angle-left"></i>
            </button>
          </li>
          <li 
            v-for="page in visiblePageNumbers" 
            :key="page" 
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fas fa-angle-right"></i>
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
              <i class="fas fa-angle-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../utils/apiClient'

// 导出相关的响应式变量
const isExporting = ref(false)
const exportType = ref('')

// Props for language support
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const route = useRoute()
const router = useRouter()

const appointments = ref([
  {
    id: 1,
    patientName: 'John Smith',
    doctorName: 'Dr. Wang',
    date: '2024-01-15',
    time: '09:00',
    type: 'general',
    status: 'confirmed',
    notes: 'Regular checkup'
  },
  {
    id: 2,
    patientName: 'Maria Garcia',
    doctorName: 'Dr. Li',
    date: '2024-01-16',
    time: '14:30',
    type: 'specialist',
    status: 'pending',
    notes: 'Follow-up consultation'
  },
  {
    id: 3,
    patientName: 'Ahmed Hassan',
    doctorName: 'Dr. Chen',
    date: '2024-01-17',
    time: '11:00',
    type: 'emergency',
    status: 'cancelled',
    notes: 'Emergency consultation'
  }
])

const currentPage = ref(1)
const itemsPerPage = 10
const sortColumn = ref('date')
const sortDirection = ref('desc')
const globalSearch = ref('')
const filters = ref({
  patientName: '',
  doctorName: '',
  type: '',
  status: '',
  dateAfter: ''
})

// 预约报表相关
const showReports = ref(false)
const isLoadingReports = ref(false)
const reportData = ref(null)
const reportError = ref('')
const reportFilters = ref({
  startDate: '',
  endDate: ''
})

// 报表相关方法
const loadReports = async () => {
  if (!reportFilters.value.startDate || !reportFilters.value.endDate) {
    return
  }
  
  isLoadingReports.value = true
  reportError.value = ''
  
  try {
    const response = await apiClient.getAppointmentReports({
      startDate: reportFilters.value.startDate,
      endDate: reportFilters.value.endDate
    })
    
    reportData.value = response.data
  } catch (error) {
    console.error('Failed to load appointment reports:', error)
    reportError.value = error.message || 'Failed to load reports'
    
    // 如果API调用失败，使用模拟数据作为后备
    reportData.value = {
      totalAppointments: 150,
      completedAppointments: 120,
      pendingAppointments: 20,
      cancelledAppointments: 10,
      statusDistribution: {
        completed: { count: 120 },
        pending: { count: 20 },
        cancelled: { count: 10 }
      },
      topClinics: [
        { name: 'Dr. Wang', count: 45 },
        { name: 'Dr. Li', count: 38 },
        { name: 'Dr. Chen', count: 32 },
        { name: 'Dr. Zhang', count: 25 },
        { name: 'Dr. Liu', count: 10 }
      ]
    }
  } finally {
    isLoadingReports.value = false
  }
}

const resetReportFilters = () => {
  reportFilters.value.startDate = ''
  reportFilters.value.endDate = ''
  reportData.value = null
  reportError.value = ''
}

const getStatusProgressClass = (status) => {
  const classes = {
    completed: 'bg-success',
    pending: 'bg-warning',
    cancelled: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getStatusPercentage = (count) => {
  if (!reportData.value) return 0
  return (count / reportData.value.totalAppointments) * 100
}

const getStatusText = (status) => {
  const statusTexts = {
    confirmed: texts.value.confirmed,
    completed: texts.value.completed,
    pending: texts.value.pending,
    cancelled: texts.value.cancelled
  }
  return statusTexts[status] || status
}

// 导出功能
const exportToCSV = () => {
  isExporting.value = true
  exportType.value = 'csv'
  
  try {
    // 获取当前筛选后的数据
    const dataToExport = filteredData.value
    
    // 定义CSV列头（人类可读）
    const headers = [
      texts.value.user,
      texts.value.date,
      texts.value.time,
      texts.value.status,
      texts.value.clinician,
      texts.value.type
    ]
    
    // 转换数据为CSV格式
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => [
        `"${item.user || ''}",`,
        `"${formatDate(item.date)}",`,
        `"${item.time || ''}",`,
        `"${getStatusText(item.status)}",`,
        `"${item.clinician || ''}",`,
        `"${item.type || ''}"`
      ].join(''))
    ].join('\n')
    
    // 添加UTF-8 BOM确保Excel正确显示中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // 生成文件名
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-')
    const filename = `appointments_${timestamp}.csv`
    
    // 下载文件
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    
    console.log(`CSV导出完成: ${filename}, 共${dataToExport.length}条记录`)
  } catch (error) {
    console.error('CSV导出失败:', error)
    alert(texts.value.exportError || '导出失败，请重试')
  } finally {
    isExporting.value = false
    exportType.value = ''
  }
}

const exportToPDF = async () => {
  isExporting.value = true
  exportType.value = 'pdf'
  
  try {
    // 获取当前筛选后的数据
    const dataToExport = filteredData.value
    
    // 检查数据量，如果超过阈值使用后台生成
    const LARGE_DATA_THRESHOLD = 100
    
    if (dataToExport.length > LARGE_DATA_THRESHOLD) {
      // 大数据量：后台异步生成
      await exportLargePDF(dataToExport)
    } else {
      // 小数据量：前端生成
      await exportSmallPDF(dataToExport)
    }
    
  } catch (error) {
    console.error('PDF导出失败:', error)
    alert(texts.value.exportError || '导出失败，请重试')
  } finally {
    isExporting.value = false
    exportType.value = ''
  }
}

const exportSmallPDF = async (data) => {
  try {
    // 调用云函数生成PDF
    const response = await apiClient.generatePDF({
      type: 'appointments',
      data: data,
      filters: {
        globalSearch: globalSearch.value,
        ...filters.value
      },
      sorting: {
        column: sortColumn.value,
        direction: sortDirection.value
      },
      metadata: {
        exportTime: new Date().toISOString(),
        totalRecords: data.length,
        userEmail: 'current-user@example.com' // 从认证状态获取
      }
    })
    
    // 下载PDF文件
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-')
    const filename = `appointments_${timestamp}.pdf`
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`PDF导出完成: ${filename}`)
  } catch (error) {
    // 如果云函数失败，降级到前端生成
    console.warn('云函数PDF生成失败，使用前端生成:', error)
    await generateClientSidePDF(data)
  }
}

const exportLargePDF = async (data) => {
  try {
    // 提交后台任务
    const response = await apiClient.submitPDFExportTask({
      type: 'appointments',
      data: data,
      filters: {
        globalSearch: globalSearch.value,
        ...filters.value
      },
      sorting: {
        column: sortColumn.value,
        direction: sortDirection.value
      },
      userEmail: 'current-user@example.com' // 从认证状态获取
    })
    
    alert(texts.value.largeExportNotification || 
      `数据量较大，正在后台生成PDF。完成后将发送邮件通知，任务ID: ${response.taskId}`)
    
  } catch (error) {
    console.error('后台PDF任务提交失败:', error)
    // 降级到前端生成
    await generateClientSidePDF(data)
  }
}

const generateClientSidePDF = async (data) => {
  // 前端PDF生成（简化版）
  const printContent = generatePrintTemplate(data)
  
  // 创建新窗口进行打印
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  
  // 等待内容加载完成后打印
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

const generatePrintTemplate = (data) => {
  const now = new Date()
  const timestamp = now.toLocaleString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${texts.value.appointmentList} - ${timestamp}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .metadata { margin-bottom: 20px; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${texts.value.appointmentList}</h1>
        <p>导出时间: ${timestamp}</p>
      </div>
      
      <div class="metadata">
        <p>总记录数: ${data.length}</p>
        <p>筛选条件: ${getFilterSummary()}</p>
        <p>排序: ${texts.value[sortColumn.value] || sortColumn.value} (${sortDirection.value === 'asc' ? '升序' : '降序'})</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>${texts.value.user}</th>
            <th>${texts.value.date}</th>
            <th>${texts.value.time}</th>
            <th>${texts.value.status}</th>
            <th>${texts.value.clinician}</th>
            <th>${texts.value.type}</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${item.user || ''}</td>
              <td>${formatDate(item.date)}</td>
              <td>${item.time || ''}</td>
              <td>${getStatusText(item.status)}</td>
              <td>${item.clinician || ''}</td>
              <td>${item.type || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>MigrantCare 预约管理系统 | 导出时间: ${timestamp}</p>
      </div>
    </body>
    </html>
  `
}

const getFilterSummary = () => {
  const activeFilters = []
  if (globalSearch.value) activeFilters.push(`全局搜索: ${globalSearch.value}`)
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value) {
      const label = texts.value[key] || key
      activeFilters.push(`${label}: ${value}`)
    }
  })
  return activeFilters.length > 0 ? activeFilters.join(', ') : '无'
}

let debounceTimeout = null
const debounce = (fn, delay) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(fn, delay)
}

onMounted(() => {
  const { page, sort, dir, search, ...filterParams } = route.query
  
  if (page) currentPage.value = parseInt(page)
  if (sort) sortColumn.value = sort
  if (dir) sortDirection.value = dir
  if (search) globalSearch.value = search
  
  Object.keys(filterParams).forEach(key => {
    if (key in filters.value) {
      filters.value[key] = filterParams[key]
    }
  })
})

watch([currentPage, sortColumn, sortDirection, globalSearch, filters], () => {
  debounce(() => {
    const query = {
      page: currentPage.value,
      sort: sortColumn.value,
      dir: sortDirection.value
    }
    
    if (globalSearch.value) query.search = globalSearch.value
    
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) query[key] = value
    })
    
    router.replace({ query })
  }, 300)
}, { deep: true })

const filteredData = computed(() => {
  let result = [...appointments.value]
  
  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    result = result.filter(item => {
      return Object.entries(item).some(([key, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm)
        }
        return false
      })
    })
  }
  
  Object.entries(filters.value).forEach(([key, filterValue]) => {
    if (filterValue) {
      if (key === 'dateAfter') {
        result = result.filter(item => new Date(item.date) >= new Date(filterValue))
      } else {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toLowerCase())
          }
          return false
        })
      }
    }
  })
  
  result.sort((a, b) => {
    let aValue = a[sortColumn.value]
    let bValue = b[sortColumn.value]
    
    if (sortColumn.value === 'date') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, filteredData.value.length)
  const total = filteredData.value.length
  return { start, end, total }
})

const visiblePages = computed(() => {
  const pages = []
  const delta = 2
  let start = Math.max(1, currentPage.value - delta)
  let end = Math.min(totalPages.value, currentPage.value + delta)
  
  if (currentPage.value <= delta) {
    end = Math.min(totalPages.value, 2 * delta + 1)
  }
  
  if (currentPage.value + delta >= totalPages.value) {
    start = Math.max(1, totalPages.value - 2 * delta)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
  currentPage.value = 1
}

const getSortIconClass = (column) => {
  if (sortColumn.value !== column) return ''
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

const getSortAriaLabel = (column) => {
  if (sortColumn.value !== column) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed: 'bg-success',
    pending: 'bg-warning',
    cancelled: 'bg-danger',
    completed: 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

// 重复的getStatusText声明已删除

const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        appointmentTable: '预约管理表格',
        searchAllFields: '搜索所有字段',
        patientName: '患者姓名',
        filterByPatient: '按患者姓名筛选',
        doctorName: '医生姓名',
        filterByDoctor: '按医生姓名筛选',
        type: '类型',
        filterByType: '按类型筛选',
        status: '状态',
        filterByStatus: '按状态筛选',
        dateAfter: '日期筛选',
        selectDate: '选择日期',
        clearFilters: '清除筛选',
        date: '日期',
        time: '时间',
        notes: '备注',
        actions: '操作',
        general: '常规检查',
        specialist: '专科咨询',
        emergency: '紧急就诊',
        confirmed: '已确认',
        pending: '待确认',
        cancelled: '已取消',
        completed: '已完成',
        edit: '编辑',
        view: '查看',
        cancel: '取消',
        showing: '显示',
        to: '至',
        of: '共',
        entries: '条记录',
        previous: '上一页',
        next: '下一页',
        noResults: '暂无数据',
        viewReports: '查看报表',
        appointmentReports: '预约报表',
        startDate: '开始日期',
        endDate: '结束日期',
        generateReport: '生成报表',
        reset: '重置',
        totalAppointments: '总预约数',
        completedAppointments: '已完成',
        pendingAppointments: '待处理',
        cancelledAppointments: '已取消',
        statusDistribution: '状态分布',
        topClinics: '热门诊所',
        reportError: '报表加载失败',
        user: '用户',
        filterByUser: '按用户筛选',
        clinician: '医生',
        filterByClinician: '按医生筛选',
        all: '全部',
        scheduled: '已预约',
        exportCSV: '导出 CSV',
        exportPDF: '导出 PDF',
        exportError: '导出失败，请重试',
        largeExportNotification: '数据量较大，正在后台生成PDF。完成后将发送邮件通知。',
        appointmentList: '预约列表'
      }
    : {
        appointmentTable: 'Appointment Management Table',
        searchAllFields: 'Search all fields',
        patientName: 'Patient Name',
        filterByPatient: 'Filter by patient name',
        doctorName: 'Doctor Name',
        filterByDoctor: 'Filter by doctor name',
        type: 'Type',
        filterByType: 'Filter by type',
        status: 'Status',
        filterByStatus: 'Filter by status',
        dateAfter: 'Date Filter',
        selectDate: 'Select date',
        clearFilters: 'Clear Filters',
        date: 'Date',
        time: 'Time',
        notes: 'Notes',
        actions: 'Actions',
        general: 'General Checkup',
        specialist: 'Specialist Consultation',
        emergency: 'Emergency Visit',
        confirmed: 'Confirmed',
        pending: 'Pending',
        cancelled: 'Cancelled',
        completed: 'Completed',
        edit: 'Edit',
        view: 'View',
        cancel: 'Cancel',
        showing: 'Showing',
        to: 'to',
        of: 'of',
        entries: 'entries',
        previous: 'Previous',
        next: 'Next',
        noResults: 'No results found',
        viewReports: 'View Reports',
        appointmentReports: 'Appointment Reports',
        startDate: 'Start Date',
        endDate: 'End Date',
        generateReport: 'Generate Report',
        reset: 'Reset',
        totalAppointments: 'Total Appointments',
        completedAppointments: 'Completed',
        pendingAppointments: 'Pending',
        cancelledAppointments: 'Cancelled',
        statusDistribution: 'Status Distribution',
        topClinics: 'Top Clinics',
        reportError: 'Report loading failed',
        user: 'User',
        filterByUser: 'Filter by user',
        clinician: 'Clinician',
        filterByClinician: 'Filter by clinician',
        all: 'All',
        scheduled: 'Scheduled',
        exportCSV: 'Export CSV',
        exportPDF: 'Export PDF',
        exportError: 'Export failed, please try again',
        largeExportNotification: 'Large dataset detected. PDF is being generated in background. You will receive an email notification when ready.',
        appointmentList: 'Appointment List'
      }
})
</script>

<style scoped>
.data-table-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.empty-state {
  color: #6c757d;
}

.table-row {
  cursor: pointer;
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-row:focus {
  outline: 2px solid #0d6efd;
  outline-offset: -2px;
}

/* 报表相关样式 */
.reports-section {
  margin-bottom: 2rem;
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

.progress-stacked {
  display: flex;
  height: 2rem;
  background-color: #e9ecef;
  border-radius: 0.375rem;
  overflow: hidden;
}

.progress-stacked .progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  transition: width 0.6s ease;
}

.reports-results h6 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .data-table-container {
    padding: 1rem;
  }
  
  /* 在小屏幕上将表格转换为卡片视图 */
  .table-responsive {
    overflow-x: auto;
  }
}
</style>