<template>
  <div class="appointment-manager">
    <div class="container mt-4">
      <!-- 页面标题 -->
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

      <!-- 快速统计 -->
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

      <!-- 预约操作区 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="appointment-actions">
            <button class="btn btn-primary me-2" @click="showNewAppointmentForm = true">
              {{ texts.newAppointment }}
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

      <!-- 新预约表单 -->
      <div class="row mb-4" v-if="showNewAppointmentForm">
        <div class="col-12">
          <div class="appointment-form">
            <h5>{{ texts.scheduleNewAppointment }}</h5>
            <form @submit.prevent="submitAppointment">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ texts.doctorName }}</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newAppointment.doctor"
                      required
                    />
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

      <!-- 预约列表 -->
      <div class="row">
        <div class="col-12">
          <div class="appointments-list">
            <!-- 即将到来的预约 -->
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

            <!-- 今日预约 -->
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
                <!-- Similar structure as upcoming appointments -->
              </div>
            </div>

            <!-- 已完成预约 -->
            <div v-else-if="activeTab === 'completed'">
              <h5 class="mb-3">{{ texts.completedAppointments }}</h5>
              <div
                v-for="appointment in completedAppointments"
                :key="appointment.id"
                class="appointment-card mb-3"
              >
                <!-- Similar structure with completed status -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 状态数据
const showNewAppointmentForm = ref(false)
const activeTab = ref('upcoming')
const today = new Date().toISOString().split('T')[0]

const newAppointment = ref({
  doctor: '',
  type: '',
  date: '',
  time: '',
  location: '',
  notes: '',
})

// 预约数据
const appointments = ref([
  {
    id: 1,
    doctor: 'Dr. Smith',
    type: 'checkup',
    date: '2024-02-15',
    time: '10:00',
    location: '墨尔本皇家医院',
    notes: '常规体检',
    status: 'confirmed',
  },
  {
    id: 2,
    doctor: 'Dr. Johnson',
    type: 'consultation',
    date: '2024-02-20',
    time: '14:30',
    location: '家庭医疗中心',
    notes: '咨询健康问题',
    status: 'confirmed',
  },
])

// 计算属性
const upcomingAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((apt) => new Date(apt.date) >= now && apt.status === 'confirmed')
})

const todayAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value.filter((apt) => apt.date === today)
})

const completedAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((apt) => new Date(apt.date) < now || apt.status === 'completed')
})

// 多语言文本
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
    },
  }
  return translations['zh'] // 暂时固定为中文，您可以添加lang prop支持
})

// 功能函数
const submitAppointment = () => {
  if (
    newAppointment.value.doctor &&
    newAppointment.value.type &&
    newAppointment.value.date &&
    newAppointment.value.time
  ) {
    const appointment = {
      id: appointments.value.length + 1,
      ...newAppointment.value,
      status: 'confirmed',
    }
    appointments.value.push(appointment)
    cancelNewAppointment()
    alert('预约创建成功！')
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

const cancelAppointment = (appointmentId) => {
  const index = appointments.value.findIndex((apt) => apt.id === appointmentId)
  if (index !== -1) {
    appointments.value[index].status = 'cancelled'
    alert('预约已取消')
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

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed: 'bg-success',
    pending: 'bg-warning',
    completed: 'bg-info',
    cancelled: 'bg-danger',
  }
  return classes[status] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    confirmed: '已确认',
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labels[status] || status
}
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
  justify-content: between;
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
}
</style>
