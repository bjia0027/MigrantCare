<template>
  <div class="user-manager-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fas fa-users me-2 text-primary"></i>
        {{ texts.userManagement }}
      </h2>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary" 
          @click="refreshUsers"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-sync-alt me-2"></i>
          {{ texts.refresh }}
        </button>
        <button 
          class="btn btn-primary" 
          @click="showAddUserModal = true"
        >
          <i class="fas fa-plus me-2"></i>
          {{ texts.addUser }}
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters-section mb-4">
      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              :placeholder="texts.searchPlaceholder"
            />
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <select class="form-select" v-model="roleFilter">
            <option value="all">{{ texts.allRoles }}</option>
            <option value="admin">{{ texts.admin }}</option>
            <option value="user">{{ texts.user }}</option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <select class="form-select" v-model="statusFilter">
            <option value="all">{{ texts.allStatus }}</option>
            <option value="active">{{ texts.active }}</option>
            <option value="inactive">{{ texts.inactive }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-section">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ texts.loading }}</span>
        </div>
        <p class="mt-2">{{ texts.loadingUsers }}</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ texts.loadError }}: {{ error }}
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <p class="text-muted">{{ texts.noUsers }}</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>{{ texts.avatar }}</th>
              <th>{{ texts.username }}</th>
              <th>{{ texts.email }}</th>
              <th>{{ texts.role }}</th>
              <th>{{ texts.status }}</th>
              <th>{{ texts.joinDate }}</th>
              <th>{{ texts.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.uid">
              <td>
                <img 
                  :src="user.photoURL || '/default-avatar.png'" 
                  :alt="user.username"
                  class="user-avatar"
                  @error="handleImageError"
                />
              </td>
              <td>
                <div class="fw-bold">{{ user.username || user.displayName }}</div>
                <small class="text-muted">{{ user.uid }}</small>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span 
                  class="badge"
                  :class="user.role === 'admin' ? 'bg-warning' : 'bg-primary'"
                >
                  {{ user.role === 'admin' ? texts.admin : texts.user }}
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="user.isActive ? 'bg-success' : 'bg-secondary'"
                >
                  {{ user.isActive ? texts.active : texts.inactive }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-outline-primary"
                    @click="editUser(user)"
                    :title="texts.edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-outline-warning"
                    @click="toggleUserStatus(user)"
                    :title="user.isActive ? texts.deactivate : texts.activate"
                  >
                    <i :class="user.isActive ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger"
                    @click="deleteUser(user)"
                    :title="texts.delete"
                    :disabled="user.role === 'admin' && user.uid === authStore.user?.uid"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <nav v-if="totalPages > 1" aria-label="User pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                {{ texts.first }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                {{ texts.previous }}
              </button>
            </li>
            <li 
              v-for="page in visiblePages" 
              :key="page" 
              class="page-item" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                {{ texts.next }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                {{ texts.last }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- 添加用户模态框 -->
    <div 
      v-if="showAddUserModal" 
      class="modal fade show" 
      style="display: block; background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ texts.addUser }}</h5>
            <button type="button" class="btn-close" @click="closeAddUserModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createUser">
              <div class="mb-3">
                <label for="newUserEmail" class="form-label">{{ texts.email }}</label>
                <input
                  type="email"
                  class="form-control"
                  id="newUserEmail"
                  v-model="newUser.email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="newUserPassword" class="form-label">{{ texts.password }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="newUserPassword"
                  v-model="newUser.password"
                  required
                  minlength="6"
                />
              </div>
              <div class="mb-3">
                <label for="newUserUsername" class="form-label">{{ texts.username }}</label>
                <input
                  type="text"
                  class="form-control"
                  id="newUserUsername"
                  v-model="newUser.username"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="newUserRole" class="form-label">{{ texts.role }}</label>
                <select class="form-select" id="newUserRole" v-model="newUser.role" required>
                  <option value="user">{{ texts.user }}</option>
                  <option value="admin">{{ texts.admin }}</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddUserModal">
              {{ texts.cancel }}
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="createUser"
              :disabled="isCreating"
            >
              <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
              {{ texts.create }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div 
      v-if="showEditUserModal" 
      class="modal fade show" 
      style="display: block; background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ texts.editUser }}</h5>
            <button type="button" class="btn-close" @click="closeEditUserModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateUser">
              <div class="mb-3">
                <label for="editUserEmail" class="form-label">{{ texts.email }}</label>
                <input
                  type="email"
                  class="form-control"
                  id="editUserEmail"
                  v-model="editingUser.email"
                  readonly
                />
              </div>
              <div class="mb-3">
                <label for="editUserUsername" class="form-label">{{ texts.username }}</label>
                <input
                  type="text"
                  class="form-control"
                  id="editUserUsername"
                  v-model="editingUser.username"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="editUserRole" class="form-label">{{ texts.role }}</label>
                <select class="form-select" id="editUserRole" v-model="editingUser.role" required>
                  <option value="user">{{ texts.user }}</option>
                  <option value="admin">{{ texts.admin }}</option>
                </select>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="editUserActive"
                    v-model="editingUser.isActive"
                  />
                  <label class="form-check-label" for="editUserActive">
                    {{ texts.active }}
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditUserModal">
              {{ texts.cancel }}
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="updateUser"
              :disabled="isUpdating"
            >
              <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
              {{ texts.update }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div 
      v-if="showToast" 
      class="toast-container position-fixed top-0 end-0 p-3" 
      style="z-index: 1500; pointer-events: none"
    >
      <div class="toast show" :class="toastClass" style="pointer-events: auto">
        <div class="toast-header">
          <i :class="toastIcon" class="me-2"></i>
          <strong class="me-auto">{{ texts.notification }}</strong>
          <button type="button" class="btn-close" @click="hideToast"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth'
import { auth, db } from '../firebase/config'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const authStore = useAuthStore()

// 响应式数据
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

// 模态框状态
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)

// 用户数据
const newUser = ref({
  email: '',
  password: '',
  username: '',
  role: 'user'
})

const editingUser = ref({})

// Toast 通知
const showToast = ref(false)
const toastMessage = ref('')
const toastClass = ref('')
const toastIcon = ref('')

// 计算属性
const filteredUsers = computed(() => {
  let filtered = users.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      (user.username || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.displayName || '').toLowerCase().includes(query)
    )
  }

  // 角色过滤
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // 状态过滤
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(user => user.isActive === isActive)
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredUsers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const texts = computed(() => {
  return props.lang === 'zh' ? {
    userManagement: '用户管理',
    refresh: '刷新',
    addUser: '添加用户',
    searchPlaceholder: '搜索用户名、邮箱...',
    allRoles: '所有角色',
    admin: '管理员',
    user: '普通用户',
    allStatus: '所有状态',
    active: '活跃',
    inactive: '非活跃',
    loading: '加载中',
    loadingUsers: '正在加载用户列表...',
    loadError: '加载失败',
    noUsers: '暂无用户',
    avatar: '头像',
    username: '用户名',
    email: '邮箱',
    role: '角色',
    status: '状态',
    joinDate: '加入日期',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    activate: '激活',
    deactivate: '停用',
    first: '首页',
    previous: '上一页',
    next: '下一页',
    last: '末页',
    password: '密码',
    cancel: '取消',
    create: '创建',
    editUser: '编辑用户',
    update: '更新',
    notification: '通知',
    userCreated: '用户创建成功',
    userUpdated: '用户更新成功',
    userDeleted: '用户删除成功',
    userStatusChanged: '用户状态已更改',
    createError: '创建用户失败',
    updateError: '更新用户失败',
    deleteError: '删除用户失败',
    confirmDelete: '确定要删除此用户吗？此操作不可撤销。'
  } : {
    userManagement: 'User Management',
    refresh: 'Refresh',
    addUser: 'Add User',
    searchPlaceholder: 'Search username, email...',
    allRoles: 'All Roles',
    admin: 'Admin',
    user: 'User',
    allStatus: 'All Status',
    active: 'Active',
    inactive: 'Inactive',
    loading: 'Loading',
    loadingUsers: 'Loading users...',
    loadError: 'Load Error',
    noUsers: 'No users found',
    avatar: 'Avatar',
    username: 'Username',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    joinDate: 'Join Date',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    activate: 'Activate',
    deactivate: 'Deactivate',
    first: 'First',
    previous: 'Previous',
    next: 'Next',
    last: 'Last',
    password: 'Password',
    cancel: 'Cancel',
    create: 'Create',
    editUser: 'Edit User',
    update: 'Update',
    notification: 'Notification',
    userCreated: 'User created successfully',
    userUpdated: 'User updated successfully',
    userDeleted: 'User deleted successfully',
    userStatusChanged: 'User status changed',
    createError: 'Failed to create user',
    updateError: 'Failed to update user',
    deleteError: 'Failed to delete user',
    confirmDelete: 'Are you sure you want to delete this user? This action cannot be undone.'
  }
})

// 方法
const refreshUsers = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    users.value = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const createUser = async () => {
  if (!newUser.value.email || !newUser.value.password || !newUser.value.username) {
    return
  }
  
  isCreating.value = true
  
  try {
    // 创建 Firebase Auth 用户
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      newUser.value.email, 
      newUser.value.password
    )
    
    // 创建 Firestore 用户文档
    const userDoc = {
      email: newUser.value.email,
      username: newUser.value.username,
      displayName: newUser.value.username,
      role: newUser.value.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await updateDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    
    showToast.value = true
    toastMessage.value = texts.value.userCreated
    toastClass.value = 'bg-success text-white'
    toastIcon.value = 'fas fa-check-circle text-success'
    
    closeAddUserModal()
    refreshUsers()
  } catch (err) {
    console.error('Error creating user:', err)
    showToast.value = true
    toastMessage.value = texts.value.createError + ': ' + err.message
    toastClass.value = 'bg-danger text-white'
    toastIcon.value = 'fas fa-exclamation-circle text-danger'
  } finally {
    isCreating.value = false
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditUserModal.value = true
}

const updateUser = async () => {
  if (!editingUser.value.uid) return
  
  isUpdating.value = true
  
  try {
    const userRef = doc(db, 'users', editingUser.value.uid)
    await updateDoc(userRef, {
      username: editingUser.value.username,
      displayName: editingUser.value.username,
      role: editingUser.value.role,
      isActive: editingUser.value.isActive,
      updatedAt: new Date()
    })
    
    showToast.value = true
    toastMessage.value = texts.value.userUpdated
    toastClass.value = 'bg-success text-white'
    toastIcon.value = 'fas fa-check-circle text-success'
    
    closeEditUserModal()
    refreshUsers()
  } catch (err) {
    console.error('Error updating user:', err)
    showToast.value = true
    toastMessage.value = texts.value.updateError + ': ' + err.message
    toastClass.value = 'bg-danger text-white'
    toastIcon.value = 'fas fa-exclamation-circle text-danger'
  } finally {
    isUpdating.value = false
  }
}

const deleteUser = async (user) => {
  if (!confirm(texts.value.confirmDelete)) return
  
  try {
    // 删除 Firestore 文档
    await deleteDoc(doc(db, 'users', user.uid))
    
    showToast.value = true
    toastMessage.value = texts.value.userDeleted
    toastClass.value = 'bg-success text-white'
    toastIcon.value = 'fas fa-check-circle text-success'
    
    refreshUsers()
  } catch (err) {
    console.error('Error deleting user:', err)
    showToast.value = true
    toastMessage.value = texts.value.deleteError + ': ' + err.message
    toastClass.value = 'bg-danger text-white'
    toastIcon.value = 'fas fa-exclamation-circle text-danger'
  }
}

const toggleUserStatus = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      isActive: !user.isActive,
      updatedAt: new Date()
    })
    
    showToast.value = true
    toastMessage.value = texts.value.userStatusChanged
    toastClass.value = 'bg-info text-white'
    toastIcon.value = 'fas fa-info-circle text-info'
    
    refreshUsers()
  } catch (err) {
    console.error('Error toggling user status:', err)
    showToast.value = true
    toastMessage.value = texts.value.updateError + ': ' + err.message
    toastClass.value = 'bg-danger text-white'
    toastIcon.value = 'fas fa-exclamation-circle text-danger'
  }
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  newUser.value = {
    email: '',
    password: '',
    username: '',
    role: 'user'
  }
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
  editingUser.value = {}
}

const hideToast = () => {
  showToast.value = false
}

const formatDate = (date) => {
  if (!date) return '-'
  
  let dateObj
  if (date.toDate) {
    dateObj = date.toDate()
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    dateObj = new Date(date)
  }
  
  return dateObj.toLocaleDateString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

const handleImageError = (event) => {
  event.target.src = '/default-avatar.png'
}

// 生命周期
onMounted(() => {
  refreshUsers()
})
</script>

<style scoped>
.user-manager-container {
  padding: 1rem;
}

.filters-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.toast {
  min-width: 300px;
}

.pagination {
  margin-top: 1rem;
}

.modal-dialog {
  max-width: 500px;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .user-avatar {
    width: 30px;
    height: 30px;
  }
}
</style>