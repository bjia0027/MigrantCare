<template>
  <div class="email-sender container mt-4">
    <h2 class="mb-4">{{ texts.emailSender }}</h2>

    <!-- 错误或成功消息 -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="assertive">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="assertive">
      {{ successMessage }}
    </div>

    <form @submit.prevent="sendEmail">
      <!-- 收件人 -->
      <div class="mb-3">
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

      <!-- 主题 -->
      <div class="mb-3">
        <label for="subject" class="form-label">{{ texts.subject }}</label>
        <input
          type="text"
          class="form-control"
          id="subject"
          v-model="emailForm.subject"
          required
          aria-required="true"
          :placeholder="texts.subjectPlaceholder"
        />
      </div>

      <!-- 正文 -->
      <div class="mb-3">
        <label for="body" class="form-label">{{ texts.body }}</label>
        <textarea
          class="form-control"
          id="body"
          v-model="emailForm.body"
          rows="6"
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

// Props for language support
const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const authStore = useAuthStore()

const emailForm = ref({
  recipient: '',
  subject: '',
  body: '',
})

const selectedFiles = ref([])
const uploadProgress = ref(0)
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

const sendEmail = async () => {
  if (!authStore.isLoggedIn) {
    errorMessage.value = texts.value.loginRequired
    return
  }
  
  if (selectedFiles.value.length === 0) {
    errorMessage.value = texts.value.noFilesSelected
    return
  }
  
  sending.value = true
  errorMessage.value = ''
  successMessage.value = ''
  uploadProgress.value = 0
  
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
    
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await authStore.user.getIdToken()}`
      },
      body: JSON.stringify(emailData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || texts.value.sendingFailed)
    }
    
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
        recipient: '收件人',
        recipientPlaceholder: '请输入收件人邮箱',
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
        failed: '失败',
        emailSent: '邮件发送成功',
        sendingFailed: '邮件发送失败',
        uploadError: '文件上传失败',
        fileSizeExceeded: '附件总大小不能超过10MB',
        noFilesSelected: '请选择至少一个附件',
        loginRequired: '请先登录再发送邮件'
      }
    : {
        emailSender: 'Email Sender',
        recipient: 'Recipient',
        recipientPlaceholder: 'Enter recipient email',
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
        failed: 'Failed',
        emailSent: 'Email sent successfully',
        sendingFailed: 'Failed to send email',
        uploadError: 'File upload failed',
        fileSizeExceeded: 'Total attachment size cannot exceed 10MB',
        noFilesSelected: 'Please select at least one attachment',
        loginRequired: 'Please login before sending emails'
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