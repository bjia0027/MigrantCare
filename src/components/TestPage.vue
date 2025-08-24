<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明Vue应用正在正常工作。</p>
    <div class="status-info">
      <h3>系统状态:</h3>
      <ul>
        <li>Vue应用: ✅ 正常运行</li>
        <li>路由系统: ✅ 正常工作</li>
        <li>当前时间: {{ currentTime }}</li>
        <li>用户认证状态: {{ authStatus }}</li>
      </ul>
    </div>
    <div class="actions">
      <button @click="testClick" class="btn btn-primary">点击测试</button>
      <p v-if="clickCount > 0">按钮已点击 {{ clickCount }} 次</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const currentTime = ref(new Date().toLocaleString())
const clickCount = ref(0)

const authStatus = computed(() => {
  if (authStore.authReady) {
    return authStore.isAuthenticated ? '已登录' : '未登录'
  }
  return '检查中...'
})

const testClick = () => {
  clickCount.value++
  console.log('测试按钮被点击了', clickCount.value, '次')
}

onMounted(() => {
  console.log('测试页面已挂载')
  setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})
</script>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.status-info ul {
  list-style: none;
  padding: 0;
}

.status-info li {
  padding: 0.25rem 0;
}

.actions {
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}
</style>