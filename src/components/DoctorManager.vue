<template>
  <div class="doctor-manager">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="title-area">
        <div class="title-with-close">
          <h2 class="page-title">
            <i class="fas fa-user-md"></i>
            {{ t.doctorManager }}
          </h2>
          <button class="btn btn-outline-secondary close-btn" @click="goBack">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p class="page-description">{{ t.manageDesc }}</p>
      </div>

      <!-- 管理员操作按钮 -->
      <div class="admin-actions" v-if="authStore.isAdmin">
        <button class="btn btn-primary" @click="openAddDoctorModal" :disabled="loading">
          <i class="fas fa-plus"></i>
          {{ t.addDoctor }}
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="t.searchPlaceholder"
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">{{ t.allStatus }}</option>
          <option value="active">{{ t.activeOnly }}</option>
          <option value="inactive">{{ t.inactiveOnly }}</option>
        </select>

        <select v-model="specialtyFilter" class="filter-select">
          <option value="all">{{ t.allSpecialties }}</option>
          <option v-for="specialty in specialtyOptions" :key="specialty" :value="specialty">
            {{ specialty }}
          </option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t.loading }}</p>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ error }}</span>
      <button @click="loadDoctors" class="retry-btn">{{ t.retry }}</button>
    </div>

    <!-- 医生列表 -->
    <div v-if="!loading && !error" class="doctors-grid">
      <div
        v-for="doctor in filteredDoctors"
        :key="doctor.id"
        class="doctor-card"
        :class="{ inactive: !doctor.isActive }"
      >
        <!-- 医生头像和基本信息 -->
        <div class="doctor-header">
          <div class="doctor-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="doctor-info">
            <h3 class="doctor-name">{{ doctor.name }}</h3>
            <p class="doctor-email">{{ doctor.email }}</p>
            <div class="doctor-status">
              <span class="status-badge" :class="doctor.isActive ? 'active' : 'inactive'">
                {{ doctor.isActive ? t.active : t.inactive }}
              </span>
            </div>
          </div>
        </div>

        <!-- 医生详细信息 -->
        <div class="doctor-details">
          <div class="detail-item">
            <i class="fas fa-phone"></i>
            <span>{{ doctor.phone || t.noPhone }}</span>
          </div>

          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>{{ doctor.slotMins }}{{ t.minutes }}</span>
          </div>

          <div class="detail-item">
            <i class="fas fa-globe"></i>
            <span>{{ doctor.timezone }}</span>
          </div>

          <div class="detail-item" v-if="doctor.specialties && doctor.specialties.length > 0">
            <i class="fas fa-stethoscope"></i>
            <div class="specialties">
              <span v-for="specialty in doctor.specialties" :key="specialty" class="specialty-tag">
                {{ specialty }}
              </span>
            </div>
          </div>
        </div>

        <!-- 工作时间 -->
        <div class="business-hours">
          <h4>{{ t.businessHours }}</h4>
          <div class="hours-grid">
            <div
              v-for="(hours, day) in doctor.businessHours"
              :key="day"
              class="hour-item"
              :class="{ enabled: hours.enabled }"
            >
              <span class="day-name">{{ t.days[day] }}</span>
              <span class="time-range" v-if="hours.enabled">
                {{ hours.start }} - {{ hours.end }}
              </span>
              <span class="closed" v-else>{{ t.closed }}</span>
            </div>
          </div>
        </div>

        <!-- 管理员操作按钮 -->
        <div class="doctor-actions" v-if="authStore.isAdmin">
          <button class="btn btn-secondary" @click="editDoctor(doctor)" :disabled="loading">
            <i class="fas fa-edit"></i>
            {{ t.edit }}
          </button>

          <button class="btn btn-danger" @click="confirmDeleteDoctor(doctor)" :disabled="loading">
            <i class="fas fa-trash"></i>
            {{ t.delete }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && filteredDoctors.length === 0" class="empty-state">
      <i class="fas fa-user-md"></i>
      <h3>{{ t.noDoctors }}</h3>
      <p>{{ t.noDoctorsDesc }}</p>
      <button v-if="authStore.isAdmin" class="btn btn-primary" @click="openAddDoctorModal">
        {{ t.addFirstDoctor }}
      </button>
    </div>

    <!-- 添加/编辑医生模态框 -->
    <div v-if="showDoctorModal" class="modal-overlay" @click="closeDoctorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? t.editDoctor : t.addDoctor }}</h3>
          <button class="close-btn" @click="closeDoctorModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveDoctorForm" class="doctor-form">
          <!-- 基本信息 -->
          <div class="form-section">
            <h4>{{ t.basicInfo }}</h4>

            <div class="form-group">
              <label for="doctorName">{{ t.name }} *</label>
              <input
                id="doctorName"
                type="text"
                v-model="doctorForm.name"
                required
                class="form-input"
                :placeholder="t.namePlaceholder"
              />
            </div>

            <div class="form-group">
              <label for="doctorEmail">{{ t.email }} *</label>
              <input
                id="doctorEmail"
                type="email"
                v-model="doctorForm.email"
                required
                class="form-input"
                :placeholder="t.emailPlaceholder"
              />
            </div>

            <div class="form-group">
              <label for="doctorPhone">{{ t.phone }}</label>
              <input
                id="doctorPhone"
                type="tel"
                v-model="doctorForm.phone"
                class="form-input"
                :placeholder="t.phonePlaceholder"
              />
            </div>
          </div>

          <!-- 专业设置 -->
          <div class="form-section">
            <h4>{{ t.professionalSettings }}</h4>

            <div class="form-group">
              <label for="doctorTimezone">{{ t.timezone }} *</label>
              <select
                id="doctorTimezone"
                v-model="doctorForm.timezone"
                required
                class="form-select"
              >
                <option v-for="tz in timezoneOptions" :key="tz" :value="tz">
                  {{ tz }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="doctorSlotMins">{{ t.slotDuration }} *</label>
              <select
                id="doctorSlotMins"
                v-model="doctorForm.slotMins"
                required
                class="form-select"
              >
                <option value="15">15 {{ t.minutes }}</option>
                <option value="30">30 {{ t.minutes }}</option>
                <option value="45">45 {{ t.minutes }}</option>
                <option value="60">60 {{ t.minutes }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="doctorSpecialties">{{ t.specialties }}</label>
              <div class="specialties-selector">
                <div
                  v-for="specialty in specialtyOptions"
                  :key="specialty"
                  class="specialty-option"
                >
                  <input
                    type="checkbox"
                    :id="`specialty-${specialty}`"
                    :value="specialty"
                    v-model="doctorForm.specialties"
                  />
                  <label :for="`specialty-${specialty}`">{{ specialty }}</label>
                </div>
              </div>
            </div>
          </div>

          <!-- 工作时间设置 -->
          <div class="form-section">
            <h4>{{ t.businessHours }}</h4>
            <div class="business-hours-form">
              <div v-for="(hours, day) in doctorForm.businessHours" :key="day" class="day-hours">
                <div class="day-header">
                  <input type="checkbox" :id="`day-${day}`" v-model="hours.enabled" />
                  <label :for="`day-${day}`" class="day-label">
                    {{ t.days[day] }}
                  </label>
                </div>

                <div class="time-inputs" v-if="hours.enabled">
                  <input type="time" v-model="hours.start" class="time-input" />
                  <span>-</span>
                  <input type="time" v-model="hours.end" class="time-input" />
                </div>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="form-section">
            <h4>{{ t.advancedSettings }}</h4>

            <div class="form-row">
              <div class="form-group">
                <label for="bufferTime">{{ t.bufferTime }}</label>
                <input
                  id="bufferTime"
                  type="number"
                  v-model="doctorForm.bufferTime"
                  min="0"
                  max="60"
                  class="form-input"
                />
                <small>{{ t.bufferTimeDesc }}</small>
              </div>

              <div class="form-group">
                <label for="maxReschedules">{{ t.maxReschedules }}</label>
                <input
                  id="maxReschedules"
                  type="number"
                  v-model="doctorForm.maxReschedules"
                  min="0"
                  max="10"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="minAdvanceBooking">{{ t.minAdvanceBooking }}</label>
                <input
                  id="minAdvanceBooking"
                  type="number"
                  v-model="doctorForm.minAdvanceBooking"
                  min="1"
                  max="168"
                  class="form-input"
                />
                <small>{{ t.minAdvanceBookingDesc }}</small>
              </div>

              <div class="form-group">
                <label for="maxAdvanceBooking">{{ t.maxAdvanceBooking }}</label>
                <input
                  id="maxAdvanceBooking"
                  type="number"
                  v-model="doctorForm.maxAdvanceBooking"
                  min="1"
                  max="365"
                  class="form-input"
                />
                <small>{{ t.maxAdvanceBookingDesc }}</small>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="doctorForm.isActive" />
                {{ t.isActive }}
              </label>
              <small>{{ t.isActiveDesc }}</small>
            </div>
          </div>

          <!-- 表单按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeDoctorModal">
              {{ t.cancel }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-small"></span>
              {{ isEditing ? t.update : t.create }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ t.confirmDelete }}</h3>
          <button class="close-btn" @click="closeDeleteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p>{{ t.deleteWarning.replace('{name}', doctorToDelete?.name || '') }}</p>
          <p class="warning-text">{{ t.deleteWarningNote }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            {{ t.cancel }}
          </button>
          <button class="btn btn-danger" @click="deleteDoctor" :disabled="formLoading">
            <span v-if="formLoading" class="spinner-small"></span>
            {{ t.delete }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ClinicianAPI } from '../api/clinicianAPI'
import { ClinicianModel } from '../models/appointmentModels'

// Props
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

// Router and Stores
const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['close'])

// 响应式数据
const doctors = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('all')
const specialtyFilter = ref('all')

// 模态框状态
const showDoctorModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const formLoading = ref(false)
const doctorToDelete = ref(null)

// 表单数据
const doctorForm = ref({
  name: '',
  email: '',
  phone: '',
  timezone: 'Australia/Melbourne',
  slotMins: 30,
  specialties: [],
  isActive: true,
  bufferTime: 10,
  maxReschedules: 3,
  minAdvanceBooking: 24,
  maxAdvanceBooking: 90,
  businessHours: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '13:00', enabled: false },
    sunday: { start: '09:00', end: '13:00', enabled: false },
  },
})

// 选项数据
const specialtyOptions = ClinicianAPI.getSpecialtyOptions()
const timezoneOptions = ClinicianAPI.getTimezoneOptions()

// 国际化
const t = computed(() => {
  const translations = {
    zh: {
      doctorManager: '医生管理',
      manageDesc: '管理医生信息，包括添加、编辑和删除医生资料',
      addDoctor: '添加医生',
      searchPlaceholder: '搜索医生姓名或邮箱...',
      allStatus: '全部状态',
      activeOnly: '仅活跃',
      inactiveOnly: '仅停用',
      allSpecialties: '全部专业',
      loading: '加载中...',
      retry: '重试',
      active: '活跃',
      inactive: '停用',
      noPhone: '未设置电话',
      minutes: '分钟',
      businessHours: '工作时间',
      closed: '休息',
      edit: '编辑',
      delete: '删除',
      noDoctors: '暂无医生',
      noDoctorsDesc: '还没有添加任何医生信息',
      addFirstDoctor: '添加第一个医生',
      editDoctor: '编辑医生',
      basicInfo: '基本信息',
      name: '姓名',
      namePlaceholder: '请输入医生姓名',
      email: '邮箱',
      emailPlaceholder: '请输入邮箱地址',
      phone: '电话',
      phonePlaceholder: '请输入电话号码',
      professionalSettings: '专业设置',
      timezone: '时区',
      slotDuration: '预约时长',
      specialties: '专业领域',
      advancedSettings: '高级设置',
      bufferTime: '缓冲时间（分钟）',
      bufferTimeDesc: '预约间隔的缓冲时间',
      maxReschedules: '最大改期次数',
      minAdvanceBooking: '最少提前预约（小时）',
      minAdvanceBookingDesc: '用户最少需要提前多少小时预约',
      maxAdvanceBooking: '最多提前预约（天）',
      maxAdvanceBookingDesc: '用户最多可以提前多少天预约',
      isActive: '启用此医生',
      isActiveDesc: '停用后用户将无法预约此医生',
      cancel: '取消',
      update: '更新',
      create: '创建',
      confirmDelete: '确认删除',
      deleteWarning: '确定要删除医生 "{name}" 吗？',
      deleteWarningNote: '此操作将停用该医生，但不会删除历史预约记录。',
      days: {
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',
        sunday: '周日',
      },
    },
    en: {
      doctorManager: 'Doctor Management',
      manageDesc:
        'Manage doctor information, including adding, editing and deleting doctor profiles',
      addDoctor: 'Add Doctor',
      searchPlaceholder: 'Search doctor name or email...',
      allStatus: 'All Status',
      activeOnly: 'Active Only',
      inactiveOnly: 'Inactive Only',
      allSpecialties: 'All Specialties',
      loading: 'Loading...',
      retry: 'Retry',
      active: 'Active',
      inactive: 'Inactive',
      noPhone: 'No phone set',
      minutes: 'minutes',
      businessHours: 'Business Hours',
      closed: 'Closed',
      edit: 'Edit',
      delete: 'Delete',
      noDoctors: 'No Doctors',
      noDoctorsDesc: 'No doctor information has been added yet',
      addFirstDoctor: 'Add First Doctor',
      editDoctor: 'Edit Doctor',
      basicInfo: 'Basic Information',
      name: 'Name',
      namePlaceholder: 'Enter doctor name',
      email: 'Email',
      emailPlaceholder: 'Enter email address',
      phone: 'Phone',
      phonePlaceholder: 'Enter phone number',
      professionalSettings: 'Professional Settings',
      timezone: 'Timezone',
      slotDuration: 'Appointment Duration',
      specialties: 'Specialties',
      advancedSettings: 'Advanced Settings',
      bufferTime: 'Buffer Time (minutes)',
      bufferTimeDesc: 'Buffer time between appointments',
      maxReschedules: 'Max Reschedules',
      minAdvanceBooking: 'Min Advance Booking (hours)',
      minAdvanceBookingDesc: 'Minimum hours users need to book in advance',
      maxAdvanceBooking: 'Max Advance Booking (days)',
      maxAdvanceBookingDesc: 'Maximum days users can book in advance',
      isActive: 'Enable this doctor',
      isActiveDesc: 'When disabled, users cannot book appointments with this doctor',
      cancel: 'Cancel',
      update: 'Update',
      create: 'Create',
      confirmDelete: 'Confirm Delete',
      deleteWarning: 'Are you sure you want to delete doctor "{name}"?',
      deleteWarningNote:
        'This will deactivate the doctor but will not delete historical appointment records.',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
    },
  }
  return translations[props.lang] || translations.zh
})

// 计算属性
const filteredDoctors = computed(() => {
  let filtered = doctors.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) || doctor.email.toLowerCase().includes(query),
    )
  }

  // 状态过滤
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter((doctor) => doctor.isActive === isActive)
  }

  // 专业过滤
  if (specialtyFilter.value !== 'all') {
    filtered = filtered.filter(
      (doctor) => doctor.specialties && doctor.specialties.includes(specialtyFilter.value),
    )
  }

  return filtered
})

// 方法
const loadDoctors = async () => {
  try {
    loading.value = true
    error.value = ''

    const result = await ClinicianAPI.getAllClinicians()
    if (result.success) {
      doctors.value = result.data
    } else {
      error.value = result.error || '获取医生列表失败'
    }
  } catch (err) {
    console.error('加载医生列表失败:', err)
    error.value = err.message || '加载医生列表失败'
  } finally {
    loading.value = false
  }
}

const openAddDoctorModal = () => {
  isEditing.value = false
  resetDoctorForm()
  showDoctorModal.value = true
}

const editDoctor = (doctor) => {
  isEditing.value = true
  doctorForm.value = {
    ...ClinicianModel.defaults,
    ...doctor,
  }
  showDoctorModal.value = true
}

const closeDoctorModal = () => {
  showDoctorModal.value = false
  resetDoctorForm()
}

const resetDoctorForm = () => {
  doctorForm.value = {
    name: '',
    email: '',
    phone: '',
    timezone: 'Australia/Melbourne',
    slotMins: 30,
    specialties: [],
    isActive: true,
    bufferTime: 10,
    maxReschedules: 3,
    minAdvanceBooking: 24,
    maxAdvanceBooking: 90,
    businessHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '13:00', enabled: false },
      sunday: { start: '09:00', end: '13:00', enabled: false },
    },
  }
}

const saveDoctorForm = async () => {
  try {
    formLoading.value = true

    let result
    if (isEditing.value) {
      result = await ClinicianAPI.updateClinician(
        doctorForm.value.id,
        doctorForm.value,
        'mock-token',
      )
    } else {
      result = await ClinicianAPI.createClinician(doctorForm.value, 'mock-token')
    }

    if (result.success) {
      await loadDoctors()
      closeDoctorModal()
      alert(isEditing.value ? '医生信息更新成功！' : '医生创建成功！')
    } else {
      alert(result.error || '操作失败')
    }
  } catch (err) {
    console.error('保存医生信息失败:', err)
    alert(err.message || '保存失败')
  } finally {
    formLoading.value = false
  }
}

const confirmDeleteDoctor = (doctor) => {
  doctorToDelete.value = doctor
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  doctorToDelete.value = null
}

const deleteDoctor = async () => {
  try {
    formLoading.value = true

    const result = await ClinicianAPI.deleteClinician(doctorToDelete.value.id, 'mock-token')

    if (result.success) {
      await loadDoctors()
      closeDeleteModal()
      alert('医生删除成功！')
    } else {
      alert(result.error || '删除失败')
    }
  } catch (err) {
    console.error('删除医生失败:', err)
    alert(err.message || '删除失败')
  } finally {
    formLoading.value = false
  }
}

// 导航方法
const goBack = () => {
  console.log('DoctorManager: goBack 被点击，发出 close 事件以关闭模态框')
  // 通知父组件关闭模态框
  emit('close')
  // 额外保障：如果作为独立路由使用，且当前不在 /appointments，则跳转
  try {
    const current = router.currentRoute.value?.path
    if (current && current !== '/appointments') {
      router.push('/appointments')
    }
  } catch (e) {
    console.warn('路由跳转备用逻辑出错：', e)
  }
}

// 生命周期
onMounted(() => {
  loadDoctors()
})
</script>

<style scoped>
.doctor-manager {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.title-area {
  flex: 1;
}

.title-with-close {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.close-btn {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 0.375rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.close-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #2d3748;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: #4299e1;
}

.page-description {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

.admin-actions {
  flex-shrink: 0;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  min-width: 150px;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.retry-btn {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background: #c53030;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.doctor-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.doctor-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.doctor-card.inactive {
  opacity: 0.6;
  background: #f7fafc;
}

.doctor-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.doctor-avatar {
  width: 60px;
  height: 60px;
  background: #4299e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.doctor-info {
  flex: 1;
}

.doctor-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.doctor-email {
  color: #718096;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background: #fed7d7;
  color: #c53030;
}

.doctor-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.detail-item i {
  width: 16px;
  color: #718096;
}

.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-tag {
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.business-hours {
  margin-bottom: 1.5rem;
}

.business-hours h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.75rem 0;
}

.hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.hour-item {
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
}

.hour-item.enabled {
  background: #ebf8ff;
  color: #2b6cb0;
}

.day-name {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.time-range {
  color: #4a5568;
}

.closed {
  color: #a0aec0;
}

.doctor-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-state i {
  font-size: 4rem;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 2rem 0;
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.close-btn:hover {
  background: #f7fafc;
  color: #4a5568;
}

.doctor-form {
  padding: 0 1.5rem 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-group small {
  display: block;
  color: #718096;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.specialties-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.specialty-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.specialty-option input[type='checkbox'] {
  width: auto;
}

.business-hours-form {
  display: grid;
  gap: 1rem;
}

.day-hours {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-label {
  font-weight: 500;
  color: #4a5568;
  margin: 0;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.delete-modal {
  max-width: 500px;
}

.modal-body {
  padding: 0 1.5rem;
}

.warning-text {
  color: #e53e3e;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .doctor-manager {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    flex-direction: column;
  }

  .doctors-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .day-hours {
    grid-template-columns: 1fr;
  }

  .specialties-selector {
    grid-template-columns: 1fr;
  }
}
</style>
