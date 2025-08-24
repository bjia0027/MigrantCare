/**
 * 预约系统 API 端点实现
 * 包含创建、更新、删除预约和可用时段查询功能
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  AppointmentModel,
  ClinicianModel,
  BlackoutModel,
  AuditLogModel,
  AppointmentConstraints,
} from '../models/appointmentModels'
// import { sendEmail } from './emailAPI' // TODO: 实现邮件API
import { useAuthStore } from '../stores/auth'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 预约 API 类
 */
export class AppointmentAPI {
  /**
   * 创建新预约
   * POST /api/appointments
   */
  static async createAppointment(appointmentData, userToken) {
    try {
      // 验证用户权限
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      // 数据验证
      const validationErrors = AppointmentModel.validate(appointmentData)
      if (validationErrors.length > 0) {
        throw new Error(`数据验证失败: ${validationErrors.join(', ')}`)
      }

      // 使用Firestore
      // 获取医生信息
      const clinician = await this.getClinicianById(appointmentData.clinicianId)
      if (!clinician) {
        throw new Error('医生不存在')
      }

      // 使用事务确保数据一致性
      const result = await runTransaction(db, async (transaction) => {
        // 检查时间冲突
        const conflicts = await this.checkTimeConflicts(
          appointmentData.clinicianId,
          appointmentData.userId,
          appointmentData.start,
          appointmentData.end,
          null, // 新预约，无需排除自身
        )

        if (conflicts.length > 0) {
          throw new Error('预约时间冲突')
        }

        // 业务约束校验
        const constraintErrors = await this.validateBusinessConstraints(appointmentData, clinician)

        if (constraintErrors.length > 0) {
          throw new Error(`业务约束校验失败: ${constraintErrors.join(', ')}`)
        }

        // 创建预约
        const appointmentRef = doc(collection(db, 'appointments'))
        const newAppointment = AppointmentModel.create({
          ...appointmentData,
          id: appointmentRef.id,
        })

        transaction.set(appointmentRef, newAppointment)

        // 创建审计日志
        const auditLogRef = doc(collection(db, 'audit_logs'))
        const auditLog = AuditLogModel.create(
          'create',
          'appointment',
          appointmentRef.id,
          user.uid,
          { appointmentData },
        )
        transaction.set(auditLogRef, auditLog)

        return { id: appointmentRef.id, ...newAppointment }
      })

      // 发送确认邮件
      await this.sendAppointmentConfirmation(result, clinician, user)

      return {
        success: true,
        data: result,
        message: '预约创建成功',
      }
    } catch (error) {
      console.error('创建预约失败:', error)
      return {
        success: false,
        error: error.message,
        message: '预约创建失败',
      }
    }
  }

  /**
   * 更新预约（改期）
   * PATCH /api/appointments/:id
   */
  static async updateAppointment(appointmentId, updateData, userToken) {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      // 获取现有预约
      const existingAppointment = await this.getAppointmentById(appointmentId)
      if (!existingAppointment) {
        throw new Error('预约不存在')
      }

      // 权限检查：只有预约者本人或管理员可以修改
      if (existingAppointment.userId !== user.uid && !user.isAdmin) {
        throw new Error('无权限修改此预约')
      }

      // 检查改期次数限制
      if (updateData.start || updateData.end) {
        if (existingAppointment.rescheduleCount >= AppointmentConstraints.business.maxReschedules) {
          throw new Error(
            `已达到最大改期次数限制 (${AppointmentConstraints.business.maxReschedules})`,
          )
        }

        // 检查改期窗口
        const now = new Date()
        const appointmentStart = existingAppointment.start.toDate()
        const hoursUntilAppointment = (appointmentStart - now) / (1000 * 60 * 60)

        if (hoursUntilAppointment < AppointmentConstraints.timing.rescheduleWindow) {
          throw new Error(
            `预约开始前${AppointmentConstraints.timing.rescheduleWindow}小时内不可改期`,
          )
        }
      }

      const result = await runTransaction(db, async (transaction) => {
        // 如果是改期，重新检查冲突
        if (updateData.start || updateData.end) {
          const conflicts = await this.checkTimeConflicts(
            updateData.clinicianId || existingAppointment.clinicianId,
            existingAppointment.userId,
            updateData.start || existingAppointment.start,
            updateData.end || existingAppointment.end,
            appointmentId, // 排除当前预约
          )

          if (conflicts.length > 0) {
            throw new Error('新时间段存在冲突')
          }
        }

        // 更新预约
        const appointmentRef = doc(db, 'appointments', appointmentId)
        const updatedData = {
          ...updateData,
          updatedAt: Timestamp.now(),
        }

        // 如果是改期，增加改期次数
        if (updateData.start || updateData.end) {
          updatedData.rescheduleCount = (existingAppointment.rescheduleCount || 0) + 1
        }

        transaction.update(appointmentRef, updatedData)

        // 创建审计日志
        const auditLogRef = doc(collection(db, 'audit_logs'))
        const auditLog = AuditLogModel.create(
          updateData.start || updateData.end ? 'reschedule' : 'update',
          'appointment',
          appointmentId,
          user.uid,
          { updateData },
          { before: existingAppointment, after: { ...existingAppointment, ...updatedData } },
        )
        transaction.set(auditLogRef, auditLog)

        return { ...existingAppointment, ...updatedData }
      })

      // 如果是改期，发送通知邮件
      if (updateData.start || updateData.end) {
        const clinician = await this.getClinicianById(result.clinicianId)
        await this.sendRescheduleNotification(result, clinician, user)
      }

      return {
        success: true,
        data: result,
        message: '预约更新成功',
      }
    } catch (error) {
      console.error('更新预约失败:', error)
      return {
        success: false,
        error: error.message,
        message: '预约更新失败',
      }
    }
  }

  /**
   * 彻底删除预约记录
   * DELETE /api/appointments/:id/permanent
   */
  static async deleteAppointment(appointmentId, userToken, reason = '') {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      const existingAppointment = await this.getAppointmentById(appointmentId)
      if (!existingAppointment) {
        throw new Error('预约不存在')
      }

      // 权限检查：只有管理员可以彻底删除记录
      if (!user.isAdmin) {
        throw new Error('只有管理员可以彻底删除预约记录')
      }

      const result = await runTransaction(db, async (transaction) => {
        const appointmentRef = doc(db, 'appointments', appointmentId)

        // 彻底删除预约记录
        transaction.delete(appointmentRef)

        // 创建审计日志
        const auditLogRef = doc(collection(db, 'audit_logs'))
        const auditLog = AuditLogModel.create(
          'delete',
          'appointment',
          appointmentId,
          user.uid,
          { reason },
          { before: existingAppointment, after: null },
        )
        transaction.set(auditLogRef, auditLog)

        return existingAppointment
      })

      // 发送删除通知邮件
      const clinician = await this.getClinicianById(result.clinicianId)
      await this.sendDeletionNotification(result, clinician, user, reason)

      return {
        success: true,
        data: result,
        message: '预约记录已彻底删除',
      }
    } catch (error) {
      console.error('删除预约失败:', error)
      return {
        success: false,
        error: error.message,
        message: '预约删除失败',
      }
    }
  }

  /**
   * 取消预约
   * DELETE /api/appointments/:id
   */
  static async cancelAppointment(appointmentId, userToken, reason = '') {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      const existingAppointment = await this.getAppointmentById(appointmentId)
      if (!existingAppointment) {
        throw new Error('预约不存在')
      }

      // 权限检查
      if (existingAppointment.userId !== user.uid && !user.isAdmin) {
        throw new Error('无权限取消此预约')
      }

      // 检查取消窗口
      const now = new Date()
      const appointmentStart = existingAppointment.start.toDate()
      const hoursUntilAppointment = (appointmentStart - now) / (1000 * 60 * 60)

      if (hoursUntilAppointment < AppointmentConstraints.timing.cancelWindow && !user.isAdmin) {
        throw new Error(`预约开始前${AppointmentConstraints.timing.cancelWindow}小时内不可取消`)
      }

      const result = await runTransaction(db, async (transaction) => {
        const appointmentRef = doc(db, 'appointments', appointmentId)

        // 更新预约状态为已取消
        const cancelData = {
          status: 'cancelled',
          cancelledAt: Timestamp.now(),
          cancelReason: reason,
          updatedAt: Timestamp.now(),
        }

        transaction.update(appointmentRef, cancelData)

        // 创建审计日志
        const auditLogRef = doc(collection(db, 'audit_logs'))
        const auditLog = AuditLogModel.create(
          'cancel',
          'appointment',
          appointmentId,
          user.uid,
          { reason },
          { before: existingAppointment, after: { ...existingAppointment, ...cancelData } },
        )
        transaction.set(auditLogRef, auditLog)

        return { ...existingAppointment, ...cancelData }
      })

      // 发送取消通知邮件
      const clinician = await this.getClinicianById(result.clinicianId)
      await this.sendCancellationNotification(result, clinician, user, reason)

      return {
        success: true,
        data: result,
        message: '预约取消成功',
      }
    } catch (error) {
      console.error('取消预约失败:', error)
      return {
        success: false,
        error: error.message,
        message: '预约取消失败',
      }
    }
  }

  /**
   * 获取所有预约（管理员权限）
   * GET /api/appointments
   */
  static async getAllAppointments(userToken, filters = {}) {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      // 检查管理员权限
      if (!user.isAdmin && !user.email?.includes('admin')) {
        throw new Error('需要管理员权限')
      }

      // 使用Firestore
      const appointmentsRef = collection(db, 'appointments')
      // 首选带 orderBy 的查询（若缺少索引则会回退）
      let q
      if (filters.status) {
        q = query(appointmentsRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
      } else if (filters.clinicianId) {
        q = query(appointmentsRef, where('clinicianId', '==', filters.clinicianId), orderBy('createdAt', 'desc'))
      } else if (filters.userId) {
        q = query(appointmentsRef, where('userId', '==', filters.userId), orderBy('createdAt', 'desc'))
      } else {
        q = query(appointmentsRef, orderBy('createdAt', 'desc'))
      }

      let querySnapshot
      try {
        querySnapshot = await getDocs(q)
      } catch (err) {
        console.warn('getAllAppointments: 索引可能缺失，降级为无排序查询。', err?.code || err)
        // 回退为不带 orderBy 的查询，避免复合索引依赖
        if (filters.status) {
          q = query(appointmentsRef, where('status', '==', filters.status))
        } else if (filters.clinicianId) {
          q = query(appointmentsRef, where('clinicianId', '==', filters.clinicianId))
        } else if (filters.userId) {
          q = query(appointmentsRef, where('userId', '==', filters.userId))
        } else {
          q = query(appointmentsRef)
        }
        querySnapshot = await getDocs(q)
      }

      const appointments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // 客户端排序：优先按 createdAt desc，其次按 start desc
      appointments.sort((a, b) => {
        const getTime = (x) => {
          if (x?.createdAt && typeof x.createdAt.toDate === 'function') return x.createdAt.toDate().getTime()
          if (x?.start && typeof x.start.toDate === 'function') return x.start.toDate().getTime()
          return 0
        }
        return getTime(b) - getTime(a)
      })

      return {
        success: true,
        data: appointments,
        message: '获取预约列表成功',
      }
    } catch (error) {
      console.error('获取预约列表失败:', error)
      return {
        success: false,
        error: error.message,
        message: '获取预约列表失败',
      }
    }
  }

  /**
   * 获取用户预约
   * GET /api/appointments/user
   */
  static async getUserAppointments(userToken, userId = null) {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      // 如果指定了userId且当前用户不是管理员，只能查看自己的预约
      const targetUserId = userId || user.uid
      if (targetUserId !== user.uid && !user.isAdmin && !user.email?.includes('admin')) {
        throw new Error('无权限查看其他用户的预约')
      }

      // 使用Firestore
      const appointmentsRef = collection(db, 'appointments')
      // 首选带 orderBy 的查询
      let q = query(appointmentsRef, where('userId', '==', targetUserId), orderBy('createdAt', 'desc'))

      let querySnapshot
      try {
        querySnapshot = await getDocs(q)
      } catch (err) {
        console.warn('getUserAppointments: 索引可能缺失，降级为无排序查询。', err?.code || err)
        q = query(appointmentsRef, where('userId', '==', targetUserId))
        querySnapshot = await getDocs(q)
      }

      const appointments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // 客户端排序：优先按 createdAt desc，其次按 start desc
      appointments.sort((a, b) => {
        const getTime = (x) => {
          if (x?.createdAt && typeof x.createdAt.toDate === 'function') return x.createdAt.toDate().getTime()
          if (x?.start && typeof x.start.toDate === 'function') return x.start.toDate().getTime()
          return 0
        }
        return getTime(b) - getTime(a)
      })

      return {
        success: true,
        data: appointments,
        message: '获取用户预约成功',
      }
    } catch (error) {
      console.error('获取用户预约失败:', error)
      return {
        success: false,
        error: error.message,
        message: '获取用户预约失败',
      }
    }
  }

  /**
   * 获取可用时段
   * GET /api/appointments/availability
   */
  static async getAvailability(clinicianId, date, userToken) {
    try {
      const user = await this.verifyUserToken(userToken)
      if (!user) {
        throw new Error('未授权访问')
      }

      const clinician = await this.getClinicianById(clinicianId)
      if (!clinician) {
        throw new Error('医生不存在')
      }

      const targetDate = dayjs(date).tz(clinician.timezone)
      const dayOfWeek = targetDate.format('dddd').toLowerCase()

      // 检查是否为工作日
      const businessHours = clinician.businessHours[dayOfWeek]
      if (!businessHours || !businessHours.enabled) {
        return {
          success: true,
          data: [],
          message: '该日期不在工作时间内',
        }
      }

      // 检查黑名单日期
      const isBlackedOut = await this.isDateBlackedOut(clinicianId, targetDate.toDate())
      if (isBlackedOut) {
        return {
          success: true,
          data: [],
          message: '该日期不可预约',
        }
      }

      // 获取当日现有预约
      const existingAppointments = await this.getAppointmentsByDate(
        clinicianId,
        targetDate.toDate(),
      )

      // 生成可用时段
      const availableSlots = this.generateAvailableSlots(
        businessHours,
        existingAppointments,
        clinician.slotMins,
        targetDate,
      )

      return {
        success: true,
        data: availableSlots,
        message: '获取可用时段成功',
      }
    } catch (error) {
      console.error('获取可用时段失败:', error)
      return {
        success: false,
        error: error.message,
        message: '获取可用时段失败',
      }
    }
  }

  /**
   * 辅助方法：验证用户令牌
   */
  static async verifyUserToken(token) {
    try {
      // 获取当前用户信息
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) {
        throw new Error('用户未登录')
      }

      return {
        uid: user.uid,
        email: user.email,
        isAdmin: authStore.isAdmin,
        role: user.role,
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      throw new Error('用户验证失败')
    }
  }

  /**
   * 辅助方法：获取医生信息
   */
  static async getClinicianById(clinicianId) {
    try {
      const docRef = doc(db, 'clinicians', clinicianId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (error) {
      console.error('获取医生信息失败:', error)
      return null
    }
  }

  /**
   * 辅助方法：获取预约信息
   */
  static async getAppointmentById(appointmentId) {
    try {
      const docRef = doc(db, 'appointments', appointmentId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (error) {
      console.error('获取预约信息失败:', error)
      return null
    }
  }

  /**
   * 辅助方法：检查时间冲突
   */
  static async checkTimeConflicts(
    clinicianId,
    userId,
    startTime,
    endTime,
    excludeAppointmentId = null,
  ) {
    try {
      const appointmentsRef = collection(db, 'appointments')

      // 查询医生的预约冲突
      const clinicianQuery = query(
        appointmentsRef,
        where('clinicianId', '==', clinicianId),
        where('status', 'in', ['pending', 'confirmed']),
        where('start', '<', endTime),
        where('end', '>', startTime),
      )

      // 查询用户的预约冲突
      const userQuery = query(
        appointmentsRef,
        where('userId', '==', userId),
        where('status', 'in', ['pending', 'confirmed']),
        where('start', '<', endTime),
        where('end', '>', startTime),
      )

      const [clinicianConflicts, userConflicts] = await Promise.all([
        getDocs(clinicianQuery),
        getDocs(userQuery),
      ])

      const conflicts = []

      clinicianConflicts.forEach((doc) => {
        if (!excludeAppointmentId || doc.id !== excludeAppointmentId) {
          conflicts.push({ id: doc.id, type: 'clinician', ...doc.data() })
        }
      })

      userConflicts.forEach((doc) => {
        if (!excludeAppointmentId || doc.id !== excludeAppointmentId) {
          conflicts.push({ id: doc.id, type: 'user', ...doc.data() })
        }
      })

      return conflicts
    } catch (error) {
      console.error('检查时间冲突失败:', error)
      return []
    }
  }

  /**
   * 辅助方法：业务约束校验
   */
  static async validateBusinessConstraints(appointmentData, clinician) {
    const errors = []
    const start = appointmentData.start.toDate
      ? appointmentData.start.toDate()
      : new Date(appointmentData.start)
    const end = appointmentData.end.toDate
      ? appointmentData.end.toDate()
      : new Date(appointmentData.end)

    // 使用约束配置进行验证
    const constraintErrors = AppointmentConstraints.validateAppointment(
      appointmentData,
      clinician,
      [], // 这里应该传入现有预约，但为了简化暂时传空数组
    )

    errors.push(...constraintErrors)

    return errors
  }

  /**
   * 辅助方法：检查日期是否在黑名单中
   */
  static async isDateBlackedOut(clinicianId, date) {
    try {
      const blackoutsRef = collection(db, 'blackouts')
      const globalQuery = query(
        blackoutsRef,
        where('startDate', '<=', Timestamp.fromDate(date)),
        where('endDate', '>=', Timestamp.fromDate(date)),
        where('clinicianId', '==', null),
      )

      const clinicianQuery = query(
        blackoutsRef,
        where('startDate', '<=', Timestamp.fromDate(date)),
        where('endDate', '>=', Timestamp.fromDate(date)),
        where('clinicianId', '==', clinicianId),
      )

      const [globalBlackouts, clinicianBlackouts] = await Promise.all([
        getDocs(globalQuery),
        getDocs(clinicianQuery),
      ])

      return !globalBlackouts.empty || !clinicianBlackouts.empty
    } catch (error) {
      console.error('检查黑名单日期失败:', error)
      return false
    }
  }

  /**
   * 辅助方法：获取指定日期的预约
   */
  static async getAppointmentsByDate(clinicianId, date) {
    try {
      const startOfDay = dayjs(date).startOf('day').toDate()
      const endOfDay = dayjs(date).endOf('day').toDate()

      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('clinicianId', '==', clinicianId),
        where('status', 'in', ['pending', 'confirmed']),
        where('start', '>=', Timestamp.fromDate(startOfDay)),
        where('start', '<', Timestamp.fromDate(endOfDay)),
        orderBy('start'),
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('获取日期预约失败:', error)
      return []
    }
  }

  /**
   * 辅助方法：生成可用时段
   */
  static generateAvailableSlots(businessHours, existingAppointments, slotMins, targetDate) {
    const slots = []
    const startTime = dayjs(targetDate)
      .hour(parseInt(businessHours.start.split(':')[0]))
      .minute(parseInt(businessHours.start.split(':')[1]))
    const endTime = dayjs(targetDate)
      .hour(parseInt(businessHours.end.split(':')[0]))
      .minute(parseInt(businessHours.end.split(':')[1]))

    let currentSlot = startTime

    while (currentSlot.isBefore(endTime)) {
      const slotEnd = currentSlot.add(slotMins, 'minute')

      // 检查是否与现有预约冲突
      const hasConflict = existingAppointments.some((appointment) => {
        const aptStart = dayjs(appointment.start.toDate())
        const aptEnd = dayjs(appointment.end.toDate())
        return currentSlot.isBefore(aptEnd) && slotEnd.isAfter(aptStart)
      })

      if (!hasConflict && slotEnd.isBefore(endTime.add(1, 'minute'))) {
        slots.push({
          start: currentSlot.toISOString(),
          end: slotEnd.toISOString(),
          available: true,
        })
      }

      currentSlot = currentSlot.add(slotMins, 'minute')
    }

    return slots
  }

  /**
   * 辅助方法：发送预约确认邮件
   */
  static async sendAppointmentConfirmation(appointment, clinician, user) {
    try {
      const emailData = {
        to: user.email,
        subject: '预约确认 - MigrantCare',
        template: 'appointment_confirmation',
        data: {
          userName: user.name || user.email,
          clinicianName: clinician.name,
          appointmentDate: dayjs(appointment.start.toDate()).format('YYYY-MM-DD'),
          appointmentTime: dayjs(appointment.start.toDate()).format('HH:mm'),
          appointmentId: appointment.id,
        },
      }

      // await sendEmail(emailData) // TODO: 实现邮件发送功能
      console.log('邮件发送功能暂未实现:', emailData)
    } catch (error) {
      console.error('发送确认邮件失败:', error)
    }
  }

  /**
   * 辅助方法：发送改期通知邮件
   */
  static async sendRescheduleNotification(appointment, clinician, user) {
    try {
      const emailData = {
        to: user.email,
        subject: '预约改期通知 - MigrantCare',
        template: 'appointment_reschedule',
        data: {
          userName: user.name || user.email,
          clinicianName: clinician.name,
          newDate: dayjs(appointment.start.toDate()).format('YYYY-MM-DD'),
          newTime: dayjs(appointment.start.toDate()).format('HH:mm'),
          appointmentId: appointment.id,
        },
      }

      // await sendEmail(emailData) // TODO: 实现邮件发送功能
      console.log('邮件发送功能暂未实现:', emailData)
    } catch (error) {
      console.error('发送改期通知邮件失败:', error)
    }
  }

  /**
   * 辅助方法：发送取消通知邮件
   */
  static async sendCancellationNotification(appointment, clinician, user, reason) {
    try {
      const emailData = {
        to: user.email,
        subject: '预约取消通知 - MigrantCare',
        template: 'appointment_cancellation',
        data: {
          userName: user.name || user.email,
          clinicianName: clinician.name,
          originalDate: dayjs(appointment.start.toDate()).format('YYYY-MM-DD'),
          originalTime: dayjs(appointment.start.toDate()).format('HH:mm'),
          reason: reason || '无',
          appointmentId: appointment.id,
        },
      }

      // await sendEmail(emailData) // TODO: 实现邮件发送功能
      console.log('邮件发送功能暂未实现:', emailData)
    } catch (error) {
      console.error('发送取消通知邮件失败:', error)
    }
  }

  /**
   * 辅助方法：发送删除通知邮件
   */
  static async sendDeletionNotification(appointment, clinician, user, reason) {
    try {
      const emailData = {
        to: user.email,
        subject: '预约删除通知 - MigrantCare',
        template: 'appointment_deletion',
        data: {
          userName: user.name || user.email,
          clinicianName: clinician.name,
          originalDate: dayjs(appointment.start.toDate()).format('YYYY-MM-DD'),
          originalTime: dayjs(appointment.start.toDate()).format('HH:mm'),
          reason: reason || '无',
          appointmentId: appointment.id,
        },
      }

      // await sendEmail(emailData) // TODO: 实现邮件发送功能
      console.log('邮件发送功能暂未实现:', emailData)
    } catch (error) {
      console.error('发送删除通知邮件失败:', error)
    }
  }

}

// 导出便捷方法
export const createAppointment = AppointmentAPI.createAppointment.bind(AppointmentAPI)
export const updateAppointment = AppointmentAPI.updateAppointment.bind(AppointmentAPI)
export const cancelAppointment = AppointmentAPI.cancelAppointment.bind(AppointmentAPI)
export const deleteAppointment = AppointmentAPI.deleteAppointment.bind(AppointmentAPI)
export const getAvailability = AppointmentAPI.getAvailability.bind(AppointmentAPI)
export const getAllAppointments = AppointmentAPI.getAllAppointments.bind(AppointmentAPI)
export const getUserAppointments = AppointmentAPI.getUserAppointments.bind(AppointmentAPI)
