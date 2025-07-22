<template>
  <div class="appointment-manager">
    <div class="container mt-4">
      <!-- Header Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              <i class="fas fa-calendar-alt me-3"></i>
              预约管理中心
            </h1>
            <p class="lead text-muted">管理您的医疗预约，健康检查和疫苗接种安排</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-5">
        <div class="col-md-4 mb-3">
          <div class="action-card" @click="showCreateAppointment = true">
            <div class="action-icon">
              <i class="fas fa-plus text-primary"></i>
            </div>
            <h5>预约新服务</h5>
            <p>安排医疗检查、疫苗接种等服务</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="action-card" @click="viewMode = 'upcoming'">
            <div class="action-icon">
              <i class="fas fa-clock text-warning"></i>
            </div>
            <h5>即将到来</h5>
            <p>查看即将进行的预约安排</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="action-card" @click="viewMode = 'history'">
            <div class="action-icon">
              <i class="fas fa-history text-info"></i>
            </div>
            <h5>历史记录</h5>
            <p>查看过往的预约和检查记录</p>
          </div>
        </div>
      </div>

      <!-- Create Appointment Modal -->
      <div class="row mb-5" v-if="showCreateAppointment">
        <div class="col-12">
          <div class="appointment-form-card">
            <h4 class="mb-4">
              <i class="fas fa-calendar-plus me-2"></i>
              创建新预约
            </h4>
            <form @submit.prevent="createAppointment">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentType" class="form-label">预约类型</label>
                  <select
                    class="form-select"
                    id="appointmentType"
                    v-model="newAppointment.type"
                    required
                  >
                    <option value="">请选择服务类型</option>
                    <option value="general">全科医生</option>
                    <option value="specialist">专科医生</option>
                    <option value="vaccine">疫苗接种</option>
                    <option value="medical-exam">移民体检</option>
                    <option value="dental">牙科检查</option>
                    <option value="eye">眼科检查</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="provider" class="form-label">医疗机构</label>
                  <select
                    class="form-select"
                    id="provider"
                    v-model="newAppointment.provider"
                    required
                  >
                    <option value="">请选择医疗机构</option>
                    <option value="royal-melbourne">墨尔本皇家医院</option>
                    <option value="family-clinic">家庭医疗中心</option>
                    <option value="city-medical">市中心医疗诊所</option>
                    <option value="vaccination-hub">疫苗接种中心</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentDate" class="form-label">预约日期</label>
                  <input
                    type="date"
                    class="form-control"
                    id="appointmentDate"
                    v-model="newAppointment.date"
                    :min="today"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="appointmentTime" class="form-label">预约时间</label>
                  <select
                    class="form-select"
                    id="appointmentTime"
                    v-model="newAppointment.time"
                    required
                  >
                    <option value="">请选择时间</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label for="notes" class="form-label">备注信息</label>
                <textarea
                  class="form-control"
                  id="notes"
                  rows="3"
                  v-model="newAppointment.notes"
                  placeholder="请描述您的症状或需求..."
                ></textarea>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-check me-1"></i>
                  确认预约
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showCreateAppointment = false"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="view-toggle">
            <button
              class="btn"
              :class="{
                'btn-primary': viewMode === 'upcoming',
                'btn-outline-primary': viewMode !== 'upcoming',
              }"
              @click="viewMode = 'upcoming'"
            >
              <i class="fas fa-clock me-1"></i>
              即将到来 ({{ upcomingAppointments.length }})
            </button>
            <button
              class="btn"
              :class="{
                'btn-primary': viewMode === 'history',
                'btn-outline-primary': viewMode !== 'history',
              }"
              @click="viewMode = 'history'"
            >
              <i class="fas fa-history me-1"></i>
              历史记录 ({{ historyAppointments.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Appointments List -->
      <div class="row">
        <div class="col-12">
          <div class="appointments-list">
            <div
              class="appointment-card"
              v-for="appointment in displayedAppointments"
              :key="appointment.id"
            >
              <div class="appointment-header">
                <div class="appointment-type">
                  <i class="fas" :class="getTypeIcon(appointment.type)"></i>
                  <span>{{ getTypeLabel(appointment.type) }}</span>
                </div>
                <span class="badge" :class="getStatusBadgeClass(appointment.status)">
                  {{ getStatusLabel(appointment.status) }}
                </span>
              </div>
              <div class="appointment-body">
                <div class="appointment-info">
                  <h5 class="provider-name">{{ getProviderName(appointment.provider) }}</h5>
                  <div class="appointment-details">
                    <div class="detail-item">
                      <i class="fas fa-calendar text-primary me-2"></i>
                      <span>{{ formatDate(appointment.date) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-clock text-warning me-2"></i>
                      <span>{{ appointment.time }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-map-marker-alt text-info me-2"></i>
                      <span>{{ appointment.address }}</span>
                    </div>
                    <div class="detail-item" v-if="appointment.notes">
                      <i class="fas fa-sticky-note text-secondary me-2"></i>
                      <span>{{ appointment.notes }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="appointment-actions" v-if="appointment.status === 'confirmed'">
                <button class="btn btn-sm btn-outline-primary me-2">
                  <i class="fas fa-edit me-1"></i>
                  修改
                </button>
                <button
                  class="btn btn-sm btn-outline-danger me-2"
                  @click="cancelAppointment(appointment.id)"
                >
                  <i class="fas fa-times me-1"></i>
                  取消
                </button>
                <button class="btn btn-sm btn-outline-info">
                  <i class="fas fa-directions me-1"></i>
                  导航
                </button>
              </div>
            </div>
          </div>

          <!-- No appointments message -->
          <div v-if="displayedAppointments.length === 0" class="no-appointments text-center">
            <i class="fas fa-calendar-times text-muted mb-3"></i>
            <h4>暂无预约记录</h4>
            <p class="text-muted">点击"预约新服务"开始安排您的医疗服务</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showCreateAppointment = ref(false)
const viewMode = ref('upcoming')

const today = new Date().toISOString().split('T')[0]

const newAppointment = ref({
  type: '',
  provider: '',
  date: '',
  time: '',
  notes: '',
})

// Sample appointments data
const appointments = ref([
  {
    id: 1,
    type: 'general',
    provider: 'family-clinic',
    date: '2024-01-20',
    time: '10:00',
    status: 'confirmed',
    address: '123 Collins Street, Melbourne',
    notes: '年度健康检查',
  },
  {
    id: 2,
    type: 'vaccine',
    provider: 'vaccination-hub',
    date: '2024-01-25',
    time: '14:00',
    status: 'confirmed',
    address: '456 Burke Street, Melbourne',
    notes: '流感疫苗',
  },
  {
    id: 3,
    type: 'medical-exam',
    provider: 'royal-melbourne',
    date: '2024-01-10',
    time: '09:00',
    status: 'completed',
    address: '300 Grattan Street, Parkville',
    notes: '移民体检',
  },
])

const upcomingAppointments = computed(() => {
  const today = new Date()
  return appointments.value.filter((apt) => {
    const aptDate = new Date(apt.date)
    return aptDate >= today && apt.status === 'confirmed'
  })
})

const historyAppointments = computed(() => {
  const today = new Date()
  return appointments.value.filter((apt) => {
    const aptDate = new Date(apt.date)
    return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled'
  })
})

const displayedAppointments = computed(() => {
  return viewMode.value === 'upcoming' ? upcomingAppointments.value : historyAppointments.value
})

const createAppointment = () => {
  if (
    newAppointment.value.type &&
    newAppointment.value.provider &&
    newAppointment.value.date &&
    newAppointment.value.time
  ) {
    const appointment = {
      id: appointments.value.length + 1,
      ...newAppointment.value,
      status: 'confirmed',
      address: getProviderAddress(newAppointment.value.provider),
    }

    appointments.value.push(appointment)

    // Reset form
    newAppointment.value = {
      type: '',
      provider: '',
      date: '',
      time: '',
      notes: '',
    }
    showCreateAppointment.value = false
  }
}

const cancelAppointment = (id) => {
  const appointment = appointments.value.find((apt) => apt.id === id)
  if (appointment) {
    appointment.status = 'cancelled'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
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
