<template>
  <div class="community-forum">
    <div class="container mt-4">
      <!-- Header Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              <i class="fas fa-comments me-3"></i>
              社区论坛
            </h1>
            <p class="lead text-muted">与其他移民朋友分享经验，获得支持和建议</p>
          </div>
        </div>
      </div>

      <!-- Forum Stats -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users text-primary"></i>
            </div>
            <div class="stat-info">
              <h4>2,345</h4>
              <p>活跃用户</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-comment-dots text-success"></i>
            </div>
            <div class="stat-info">
              <h4>15,678</h4>
              <p>帖子总数</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-heart text-danger"></i>
            </div>
            <div class="stat-info">
              <h4>45,231</h4>
              <p>获得点赞</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock text-warning"></i>
            </div>
            <div class="stat-info">
              <h4>24/7</h4>
              <p>在线支持</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Post Button -->
      <div class="row mb-4">
        <div class="col-12">
          <button class="btn btn-primary btn-lg" @click="showCreatePost = !showCreatePost">
            <i class="fas fa-plus me-2"></i>
            发表新帖
          </button>
        </div>
      </div>

      <!-- Create Post Form -->
      <div class="row mb-5" v-if="showCreatePost">
        <div class="col-12">
          <div class="create-post-card">
            <h4 class="mb-3">
              <i class="fas fa-edit me-2"></i>
              创建新帖子
            </h4>
            <form @submit.prevent="createPost">
              <div class="mb-3">
                <label for="postTitle" class="form-label">标题</label>
                <input
                  type="text"
                  class="form-control"
                  id="postTitle"
                  v-model="newPost.title"
                  placeholder="请输入帖子标题..."
                  required
                />
              </div>
              <div class="mb-3">
                <label for="postCategory" class="form-label">分类</label>
                <select class="form-select" id="postCategory" v-model="newPost.category">
                  <option value="general">综合讨论</option>
                  <option value="health">健康相关</option>
                  <option value="legal">法律咨询</option>
                  <option value="housing">住房租赁</option>
                  <option value="jobs">工作求职</option>
                  <option value="education">教育培训</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="postContent" class="form-label">内容</label>
                <textarea
                  class="form-control"
                  id="postContent"
                  rows="6"
                  v-model="newPost.content"
                  placeholder="分享您的经验、问题或建议..."
                  required
                ></textarea>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane me-1"></i>
                  发布帖子
                </button>
                <button type="button" class="btn btn-secondary" @click="showCreatePost = false">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Categories Filter -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="categories-filter">
            <button
              class="btn category-btn"
              :class="{
                'btn-primary': selectedCategory === '',
                'btn-outline-primary': selectedCategory !== '',
              }"
              @click="selectedCategory = ''"
            >
              全部
            </button>
            <button
              class="btn category-btn"
              :class="{
                'btn-primary': selectedCategory === 'general',
                'btn-outline-primary': selectedCategory !== 'general',
              }"
              @click="selectedCategory = 'general'"
            >
              综合讨论
            </button>
            <button
              class="btn category-btn"
              :class="{
                'btn-primary': selectedCategory === 'health',
                'btn-outline-primary': selectedCategory !== 'health',
              }"
              @click="selectedCategory = 'health'"
            >
              健康相关
            </button>
            <button
              class="btn category-btn"
              :class="{
                'btn-primary': selectedCategory === 'legal',
                'btn-outline-primary': selectedCategory !== 'legal',
              }"
              @click="selectedCategory = 'legal'"
            >
              法律咨询
            </button>
            <button
              class="btn category-btn"
              :class="{
                'btn-primary': selectedCategory === 'housing',
                'btn-outline-primary': selectedCategory !== 'housing',
              }"
              @click="selectedCategory = 'housing'"
            >
              住房租赁
            </button>
          </div>
        </div>
      </div>

      <!-- Forum Posts -->
      <div class="row">
        <div class="col-12">
          <div class="forum-posts">
            <div class="post-card" v-for="post in filteredPosts" :key="post.id">
              <div class="post-header">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="post-user">
                    <div class="user-avatar">
                      <i class="fas fa-user-circle text-primary"></i>
                    </div>
                    <div class="user-info">
                      <h6 class="user-name">{{ post.author }}</h6>
                      <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
                    </div>
                  </div>
                  <span class="badge" :class="getCategoryBadgeClass(post.category)">
                    {{ getCategoryLabel(post.category) }}
                  </span>
                </div>
              </div>
              <div class="post-content">
                <h5 class="post-title">{{ post.title }}</h5>
                <p class="post-text">{{ post.content }}</p>
              </div>
              <div class="post-actions">
                <button class="action-btn" @click="toggleLike(post.id)">
                  <i class="fas fa-heart" :class="{ 'text-danger': post.liked }"></i>
                  <span>{{ post.likes }}</span>
                </button>
                <button class="action-btn">
                  <i class="fas fa-comment"></i>
                  <span>{{ post.comments }}</span>
                </button>
                <button class="action-btn">
                  <i class="fas fa-share"></i>
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showCreatePost = ref(false)
const selectedCategory = ref('')

const newPost = ref({
  title: '',
  category: 'general',
  content: '',
})

// Sample forum posts data
const posts = ref([
  {
    id: 1,
    title: '刚到澳洲，需要办理Medicare卡的流程是什么？',
    content:
      '大家好，我刚刚抵达澳洲，想了解一下办理Medicare卡的具体流程。需要准备哪些材料？大概需要多长时间？谢谢大家！',
    author: '新移民小王',
    category: 'health',
    createdAt: new Date('2024-01-15'),
    likes: 15,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    title: '墨尔本租房经验分享 - 避坑指南',
    content:
      '在墨尔本租房一年多了，想和大家分享一些经验。包括如何找房、看房注意事项、签约要点等。希望对新来的朋友有帮助。',
    author: '澳洲老司机',
    category: 'housing',
    createdAt: new Date('2024-01-14'),
    likes: 32,
    comments: 15,
    liked: true,
  },
  {
    id: 3,
    title: '关于工作签证延期的问题咨询',
    content:
      '我的工作签证快要到期了，想了解延期的流程。有没有类似经历的朋友可以分享一下经验？需要注意哪些事项？',
    author: '忙碌的程序员',
    category: 'legal',
    createdAt: new Date('2024-01-13'),
    likes: 8,
    comments: 12,
    liked: false,
  },
  {
    id: 4,
    title: '推荐几个澳洲找工作的网站',
    content:
      'Seek、Indeed、LinkedIn是最常用的，另外还有一些行业专门的网站。分享给大家，希望大家都能找到心仪的工作！',
    author: 'HR小姐姐',
    category: 'jobs',
    createdAt: new Date('2024-01-12'),
    likes: 45,
    comments: 20,
    liked: false,
  },
])

const filteredPosts = computed(() => {
  if (!selectedCategory.value) {
    return posts.value
  }
  return posts.value.filter((post) => post.category === selectedCategory.value)
})

const createPost = () => {
  if (newPost.value.title && newPost.value.content) {
    const post = {
      id: posts.value.length + 1,
      ...newPost.value,
      author: '当前用户',
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      liked: false,
    }
    posts.value.unshift(post)

    // Reset form
    newPost.value = {
      title: '',
      category: 'general',
      content: '',
    }
    showCreatePost.value = false
  }
}

const toggleLike = (postId) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    post.liked = !post.liked
    post.likes += post.liked ? 1 : -1
  }
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const getCategoryBadgeClass = (category) => {
  const classes = {
    general: 'bg-secondary',
    health: 'bg-success',
    legal: 'bg-warning',
    housing: 'bg-info',
    jobs: 'bg-primary',
    education: 'bg-purple',
  }
  return classes[category] || 'bg-secondary'
}

const getCategoryLabel = (category) => {
  const labels = {
    general: '综合讨论',
    health: '健康相关',
    legal: '法律咨询',
    housing: '住房租赁',
    jobs: '工作求职',
    education: '教育培训',
  }
  return labels[category] || category
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
}

.stat-info h4 {
  margin: 0;
  font-weight: bold;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
}

.create-post-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.categories-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  margin-bottom: 0.5rem;
}

.post-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.post-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.post-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  font-size: 2rem;
  margin-right: 1rem;
}

.user-name {
  margin: 0;
  font-weight: 600;
}

.post-content {
  padding: 1.5rem;
}

.post-title {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.post-text {
  color: #495057;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #007bff;
}

.action-btn i.text-danger {
  color: #dc3545 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .create-post-card {
    padding: 1rem;
  }

  .categories-filter {
    justify-content: center;
  }

  .post-content {
    padding: 1rem;
  }

  .post-header {
    padding: 1rem;
  }

  .post-actions {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }
}
</style>
