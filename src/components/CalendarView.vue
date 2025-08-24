<template>
  <div class="calendar-view">
    <div class="calendar-header mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <h4>{{ texts.calendarTitle }}</h4>
        <div class="calendar-controls">
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: currentView === 'dayGridMonth' }"
              @click="changeView('dayGridMonth')"
            >
              {{ texts.monthView }}
            </button>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: currentView === 'timeGridWeek' }"
              @click="changeView('timeGridWeek')"
            >
              {{ texts.weekView }}
            </button>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: currentView === 'timeGridDay' }"
              @click="changeView('timeGridDay')"
            >
              {{ texts.dayView }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>

    <!-- 新建预约模态框 -->
    <div
      class="modal fade"
      id="appointmentModal"
      tabindex="-1"
      aria-labelledby="appointmentModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="appointmentModalLabel">
              {{ isEditing ? texts.editAppointment : texts.newAppointment }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAppointment">
              <div class="mb-3">
                <label for="appointmentTitle" class="form-label">{{ texts.title }}</label>
                <input
                  type="text"
                  class="form-control"
                  id="appointmentTitle"
                  v-model="appointmentForm.title"
                  required
                />
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="appointmentDate" class="form-label">{{ texts.date }}</label>
                    <input
                      type="date"
                      class="form-control"
                      id="appointmentDate"
                      v-model="appointmentForm.date"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="appointmentTime" class="form-label">{{ texts.time }}</label>
                    <input
                      type="time"
                      class="form-control"
                      id="appointmentTime"
                      v-model="appointmentForm.time"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="appointmentDuration" class="form-label">{{ texts.duration }}</label>
                <select
                  class="form-select"
                  id="appointmentDuration"
                  v-model="appointmentForm.duration"
                >
                  <option value="30">30 {{ texts.minutes }}</option>
                  <option value="60">1 {{ texts.hour }}</option>
                  <option value="90">1.5 {{ texts.hours }}</option>
                  <option value="120">2 {{ texts.hours }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="appointmentClinician" class="form-label">{{ texts.clinician }}</label>
                <select
                  class="form-select"
                  id="appointmentClinician"
                  v-model="appointmentForm.clinicianId"
                  required
                >
                  <option value="">{{ texts.selectClinician }}</option>
                  <option v-for="clinician in clinicians" :key="clinician.id" :value="clinician.id">
                    {{ clinician.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="appointmentNotes" class="form-label">{{ texts.notes }}</label>
                <textarea
                  class="form-control"
                  id="appointmentNotes"
                  rows="3"
                  v-model="appointmentForm.notes"
                  :placeholder="texts.notesPlaceholder"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ texts.cancel }}
            </button>
            <button
              type="button"
              class="btn btn-danger"
              v-if="isEditing"
              @click="deleteAppointment"
            >
              {{ texts.delete }}
            </button>
            <button type="button" class="btn btn-primary" @click="saveAppointment">
              {{ isEditing ? texts.update : texts.create }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 冲突提示模态框 -->
    <div
      class="modal fade"
      id="conflictModal"
      tabindex="-1"
      aria-labelledby="conflictModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="conflictModalLabel">
              {{ texts.conflictDetected }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ texts.conflictMessage }}
            </div>

            <div v-if="suggestedSlots.length > 0">
              <h6>{{ texts.suggestedTimes }}</h6>
              <div class="list-group">
                <button
                  v-for="slot in suggestedSlots"
                  :key="slot.start"
                  type="button"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  @click="selectSuggestedSlot(slot)"
                >
                  <span>{{ formatSlotTime(slot) }}</span>
                  <small class="text-muted">评分: {{ slot.score }}</small>
                </button>
              </div>
            </div>
            <div v-else class="mt-3">
              <p class="text-muted">{{ texts.noAlternativeSlots }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ texts.cancel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
// 移除对 AppointmentAPI 的直接依赖
import { AppointmentConstraints } from '../models/appointmentModels'
import {
  validateAppointment,
  checkConflicts,
  suggestAlternatives,
} from '../utils/appointmentConstraints'
import dayjs from 'dayjs'
import { Modal } from 'bootstrap'

// Props
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
  appointments: {
    type: Array,
    default: () => [],
  },
  clinicians: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits([
  'appointment-created',
  'appointment-updated',
  'appointment-deleted',
  'date-selected',
])

// Reactive data
const fullCalendar = ref(null)
const currentView = ref('timeGridWeek')
const isEditing = ref(false)
const appointmentModal = ref(null)
const conflictModal = ref(null)
const suggestedSlots = ref([])

const appointmentForm = ref({
  id: null,
  title: '',
  date: '',
  time: '',
  duration: 60,
  clinicianId: '',
  notes: '',
})

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: currentView.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: '',
  },
  locale: props.lang === 'zh' ? 'zh-cn' : 'en',
  height: 'auto',
  selectable: true,
  selectMirror: true,
  editable: true,
  dayMaxEvents: true,
  weekends: true,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '09:00',
    endTime: '17:00',
  },
  slotMinTime: '08:00',
  slotMaxTime: '18:00',
  slotDuration: '00:30',
  events: calendarEvents,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
}))

// Computed properties
const calendarEvents = computed(() => {
  return props.appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title || `${appointment.doctor} - ${appointment.type}`,
    start: `${appointment.date}T${appointment.time}`,
    end: dayjs(`${appointment.date}T${appointment.time}`)
      .add(appointment.duration || 60, 'minute')
      .format('YYYY-MM-DDTHH:mm'),
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    extendedProps: {
      appointment: appointment,
    },
  }))
})

const texts = computed(() => {
  const translations = {
    zh: {
      calendarTitle: '预约日历',
      monthView: '月视图',
      weekView: '周视图',
      dayView: '日视图',
      newAppointment: '新建预约',
      editAppointment: '编辑预约',
      title: '预约标题',
      date: '日期',
      time: '时间',
      duration: '时长',
      minutes: '分钟',
      hour: '小时',
      hours: '小时',
      clinician: '医生',
      selectClinician: '选择医生',
      notes: '备注',
      notesPlaceholder: '请输入预约备注...',
      cancel: '取消',
      delete: '删除',
      create: '创建',
      update: '更新',
      conflictDetected: '检测到时间冲突',
      conflictMessage: '所选时间段与现有预约冲突，请选择其他时间或查看建议时间。',
      suggestedTimes: '建议时间段',
      noAlternativeSlots: '暂无可用的替代时段',
      pastDateError: '不能在过去的日期创建预约',
      confirmDelete: '确定要取消这个预约吗？',
      deleteSuccess: '预约已取消，通知邮件已发送',
      createSuccess: '预约创建成功！确认邮件已发送',
      updateSuccess: '预约更新成功！通知邮件已发送',
      rescheduleSuccess: '预约改期成功！通知邮件已发送',
    },
    en: {
      calendarTitle: 'Appointment Calendar',
      monthView: 'Month',
      weekView: 'Week',
      dayView: 'Day',
      newAppointment: 'New Appointment',
      editAppointment: 'Edit Appointment',
      title: 'Title',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      clinician: 'Clinician',
      selectClinician: 'Select Clinician',
      notes: 'Notes',
      notesPlaceholder: 'Enter appointment notes...',
      cancel: 'Cancel',
      delete: 'Delete',
      create: 'Create',
      update: 'Update',
      conflictDetected: 'Conflict Detected',
      conflictMessage:
        'The selected time conflicts with existing appointments. Please choose another time or check suggested times.',
      suggestedTimes: 'Suggested Times',
      noAlternativeSlots: 'No alternative slots available',
      pastDateError: 'Cannot create appointments in the past',
      confirmDelete: 'Are you sure you want to delete this appointment?',
      deleteSuccess: 'Appointment deleted, notification email sent',
      createSuccess: 'Appointment created successfully! Confirmation email sent',
      updateSuccess: 'Appointment updated successfully! Notification email sent',
      rescheduleSuccess: 'Appointment rescheduled successfully! Notification email sent',
    },
  }
  return translations[props.lang] || translations.zh
})

// Methods
const changeView = (view) => {
  currentView.value = view
  if (fullCalendar.value) {
    fullCalendar.value.getApi().changeView(view)
  }
}

const handleDateSelect = async (selectInfo) => {
  const clickedDate = dayjs(selectInfo.start)
  const now = dayjs()

  // 检查是否点击的是过去的日期
  if (clickedDate.isBefore(now, 'day')) {
    alert(texts.value.pastDateError || 'Cannot create appointments in the past')
    return
  }

  resetAppointmentForm()
  appointmentForm.value.date = selectInfo.startStr.split('T')[0]
  appointmentForm.value.time = selectInfo.startStr.split('T')[1]?.substring(0, 5) || '09:00'
  isEditing.value = false

  // 清空之前的建议时段
  suggestedSlots.value = []

  appointmentModal.value.show()
}

const handleEventClick = (clickInfo) => {
  const appointment = clickInfo.event.extendedProps.appointment
  appointmentForm.value = {
    id: appointment.id,
    title: appointment.title || `${appointment.doctor} - ${appointment.type}`,
    date: appointment.date,
    time: appointment.time,
    duration: appointment.duration || 60,
    clinicianId: appointment.clinicianId || '',
    notes: appointment.notes || '',
  }
  isEditing.value = true
  appointmentModal.value.show()
}

const handleEventDrop = async (dropInfo) => {
  const appointment = dropInfo.event.extendedProps.appointment
  const newStart = dayjs(dropInfo.event.start)

  const updatedAppointment = {
    ...appointment,
    date: newStart.format('YYYY-MM-DD'),
    time: newStart.format('HH:mm'),
    start: dropInfo.event.start.toISOString(),
    end: dropInfo.event.end.toISOString(),
    userId: appointment.userId,
    clinicianId: appointment.clinicianId,
  }

  try {
    // 获取医生信息
    const clinician = props.clinicians.find((c) => c.id === updatedAppointment.clinicianId)
    if (!clinician) {
      dropInfo.revert()
      alert('无法找到医生信息')
      return
    }

    // 验证改期约束
    const originalAppointment = props.appointments.find((apt) => apt.id === dropInfo.event.id)
    const rescheduleErrors = AppointmentConstraints.validateReschedule(
      originalAppointment,
      updatedAppointment,
    )

    if (rescheduleErrors.length > 0) {
      dropInfo.revert()
      alert(`改期失败：\n${rescheduleErrors.join('\n')}`)
      return
    }

    // 检查拖拽后的时间冲突
    const conflicts = checkConflicts(updatedAppointment, props.appointments, dropInfo.event.id)
    if (conflicts.length > 0) {
      dropInfo.revert() // 恢复到原位置

      // 生成建议时段
      const suggestions = suggestAlternatives(updatedAppointment, clinician, props.appointments, 5)

      suggestedSlots.value = suggestions
      showConflictModal(updatedAppointment)
      return
    }

    // 通过事件交由父组件处理更新逻辑（包括调用 API 与鉴权）
    emit('appointment-updated', {
      id: dropInfo.event.id,
      start: updatedAppointment.start,
      end: updatedAppointment.end,
    })
  } catch (error) {
    console.error('拖拽更新预约时发生错误:', error)
    dropInfo.revert()
    alert('改期时发生错误，请稍后重试')
  }
}

const handleEventResize = async (resizeInfo) => {
  const appointment = resizeInfo.event.extendedProps.appointment
  const duration = dayjs(resizeInfo.event.end).diff(dayjs(resizeInfo.event.start), 'minute')

  const updatedAppointment = {
    ...appointment,
    duration: duration,
  }

  emit('appointment-updated', updatedAppointment)
}

const saveAppointment = async () => {
  const appointmentData = {
    ...appointmentForm.value,
    start: `${appointmentForm.value.date}T${appointmentForm.value.time}`,
    end: dayjs(`${appointmentForm.value.date}T${appointmentForm.value.time}`)
      .add(appointmentForm.value.duration, 'minute')
      .format('YYYY-MM-DDTHH:mm'),
  }

  try {
    // 获取选中的医生信息
    const selectedClinician = props.clinicians.find(
      (c) => c.id === appointmentForm.value.clinicianId,
    )
    if (!selectedClinician) {
      alert('请选择有效的医生')
      return
    }

    // 进行约束校验
    const validationErrors = validateAppointment(
      appointmentData,
      selectedClinician,
      props.appointments,
    )

    if (validationErrors.length > 0) {
      alert(`预约验证失败：\n${validationErrors.join('\n')}`)
      return
    }

    // 检查时间冲突
    const conflicts = checkConflicts(appointmentData, props.appointments)
    if (conflicts.length > 0) {
      // 生成建议时段
      const suggestions = suggestAlternatives(
        appointmentData,
        selectedClinician,
        props.appointments,
        5,
      )

      suggestedSlots.value = suggestions
      showConflictModal(appointmentData)
      return
    }

    if (isEditing.value) {
      // 交由父组件处理更新逻辑
      emit('appointment-updated', appointmentData)
    } else {
      // 交由父组件处理创建逻辑
      emit('appointment-created', appointmentData)
    }

    appointmentModal.value.hide()
    resetAppointmentForm()
  } catch (error) {
    console.error('保存预约时发生错误:', error)
    alert('保存预约时发生错误，请稍后重试')
  }
}

const deleteAppointment = () => {
  if (confirm(texts.value.confirmDelete || 'Are you sure you want to delete this appointment?')) {
    emit('appointment-deleted', appointmentForm.value.id)
    appointmentModal.value.hide()
    resetAppointmentForm()
  }
}

// checkConflicts function is imported from utils/appointmentConstraints

const showConflictModal = (appointment) => {
  // 生成建议时间段
  suggestedSlots.value = generateSuggestedSlots(appointment)
  conflictModal.value.show()
}

const generateSuggestedSlots = (appointment) => {
  const slots = []
  const duration = appointment.duration || 60
  const date = dayjs(appointment.date)

  // 生成当天的建议时间段
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const start = date.hour(hour).minute(minute)
      const end = start.add(duration, 'minute')

      if (end.hour() <= 17 && !hasConflict(start, end)) {
        slots.push({
          start: start.format('YYYY-MM-DDTHH:mm'),
          end: end.format('YYYY-MM-DDTHH:mm'),
        })

        if (slots.length >= 5) break
      }
    }
    if (slots.length >= 5) break
  }

  return slots
}

const hasConflict = (start, end) => {
  return props.appointments.some((existing) => {
    const existingStart = dayjs(`${existing.date}T${existing.time}`)
    const existingEnd = existingStart.add(existing.duration || 60, 'minute')

    return start.isBefore(existingEnd) && end.isAfter(existingStart)
  })
}

const resetNewAppointmentForm = () => {
  appointmentForm.value = {
    id: null,
    title: '',
    date: '',
    time: '',
    duration: 60,
    clinicianId: '',
    notes: '',
  }
  suggestedSlots.value = []
}

const selectSuggestedSlot = (slot) => {
  const start = dayjs(slot.start)
  appointmentForm.value.date = start.format('YYYY-MM-DD')
  appointmentForm.value.time = start.format('HH:mm')
  appointmentForm.value.duration = dayjs(slot.end).diff(dayjs(slot.start), 'minute')
  conflictModal.value.hide()
  appointmentModal.value.show()
}

const formatSlotTime = (slot) => {
  const start = dayjs(slot.start)
  const end = dayjs(slot.end)
  return `${start.format('HH:mm')} - ${end.format('HH:mm')}`
}

const getEventColor = (status) => {
  const colors = {
    confirmed: '#28a745',
    pending: '#ffc107',
    cancelled: '#dc3545',
    completed: '#6c757d',
  }
  return colors[status] || '#007bff'
}

const resetAppointmentForm = () => {
  appointmentForm.value = {
    id: null,
    title: '',
    date: '',
    time: '',
    duration: 60,
    clinicianId: '',
    notes: '',
  }
}

// Lifecycle
onMounted(() => {
  appointmentModal.value = new Modal(document.getElementById('appointmentModal'))
  conflictModal.value = new Modal(document.getElementById('conflictModal'))
})

// Watch for view changes
watch(currentView, (newView) => {
  if (fullCalendar.value) {
    fullCalendar.value.getApi().changeView(newView)
  }
})
</script>

<style scoped>
.calendar-view {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.calendar-container {
  margin-top: 1rem;
}

.btn-group .btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

/* FullCalendar 样式覆盖 */
:deep(.fc-toolbar) {
  margin-bottom: 1rem;
}

:deep(.fc-button) {
  background-color: #007bff;
  border-color: #007bff;
}

:deep(.fc-button:hover) {
  background-color: #0056b3;
  border-color: #0056b3;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
}

:deep(.fc-daygrid-event) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.fc-timegrid-event) {
  border-radius: 4px;
}

:deep(.fc-select-helper) {
  background-color: rgba(0, 123, 255, 0.2);
  border: 1px solid #007bff;
}
</style>
