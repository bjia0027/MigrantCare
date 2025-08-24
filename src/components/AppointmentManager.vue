<template>
  <div class="appointment-manager">
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              {{ texts.appointmentManager }}
            </h1>
            <p class="lead text-muted">{{ texts.manageDesc }}</p>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-4 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-primary mb-2"></div>
            <h4>{{ upcomingAppointments.length }}</h4>
            <p class="text-muted">{{ texts.upcomingAppointments }}</p>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-warning mb-2"></div>
            <h4>{{ todayAppointments.length }}</h4>
            <p class="text-muted">{{ texts.todayAppointments }}</p>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-info mb-2"></div>
            <h4>{{ completedAppointments.length }}</h4>
            <p class="text-muted">{{ texts.completedAppointments }}</p>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div class="appointment-actions">
            <button class="btn btn-primary me-2" @click="showNewAppointmentForm = true">
              {{ texts.newAppointment }}
            </button>
            <button
              v-if="authStore.isAdmin"
              class="btn btn-secondary me-2"
              @click="showDoctorManager = true"
            >
              {{ texts.manageDoctors || '管理医生' }}
            </button>
            <div class="btn-group" role="group">
              <button
                class="btn"
                :class="activeTab === 'upcoming' ? 'btn-info' : 'btn-outline-info'"
                @click="activeTab = 'upcoming'"
              >
                {{ texts.upcoming }}
              </button>
              <button
                class="btn"
                :class="activeTab === 'today' ? 'btn-warning' : 'btn-outline-warning'"
                @click="activeTab = 'today'"
              >
                {{ texts.today }}
              </button>
              <button
                class="btn"
                :class="activeTab === 'completed' ? 'btn-success' : 'btn-outline-success'"
                @click="activeTab = 'completed'"
              >
                {{ texts.completed }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div class="view-toggle">
            <div class="btn-group" role="group">
              <button
                type="button"
                class="btn"
                :class="currentView === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                @click="currentView = 'list'"
              >
                <i class="fas fa-list"></i> {{ texts.listView }}
              </button>
              <button
                type="button"
                class="btn"
                :class="currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                @click="currentView = 'grid'"
              >
                <i class="fas fa-th"></i> {{ texts.gridView }}
              </button>
              <button
                type="button"
                class="btn"
                :class="currentView === 'calendar' ? 'btn-primary' : 'btn-outline-primary'"
                @click="currentView = 'calendar'"
              >
                <i class="fas fa-calendar-alt"></i> {{ texts.calendarView }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4" v-if="showNewAppointmentForm">
        <div class="col-12">
          <div class="appointment-form">
            <h5>{{ texts.scheduleNewAppointment }}</h5>
            <form @submit.prevent="submitAppointment">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ texts.doctorName }}</label>
                    <select class="form-select" v-model="newAppointment.doctor" required>
                      <option value="">{{ texts.selectDoctor }}</option>
                      <option
                        v-for="clinician in clinicians"
                        :key="clinician.id"
                        :value="clinician.id"
                      >
                        {{ clinician.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ texts.appointmentType }}</label>
                    <select class="form-select" v-model="newAppointment.type" required>
                      <option value="">{{ texts.selectType }}</option>
                      <option value="checkup">{{ texts.generalCheckup }}</option>
                      <option value="consultation">{{ texts.consultation }}</option>
                      <option value="followup">{{ texts.followUp }}</option>
                      <option value="specialist">{{ texts.specialist }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ texts.appointmentDate }}</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="newAppointment.date"
                      :min="today"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ texts.appointmentTime }}</label>
                    <input
                      type="time"
                      class="form-control"
                      v-model="newAppointment.time"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ texts.location }}</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newAppointment.location"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">{{ texts.notes }}</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="newAppointment.notes"
                  :placeholder="texts.additionalNotes"
                ></textarea>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success">
                  {{ texts.confirmAppointment }}
                </button>
                <button type="button" class="btn btn-secondary" @click="cancelNewAppointment">
                  {{ texts.cancel }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div v-if="currentView === 'list'">
          <div class="row">
            <div class="col-12">
              <div class="appointments-list">
                <div v-if="activeTab === 'upcoming'">
                  <h5 class="mb-3">{{ texts.upcomingAppointments }}</h5>
                  <div
                    v-for="appointment in upcomingAppointments"
                    :key="appointment.id"
                    class="appointment-card mb-3"
                  >
                    <div class="appointment-header">
                      <h6 class="appointment-title">{{ appointment.doctor }}</h6>
                      <span class="appointment-status badge bg-primary">{{ texts.upcoming }}</span>
                    </div>
                    <div class="appointment-details">
                      <div class="detail-row">
                        <strong>{{ texts.date }}:</strong> {{ formatDate(appointment.date) }}
                      </div>
                      <div class="detail-row">
                        <strong>{{ texts.time }}:</strong> {{ appointment.time }}
                      </div>
                      <div class="detail-row">
                        <strong>{{ texts.location }}:</strong> {{ appointment.location }}
                      </div>
                      <div class="detail-row" v-if="appointment.notes">
                        <strong>{{ texts.notes }}:</strong> {{ appointment.notes }}
                      </div>
                    </div>
                    <div class="appointment-actions">
                      <button class="btn btn-sm btn-outline-warning me-2">
                        {{ texts.edit }}
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger me-2"
                        @click="cancelAppointment(appointment.id)"
                      >
                        {{ texts.cancel }}
                      </button>
                      <button class="btn btn-sm btn-outline-info">
                        {{ texts.directions }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeTab === 'today'">
                  <h5 class="mb-3">{{ texts.todayAppointments }}</h5>
                  <div v-if="todayAppointments.length === 0" class="empty-state text-center py-4">
                    <div class="empty-icon mb-3 text-muted"></div>
                    <p class="text-muted">{{ texts.noAppointmentsToday }}</p>
                  </div>
                  <div
                    v-for="appointment in todayAppointments"
                    :key="appointment.id"
                    class="appointment-card mb-3"
                  >
                  </div>
                </div>

                <div v-else-if="activeTab === 'completed'">
                  <h5 class="mb-3">{{ texts.completedAppointments }}</h5>
                  <div
                    v-for="appointment in completedAppointments"
                    :key="appointment.id"
                    class="appointment-card mb-3"
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentView === 'grid'" class="grid-view">
          <div class="row">
            <div
              class="col-md-4 mb-3"
              v-for="appointment in filteredAppointments"
              :key="appointment.id"
            >
              <div class="card appointment-card">
                <div class="card-body">
                  <h6 class="card-title">{{ appointment.doctor }}</h6>
                  <p class="card-text">
                    <small class="text-muted">
                      <i class="fas fa-clock"></i> {{ formatDate(appointment.date) }}
                      {{ appointment.time }}
                    </small>
                  </p>
                  <p class="card-text">{{ appointment.type }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge" :class="getStatusBadgeClass(appointment.status)">{{
                      getStatusLabel(appointment.status)
                    }}</span>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="openModal('edit', appointment)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="cancelAppointment(appointment.id)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentView === 'calendar'" class="calendar-view">
          <CalendarView
            :appointments="appointments"
            :clinicians="clinicians"
            :lang="lang"
            @appointment-created="handleAppointmentCreated"
            @appointment-updated="handleAppointmentUpdated"
            @appointment-deleted="handleAppointmentDeleted"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showDoctorManager"
      class="modal fade show"
      style="display: block; background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ texts.manageDoctors || '管理医生' }}</h5>
            <button type="button" class="btn-close" @click="showDoctorManager = false"></button>
          </div>
          <div class="modal-body">
            <DoctorManager
              :lang="lang"
              @close="handleDoctorManagerClose"
              @doctor-updated="loadClinicians"
              @doctor-created="loadClinicians"
              @doctor-deleted="loadClinicians"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showToast"
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1500; pointer-events: none"
    >
      <div
        class="toast show"
        :class="{
          'bg-success': toastType === 'success',
          'bg-danger': toastType === 'error',
          'bg-warning': toastType === 'warning',
          'bg-info': toastType === 'info',
        }"
        role="alert"
        style="pointer-events: auto"
      >
        <div class="toast-header">
          <i
            class="fas me-2"
            :class="{
              'fa-check-circle text-success': toastType === 'success',
              'fa-exclamation-circle text-danger': toastType === 'error',
              'fa-exclamation-triangle text-warning': toastType === 'warning',
              'fa-info-circle text-info': toastType === 'info',
            }"
          ></i>
          <strong class="me-auto">
            {{
              toastType === 'success'
                ? '成功'
                : toastType === 'error'
                  ? '错误'
                  : toastType === 'warning'
                    ? '警告'
                    : '信息'
            }}
          </strong>
          <button type="button" class="btn-close" @click="showToast = false"></button>
        </div>
        <div class="toast-body text-white">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from 'vue'
import CalendarView from './CalendarView.vue'
import DoctorManager from './DoctorManager.vue'
import { AppointmentModel, ClinicianModel, BlackoutModel } from '../models/appointmentModels'
import { useAuthStore } from '../stores/auth'
import {
  getAllAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment as cancelAppointmentAPI,
  deleteAppointment as deleteAppointmentAPI,
} from '../api/appointmentAPI'
import { ClinicianAPI } from '../api/clinicianAPI'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const showNewAppointmentForm = ref(false)
const showDoctorManager = ref(false)
const activeTab = ref('upcoming')
const currentView = ref('timeGridWeek')
const editingAppointment = ref(null)
const currentDate = ref(new Date())
const selectedDate = ref(null)
const searchTerm = ref('')
const statusFilter = ref('all')
const today = new Date().toISOString().split('T')[0]

const authStore = useAuthStore()

const hasLoadedOnce = ref(false)

const newAppointment = ref({
  doctor: '',
  type: '',
  date: '',
  time: '',
  location: '',
  notes: '',
})

const appointments = ref([])
const loading = ref(false)
const error = ref(null)

// 定义医生列表（修复 ReferenceError: clinicians is not defined）
const clinicians = ref([])

// Toast通知相关
const toastMessage = ref('')
const toastType = ref('success') // success, error, warning, info
const showToast = ref(false)

// Toast通知函数
const showSuccessToast = (message) => {
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
  // 3秒后自动隐藏
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const showErrorToast = (message) => {
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
  // 5秒后自动隐藏（错误信息显示时间稍长）
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

const showWarningToast = (message) => {
  toastMessage.value = message
  toastType.value = 'warning'
  showToast.value = true
  // 4秒后自动隐藏
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

// 接收 DoctorManager 的 close 事件，关闭模态框
const handleDoctorManagerClose = () => {
  try {
    console.log('AppointmentManager: 收到 DoctorManager close，关闭模态框')
    showDoctorManager.value = false
  } catch (e) {
    console.warn('关闭 DoctorManager 模态框时出错：', e)
    showDoctorManager.value = false
  }
}

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

    // 直接调用 API，内部会使用当前登录用户进行验证
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
      const userIds = [...new Set(result.data.map((apt) => apt.userId).filter(Boolean))]

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

            querySnapshot.forEach((doc) => {
              const userData = doc.data()
              userMap.set(doc.id, {
                email: userData.email || '',
                displayName: userData.displayName || userData.username || '',
                phone: userData.profile?.phone || '',
              })
            })
          }
        } catch (error) {
          console.warn('获取用户信息失败:', error)
        }
      }

      // 构建 clinicianId => name 的映射，用于补齐医生姓名
      const nameById = Object.fromEntries((clinicians.value || []).map((c) => [c.id, c.name]))
      // 转换数据格式以匹配现有的组件结构
      appointments.value = result.data.map((apt) => {
        const userInfo = userMap.get(apt.userId) || {}
        return {
          id: apt.id,
          doctor: apt.doctor || apt.clinicianName || nameById[apt.clinicianId] || '未知医生',
          type: apt.type || apt.service || '未知服务',
          date:
            apt.date ||
            (apt.start ? new Date(apt.start.seconds * 1000).toISOString().split('T')[0] : ''),
          time:
            apt.time ||
            (apt.start
              ? new Date(apt.start.seconds * 1000).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''),
          location: apt.location || '未知地点',
          notes: apt.notes || '',
          status: apt.status || 'pending',
          patientName:
            userInfo.email ||
            apt.patientName ||
            apt.displayName ||
            userInfo.displayName ||
            '未知用户',
          start: toLocalDate(apt.start),
          end: toLocalDate(apt.end),
          clinicianId: apt.clinicianId || 'unknown',
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

// 等待认证就绪（避免路由切换后立即请求导致 token 为空）
const waitForAuthReady = (timeoutMs = 6000) => {
  return new Promise((resolve) => {
    if (authStore.authReady) return resolve(true)
    const timer = setTimeout(() => {
      stop && stop()
      resolve(false)
    }, timeoutMs)
    const stop = watch(
      () => authStore.authReady,
      (ready) => {
        if (ready) {
          clearTimeout(timer)
          stop()
          resolve(true)
        }
      },
      { immediate: false },
    )
  })
}

// 组件挂载时加载数据（等待认证就绪）
onMounted(async () => {
  await waitForAuthReady()
  await loadClinicians()
  await loadAppointments()
  hasLoadedOnce.value = true
})

// keep-alive 场景：组件被重新激活时，如已完成首次加载则刷新数据
onActivated(async () => {
  if (!hasLoadedOnce.value) return
  await waitForAuthReady()
  await loadAppointments()
})

// 加载医生数据
const loadClinicians = async () => {
  // 移除本地默认医生，强制从 Firebase 加载
  clinicians.value = []

  try {
    console.log('开始加载医生数据...')
    // 只从 API 获取活跃医生
    const result = await ClinicianAPI.getAllClinicians({ isActive: true })
    console.log('API调用结果:', result)

    if (result.success && result.data && result.data.length > 0) {
      // 过滤活跃医生
      const activeClinicians = result.data.filter((doc) => doc.isActive !== false)
      clinicians.value = activeClinicians
      console.log('成功从API加载医生数据:', activeClinicians.length, '位医生')
      console.log(
        '医生列表:',
        activeClinicians.map((c) => ({ id: c.id, name: c.name })),
      )
    } else {
      console.log('API未返回医生数据')
    }
  } catch (error) {
    console.error('从API加载医生数据失败：', error)
  }

  console.log(
    '最终医生数据:',
    clinicians.value.map((c) => ({ id: c.id, name: c.name })),
  )
}

// 黑名单日期
const blackouts = ref([
  {
    id: 'blackout_1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-01'),
    reason: 'New Year Holiday',
    type: 'holiday',
  },
  {
    id: 'blackout_2',
    startDate: new Date('2024-12-25'),
    endDate: new Date('2024-12-25'),
    reason: 'Christmas Day',
    type: 'holiday',
  },
])

// 统一将可能的多种时间表示转为原生 Date，避免时区与类型不一致导致的统计错误
const toLocalDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000)
  return new Date(value)
}
const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const upcomingAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((apt) => {
    const start = toLocalDate(apt.start)
    const status = apt.status || 'pending'
    // 未来的预约，且未被取消
    return !!start && start > now && status !== 'cancelled'
  })
})

const todayAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((apt) => {
    const start = toLocalDate(apt.start)
    return !!start && isSameDay(start, now)
  })
})

const completedAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((apt) => {
    const end = toLocalDate(apt.end) || toLocalDate(apt.start)
    const status = apt.status
    // 已结束或被标记为完成/取消
    return (!!end && end < now) || status === 'completed' || status === 'cancelled'
  })
})

const texts = computed(() => {
  const translations = {
    zh: {
      appointmentManager: '预约管理中心',
      manageDesc: '管理您的医疗预约，健康检查和疫苗接种安排',
      upcomingAppointments: '即将到来的预约',
      todayAppointments: '今日预约',
      completedAppointments: '已完成预约',
      newAppointment: '预约新服务',
      upcoming: '即将到来',
      today: '今日',
      completed: '已完成',
      scheduleNewAppointment: '安排新预约',
      doctorName: '医生姓名',
      selectDoctor: '选择医生',
      appointmentType: '预约类型',
      selectType: '选择类型',
      generalCheckup: '常规体检',
      consultation: '咨询',
      followUp: '复查',
      specialist: '专科医生',
      appointmentDate: '预约日期',
      appointmentTime: '预约时间',
      location: '地点',
      notes: '备注',
      additionalNotes: '请描述您的症状或需求...',
      confirmAppointment: '确认预约',
      cancel: '取消',
      date: '日期',
      time: '时间',
      edit: '修改',
      directions: '导航',
      noAppointmentsToday: '今天没有预约',
      listView: '列表视图',
      gridView: '网格视图',
      calendarView: '日历视图',
      search: '搜索预约',
      filter: '筛选',
      all: '全部',
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      patientName: '患者姓名',
      doctor: '医生',
      title: '预约管理',
      noUpcomingAppointments: '暂无即将到来的预约',
      submit: '提交',
      close: '关闭',
    },
    en: {
      appointmentManager: 'Appointment Manager',
      manageDesc: 'Manage your medical appointments, health checks and vaccination schedules',
      upcomingAppointments: 'Upcoming Appointments',
      todayAppointments: "Today's Appointments",
      completedAppointments: 'Completed Appointments',
      newAppointment: 'New Appointment',
      upcoming: 'Upcoming',
      today: 'Today',
      completed: 'Completed',
      scheduleNewAppointment: 'Schedule New Appointment',
      doctorName: 'Doctor Name',
      selectDoctor: 'Select Doctor',
      appointmentType: 'Appointment Type',
      selectType: 'Select Type',
      generalCheckup: 'General Checkup',
      consultation: 'Consultation',
      followUp: 'Follow-up',
      specialist: 'Specialist',
      appointmentDate: 'Appointment Date',
      appointmentTime: 'Appointment Time',
      location: 'Location',
      notes: 'Notes',
      additionalNotes: 'Please describe your symptoms or requirements...',
      confirmAppointment: 'Confirm Appointment',
      cancel: 'Cancel',
      date: 'Date',
      time: 'Time',
      edit: 'Edit',
      directions: 'Directions',
      noAppointmentsToday: 'No appointments today',
      listView: 'List View',
      gridView: 'Grid View',
      calendarView: 'Calendar View',
      search: 'Search appointments',
      filter: 'Filter',
      all: 'All',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      patientName: 'Patient Name',
      doctor: 'Doctor',
      title: 'Appointment Manager',
      noUpcomingAppointments: 'No upcoming appointments',
      submit: 'Submit',
      close: 'Close',
    },
  }
  return translations[props.lang] || translations.zh
})

const submitAppointment = async () => {
  if (
    newAppointment.value.doctor &&
    newAppointment.value.type &&
    newAppointment.value.date &&
    newAppointment.value.time
  ) {
    try {
      loading.value = true

      // 找到选中的医生信息
      const selectedClinician = clinicians.value.find((c) => c.id === newAppointment.value.doctor)

      if (!selectedClinician) {
        throw new Error('请选择有效的医生')
      }

      // 构建开始和结束时间
      const startDateTime = new Date(`${newAppointment.value.date}T${newAppointment.value.time}:00`)
      const endDateTime = new Date(
        startDateTime.getTime() + (selectedClinician.slotMins || 60) * 60000,
      )

      // 转换为API期望的格式
      const appointmentData = {
        userId: authStore.user?.uid || 'anonymous',
        clinicianId: selectedClinician.id,
        clinicianName: selectedClinician.name,
        start: startDateTime,
        end: endDateTime,
        status: 'pending',
        type: newAppointment.value.type,
        title: `${newAppointment.value.type} - ${selectedClinician.name}`,
        notes: newAppointment.value.notes || '',
        location: newAppointment.value.location || '',
        duration: selectedClinician.slotMins || 60,
        source: 'web',
      }

      const token = await authStore.getIdToken()
      const result = await createAppointment(appointmentData, token)
      if (result.success) {
        // 直接添加新预约到本地数组，避免重新加载所有数据
        const newAppointmentItem = {
          id: result.data.id,
          doctor: selectedClinician.name,
          type: newAppointment.value.type,
          date: newAppointment.value.date,
          time: newAppointment.value.time,
          location: newAppointment.value.location || '未知地点',
          notes: newAppointment.value.notes || '',
          status: 'confirmed',
          patientName: authStore.user?.displayName || '未知用户',
          start: startDateTime,
          end: endDateTime,
          clinicianId: selectedClinician.id,
          clinicianName: selectedClinician.name,
          userId: authStore.user?.uid || 'anonymous',
        }

        // 添加到预约列表
        appointments.value.push(newAppointmentItem)

        cancelNewAppointment()

        // 使用更快的toast通知替代alert
        showSuccessToast('预约创建成功！')
      } else {
        throw new Error(result.error || '创建预约失败')
      }
    } catch (err) {
      console.error('创建预约失败:', err)
      error.value = err.message || '创建预约失败，请重试'
      showErrorToast('创建预约失败：' + error.value)
    } finally {
      loading.value = false
    }
  }
}

const cancelNewAppointment = () => {
  showNewAppointmentForm.value = false
  newAppointment.value = {
    doctor: '',
    type: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  }
}

const cancelAppointment = async (appointmentId) => {
  try {
    loading.value = true
    const result = await cancelAppointmentAPI(
      appointmentId,
      await authStore.getIdToken(),
      '用户取消',
    )
    if (result.success) {
      // 直接从本地数组中移除预约，避免重新加载所有数据
      const index = appointments.value.findIndex((apt) => apt.id === appointmentId)
      if (index > -1) {
        appointments.value.splice(index, 1)
      }
      showSuccessToast('预约已取消')
    } else {
      throw new Error(result.error || '取消预约失败')
    }
  } catch (err) {
    console.error('取消预约失败:', err)
    error.value = err.message || '取消预约失败，请重试'
    showErrorToast('取消预约失败：' + error.value)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getTypeIcon = (type) => {
  const icons = {
    general: 'fa-user-md text-primary',
    specialist: 'fa-stethoscope text-success',
    vaccine: 'fa-syringe text-warning',
    'medical-exam': 'fa-file-medical text-info',
    dental: 'fa-tooth text-danger',
    eye: 'fa-eye text-secondary',
  }
  return icons[type] || 'fa-calendar'
}

const getTypeLabel = (type) => {
  const labels = {
    general: '全科医生',
    specialist: '专科医生',
    vaccine: '疫苗接种',
    'medical-exam': '移民体检',
    dental: '牙科检查',
    eye: '眼科检查',
  }
  return labels[type] || type
}

const getProviderName = (provider) => {
  const names = {
    'royal-melbourne': '墨尔本皇家医院',
    'family-clinic': '家庭医疗中心',
    'city-medical': '市中心医疗诊所',
    'vaccination-hub': '疫苗接种中心',
  }
  return names[provider] || provider
}

const getProviderAddress = (provider) => {
  const addresses = {
    'royal-melbourne': '300 Grattan Street, Parkville',
    'family-clinic': '123 Collins Street, Melbourne',
    'city-medical': '789 Swanston Street, Melbourne',
    'vaccination-hub': '456 Burke Street, Melbourne',
  }
  return addresses[provider] || ''
}

// getStatusBadgeClass 函数已在后面声明

// CalendarView 事件处理方法
const handleAppointmentCreated = async (appointmentData) => {
  try {
    loading.value = true
    const newAppointmentData = {
      ...appointmentData,
      status: 'confirmed',
      userId: authStore.user?.uid || 'anonymous',
      userEmail: authStore.user?.email || '',
      createdAt: new Date().toISOString(),
    }

    const result = await createAppointment(newAppointmentData, await authStore.getIdToken())
    if (result.success) {
      await loadAppointments()
      console.log('新预约已创建:', result.data)
    } else {
      throw new Error(result.error || '创建预约失败')
    }
  } catch (err) {
    console.error('创建预约失败:', err)
    error.value = err.message || '创建预约失败，请重试'
  } finally {
    loading.value = false
  }
}

const handleAppointmentUpdated = async (appointmentData) => {
  try {
    loading.value = true
    const result = await updateAppointment(
      appointmentData.id,
      appointmentData,
      await authStore.getIdToken(),
    )
    if (result.success) {
      // 直接更新本地数组中的预约，避免重新加载所有数据
      const index = appointments.value.findIndex((apt) => apt.id === appointmentData.id)
      if (index > -1) {
        appointments.value[index] = { ...appointments.value[index], ...appointmentData }
      }
      console.log('预约已更新:', result.data)
    } else {
      throw new Error(result.error || '更新预约失败')
    }
  } catch (err) {
    console.error('更新预约失败:', err)
    error.value = err.message || '更新预约失败，请重试'
  } finally {
    loading.value = false
  }
}

const handleAppointmentDeleted = async (appointmentId) => {
  try {
    loading.value = true
    const token = await authStore.getIdToken()
    if (!token) throw new Error('用户未登录')

    let result
    if (isAdmin.value) {
      // 管理员执行彻底删除
      result = await deleteAppointmentAPI(appointmentId, token, '管理员彻底删除')
    } else {
      // 普通用户执行取消
      result = await cancelAppointmentAPI(appointmentId, token, '用户删除')
    }

    if (result.success) {
      // 从本地数组中移除预约，避免重新加载所有数据
      const index = appointments.value.findIndex((apt) => apt.id === appointmentId)
      if (index > -1) {
        appointments.value.splice(index, 1)
      }
      console.log(isAdmin.value ? '预约已彻底删除:' : '预约已取消:', appointmentId)
      showSuccessToast(isAdmin.value ? '预约已删除' : '预约已取消')
    } else {
      throw new Error(result.error || (isAdmin.value ? '删除预约失败' : '取消预约失败'))
    }
  } catch (err) {
    console.error(isAdmin.value ? '删除预约失败:' : '取消预约失败:', err)
    error.value = err.message || (isAdmin.value ? '删除预约失败，请重试' : '取消预约失败，请重试')
    showErrorToast(error.value)
  } finally {
    loading.value = false
  }
}

// getStatusLabel 函数已在后面声明

// Modal 相关变量
const currentUser = ref(null)
const showModal = ref(false)
const modalMode = ref('create')
const selectedAppointment = ref(null)
const appointmentForm = ref({
  patientName: '',
  doctorName: '',
  date: '',
  time: '',
  type: '',
  notes: '',
})

// 重复的appointments声明已删除

// 重复的filteredAppointments声明已删除

const openModal = (mode, appointment = null) => {
  modalMode.value = mode
  selectedAppointment.value = appointment

  if (mode === 'create') {
    appointmentForm.value = {
      patientName: '',
      doctorName: '',
      date: '',
      time: '',
      type: '',
      notes: '',
    }
  } else if (mode === 'edit' && appointment) {
    appointmentForm.value = { ...appointment }
  }

  showModal.value = true
}

// 日历相关方法
const weekdays = computed(() => {
  return props.lang === 'zh'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString(props.lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayAppointments = appointments.value.filter((apt) => {
      return apt.date === date.toISOString().split('T')[0]
    })

    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      appointments: dayAppointments,
    })
  }

  return days
})

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const selectDate = (date) => {
  selectedDate.value = date
  // 可以在这里添加选择日期后的逻辑
}

// 变量已在前面声明

const handleDateSelected = (date) => {
  selectedDate.value = date
  // 可以在这里添加选择日期后的逻辑，比如显示该日期的预约详情
  console.log('选择的日期:', date)
}

// 计算属性
const calendarAppointments = computed(() => {
  return appointments.value.map((apt) => ({
    ...apt,
    title: `${apt.patientName} - ${apt.doctor}`,
    start: apt.start,
    end: apt.end,
  }))
})

const filteredAppointments = computed(() => {
  let filtered = appointments.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (apt) =>
        apt.patientName?.toLowerCase().includes(search) ||
        apt.doctor?.toLowerCase().includes(search) ||
        apt.notes?.toLowerCase().includes(search),
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((apt) => apt.status === statusFilter.value)
  }

  return filtered
})

// 状态相关方法
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    pending: 'bg-warning',
    confirmed: 'bg-success',
    cancelled: 'bg-danger',
    completed: 'bg-secondary',
    upcoming: 'bg-primary',
    today: 'bg-info',
  }
  return statusClasses[status] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const statusLabels = {
    pending: texts.value.pending,
    confirmed: texts.value.confirmed,
    cancelled: texts.value.cancelled,
    completed: texts.value.completed,
    upcoming: texts.value.upcoming,
    today: texts.value.today,
  }
  return statusLabels[status] || status
}

// keep-alive 返回时重新激活由 onActivated 处理；此处不再重复挂载加载
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.appointment-form-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.appointment-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.appointment-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appointment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.appointment-body {
  padding: 1.5rem;
}

.provider-name {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.detail-item i {
  width: 20px;
}

.appointment-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.no-appointments {
  padding: 3rem;
  color: #6c757d;
}

.no-appointments i {
  font-size: 4rem;
}

/* 日历视图样式 */
.calendar-view {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar-container {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-month {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 200px;
  text-align: center;
}

.calendar-grid {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 10px;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
}

.calendar-day {
  min-height: 100px;
  background-color: white;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 4px;
}

.calendar-day:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #adb5bd;
}

.calendar-day.today {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.has-appointments {
  background-color: #fff3e0;
}

.day-number {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}

.day-appointments {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.appointment-dot {
  width: 100%;
  height: 18px;
  border-radius: 9px;
  font-size: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 4px;
}

.more-appointments {
  font-size: 10px;
  color: #6c757d;
  text-align: center;
  margin-top: 2px;
}

/* 视图切换样式 */
.view-toggle .btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle .btn {
  border-radius: 0;
  padding: 8px 16px;
}

.view-toggle .btn:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.view-toggle .btn:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .appointment-form-card {
    padding: 1rem;
  }

  .appointment-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .appointment-actions {
    flex-direction: column;
  }

  .appointment-actions .btn {
    width: 100%;
  }

  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }

  .calendar-header {
    flex-direction: column;
    gap: 10px;
  }

  .current-month {
    min-width: auto;
  }

  .view-toggle .btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .calendar-day {
    min-height: 60px;
    padding: 2px;
  }

  .day-number {
    font-size: 0.8rem;
  }

  .appointment-dot {
    height: 14px;
    font-size: 8px;
  }
}
</style>
