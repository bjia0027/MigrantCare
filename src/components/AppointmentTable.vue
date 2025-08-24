<template>
  <div class="data-table-container">
    <div class="table-header">
      <h2>{{ texts.appointmentManagement }}</h2>

      <!-- 批量操作按钮 -->
      <div class="bulk-actions" v-if="selectedItems.length > 0">
        <button class="btn btn-primary me-2" @click="openBulkEmailModal">
          <i class="fas fa-envelope me-1"></i>
          {{ texts.bulkEmail }} ({{ selectedItems.length }})
        </button>
        <button class="btn btn-outline-secondary" @click="clearSelection">
          <i class="fas fa-times me-1"></i>
          {{ texts.clearSelection }}
        </button>
      </div>

      <!-- 导出按钮 -->
      <div class="export-buttons">
        <button 
          class="btn btn-outline-success me-2" 
          @click="exportToCSV"
          :disabled="isExporting"
          :aria-label="texts.exportCSV"
        >
          <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-file-csv me-1"></i>
          {{ texts.exportCSV }}
        </button>
        <button 
          class="btn btn-outline-danger" 
          @click="exportToPDF"
          :disabled="isExporting"
          :aria-label="texts.exportPDF"
        >
          <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-file-pdf me-1"></i>
          {{ texts.exportPDF }}
        </button>
      </div>
    </div>

    <!-- 全局搜索 -->
    <div class="search-container mb-3">
      <div class="input-group">
        <span class="input-group-text">
          <i class="fas fa-search"></i>
        </span>
        <input
          type="text"
          class="form-control"
          :placeholder="texts.globalSearch"
          v-model="globalSearch"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col" style="width: 50px">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th scope="col" class="sortable" @click="sort('patientName')">
              {{ texts.patientName }}
              <i :class="getSortIconClass('patientName')"></i>
            </th>
            <th scope="col" class="sortable" @click="sort('appointmentDate')">
              {{ texts.appointmentDate }}
              <i :class="getSortIconClass('appointmentDate')"></i>
            </th>
            <th scope="col" class="sortable" @click="sort('appointmentTime')">
              {{ texts.appointmentTime }}
              <i :class="getSortIconClass('appointmentTime')"></i>
            </th>
            <th scope="col">{{ texts.service }}</th>
            <th scope="col">{{ texts.status }}</th>
            <th scope="col">{{ texts.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- 加载状态 -->
          <tr v-if="loading">
            <td colspan="7" class="text-center empty-state">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
              <p class="mb-0 mt-2">正在加载预约数据...</p>
            </td>
          </tr>
          <!-- 错误状态 -->
          <tr v-else-if="error">
            <td colspan="7" class="text-center empty-state">
              <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
              <p class="mb-2 text-danger">{{ error }}</p>
              <button class="btn btn-sm btn-outline-primary" @click="loadAppointments()">
                <i class="fas fa-redo"></i> 重新加载
              </button>
            </td>
          </tr>
          <!-- 无数据状态 -->
          <tr v-else-if="paginatedData.length === 0">
            <td colspan="7" class="text-center empty-state">
              <i class="fas fa-calendar-times fa-3x mb-3 text-muted"></i>
              <p class="mb-0">{{ texts.noAppointments }}</p>
            </td>
          </tr>
          <tr
            v-for="appointment in paginatedData"
            :key="appointment.id"
            class="table-row"
            :class="{ 'table-active': selectedItems.includes(appointment.id) }"
          >
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :value="appointment.id"
                v-model="selectedItems"
              />
            </td>
            <td>{{ appointment.patientName }}</td>
            <td>{{ formatDate(appointment.appointmentDate) }}</td>
            <td>{{ appointment.appointmentTime }}</td>
            <td>{{ appointment.service }}</td>
            <td>
              <span :class="getStatusBadgeClass(appointment.status)">
                {{ getStatusText(appointment.status) }}
              </span>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="editAppointment(appointment)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteAppointment(appointment.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页导航 -->
    <nav aria-label="Table pagination" v-if="totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-left"></i>
          </button>
        </li>
        <li
          v-for="page in visiblePageNumbers"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="goToPage(page)">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-right"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>

  <!-- 批量邮件模态框 -->
  <div
    v-if="showBulkEmailModal"
    class="modal fade show"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
    tabindex="-1"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-envelope me-2"></i>
            {{ texts.bulkEmail }} ({{ selectedItems.length }} {{ texts.selectedUsers }})
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeBulkEmailModal"
            :aria-label="texts.close"
          ></button>
        </div>
        <div class="modal-body">
          <EmailSender
            :lang="lang"
            :preselected-recipients="getSelectedUsers()"
            @email-sent="closeBulkEmailModal"
            @close="closeBulkEmailModal"
          ></EmailSender>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmailSender from './EmailSender.vue'
// import apiClient from '../utils/apiClient' // removed unused import
import { useAuthStore } from '../stores/auth'
import { getAllAppointments, getUserAppointments, cancelAppointment as cancelAppointmentAPI, deleteAppointment as deleteAppointmentAPI } from '../api/appointmentAPI'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const route = useRoute()
// const router = useRouter() // removed unused variable
const authStore = useAuthStore()

// 导出相关
const isExporting = ref(false)

// 多选相关
const selectedItems = ref([])
const showBulkEmailModal = ref(false)

// 预约数据
const appointments = ref([])
const loading = ref(false)
const error = ref(null)

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.email === 'admin@migrantcare.com'
})

// 加载预约数据
const loadAppointments = async () => {
  loading.value = true
  error.value = null

  try {
    const token = await authStore.getIdToken()
    if (!token) {
      throw new Error('用户未登录')
    }

    let result
    if (isAdmin.value) {
      // 管理员获取所有预约
      result = await getAllAppointments(token)
    } else {
      // 普通用户只获取自己的预约
      result = await getUserAppointments(token)
    }

    if (result.success) {
      // 获取所有唯一的用户ID
      const userIds = [...new Set(result.data.map(apt => apt.userId).filter(Boolean))]
      
      // 批量获取用户信息
      const userMap = new Map()
      if (userIds.length > 0) {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore')
          const { db } = await import('../firebase/config')
          
          // 分批查询用户信息（Firestore 的 in 查询限制为10个）
          const batchSize = 10
          for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize)
            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('__name__', 'in', batch))
            const querySnapshot = await getDocs(q)
            
            querySnapshot.forEach(doc => {
              const userData = doc.data()
              userMap.set(doc.id, {
                email: userData.email || '',
                displayName: userData.displayName || userData.username || '',
                phone: userData.profile?.phone || ''
              })
            })
          }
        } catch (error) {
          console.warn('获取用户信息失败:', error)
        }
      }
      
      // 转换数据格式以匹配现有的表格结构
      appointments.value = result.data.map((apt) => {
        const userInfo = userMap.get(apt.userId) || {}
        return {
          id: apt.id,
          patientName: userInfo.email || apt.patientName || apt.displayName || userInfo.displayName || '未知用户',
          email: userInfo.email || '',
          phone: userInfo.phone || apt.phone || '',
          appointmentDate:
            apt.date ||
            (apt.start ? new Date(apt.start.seconds * 1000).toISOString().split('T')[0] : ''),
          appointmentTime:
            apt.time ||
            (apt.start
              ? new Date(apt.start.seconds * 1000).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''),
          service: apt.type || apt.service || '未知服务',
          status: apt.status || 'pending',
          doctor: apt.doctor || apt.clinicianName || '未知医生',
          location: apt.location || '未知地点',
          notes: apt.notes || '',
          userId: apt.userId,
        }
      })
    } else {
      error.value = result.error || '获取预约数据失败'
    }
  } catch (err) {
    console.error('加载预约数据失败:', err)
    error.value = err.message || '加载预约数据失败'
  } finally {
    loading.value = false
  }
}

// 分页相关
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 排序相关
const sortField = ref('')
const sortDirection = ref('asc')

// 全局搜索
const globalSearch = ref('')

// 计算属性
const isAllSelected = computed(() => {
  return selectedItems.value.length === paginatedData.value.length && paginatedData.value.length > 0
})

const filteredData = computed(() => {
  let data = appointments.value

  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    data = data.filter(
      (item) =>
        item.patientName.toLowerCase().includes(searchTerm) ||
        item.service.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm),
    )
  }

  if (sortField.value) {
    data = [...data].sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage.value)
})

const visiblePageNumbers = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }

  return pages
})

// 方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedData.value.map((item) => item.id)
  }
}

const clearSelection = () => {
  selectedItems.value = []
}

const openBulkEmailModal = () => {
  showBulkEmailModal.value = true
}

const closeBulkEmailModal = () => {
  showBulkEmailModal.value = false
  clearSelection()
}

const getSelectedUsers = () => {
  return appointments.value
    .filter((appointment) => selectedItems.value.includes(appointment.id))
    .map((appointment) => ({
      name: appointment.patientName,
      email: appointment.email,
      phone: appointment.phone,
    }))
}

const sort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIconClass = (field) => {
  if (sortField.value !== field) {
    return 'fas fa-sort text-muted'
  }
  return sortDirection.value === 'asc'
    ? 'fas fa-sort-up text-primary'
    : 'fas fa-sort-down text-primary'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge bg-warning text-dark',
    confirmed: 'badge bg-success',
    completed: 'badge bg-primary',
    cancelled: 'badge bg-danger',
  }
  return classes[status] || 'badge bg-secondary'
}

const getStatusText = (status) => {
  const statusTexts = {
    pending: texts.value.pending,
    confirmed: texts.value.confirmed,
    completed: texts.value.completed,
    cancelled: texts.value.cancelled,
  }
  return statusTexts[status] || status
}

const editAppointment = (appointment) => {
  // 编辑预约逻辑
  console.log('编辑预约:', appointment)
}

const deleteAppointment = async (appointmentId) => {
  // 彻底删除预约记录
  if (confirm('确定要彻底删除这条预约记录吗？此操作不可恢复！')) {
    try {
      loading.value = true
      const token = await authStore.getIdToken()
      if (!token) {
        throw new Error('用户未登录')
      }
      
      const result = await deleteAppointmentAPI(appointmentId, token, '管理员彻底删除')
      if (result.success) {
        // 从本地数组中移除预约
        appointments.value = appointments.value.filter((a) => a.id !== appointmentId)
        console.log('预约记录已彻底删除:', appointmentId)
        alert('预约记录已彻底删除')
      } else {
        throw new Error(result.error || '删除预约失败')
      }
    } catch (err) {
      console.error('删除预约失败:', err)
      error.value = err.message || '删除预约失败，请重试'
      alert('删除失败: ' + error.value)
    } finally {
      loading.value = false
    }
  }
}

const exportToCSV = () => {
  try {
    isExporting.value = true
    const csvContent = generateCSV()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
    const filename = `appointments_${timestamp}.csv`
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8')
  } catch (error) {
    console.error('Export to CSV failed:', error)
    alert(texts.value.exportError || '导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const exportToPDF = async () => {
  try {
    isExporting.value = true
    await generatePDFOnFrontend()
  } catch (error) {
    console.error('Export to PDF failed:', error)
    alert(texts.value.exportError || '导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const generateCSV = () => {
  const headers = [
    'ID',
    texts.value.patientName,
    texts.value.appointmentDate,
    texts.value.appointmentTime,
    texts.value.service,
    texts.value.status
  ]
  
  const csvRows = [headers.join(',')]
  
  filteredData.value.forEach(appointment => {
    const row = [
      appointment.id,
      `"${appointment.patientName.replace(/"/g, '""')}"`,
      appointment.appointmentDate,
      appointment.appointmentTime,
      `"${appointment.service.replace(/"/g, '""')}"`,
      `"${getStatusText(appointment.status).replace(/"/g, '""')}"`
    ]
    csvRows.push(row.join(','))
  })
  
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  return BOM + csvRows.join('\n')
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf')
  return jsPDF
}

const generatePDFOnFrontend = async () => {
  try {
    const jsPDF = await loadJsPDF()
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text(texts.value.appointmentManagement, 20, 20)
    
    // Add export info
    doc.setFontSize(10)
    const exportTime = new Date().toLocaleString()
    doc.text(`${texts.value.exportTime || '导出时间'}: ${exportTime}`, 20, 30)
    
    // Add table headers
    let yPosition = 50
    doc.setFontSize(12)
    const headers = ['ID', texts.value.patientName, texts.value.appointmentDate, texts.value.appointmentTime, texts.value.service, texts.value.status]
    doc.text(headers.join('  |  '), 20, yPosition)
    
    // Add data rows
    yPosition += 10
    filteredData.value.forEach((appointment, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      const row = [
        appointment.id,
        appointment.patientName.substring(0, 15) + (appointment.patientName.length > 15 ? '...' : ''),
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.service.substring(0, 10) + (appointment.service.length > 10 ? '...' : ''),
        getStatusText(appointment.status)
      ]
      
      doc.setFontSize(10)
      doc.text(row.join('  |  '), 20, yPosition)
      yPosition += 8
    })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
    const filename = `appointments_${timestamp}.pdf`
    doc.save(filename)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}

// 多语言文本
const texts = computed(() =>
  props.lang === 'zh'
    ? {
        appointmentManagement: '预约管理',
        bulkEmail: '批量邮件',
        clearSelection: '清除选择',
        exportCSV: '导出CSV',
        exportPDF: '导出PDF',
        globalSearch: '全局搜索...',
        patientName: '患者姓名',
        appointmentDate: '预约日期',
        appointmentTime: '预约时间',
        service: '服务类型',
        status: '状态',
        actions: '操作',
        noAppointments: '暂无预约记录',
        selectedUsers: '位用户',
        close: '关闭',
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消',
        confirmDelete: '确定要删除这个预约吗？',
        exportError: '导出失败，请重试',
        exportTime: '导出时间',
      }
    : {
        appointmentManagement: 'Appointment Management',
        bulkEmail: 'Bulk Email',
        clearSelection: 'Clear Selection',
        exportCSV: 'Export CSV',
        exportPDF: 'Export PDF',
        globalSearch: 'Global search...',
        patientName: 'Patient Name',
        appointmentDate: 'Appointment Date',
        appointmentTime: 'Appointment Time',
        service: 'Service',
        status: 'Status',
        actions: 'Actions',
        noAppointments: 'No appointments found',
        selectedUsers: 'users',
        close: 'Close',
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
        confirmDelete: 'Are you sure you want to delete this appointment?',
        exportError: 'Export failed, please try again',
        exportTime: 'Export Time',
      },
)

// 监听路由变化
watch(
  () => route.query,
  () => {
    // 处理路由查询参数变化
  },
  { immediate: true },
)

// 组件挂载时的初始化
onMounted(() => {
  // 加载预约数据
  loadAppointments()
})
</script>

<style scoped>
.data-table-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.search-container {
  max-width: 400px;
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

@media (max-width: 768px) {
  .data-table-container {
    padding: 1rem;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .export-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .table-responsive {
    overflow-x: auto;
  }
}
</style>
