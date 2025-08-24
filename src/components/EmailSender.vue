<template>
  <div class="email-sender container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">{{ texts.emailSender }}</h2>
      <button 
        type="button" 
        class="btn-close" 
        @click="$emit('close')"
        :aria-label="texts.close"
      ></button>
    </div>

    <!-- 发送模式切换 -->
    <div class="mb-4">
      <div class="btn-group" role="group">
        <button 
          type="button" 
          class="btn" 
          :class="sendMode === 'single' ? 'btn-primary' : 'btn-outline-primary'"
          @click="sendMode = 'single'"
        >
          {{ texts.singleEmail }}
        </button>
        <button 
          type="button" 
          class="btn" 
          :class="sendMode === 'bulk' ? 'btn-primary' : 'btn-outline-primary'"
          @click="sendMode = 'bulk'"
        >
          {{ texts.bulkEmail }}
        </button>
      </div>
    </div>

    <!-- 错误或成功消息 -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="assertive">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="assertive">
      {{ successMessage }}
    </div>

    <!-- 批量发送进度 -->
    <div v-if="bulkProgress.total > 0" class="mb-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ texts.bulkSendProgress }}</h5>
          <div class="progress mb-2">
            <div 
              class="progress-bar" 
              :style="{ width: (bulkProgress.sent / bulkProgress.total * 100) + '%' }"
            >
              {{ bulkProgress.sent }} / {{ bulkProgress.total }}
            </div>
          </div>
          <div class="row text-center">
            <div class="col-md-4">
              <small class="text-success">{{ texts.sent }}: {{ bulkProgress.sent }}</small>
            </div>
            <div class="col-md-4">
              <small class="text-danger">{{ texts.failed }}: {{ bulkProgress.failed }}</small>
            </div>
            <div class="col-md-4">
              <small class="text-muted">{{ texts.remaining }}: {{ bulkProgress.total - bulkProgress.sent - bulkProgress.failed }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendEmail">
      <!-- 收件人 -->
      <div class="mb-3" v-if="sendMode === 'single'">
        <label for="recipient" class="form-label">{{ texts.recipient }}</label>
        <input
          type="email"
          class="form-control"
          id="recipient"
          v-model="emailForm.recipient"
          required
          aria-required="true"
          :placeholder="texts.recipientPlaceholder"
        />
      </div>

      <!-- 批量收件人选择 -->
      <div class="mb-3" v-if="sendMode === 'bulk'">
        <label class="form-label">{{ texts.recipientGroups }}</label>
        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">{{ texts.selectGroups }}</h6>
              </div>
              <div class="card-body">
                <div class="form-check" v-for="group in recipientGroups" :key="group.id">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="'group-' + group.id"
                    v-model="selectedGroups"
                    :value="group.id"
                    @change="updateSelectedRecipients"
                  >
                  <label class="form-check-label" :for="'group-' + group.id">
                    {{ group.name }} ({{ group.count }} {{ texts.people }})
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">{{ texts.selectedRecipients }} ({{ selectedRecipients.length }})</h6>
              </div>
              <div class="card-body" style="max-height: 200px; overflow-y: auto;">
                <div v-if="selectedRecipients.length === 0" class="text-muted">
                  {{ texts.noRecipientsSelected }}
                </div>
                <div v-else>
                  <small class="d-block mb-1" v-for="recipient in selectedRecipients.slice(0, 10)" :key="recipient.email">
                    {{ recipient.name }} ({{ recipient.email }})
                  </small>
                  <small v-if="selectedRecipients.length > 10" class="text-muted">
                    {{ texts.andMore.replace('{count}', selectedRecipients.length - 10) }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板选择 -->
      <div class="mb-3" v-if="sendMode === 'bulk'">
        <label for="template" class="form-label">{{ texts.emailTemplate }}</label>
        <select 
          class="form-select" 
          id="template"
          v-model="selectedTemplate"
          @change="applyTemplate"
        >
          <option value="">{{ texts.selectTemplate }}</option>
          <option v-for="template in emailTemplates" :key="template.id" :value="template.id">
            {{ template.name }}
          </option>
        </select>
      </div>

      <!-- 主题 -->
      <div class="mb-3">
        <label for="subject" class="form-label">{{ texts.subject }}</label>
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            id="subject"
            v-model="emailForm.subject"
            required
            aria-required="true"
            :placeholder="texts.subjectPlaceholder"
          />
          <button 
            v-if="sendMode === 'bulk'" 
            type="button" 
            class="btn btn-outline-secondary"
            @click="showVariableHelper = !showVariableHelper"
          >
            {{ texts.variables }}
          </button>
        </div>
      </div>

      <!-- 变量帮助 -->
      <div v-if="showVariableHelper && sendMode === 'bulk'" class="mb-3">
        <div class="card bg-light">
          <div class="card-body">
            <h6 class="card-title">{{ texts.availableVariables }}</h6>
            <div class="row">
              <div class="col-md-6">
                <small class="d-block"><code>{{name}}</code> - {{ texts.recipientName }}</small>
                <small class="d-block"><code>{{email}}</code> - {{ texts.recipientEmail }}</small>
                <small class="d-block"><code>{{phone}}</code> - {{ texts.recipientPhone }}</small>
              </div>
              <div class="col-md-6">
                <small class="d-block"><code>{{date}}</code> - {{ texts.currentDate }}</small>
                <small class="d-block"><code>{{time}}</code> - {{ texts.currentTime }}</small>
                <small class="d-block"><code>{{sender}}</code> - {{ texts.senderName }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 正文 -->
      <div class="mb-3">
        <label for="body" class="form-label">{{ texts.body }}</label>
        <textarea
          class="form-control"
          id="body"
          v-model="emailForm.body"
          rows="8"
          required
          aria-required="true"
          :placeholder="texts.bodyPlaceholder"
        ></textarea>
      </div>

      <!-- 附件 -->
      <div class="mb-3">
        <label for="attachment" class="form-label">{{ texts.attachment }}</label>
        <input
          type="file"
          class="form-control"
          id="attachment"
          @change="handleFileUpload"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        />
        <small class="form-text text-muted">{{ texts.attachmentLimit }}</small>
      </div>

      <!-- 已选择的文件列表 -->
      <div v-if="selectedFiles.length > 0" class="mb-3">
        <h5>{{ texts.selectedFiles }}</h5>
        <ul class="list-group">
          <li v-for="(file, index) in selectedFiles" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <i class="fas fa-file me-2"></i>
              {{ file.name }} ({{ formatFileSize(file.size) }})
            </div>
            <button type="button" class="btn btn-sm btn-danger" @click="removeFile(index)">
              <i class="fas fa-times"></i>
            </button>
          </li>
        </ul>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-3">
        <label>{{ texts.uploadProgress }}: {{ uploadProgress }}%</label>
        <div class="progress">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            :style="{ width: uploadProgress + '%' }"
            :aria-valuenow="uploadProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="text-center">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          :disabled="sending || selectedFiles.length === 0"
        >
          <span v-if="sending" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ texts.sendEmail }}
        </button>
      </div>
    </form>

    <!-- 发送历史记录 -->
    <div v-if="emailHistory.length > 0" class="mt-5">
      <h3>{{ texts.emailHistory }}</h3>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>{{ texts.recipient }}</th>
              <th>{{ texts.subject }}</th>
              <th>{{ texts.sentAt }}</th>
              <th>{{ texts.status }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(email, index) in emailHistory" :key="index">
              <td>{{ email.recipient }}</td>
              <td>{{ email.subject }}</td>
              <td>{{ formatDate(email.sentAt) }}</td>
              <td>
                <span :class="`badge ${email.status === 'success' ? 'bg-success' : 'bg-danger'}`">
                  {{ email.status === 'success' ? texts.success : texts.failed }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import apiClient from '../utils/apiClient'

// Props for language support
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
  preselectedRecipients: {
    type: Array,
    default: () => []
  }
})

const authStore = useAuthStore()

const emailForm = ref({
  recipient: '',
  subject: '',
  body: ''
})

// 批量邮件相关数据
const sendMode = ref('single') // 'single' 或 'bulk'
const selectedGroups = ref([])
const selectedRecipients = ref([])
const selectedTemplate = ref('')
const showVariableHelper = ref(false)
const bulkProgress = ref({
  total: 0,
  sent: 0,
  failed: 0,
  inProgress: false
})

// 收件人群组数据
const recipientGroups = ref([
  { id: 'all_users', name: '所有用户', count: 0 },
  { id: 'forum_active', name: '论坛活跃用户', count: 0 },
  { id: 'appointment_users', name: '预约用户', count: 0 },
  { id: 'new_users', name: '新注册用户', count: 0 }
])

// 邮件模板数据
const emailTemplates = ref([
  {
    id: 'welcome',
    name: '欢迎邮件',
    subject: '欢迎加入 MigrantCare - {{name}}',
    body: '亲爱的 {{name}}，\n\n欢迎加入 MigrantCare 社区！我们很高兴您成为我们大家庭的一员。\n\n在这里，您可以：\n- 预约各种服务\n- 参与社区讨论\n- 获取最新资讯\n\n如有任何问题，请随时联系我们。\n\n祝好，\nMigrantCare 团队\n{{date}}'
  },
  {
    id: 'appointment_reminder',
    name: '预约提醒',
    subject: '预约提醒 - {{name}}',
    body: '亲爱的 {{name}}，\n\n这是您预约的提醒通知。\n\n请确保按时参加您的预约。如需更改或取消，请提前联系我们。\n\n感谢您的配合！\n\nMigrantCare 团队\n{{date}}'
  },
  {
    id: 'newsletter',
    name: '社区通讯',
    subject: 'MigrantCare 社区通讯 - {{date}}',
    body: '亲爱的 {{name}}，\n\n欢迎阅读本期 MigrantCare 社区通讯！\n\n本期亮点：\n- 社区最新动态\n- 服务更新信息\n- 用户故事分享\n\n感谢您对社区的支持！\n\nMigrantCare 团队\n{{date}}'
  }
])

const selectedFiles = ref([])
const uploadProgress = ref({})
const sending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailHistory = ref([])

const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files.length) return

  let totalSize = selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    totalSize += file.size
    
    if (totalSize > 10 * 1024 * 1024) {
      errorMessage.value = texts.value.fileSizeExceeded
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }
    
    selectedFiles.value.push(file)
  }
  event.target.value = ''
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

// 批量邮件相关方法
const toggleSendMode = (mode) => {
  sendMode.value = mode
  if (mode === 'single') {
    selectedGroups.value = []
    selectedRecipients.value = []
    selectedTemplate.value = ''
    showVariableHelper.value = false
  }
}

const updateSelectedRecipients = async () => {
  try {
    // 模拟获取选中群组的用户数据
    const recipients = []
    
    for (const groupId of selectedGroups.value) {
      // 这里应该调用 API 获取实际的用户数据
      // 现在使用模拟数据
      const mockUsers = generateMockUsers(groupId)
      recipients.push(...mockUsers)
    }
    
    // 去重
    const uniqueRecipients = recipients.filter((recipient, index, self) => 
      index === self.findIndex(r => r.email === recipient.email)
    )
    
    selectedRecipients.value = uniqueRecipients
  } catch (error) {
    console.error('获取收件人失败:', error)
    errorMessage.value = '获取收件人列表失败'
  }
}

const generateMockUsers = (groupId) => {
  const mockData = {
    'all_users': [
      { name: '张三', email: 'zhang@example.com', phone: '123-456-7890' },
      { name: '李四', email: 'li@example.com', phone: '123-456-7891' },
      { name: '王五', email: 'wang@example.com', phone: '123-456-7892' }
    ],
    'forum_active': [
      { name: '张三', email: 'zhang@example.com', phone: '123-456-7890' },
      { name: '李四', email: 'li@example.com', phone: '123-456-7891' }
    ],
    'appointment_users': [
      { name: '王五', email: 'wang@example.com', phone: '123-456-7892' }
    ],
    'new_users': [
      { name: '赵六', email: 'zhao@example.com', phone: '123-456-7893' }
    ]
  }
  
  return mockData[groupId] || []
}

const applyTemplate = () => {
  const template = emailTemplates.value.find(t => t.id === selectedTemplate.value)
  if (template) {
    emailForm.value.subject = template.subject
    emailForm.value.body = template.body
  }
}

const replaceVariables = (text, recipient) => {
  const now = new Date()
  const variables = {
    name: recipient.name || recipient.email,
    email: recipient.email,
    phone: recipient.phone || '',
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    sender: authStore.user?.name || 'MigrantCare 团队'
  }
  
  let result = text
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, variables[key])
  })
  
  return result
}

// 处理预选收件人
watch(() => props.preselectedRecipients, (newRecipients) => {
  if (newRecipients && newRecipients.length > 0) {
    // 自动切换到批量模式
    sendMode.value = 'bulk'
    // 设置预选收件人
    selectedRecipients.value = newRecipients.map(recipient => ({
      email: recipient.email,
      name: recipient.name || recipient.email,
      phone: recipient.phone || ''
    }))
  }
}, { immediate: true })

// 组件挂载时处理预选收件人
onMounted(() => {
  if (props.preselectedRecipients && props.preselectedRecipients.length > 0) {
    sendMode.value = 'bulk'
    selectedRecipients.value = props.preselectedRecipients.map(recipient => ({
      email: recipient.email,
      name: recipient.name || recipient.email,
      phone: recipient.phone || ''
    }))
  }
})

const sendBulkEmail = async () => {
  if (selectedRecipients.value.length === 0) {
    errorMessage.value = '请选择收件人'
    return
  }
  
  try {
    // 生成请求 ID
    const requestId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 准备附件数据
    const attachments = selectedFiles.value.map(file => ({
      filename: file.name,
      type: file.type,
      path: file.path // 假设文件已上传到 Firebase Storage
    }))
    
    // 准备收件人数据
    const recipients = selectedRecipients.value.map(recipient => ({
      email: recipient.email,
      name: recipient.name,
      phone: recipient.phone || ''
    }))
    
    // 初始化进度
    bulkProgress.value = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      inProgress: true,
      currentBatch: 0,
      totalBatches: Math.ceil(recipients.length / 10)
    }
    
    // 调用批量邮件 API
    const response = await apiClient.sendBulkEmail({
      recipients,
      subject: emailForm.value.subject,
      body: emailForm.value.body,
      attachments,
      batchSize: 10,
      delayBetweenBatches: 2000,
      requestId
    })
    
    if (response.success) {
      // 开始轮询进度
      const pollProgress = async () => {
        try {
          const progressResponse = await apiClient.getBulkEmailProgress(requestId)
          if (progressResponse.success) {
             const progress = progressResponse.progress
            bulkProgress.value = {
              total: progress.total,
              sent: progress.sent,
              failed: progress.failed,
              inProgress: progress.inProgress,
              currentBatch: progress.currentBatch || 0,
              totalBatches: progress.totalBatches || Math.ceil(progress.total / 10)
            }
            
            if (progress.inProgress) {
              // 继续轮询
              setTimeout(pollProgress, 2000)
            } else {
              // 完成
               if (progress.failed === 0) {
                 successMessage.value = texts.value.bulkEmailSuccess
               } else {
                 successMessage.value = `${texts.value.bulkEmailPartialSuccess} (成功: ${progress.sent}, 失败: ${progress.failed})`
               }
               
               // 清空表单
               emailForm.value.to = ''
               emailForm.value.subject = ''
               emailForm.value.body = ''
               selectedFiles.value = []
               selectedGroups.value = []
               selectedRecipients.value = []
            }
          }
        } catch (progressError) {
           console.error('获取进度失败:', progressError)
           bulkProgress.value.inProgress = false
           errorMessage.value = texts.value.bulkEmailError
         }
      }
      
      // 开始轮询
      setTimeout(pollProgress, 1000)
      
    } else {
      throw new Error(response.error || '批量邮件发送失败')
    }
    
  } catch (error) {
       console.error('批量邮件发送失败:', error)
       errorMessage.value = error.message || texts.value.bulkEmailError
       bulkProgress.value.inProgress = false
     }
}

const sendEmail = async () => {
  if (!authStore.isLoggedIn) {
    errorMessage.value = texts.value.loginRequired
    return
  }
  
  // 批量发送模式
  if (sendMode.value === 'bulk') {
    await sendBulkEmail()
    return
  }
  
  // 单封邮件发送模式
   sending.value = true
   errorMessage.value = ''
   successMessage.value = ''
  
  try {
    const storage = getStorage()
    const uploadTasks = []
    const fileMetadata = []
    
    for (const file of selectedFiles.value) {
      const fileId = uuidv4()
      const fileExtension = file.name.split('.').pop()
      const filePath = `attachments/${authStore.user.uid}/${fileId}.${fileExtension}`
      const fileRef = storageRef(storage, filePath)
      
      const uploadTask = uploadBytesResumable(fileRef, file)
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          uploadProgress.value = Math.round(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          errorMessage.value = texts.value.uploadError
          sending.value = false
        }
      )
      
      uploadTasks.push(uploadTask.then(() => getDownloadURL(fileRef)))
      
      fileMetadata.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      })
    }
    
    const downloadURLs = await Promise.all(uploadTasks)
    const emailData = {
      recipient: emailForm.value.recipient,
      subject: emailForm.value.subject,
      body: emailForm.value.body,
      attachments: fileMetadata.map((meta, index) => ({
        ...meta,
        url: downloadURLs[index]
      })),
      userId: authStore.user.uid,
      requestId: uuidv4() // 用于幂等性检查
    }
    
    // 使用统一的API客户端发送邮件
    const result = await apiClient.sendEmail(emailData)
    
    emailHistory.value.unshift({
      recipient: emailForm.value.recipient,
      subject: emailForm.value.subject,
      sentAt: Date.now(),
      status: 'success',
      messageId: result.messageId
    })
    
    successMessage.value = `${texts.value.emailSent} (ID: ${result.messageId})`
    
    emailForm.value = {
      recipient: '',
      subject: '',
      body: ''
    }
    selectedFiles.value = []
    
  } catch (error) {
    console.error('Email sending error:', error)
    errorMessage.value = error.message || texts.value.sendingFailed
    
    emailHistory.value.unshift({
      recipient: emailForm.value.recipient,
      subject: emailForm.value.subject,
      sentAt: Date.now(),
      status: 'failed'
    })
  } finally {
    sending.value = false
    uploadProgress.value = 0
  }
}
const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        emailSender: '邮件发送',
        singleEmail: '单封邮件',
        bulkEmail: '批量邮件',
        recipient: '收件人',
        recipientPlaceholder: '请输入收件人邮箱',
        recipientGroups: '收件人群组',
        selectGroups: '选择群组',
        selectedRecipients: '已选择收件人',
        noRecipientsSelected: '未选择收件人',
        people: '人',
        andMore: '还有 {count} 人...',
        emailTemplate: '邮件模板',
        selectTemplate: '选择模板',
        variables: '变量',
        availableVariables: '可用变量',
        recipientName: '收件人姓名',
        recipientEmail: '收件人邮箱',
        recipientPhone: '收件人电话',
        currentDate: '当前日期',
        currentTime: '当前时间',
        senderName: '发送者姓名',
        bulkSendProgress: '批量发送进度',
        sent: '已发送',
        failed: '失败',
        remaining: '剩余',
        subject: '主题',
        subjectPlaceholder: '请输入邮件主题',
        body: '正文',
        bodyPlaceholder: '请输入邮件内容',
        attachment: '附件',
        attachmentLimit: '最大附件大小：10MB',
        selectedFiles: '已选择的文件',
        uploadProgress: '上传进度',
        sendEmail: '发送邮件',
        emailHistory: '发送历史',
        sentAt: '发送时间',
        status: '状态',
        success: '成功',
        emailSent: '邮件发送成功',
        sendingFailed: '邮件发送失败',
        uploadError: '文件上传失败',
        fileSizeExceeded: '附件总大小不能超过10MB',
        noFilesSelected: '请选择至少一个附件',
        loginRequired: '请先登录再发送邮件',
        bulkEmailSuccess: '批量邮件发送成功！',
        bulkEmailPartialSuccess: '批量邮件发送完成',
        bulkEmailError: '批量邮件发送失败，请重试',
        close: '关闭'
      }
    : {
        emailSender: 'Email Sender',
        singleEmail: 'Single Email',
        bulkEmail: 'Bulk Email',
        recipient: 'Recipient',
        recipientPlaceholder: 'Enter recipient email',
        recipientGroups: 'Recipient Groups',
        selectGroups: 'Select Groups',
        selectedRecipients: 'Selected Recipients',
        noRecipientsSelected: 'No recipients selected',
        people: 'people',
        andMore: 'and {count} more...',
        emailTemplate: 'Email Template',
        selectTemplate: 'Select Template',
        variables: 'Variables',
        availableVariables: 'Available Variables',
        recipientName: 'Recipient Name',
        recipientEmail: 'Recipient Email',
        recipientPhone: 'Recipient Phone',
        currentDate: 'Current Date',
        currentTime: 'Current Time',
        senderName: 'Sender Name',
        bulkSendProgress: 'Bulk Send Progress',
        sent: 'Sent',
        failed: 'Failed',
        remaining: 'Remaining',
        subject: 'Subject',
        subjectPlaceholder: 'Enter email subject',
        body: 'Body',
        bodyPlaceholder: 'Enter email content',
        attachment: 'Attachment',
        attachmentLimit: 'Maximum attachment size: 10MB',
        selectedFiles: 'Selected Files',
        uploadProgress: 'Upload Progress',
        sendEmail: 'Send Email',
        emailHistory: 'Sending History',
        sentAt: 'Sent At',
        status: 'Status',
        success: 'Success',
        emailSent: 'Email sent successfully',
        sendingFailed: 'Failed to send email',
        uploadError: 'File upload failed',
        fileSizeExceeded: 'Total attachment size cannot exceed 10MB',
        noFilesSelected: 'Please select at least one attachment',
        loginRequired: 'Please login before sending emails',
        bulkEmailSuccess: 'Bulk email sent successfully!',
        bulkEmailPartialSuccess: 'Bulk email completed',
        bulkEmailError: 'Failed to send bulk email, please try again',
        close: 'Close'
      }
})
</script>

<style scoped>
.email-sender {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress {
  height: 20px;
}
</style>