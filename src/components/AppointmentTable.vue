<template>
  <div class="data-table-container">
    <h2 class="mb-4">{{ texts.appointmentList }}</h2>

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

const getStatusText = (status) => {
  const statusMap = {
    confirmed: texts.value.confirmed,
    pending: texts.value.pending,
    cancelled: texts.value.cancelled,
    completed: texts.value.completed
  }
  return statusMap[status] || status
}

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
        next: '下一页'
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
        next: 'Next'
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