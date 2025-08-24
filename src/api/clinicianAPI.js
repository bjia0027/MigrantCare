/**
 * 医生管理 API 端点实现
 * 包含创建、更新、删除、查询医生信息功能
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
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { ClinicianModel } from '../models/appointmentModels'
import { useAuthStore } from '../stores/auth'

export class ClinicianAPI {
  /**
   * 验证用户权限（仅管理员可以管理医生信息）
   */
  static async verifyAdminAccess(userToken) {
    try {
      // 开发环境种子数据专用后门：仅在本地开发时允许使用固定令牌跳过登录与管理员校验
      // 注意：此分支不会在生产环境生效，且仅用于 init-doctors.html 等开发场景
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        if (userToken === 'admin-token') {
          return { uid: 'dev-seeder', email: 'dev-admin@migrantcare.local', role: 'admin' }
        }
      }

      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) {
        throw new Error('用户未登录')
      }

      // 检查是否为管理员
      if (!authStore.isAdmin) {
        throw new Error('权限不足：仅管理员可以管理医生信息')
      }

      return user
    } catch (error) {
      console.error('权限验证失败:', error)
      throw error
    }
  }

  /**
   * 创建新医生
   * POST /api/clinicians
   */
  static async createClinician(clinicianData, userToken) {
    try {
      // 验证管理员权限
      const user = await this.verifyAdminAccess(userToken)

      // 验证医生数据
      const validationErrors = ClinicianModel.validate(clinicianData)
      if (validationErrors.length > 0) {
        throw new Error(`数据验证失败: ${validationErrors.join(', ')}`)
      }

      // 检查邮箱是否已存在
      const existingClinician = await this.getClinicianByEmail(clinicianData.email)
      if (existingClinician) {
        throw new Error('该邮箱已被其他医生使用')
      }

      // 创建医生对象
      const newClinician = ClinicianModel.create(clinicianData)

      // 保存到 Firestore
      const cliniciansRef = collection(db, 'clinicians')
      const docRef = await addDoc(cliniciansRef, newClinician)

      const result = {
        id: docRef.id,
        ...newClinician,
      }

      console.log('医生创建成功:', result)

      return {
        success: true,
        data: result,
        message: '医生创建成功',
      }
    } catch (error) {
      console.error('创建医生失败:', error)
      return {
        success: false,
        error: error.message,
        message: '创建医生失败',
      }
    }
  }

  /**
   * 更新医生信息
   * PATCH /api/clinicians/:id
   */
  static async updateClinician(clinicianId, updateData, userToken) {
    try {
      // 验证管理员权限
      const user = await this.verifyAdminAccess(userToken)

      // 检查医生是否存在
      const existingClinician = await this.getClinicianById(clinicianId)
      if (!existingClinician) {
        throw new Error('医生不存在')
      }

      // 如果更新邮箱，检查是否与其他医生冲突
      if (updateData.email && updateData.email !== existingClinician.email) {
        const emailConflict = await this.getClinicianByEmail(updateData.email)
        if (emailConflict && emailConflict.id !== clinicianId) {
          throw new Error('该邮箱已被其他医生使用')
        }
      }

      // 合并更新数据
      const mergedData = {
        ...existingClinician,
        ...updateData,
        updatedAt: Timestamp.now(),
      }

      // 验证合并后的数据
      const validationErrors = ClinicianModel.validate(mergedData)
      if (validationErrors.length > 0) {
        throw new Error(`数据验证失败: ${validationErrors.join(', ')}`)
      }

      // 更新到 Firestore
      const clinicianRef = doc(db, 'clinicians', clinicianId)
      await updateDoc(clinicianRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      })

      const result = {
        id: clinicianId,
        ...mergedData,
      }

      console.log('医生信息更新成功:', result)

      return {
        success: true,
        data: result,
        message: '医生信息更新成功',
      }
    } catch (error) {
      console.error('更新医生信息失败:', error)
      return {
        success: false,
        error: error.message,
        message: '更新医生信息失败',
      }
    }
  }

  /**
   * 删除医生（软删除，设置为不活跃）
   * DELETE /api/clinicians/:id
   */
  static async deleteClinician(clinicianId, userToken) {
    try {
      // 验证管理员权限
      const user = await this.verifyAdminAccess(userToken)

      // 检查医生是否存在
      const existingClinician = await this.getClinicianById(clinicianId)
      if (!existingClinician) {
        throw new Error('医生不存在')
      }

      // 检查是否有未完成的预约
      const hasActiveAppointments = await this.hasActiveAppointments(clinicianId)
      if (hasActiveAppointments) {
        throw new Error('该医生还有未完成的预约，无法删除')
      }

      // 软删除：设置为不活跃
      const clinicianRef = doc(db, 'clinicians', clinicianId)
      await updateDoc(clinicianRef, {
        isActive: false,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      console.log('医生删除成功:', clinicianId)

      return {
        success: true,
        data: { id: clinicianId },
        message: '医生删除成功',
      }
    } catch (error) {
      console.error('删除医生失败:', error)
      return {
        success: false,
        error: error.message,
        message: '删除医生失败',
      }
    }
  }

  /**
   * 获取所有医生列表
   * GET /api/clinicians
   */
  static async getAllClinicians(filters = {}) {
    let clinicians = []
    try {
      // 统一使用 Firestore（包括开发环境），确保返回真实文档 ID
      const cliniciansRef = collection(db, 'clinicians')
      let q

      // 当带有 isActive 过滤时，不与 orderBy 组合，避免首次运行项目时触发复合索引要求
      if (filters.isActive !== undefined) {
        q = query(cliniciansRef, where('isActive', '==', filters.isActive))
      } else {
        q = query(cliniciansRef, orderBy('name', 'asc'))
      }

      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        clinicians.push({ id: doc.id, ...doc.data() })
      })

      // 如果使用了 isActive 过滤，则在客户端按名称排序，效果与服务端 orderBy 一致
      if (filters.isActive !== undefined) {
        clinicians.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }

      console.log('[ClinicianAPI] Loaded clinicians:', clinicians.map(c => ({ id: c.id, name: c.name, isActive: c.isActive })))
    } catch (error) {
      console.error('从 Firestore 加载医生失败:', error)
      return {
        success: false,
        error: error.message,
        message: '获取医生列表失败',
      }
    }
  
    return {
      success: true,
      data: clinicians,
      message: clinicians.length > 0 ? '获取医生列表成功' : 'clinicians 集合为空',
    }
  }

  /**
   * 根据ID获取医生信息
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
   * 根据邮箱获取医生信息
   */
  static async getClinicianByEmail(email) {
    try {
      const cliniciansRef = collection(db, 'clinicians')
      const q = query(cliniciansRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      }
    } catch (error) {
      console.error('根据邮箱获取医生信息失败:', error)
      return null
    }
  }

  /**
   * 检查医生是否有活跃的预约
   */
  static async hasActiveAppointments(clinicianId) {
    try {
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('clinicianId', '==', clinicianId),
        where('status', 'in', ['pending', 'confirmed']),
      )

      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('检查活跃预约失败:', error)
      return true // 出错时保守处理，假设有活跃预约
    }
  }

  /**
   * 获取医生的专业领域选项
   */
  static getSpecialtyOptions() {
    return [
      '全科医学',
      '内科',
      '外科',
      '儿科',
      '妇产科',
      '心理科',
      '皮肤科',
      '眼科',
      '耳鼻喉科',
      '骨科',
      '神经科',
      '心脏科',
      '肿瘤科',
      '急诊科',
      '康复科',
      '中医科',
    ]
  }

  /**
   * 获取时区选项
   */
  static getTimezoneOptions() {
    return [
      'Australia/Melbourne',
      'Australia/Sydney',
      'Australia/Brisbane',
      'Australia/Perth',
      'Australia/Adelaide',
      'Australia/Darwin',
      'Australia/Hobart',
    ]
  }
}

// 导出便捷方法
export const {
  createClinician,
  updateClinician,
  deleteClinician,
  getAllClinicians,
  getClinicianById,
  getClinicianByEmail,
} = ClinicianAPI
