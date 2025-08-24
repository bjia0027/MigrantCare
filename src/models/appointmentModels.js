/**
 * 预约系统数据模型定义
 * 定义 Firestore 集合结构和数据验证规则
 */

import { Timestamp } from 'firebase/firestore'
import { AppointmentConstraintValidator, APPOINTMENT_CONSTRAINTS } from '../utils/appointmentConstraints'

/**
 * 预约数据模型
 * Firestore 集合: appointments
 */
export const AppointmentModel = {
  // 字段定义
  fields: {
    id: 'string',           // 预约ID (自动生成)
    userId: 'string',       // 用户ID (必填)
    clinicianId: 'string',  // 医生ID (必填)
    start: 'timestamp',     // 开始时间 (必填)
    end: 'timestamp',       // 结束时间 (必填)
    status: 'string',       // 状态: 'pending', 'confirmed', 'cancelled', 'completed'
    notes: 'string',        // 备注 (可选)
    createdAt: 'timestamp', // 创建时间
    updatedAt: 'timestamp', // 更新时间
    source: 'string',       // 来源: 'web', 'mobile', 'admin'
    title: 'string',        // 预约标题 (可选)
    type: 'string',         // 预约类型: 'checkup', 'consultation', 'followup', 'specialist'
    duration: 'number',     // 时长(分钟)
    rescheduleCount: 'number', // 改期次数
    cancelledAt: 'timestamp',  // 取消时间 (可选)
    completedAt: 'timestamp'   // 完成时间 (可选)
  },

  // 默认值
  defaults: {
    status: 'pending',
    source: 'web',
    duration: 60,
    rescheduleCount: 0,
    notes: '',
    title: ''
  },

  // 状态枚举
  statuses: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed', 
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },

  // 预约类型枚举
  types: {
    CHECKUP: 'checkup',
    CONSULTATION: 'consultation',
    FOLLOWUP: 'followup',
    SPECIALIST: 'specialist'
  },

  // 来源枚举
  sources: {
    WEB: 'web',
    MOBILE: 'mobile',
    ADMIN: 'admin'
  },

  // 验证规则
  validate: (appointment) => {
    const errors = []
    
    if (!appointment.userId) {
      errors.push('用户ID不能为空')
    }
    
    if (!appointment.clinicianId) {
      errors.push('医生ID不能为空')
    }
    
    if (!appointment.start) {
      errors.push('开始时间不能为空')
    }
    
    if (!appointment.end) {
      errors.push('结束时间不能为空')
    }
    
    if (appointment.start && appointment.end && appointment.start >= appointment.end) {
      errors.push('结束时间必须晚于开始时间')
    }
    
    if (appointment.duration && (appointment.duration < 15 || appointment.duration > 480)) {
      errors.push('预约时长必须在15分钟到8小时之间')
    }
    
    if (appointment.status && !Object.values(AppointmentModel.statuses).includes(appointment.status)) {
      errors.push('无效的预约状态')
    }
    
    return errors
  },

  // 创建新预约对象
  create: (data) => {
    const now = Timestamp.now()

    // 标准化任意输入为 Firestore Timestamp（已是 Timestamp 时直接返回）
    const normalizeToTimestamp = (v) => {
      if (!v) return v
      if (typeof v?.toDate === 'function') return v // Firestore Timestamp
      if (v instanceof Date) return Timestamp.fromDate(v)
      const parsed = new Date(v)
      return isNaN(parsed.getTime()) ? v : Timestamp.fromDate(parsed)
    }

    return {
      ...AppointmentModel.defaults,
      ...data,
      start: normalizeToTimestamp(data.start),
      end: normalizeToTimestamp(data.end),
      createdAt: now,
      updatedAt: now
    }
  }
}

/**
 * 医生/临床医师数据模型
 * Firestore 集合: clinicians
 */
export const ClinicianModel = {
  // 字段定义
  fields: {
    id: 'string',           // 医生ID
    name: 'string',         // 姓名 (必填)
    email: 'string',        // 邮箱 (必填)
    phone: 'string',        // 电话 (可选)
    timezone: 'string',     // 时区 (必填)
    businessHours: 'object', // 工作时间
    slotMins: 'number',     // 时间段长度(分钟)
    specialties: 'array',   // 专业领域
    isActive: 'boolean',    // 是否激活
    createdAt: 'timestamp', // 创建时间
    updatedAt: 'timestamp', // 更新时间
    bufferTime: 'number',   // 缓冲时间(分钟)
    maxReschedules: 'number', // 最大改期次数
    minAdvanceBooking: 'number', // 最少提前预约时间(小时)
    maxAdvanceBooking: 'number'  // 最多提前预约时间(天)
  },

  // 默认值
  defaults: {
    timezone: 'Australia/Melbourne',
    slotMins: 30,
    isActive: true,
    specialties: [],
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
      sunday: { start: '09:00', end: '13:00', enabled: false }
    }
  },

  // 验证规则
  validate: (clinician) => {
    const errors = []
    
    if (!clinician.name || clinician.name.trim().length < 2) {
      errors.push('医生姓名至少需要2个字符')
    }
    
    if (!clinician.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clinician.email)) {
      errors.push('请提供有效的邮箱地址')
    }
    
    if (!clinician.timezone) {
      errors.push('时区不能为空')
    }
    
    if (clinician.slotMins && (clinician.slotMins < 15 || clinician.slotMins > 120)) {
      errors.push('时间段长度必须在15-120分钟之间')
    }
    
    return errors
  },

  // 创建新医生对象
  create: (data) => {
    const now = Timestamp.now()
    return {
      ...ClinicianModel.defaults,
      ...data,
      createdAt: now,
      updatedAt: now
    }
  }
}

/**
 * 黑名单日期数据模型
 * Firestore 集合: blackouts
 */
export const BlackoutModel = {
  // 字段定义
  fields: {
    id: 'string',           // 黑名单ID
    startDate: 'timestamp', // 开始日期 (必填)
    endDate: 'timestamp',   // 结束日期 (必填)
    reason: 'string',       // 原因 (必填)
    type: 'string',         // 类型: 'holiday', 'maintenance', 'emergency', 'personal'
    clinicianId: 'string',  // 医生ID (可选，为空表示全局)
    isRecurring: 'boolean', // 是否重复
    recurringPattern: 'object', // 重复模式
    createdAt: 'timestamp', // 创建时间
    updatedAt: 'timestamp', // 更新时间
    createdBy: 'string'     // 创建者ID
  },

  // 默认值
  defaults: {
    type: 'holiday',
    isRecurring: false,
    recurringPattern: null
  },

  // 类型枚举
  types: {
    HOLIDAY: 'holiday',
    MAINTENANCE: 'maintenance',
    EMERGENCY: 'emergency',
    PERSONAL: 'personal'
  },

  // 验证规则
  validate: (blackout) => {
    const errors = []
    
    if (!blackout.startDate) {
      errors.push('开始日期不能为空')
    }
    
    if (!blackout.endDate) {
      errors.push('结束日期不能为空')
    }
    
    if (blackout.startDate && blackout.endDate && blackout.startDate >= blackout.endDate) {
      errors.push('结束日期必须晚于开始日期')
    }
    
    if (!blackout.reason || blackout.reason.trim().length < 2) {
      errors.push('原因至少需要2个字符')
    }
    
    if (blackout.type && !Object.values(BlackoutModel.types).includes(blackout.type)) {
      errors.push('无效的黑名单类型')
    }
    
    return errors
  },

  // 创建新黑名单对象
  create: (data) => {
    const now = Timestamp.now()
    return {
      ...BlackoutModel.defaults,
      ...data,
      createdAt: now,
      updatedAt: now
    }
  }
}

/**
 * 审计日志数据模型
 * Firestore 集合: audit_logs
 */
export const AuditLogModel = {
  // 字段定义
  fields: {
    id: 'string',           // 日志ID
    action: 'string',       // 操作: 'create', 'update', 'delete', 'reschedule', 'cancel'
    entityType: 'string',   // 实体类型: 'appointment', 'clinician', 'blackout'
    entityId: 'string',     // 实体ID
    userId: 'string',       // 操作用户ID
    timestamp: 'timestamp', // 操作时间
    details: 'object',      // 详细信息
    ipAddress: 'string',    // IP地址
    userAgent: 'string',    // 用户代理
    changes: 'object'       // 变更内容 (before/after)
  },

  // 操作类型枚举
  actions: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    RESCHEDULE: 'reschedule',
    CANCEL: 'cancel',
    CONFIRM: 'confirm',
    COMPLETE: 'complete'
  },

  // 实体类型枚举
  entityTypes: {
    APPOINTMENT: 'appointment',
    CLINICIAN: 'clinician',
    BLACKOUT: 'blackout',
    USER: 'user'
  },

  // 创建审计日志
  create: (action, entityType, entityId, userId, details = {}, changes = null) => {
    return {
      action,
      entityType,
      entityId,
      userId,
      timestamp: Timestamp.now(),
      details,
      changes,
      ipAddress: null, // 在服务端设置
      userAgent: null  // 在服务端设置
    }
  }
}

/**
 * 预约约束配置
 */
export const AppointmentConstraints = {
  ...APPOINTMENT_CONSTRAINTS,
  
  /**
   * 验证预约数据（集成完整约束校验）
   */
  validateAppointment(appointmentData, clinician, existingAppointments = []) {
    return AppointmentConstraintValidator.validateAppointmentData(
      appointmentData, 
      clinician, 
      existingAppointments
    )
  },
  
  /**
   * 检查时间冲突
   */
  checkTimeConflicts(appointmentData, existingAppointments, excludeId = null) {
    return AppointmentConstraintValidator.checkTimeConflicts(
      appointmentData,
      existingAppointments,
      excludeId
    )
  },
  
  /**
   * 生成建议时段
   */
  suggestAlternativeSlots(appointmentData, clinician, existingAppointments, count = 5) {
    return AppointmentConstraintValidator.suggestAlternativeSlots(
      appointmentData,
      clinician,
      existingAppointments,
      count
    )
  },
  
  /**
   * 验证改期约束
   */
  validateReschedule(existingAppointment, newAppointmentData, userRole = 'user') {
    return AppointmentConstraintValidator.validateReschedule(
      existingAppointment,
      newAppointmentData,
      userRole
    )
  },
  
  /**
   * 验证取消约束
   */
  validateCancellation(existingAppointment, userRole = 'user') {
    return AppointmentConstraintValidator.validateCancellation(
      existingAppointment,
      userRole
    )
  }
}

/**
 * Firestore 集合引用配置
 */
export const Collections = {
  APPOINTMENTS: 'appointments',
  CLINICIANS: 'clinicians', 
  BLACKOUTS: 'blackouts',
  AUDIT_LOGS: 'audit_logs',
  USERS: 'users'
}

/**
 * 索引配置建议
 */
export const IndexConfig = {
  appointments: [
    ['userId', 'start'],
    ['clinicianId', 'start'],
    ['status', 'start'],
    ['start', 'end']
  ],
  clinicians: [
    ['isActive', 'name'],
    ['specialties', 'isActive']
  ],
  blackouts: [
    ['startDate', 'endDate'],
    ['clinicianId', 'startDate'],
    ['type', 'startDate']
  ],
  audit_logs: [
    ['entityType', 'timestamp'],
    ['userId', 'timestamp'],
    ['action', 'timestamp']
  ]
}