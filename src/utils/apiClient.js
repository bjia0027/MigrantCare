/**
 * 统一的 API 客户端
 * 封装所有云函数请求，处理认证、错误处理和重试逻辑
 */

import { auth } from '../firebase/config'
import { useAuthStore } from '../stores/auth'

// API 基础配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 30000, // 30秒超时
  retryAttempts: 3,
  retryDelay: 1000 // 1秒重试延迟
}

/**
 * API 错误类
 */
class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * 获取当前用户的 ID Token
 */
async function getIdToken() {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new ApiError('用户未登录', 401, 'UNAUTHORIZED', 'No authenticated user')
    }
    
    // 强制刷新 token 以确保有效性
    const token = await currentUser.getIdToken(true)
    return token
  } catch (error) {
    console.error('获取 ID Token 失败:', error)
    throw new ApiError('认证失败', 401, 'AUTH_FAILED', error.message)
  }
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 发送 HTTP 请求的核心函数
 */
async function makeRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requireAuth = true,
    timeout = API_CONFIG.timeout
  } = options

  // 构建完整的 URL
  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  // 准备请求头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  // 如果需要认证，添加 Authorization 头
  if (requireAuth) {
    try {
      const token = await getIdToken()
      requestHeaders.Authorization = `Bearer ${token}`
    } catch (error) {
      // 如果获取 token 失败，尝试重新登录
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        // 清除当前用户状态，触发重新登录
        await authStore.logout()
      }
      throw error
    }
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // 检查响应状态
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }

      // 处理认证错误
      if (response.status === 401 || response.status === 403) {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          // 尝试刷新 token
          try {
            await getIdToken()
            // 如果刷新成功，重试请求
            return makeRequest(endpoint, options)
          } catch {
            // 刷新失败，清除用户状态
            await authStore.logout()
          }
        }
        throw new ApiError(
          errorData.message || '认证失败，请重新登录',
          response.status,
          errorData.code || 'UNAUTHORIZED',
          errorData.details
        )
      }

      throw new ApiError(
        errorData.message || '请求失败',
        response.status,
        errorData.code || 'REQUEST_FAILED',
        errorData.details
      )
    }

    // 解析响应数据
    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new ApiError('请求超时', 408, 'TIMEOUT', '请求超时，请检查网络连接')
    }
    
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      '网络错误',
      0,
      'NETWORK_ERROR',
      error.message
    )
  }
}

/**
 * 带重试机制的请求函数
 */
async function requestWithRetry(endpoint, options = {}) {
  const { retryAttempts = API_CONFIG.retryAttempts } = options
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await makeRequest(endpoint, options)
    } catch (error) {
      // 如果是最后一次尝试或者是认证错误，直接抛出
      if (attempt === retryAttempts || error.status === 401 || error.status === 403) {
        throw error
      }
      
      // 等待后重试
      await delay(API_CONFIG.retryDelay * attempt)
      console.warn(`请求失败，正在重试 (${attempt}/${retryAttempts}):`, error.message)
    }
  }
}

/**
 * API 客户端类
 */
class ApiClient {
  /**
   * 健康检查
   */
  async checkHealth() {
    return requestWithRetry('/health', { requireAuth: false })
  }

  /**
   * 发送邮件
   * @param {Object} emailData - 邮件数据
   * @param {string} emailData.recipient - 收件人邮箱
   * @param {string} emailData.subject - 邮件主题
   * @param {string} emailData.body - 邮件内容
   * @param {string} emailData.requestId - 请求ID（可选，用于幂等性）
   */
  async sendEmail(emailData) {
    // 生成请求ID（如果未提供）
    if (!emailData.requestId) {
      emailData.requestId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    return requestWithRetry('/sendEmail', {
      method: 'POST',
      body: emailData,
      requireAuth: true
    })
  }

  /**
   * 获取预约报告
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} params.endDate - 结束日期 (YYYY-MM-DD)
   * @param {number} params.limit - 限制数量（可选）
   * @param {number} params.offset - 偏移量（可选）
   */
  async getAppointmentReports(params) {
    const queryString = new URLSearchParams(params).toString()
    return requestWithRetry(`/getAppointmentReports?${queryString}`, {
      requireAuth: true
    })
  }

  /**
   * 获取审计日志
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期（可选）
   * @param {string} params.endDate - 结束日期（可选）
   * @param {string} params.userId - 用户ID（可选）
   * @param {string} params.action - 操作类型（可选）
   * @param {number} params.limit - 限制数量（可选）
   * @param {number} params.offset - 偏移量（可选）
   */
  async getAuditLog(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/auditLog?${queryString}` : '/auditLog'
    return requestWithRetry(endpoint, {
      requireAuth: true
    })
  }

  /**
   * 记录用户登录
   * @param {Object} loginData - 登录数据
   */
  async logUserLogin(loginData) {
    return requestWithRetry('/logUserLogin', {
      method: 'POST',
      body: loginData,
      requireAuth: true
    })
  }

  /**
   * 记录用户登出
   * @param {Object} logoutData - 登出数据
   */
  async logUserLogout(logoutData) {
    return requestWithRetry('/logUserLogout', {
      method: 'POST',
      body: logoutData,
      requireAuth: true
    })
  }

  /**
   * 获取认证日志
   * @param {Object} params - 查询参数
   */
  async getAuthLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/getAuthLogs?${queryString}` : '/getAuthLogs'
    return requestWithRetry(endpoint, {
      requireAuth: true
    })
  }
}

// 创建单例实例
const apiClient = new ApiClient()

// 导出 API 客户端实例和错误类
export { apiClient, ApiError }
export default apiClient

// 导出配置用于测试
export { API_CONFIG }