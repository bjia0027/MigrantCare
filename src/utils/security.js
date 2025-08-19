/**
 * 安全工具函数
 * 用于防止XSS攻击和验证用户输入
 */

/**
 * HTML转义函数 - 防止XSS攻击
 * @param {string} str - 需要转义的字符串
 * @returns {string} - 转义后的安全字符串
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') {
    return str
  }

  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }

  return str.replace(/[&<>"'`=/]/g, (match) => htmlEscapeMap[match])
}

/**
 * 清理和验证用户输入
 * @param {string} input - 用户输入
 * @param {Object} options - 验证选项
 * @returns {Object} - 验证结果
 */
export function validateAndSanitizeInput(input, options = {}) {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHtml = false,
    required = false,
    pattern = null,
  } = options

  const result = {
    isValid: true,
    sanitized: '',
    errors: [],
  }

  if (!input || input.trim() === '') {
    if (required) {
      result.isValid = false
      result.errors.push('This field is required')
    }
    result.sanitized = ''
    return result
  }

  let sanitized = String(input).trim()

  if (sanitized.length < minLength) {
    result.isValid = false
    result.errors.push(`Minimum ${minLength} characters required`)
  }

  if (sanitized.length > maxLength) {
    result.isValid = false
    result.errors.push(`Maximum ${maxLength} characters allowed`)
    sanitized = sanitized.substring(0, maxLength)
  }

  if (pattern && !pattern.test(sanitized)) {
    result.isValid = false
    result.errors.push('Invalid input format')
  }

  if (!allowHtml) {
    sanitized = escapeHtml(sanitized)
  }

  result.sanitized = sanitized
  return result
}

/**
 * 用户名验证
 * @param {string} username - 用户名
 * @returns {Object} - 验证结果
 */
export function validateUsername(username) {
  const usernamePattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/

  return validateAndSanitizeInput(username, {
    minLength: 3,
    maxLength: 20,
    required: true,
    pattern: usernamePattern,
  })
}

/**
 * 密码验证
 * @param {string} password - 密码
 * @returns {Object} - 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: true,
    errors: [],
  }

  if (!password) {
    result.isValid = false
    result.errors.push('密码不能为空')
    return result
  }

  if (password.length < 8) {
    result.isValid = false
    result.errors.push('密码至少需要8个字符')
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false
    result.errors.push('密码必须包含至少一个大写字母')
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false
    result.errors.push('密码必须包含至少一个小写字母')
  }

  if (!/\d/.test(password)) {
    result.isValid = false
    result.errors.push('密码必须包含至少一个数字')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false
    result.errors.push('密码必须包含至少一个特殊字符')
  }

  return result
}

/**
 * 邮箱验证
 * @param {string} email - 邮箱地址
 * @returns {Object} - 验证结果
 */
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return validateAndSanitizeInput(email, {
    maxLength: 254,
    required: true,
    pattern: emailPattern,
  })
}

/**
 * 防止SQL注入 - 基本检查
 * @param {string} input - 用户输入
 * @returns {boolean} - 是否安全
 */
export function checkSqlInjection(input) {
  if (typeof input !== 'string') {
    return true
  }

  const sqlPatterns = [
    /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /(union.*select)/i,
    /(script.*>)/i,
    /('|('')|;|--|\/\*|\*\/)/i,
  ]

  return !sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * 内容过滤 - 移除恶意内容
 * @param {string} content - 内容字符串
 * @returns {string} - 过滤后的内容
 */
export function filterContent(content) {
  if (typeof content !== 'string') {
    return content
  }

  let filtered = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  filtered = filtered.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')

  filtered = filtered.replace(/javascript\s*:/gi, '')

  filtered = filtered.replace(/data\s*:/gi, '')

  return filtered
}

/**
 * 生成安全的随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} - 随机字符串
 */
export function generateSecureRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * 速率限制检查（基于内存存储）
 * @param {string} identifier - 标识符（如IP地址或用户ID）
 * @param {number} maxAttempts - 最大尝试次数
 * @param {number} windowMs - 时间窗口（毫秒）
 * @returns {boolean} - 是否在限制内
 */
const rateLimitStore = new Map()

export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`

  const attempts = rateLimitStore.get(key) || 0

  if (attempts >= maxAttempts) {
    return false
  }

  rateLimitStore.set(key, attempts + 1)

  for (const [mapKey] of rateLimitStore) {
    const keyTime = parseInt(mapKey.split('_')[1]) * windowMs
    if (now - keyTime > windowMs) {
      rateLimitStore.delete(mapKey)
    }
  }

  return true
}

export const validateInput = (value, rules = {}) => {
  const errors = []
  
  if (!value && rules.required) {
    errors.push('This field is required')
    return { isValid: false, errors }
  }
  
  const stringValue = String(value || '').trim()
  
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`)
  }
  
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`)
  }
  
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.patternMessage || 'Invalid format')
  }
  
  if (rules.allowHtml !== true) {
    const cleanValue = sanitizeHtml(stringValue)
    if (cleanValue !== stringValue) {
      errors.push('HTML content is not allowed')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: rules.allowHtml ? stringValue : sanitizeHtml(stringValue)
  }
}

export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

const cleanupExpiredRecords = () => {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.firstAttempt > oneHour) {
      rateLimitStore.delete(key)
    }
  }
}
