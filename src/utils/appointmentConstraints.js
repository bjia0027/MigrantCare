/**
 * 预约系统约束校验逻辑
 * 包含业务规则验证、并发安全机制、时间冲突检测等
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

/**
 * 预约约束配置
 */
export const APPOINTMENT_CONSTRAINTS = {
  // 时间约束
  timing: {
    minDuration: 15, // 最短时长（分钟）
    maxDuration: 240, // 最长时长（分钟）
    bufferBefore: 10, // 前置缓冲时间（分钟）
    bufferAfter: 10, // 后置缓冲时间（分钟）
    rescheduleWindow: 24, // 改期窗口（小时）
    cancelWindow: 2, // 取消窗口（小时）
    advanceBooking: {
      min: 1, // 最少提前预约（小时）
      max: 90 * 24 // 最多提前预约（小时，90天）
    }
  },
  
  // 业务约束
  business: {
    maxReschedules: 3, // 最大改期次数
    maxDailyAppointments: 10, // 每日最大预约数
    maxWeeklyAppointments: 20, // 每周最大预约数
    allowWeekends: false, // 是否允许周末预约
    requireApproval: false // 是否需要审批
  },
  
  // 并发控制
  concurrency: {
    lockTimeout: 30000, // 锁超时时间（毫秒）
    retryAttempts: 3, // 重试次数
    retryDelay: 1000 // 重试延迟（毫秒）
  }
}

/**
 * 预约约束验证器
 */
export class AppointmentConstraintValidator {
  
  /**
   * 验证预约数据的完整性和业务规则
   */
  static validateAppointmentData(appointmentData, clinician, existingAppointments = []) {
    const errors = []
    
    try {
      // 基础数据验证
      const basicErrors = this.validateBasicData(appointmentData)
      errors.push(...basicErrors)
      
      // 时间约束验证
      const timeErrors = this.validateTimeConstraints(appointmentData, clinician)
      errors.push(...timeErrors)
      
      // 业务规则验证
      const businessErrors = this.validateBusinessRules(appointmentData, existingAppointments)
      errors.push(...businessErrors)
      
      // 工作时段验证
      const scheduleErrors = this.validateWorkingHours(appointmentData, clinician)
      errors.push(...scheduleErrors)
      
    } catch (error) {
      errors.push(`验证过程出错: ${error.message}`)
    }
    
    return errors
  }
  
  /**
   * 基础数据验证
   */
  static validateBasicData(appointmentData) {
    const errors = []
    
    // 必填字段检查
    const requiredFields = ['userId', 'clinicianId', 'start', 'end']
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        errors.push(`缺少必填字段: ${field}`)
      }
    }
    
    // 时间格式验证
    if (appointmentData.start && appointmentData.end) {
      const start = dayjs(appointmentData.start)
      const end = dayjs(appointmentData.end)
      
      if (!start.isValid()) {
        errors.push('开始时间格式无效')
      }
      
      if (!end.isValid()) {
        errors.push('结束时间格式无效')
      }
      
      if (start.isValid() && end.isValid()) {
        if (end.isBefore(start)) {
          errors.push('结束时间不能早于开始时间')
        }
        
        if (start.isSame(end)) {
          errors.push('开始时间和结束时间不能相同')
        }
      }
    }
    
    return errors
  }
  
  /**
   * 时间约束验证
   */
  static validateTimeConstraints(appointmentData, clinician) {
    const errors = []
    const start = dayjs(appointmentData.start)
    const end = dayjs(appointmentData.end)
    const now = dayjs()
    
    if (!start.isValid() || !end.isValid()) {
      return errors // 基础验证已经处理了格式问题
    }
    
    // 时长验证
    const duration = end.diff(start, 'minute')
    if (duration < APPOINTMENT_CONSTRAINTS.timing.minDuration) {
      errors.push(`预约时长不能少于 ${APPOINTMENT_CONSTRAINTS.timing.minDuration} 分钟`)
    }
    
    if (duration > APPOINTMENT_CONSTRAINTS.timing.maxDuration) {
      errors.push(`预约时长不能超过 ${APPOINTMENT_CONSTRAINTS.timing.maxDuration} 分钟`)
    }
    
    // 提前预约时间验证
    const hoursFromNow = start.diff(now, 'hour', true)
    if (hoursFromNow < APPOINTMENT_CONSTRAINTS.timing.advanceBooking.min) {
      errors.push(`预约时间至少需要提前 ${APPOINTMENT_CONSTRAINTS.timing.advanceBooking.min} 小时`)
    }
    
    if (hoursFromNow > APPOINTMENT_CONSTRAINTS.timing.advanceBooking.max) {
      errors.push(`预约时间不能超过 ${Math.floor(APPOINTMENT_CONSTRAINTS.timing.advanceBooking.max / 24)} 天`)
    }
    
    // 过去时间验证
    if (start.isBefore(now)) {
      errors.push('不能预约过去的时间')
    }
    
    // 时间槽对齐验证（如果医生设置了固定时间槽）
    if (clinician.slotMins) {
      const startMinutes = start.minute() + start.hour() * 60
      if (startMinutes % clinician.slotMins !== 0) {
        errors.push(`预约开始时间必须对齐到 ${clinician.slotMins} 分钟时间槽`)
      }
      
      if (duration % clinician.slotMins !== 0) {
        errors.push(`预约时长必须是 ${clinician.slotMins} 分钟的倍数`)
      }
    }
    
    return errors
  }
  
  /**
   * 业务规则验证
   */
  static validateBusinessRules(appointmentData, existingAppointments) {
    const errors = []
    const start = dayjs(appointmentData.start)
    
    // 周末预约验证
    if (!APPOINTMENT_CONSTRAINTS.business.allowWeekends) {
      const dayOfWeek = start.day()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        errors.push('不允许在周末预约')
      }
    }
    
    // 每日预约数量限制
    const sameDayAppointments = existingAppointments.filter(apt => {
      const aptStart = dayjs(apt.start)
      return aptStart.isSame(start, 'day') && apt.userId === appointmentData.userId
    })
    
    if (sameDayAppointments.length >= APPOINTMENT_CONSTRAINTS.business.maxDailyAppointments) {
      errors.push(`每日最多只能预约 ${APPOINTMENT_CONSTRAINTS.business.maxDailyAppointments} 次`)
    }
    
    // 每周预约数量限制
    const sameWeekAppointments = existingAppointments.filter(apt => {
      const aptStart = dayjs(apt.start)
      return aptStart.isSame(start, 'week') && apt.userId === appointmentData.userId
    })
    
    if (sameWeekAppointments.length >= APPOINTMENT_CONSTRAINTS.business.maxWeeklyAppointments) {
      errors.push(`每周最多只能预约 ${APPOINTMENT_CONSTRAINTS.business.maxWeeklyAppointments} 次`)
    }
    
    return errors
  }
  
  /**
   * 工作时段验证
   */
  static validateWorkingHours(appointmentData, clinician) {
    const errors = []
    const start = dayjs(appointmentData.start).tz(clinician.timezone || 'UTC')
    const end = dayjs(appointmentData.end).tz(clinician.timezone || 'UTC')
    
    const dayOfWeek = start.format('dddd').toLowerCase()
    const businessHours = clinician.businessHours?.[dayOfWeek]
    
    if (!businessHours || !businessHours.enabled) {
      errors.push(`${start.format('dddd')} 不在工作时间内`)
      return errors
    }
    
    // 解析工作时间
    const workStart = dayjs(start.format('YYYY-MM-DD') + ' ' + businessHours.start)
    const workEnd = dayjs(start.format('YYYY-MM-DD') + ' ' + businessHours.end)
    
    // 检查预约时间是否在工作时间内
    if (start.isBefore(workStart)) {
      errors.push(`预约开始时间早于工作时间 (${businessHours.start})`)
    }
    
    if (end.isAfter(workEnd)) {
      errors.push(`预约结束时间晚于工作时间 (${businessHours.end})`)
    }
    
    // 检查午休时间（如果设置了）
    if (businessHours.breakStart && businessHours.breakEnd) {
      const breakStart = dayjs(start.format('YYYY-MM-DD') + ' ' + businessHours.breakStart)
      const breakEnd = dayjs(start.format('YYYY-MM-DD') + ' ' + businessHours.breakEnd)
      
      // 检查预约是否与午休时间冲突
      if (start.isBefore(breakEnd) && end.isAfter(breakStart)) {
        errors.push(`预约时间与午休时间冲突 (${businessHours.breakStart} - ${businessHours.breakEnd})`)
      }
    }
    
    return errors
  }
  
  /**
   * 时间冲突检测（包含缓冲时间）
   */
  static checkTimeConflicts(appointmentData, existingAppointments, excludeId = null) {
    const conflicts = []
    const start = dayjs(appointmentData.start)
    const end = dayjs(appointmentData.end)
    
    // 添加缓冲时间
    const bufferedStart = start.subtract(APPOINTMENT_CONSTRAINTS.timing.bufferBefore, 'minute')
    const bufferedEnd = end.add(APPOINTMENT_CONSTRAINTS.timing.bufferAfter, 'minute')
    
    for (const existing of existingAppointments) {
      // 跳过自身（用于更新场景）
      if (excludeId && existing.id === excludeId) {
        continue
      }
      
      // 跳过已取消的预约
      if (existing.status === 'cancelled') {
        continue
      }
      
      const existingStart = dayjs(existing.start)
      const existingEnd = dayjs(existing.end)
      
      // 检查时间重叠（包含缓冲时间）
      if (bufferedStart.isBefore(existingEnd) && bufferedEnd.isAfter(existingStart)) {
        conflicts.push({
          id: existing.id,
          type: this.getConflictType(appointmentData, existing),
          start: existingStart.toISOString(),
          end: existingEnd.toISOString(),
          message: this.getConflictMessage(appointmentData, existing)
        })
      }
    }
    
    return conflicts
  }
  
  /**
   * 获取冲突类型
   */
  static getConflictType(newAppointment, existingAppointment) {
    if (newAppointment.clinicianId === existingAppointment.clinicianId) {
      return 'clinician_conflict'
    }
    if (newAppointment.userId === existingAppointment.userId) {
      return 'user_conflict'
    }
    return 'unknown_conflict'
  }
  
  /**
   * 获取冲突消息
   */
  static getConflictMessage(newAppointment, existingAppointment) {
    const type = this.getConflictType(newAppointment, existingAppointment)
    const start = dayjs(existingAppointment.start).format('HH:mm')
    const end = dayjs(existingAppointment.end).format('HH:mm')
    
    switch (type) {
      case 'clinician_conflict':
        return `医生在 ${start}-${end} 已有预约`
      case 'user_conflict':
        return `您在 ${start}-${end} 已有预约`
      default:
        return `时间段 ${start}-${end} 存在冲突`
    }
  }
  
  /**
   * 生成建议的可用时段
   */
  static suggestAlternativeSlots(appointmentData, clinician, existingAppointments, count = 5) {
    const suggestions = []
    const requestedStart = dayjs(appointmentData.start)
    const duration = dayjs(appointmentData.end).diff(dayjs(appointmentData.start), 'minute')
    
    // 获取当天的工作时间
    const dayOfWeek = requestedStart.format('dddd').toLowerCase()
    const businessHours = clinician.businessHours?.[dayOfWeek]
    
    if (!businessHours || !businessHours.enabled) {
      return suggestions
    }
    
    const workStart = dayjs(requestedStart.format('YYYY-MM-DD') + ' ' + businessHours.start)
    const workEnd = dayjs(requestedStart.format('YYYY-MM-DD') + ' ' + businessHours.end)
    
    // 生成时间槽
    const slotDuration = clinician.slotMins || 30
    let currentSlot = workStart
    
    while (currentSlot.add(duration, 'minute').isBefore(workEnd) && suggestions.length < count) {
      const slotEnd = currentSlot.add(duration, 'minute')
      
      // 检查这个时间槽是否可用
      const testAppointment = {
        ...appointmentData,
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString()
      }
      
      const conflicts = this.checkTimeConflicts(testAppointment, existingAppointments)
      
      if (conflicts.length === 0) {
        // 验证其他约束
        const errors = this.validateTimeConstraints(testAppointment, clinician)
        const scheduleErrors = this.validateWorkingHours(testAppointment, clinician)
        
        if (errors.length === 0 && scheduleErrors.length === 0) {
          suggestions.push({
            start: currentSlot.toISOString(),
            end: slotEnd.toISOString(),
            score: this.calculateSlotScore(currentSlot, requestedStart)
          })
        }
      }
      
      currentSlot = currentSlot.add(slotDuration, 'minute')
    }
    
    // 按评分排序（越接近原始时间评分越高）
    return suggestions.sort((a, b) => b.score - a.score)
  }
  
  /**
   * 计算时间槽评分（越接近原始时间评分越高）
   */
  static calculateSlotScore(slotTime, requestedTime) {
    const diffMinutes = Math.abs(slotTime.diff(requestedTime, 'minute'))
    return Math.max(0, 1000 - diffMinutes) // 基础分1000，每分钟差距扣1分
  }
  
  /**
   * 验证改期约束
   */
  static validateReschedule(existingAppointment, newAppointmentData, userRole = 'user') {
    const errors = []
    
    // 检查改期次数限制
    const rescheduleCount = existingAppointment.rescheduleCount || 0
    if (rescheduleCount >= APPOINTMENT_CONSTRAINTS.business.maxReschedules) {
      errors.push(`已达到最大改期次数限制 (${APPOINTMENT_CONSTRAINTS.business.maxReschedules})`)
    }
    
    // 检查改期窗口（管理员可以跳过）
    if (userRole !== 'admin') {
      const now = dayjs()
      const appointmentStart = dayjs(existingAppointment.start)
      const hoursUntilAppointment = appointmentStart.diff(now, 'hour', true)
      
      if (hoursUntilAppointment < APPOINTMENT_CONSTRAINTS.timing.rescheduleWindow) {
        errors.push(`预约开始前 ${APPOINTMENT_CONSTRAINTS.timing.rescheduleWindow} 小时内不可改期`)
      }
    }
    
    // 检查预约状态
    if (existingAppointment.status === 'cancelled') {
      errors.push('已取消的预约不能改期')
    }
    
    if (existingAppointment.status === 'completed') {
      errors.push('已完成的预约不能改期')
    }
    
    return errors
  }
  
  /**
   * 验证取消约束
   */
  static validateCancellation(existingAppointment, userRole = 'user') {
    const errors = []
    
    // 检查取消窗口（管理员可以跳过）
    if (userRole !== 'admin') {
      const now = dayjs()
      const appointmentStart = dayjs(existingAppointment.start)
      const hoursUntilAppointment = appointmentStart.diff(now, 'hour', true)
      
      if (hoursUntilAppointment < APPOINTMENT_CONSTRAINTS.timing.cancelWindow) {
        errors.push(`预约开始前 ${APPOINTMENT_CONSTRAINTS.timing.cancelWindow} 小时内不可取消`)
      }
    }
    
    // 检查预约状态
    if (existingAppointment.status === 'cancelled') {
      errors.push('预约已经被取消')
    }
    
    if (existingAppointment.status === 'completed') {
      errors.push('已完成的预约不能取消')
    }
    
    return errors
  }
}

/**
 * 并发安全控制器
 */
export class ConcurrencyController {
  
  /**
   * 乐观锁实现
   */
  static async withOptimisticLock(operation, maxRetries = APPOINTMENT_CONSTRAINTS.concurrency.retryAttempts) {
    let lastError
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // 如果是并发冲突错误，等待后重试
        if (this.isConcurrencyError(error) && attempt < maxRetries - 1) {
          await this.delay(APPOINTMENT_CONSTRAINTS.concurrency.retryDelay * (attempt + 1))
          continue
        }
        
        // 其他错误直接抛出
        throw error
      }
    }
    
    throw lastError
  }
  
  /**
   * 判断是否为并发冲突错误
   */
  static isConcurrencyError(error) {
    const concurrencyErrorMessages = [
      'transaction failed',
      'document was modified',
      'version mismatch',
      'concurrent modification'
    ]
    
    const errorMessage = error.message.toLowerCase()
    return concurrencyErrorMessages.some(msg => errorMessage.includes(msg))
  }
  
  /**
   * 延迟函数
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * 分布式锁实现（基于 Firestore）
   */
  static async acquireLock(lockKey, timeout = APPOINTMENT_CONSTRAINTS.concurrency.lockTimeout) {
    const lockDoc = {
      key: lockKey,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + timeout),
      owner: this.generateLockOwner()
    }
    
    // 这里应该实现实际的 Firestore 锁逻辑
    // 暂时返回模拟结果
    return {
      acquired: true,
      lockId: lockDoc.owner,
      release: async () => {
        // 释放锁的逻辑
        console.log(`释放锁: ${lockKey}`)
      }
    }
  }
  
  /**
   * 生成锁拥有者标识
   */
  static generateLockOwner() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 导出便捷方法
export const validateAppointment = AppointmentConstraintValidator.validateAppointmentData.bind(AppointmentConstraintValidator)
export const checkConflicts = AppointmentConstraintValidator.checkTimeConflicts.bind(AppointmentConstraintValidator)
export const suggestAlternatives = AppointmentConstraintValidator.suggestAlternativeSlots.bind(AppointmentConstraintValidator)
export const validateReschedule = AppointmentConstraintValidator.validateReschedule.bind(AppointmentConstraintValidator)
export const validateCancellation = AppointmentConstraintValidator.validateCancellation.bind(AppointmentConstraintValidator)
export const withOptimisticLock = ConcurrencyController.withOptimisticLock.bind(ConcurrencyController)