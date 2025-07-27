<template>
  <div class="community-forum">
    <div class="container mt-4">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              {{ texts.communityForum }}
            </h1>
            <p class="lead text-muted">{{ texts.forumDesc }}</p>
          </div>
        </div>
      </div>

      <!-- 论坛统计 -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-primary mb-2"></div>
            <h4>{{ totalMembers }}</h4>
            <p class="text-muted">{{ texts.totalMembers }}</p>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-success mb-2"></div>
            <h4>{{ posts.length }}</h4>
            <p class="text-muted">{{ texts.totalPosts }}</p>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-danger mb-2"></div>
            <h4>{{ totalLikes }}</h4>
            <p class="text-muted">{{ texts.totalLikes }}</p>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card text-center">
            <div class="stat-icon text-warning mb-2"></div>
            <h4>{{ getActiveUsers() }}</h4>
            <p class="text-muted">{{ texts.activeToday }}</p>
          </div>
        </div>
      </div>

      <!-- 发布新帖 -->
      <div class="row mb-4" v-if="currentUser && currentUser.username">
        <div class="col-12">
          <div class="new-post-card">
            <h5>{{ texts.shareThoughts }}</h5>
            <button class="btn btn-primary" @click="showNewPostForm = !showNewPostForm">
              {{ texts.newPost }}
            </button>
          </div>
        </div>
      </div>

      <!-- 新帖表单 -->
      <div class="row mb-4" v-if="showNewPostForm">
        <div class="col-12">
          <div class="new-post-form">
            <h5>{{ texts.createNewPost }}</h5>
            <form @submit.prevent="submitPost">
              <div class="mb-3">
                <label class="form-label">{{ texts.postTitle }}</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newPost.title"
                  :placeholder="texts.enterTitle"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">{{ texts.postContent }}</label>
                <textarea
                  class="form-control"
                  rows="4"
                  v-model="newPost.content"
                  :placeholder="texts.shareExperience"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ texts.category }}</label>
                <select class="form-select" v-model="newPost.category" required>
                  <option value="">{{ texts.selectCategory }}</option>
                  <option value="general">{{ texts.generalDiscussion }}</option>
                  <option value="health">{{ texts.healthTips }}</option>
                  <option value="housing">{{ texts.housing }}</option>
                  <option value="employment">{{ texts.employment }}</option>
                  <option value="education">{{ texts.education }}</option>
                </select>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  {{ texts.publishPost }}
                </button>
                <button type="button" class="btn btn-secondary" @click="cancelNewPost">
                  {{ texts.cancel }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="row">
        <div class="col-12">
          <div class="posts-container">
            <div v-for="post in paginatedPosts" :key="post.id" class="post-card mb-4">
              <div class="post-header">
                <div class="d-flex align-items-center">
                  <div class="user-avatar me-3">
                    <div class="avatar-circle text-primary"></div>
                  </div>
                  <div class="post-meta">
                    <h6 class="mb-0">{{ post.author }}</h6>
                    <small class="text-muted">
                      {{ formatDate(post.createdAt) }} •
                      <span class="category-tag">{{ getCategoryName(post.category) }}</span>
                    </small>
                  </div>
                </div>
              </div>
              <div class="post-content">
                <h5 class="post-title">{{ post.title }}</h5>
                <p class="post-text">{{ post.content }}</p>

                <!-- 评分组件 -->
                <RatingComponent
                  v-if="currentUser && currentUser.username"
                  :target-id="`post-${post.id}`"
                  :target-type="'forum-post'"
                  :interactive="true"
                  :current-user="currentUser"
                  class="mb-3"
                />
              </div>
              <div class="post-actions">
                <div class="action-buttons">
                  <button
                    class="btn btn-sm"
                    :class="post.liked ? 'btn-danger' : 'btn-outline-danger'"
                    @click="toggleLike(post.id)"
                    v-if="currentUser && currentUser.username"
                  >
                    ♥ {{ post.likes }}
                  </button>
                  <button class="btn btn-sm btn-outline-primary" @click="toggleComments(post.id)">
                    💬 {{ post.replies?.length || 0 }}
                  </button>
                  <button class="btn btn-sm btn-outline-secondary">📤 {{ texts.share }}</button>
                </div>
              </div>

              <!-- 评论区域 -->
              <div v-if="post.showComments" class="comments-section mt-3">
                <!-- 现有评论列表 -->
                <div v-if="post.replies && post.replies.length > 0" class="existing-comments mb-3">
                  <h6 class="comments-title">{{ texts.comments }} ({{ post.replies.length }})</h6>
                  <div v-for="reply in post.replies" :key="reply.id" class="comment-item">
                    <div class="d-flex">
                      <div class="comment-avatar me-2">
                        <div class="avatar-circle-small text-secondary">
                          {{ reply.author.charAt(0) }}
                        </div>
                      </div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <strong class="comment-author">{{ reply.author }}</strong>
                          <small class="comment-time text-muted ms-2">{{
                            formatDate(reply.createdAt)
                          }}</small>
                        </div>
                        <p class="comment-text">{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 添加新评论表单 -->
                <div v-if="currentUser && currentUser.username" class="add-comment-form">
                  <h6 class="mb-2">{{ texts.addComment }}</h6>
                  <div class="d-flex">
                    <div class="comment-avatar me-2">
                      <div class="avatar-circle-small text-primary">
                        {{ currentUser.username.charAt(0) }}
                      </div>
                    </div>
                    <div class="comment-input-area flex-grow-1">
                      <textarea
                        v-model="newComments[post.id]"
                        class="form-control comment-textarea"
                        :placeholder="texts.writeComment"
                        rows="2"
                      ></textarea>
                      <div class="comment-actions mt-2">
                        <button
                          class="btn btn-primary btn-sm me-2"
                          @click="submitComment(post.id)"
                          :disabled="!newComments[post.id] || newComments[post.id].trim() === ''"
                        >
                          {{ texts.postComment }}
                        </button>
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          @click="cancelComment(post.id)"
                        >
                          {{ texts.cancel }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 未登录提示 -->
                <div v-else class="login-prompt text-center py-3">
                  <p class="text-muted mb-0">{{ texts.loginToComment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-container" v-if="totalPages > 1">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">
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
                  <button
                    class="page-link"
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  >
                    {{ texts.next }}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RatingComponent from './RatingComponent.vue'
import { validateAndSanitizeInput, filterContent } from '../utils/security.js'

// Props
const props = defineProps({
  currentUser: {
    type: Object,
    default: () => ({ username: 'Guest' }),
  },
  lang: {
    type: String,
    default: 'zh',
  },
})

// 状态数据
const showNewPostForm = ref(false)
const selectedCategory = ref('')
const currentPage = ref(1)
const postsPerPage = 5
const newComments = ref({}) // 管理每个帖子的新评论内容

const newPost = ref({
  title: '',
  category: 'general',
  content: '',
})

// 论坛统计数据
const totalMembers = ref(2345)

const totalLikes = computed(() => {
  return posts.value.reduce((sum, post) => sum + post.likes, 0)
})

const getActiveUsers = () => {
  return Math.floor(totalMembers.value * 0.1) // 假设10%的用户今天活跃
}

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
    replies: [
      {
        id: 1,
        author: 'AussieExpert',
        content:
          'You need to bring your passport and visa documents to the Medicare office. The process usually takes about 2-3 weeks to get your card.',
        createdAt: new Date('2024-01-15'),
      },
    ],
    liked: false,
    showComments: false,
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
    replies: [],
    liked: true,
    showComments: false,
  },
  {
    id: 3,
    title: '关于工作签证延期的问题咨询',
    content:
      '我的工作签证快要到期了，想了解延期的流程。有没有类似经历的朋友可以分享一下经验？需要注意哪些事项？',
    author: '打工人小李',
    category: 'employment',
    createdAt: new Date('2024-01-13'),
    likes: 8,
    replies: [],
    liked: false,
    showComments: false,
  },
])

// 分页相关计算属性
const totalPages = computed(() => Math.ceil(posts.value.length / postsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return posts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      communityForum: '社区论坛',
      forumDesc: '与其他移民朋友分享经验，获得支持和建议',
      totalMembers: '活跃用户',
      totalPosts: '帖子总数',
      totalLikes: '获得点赞',
      activeToday: '今日活跃',
      shareThoughts: '分享您的想法和经验',
      newPost: '发表新帖',
      createNewPost: '创建新帖子',
      postTitle: '标题',
      enterTitle: '请输入帖子标题...',
      postContent: '内容',
      shareExperience: '分享您的经验、问题或建议...',
      category: '分类',
      selectCategory: '选择分类',
      generalDiscussion: '综合讨论',
      healthTips: '健康相关',
      housing: '住房租赁',
      employment: '工作求职',
      education: '教育培训',
      publishPost: '发布帖子',
      cancel: '取消',
      share: '分享',
      previous: '上一页',
      next: '下一页',
      comments: '评论',
      addComment: '添加评论',
      writeComment: '写下您的评论...',
      postComment: '发布评论',
      loginToComment: '请登录以发表评论',
    },
    en: {
      communityForum: 'Community Forum',
      forumDesc: 'Share experiences with other migrants, get support and advice',
      totalMembers: 'Active Users',
      totalPosts: 'Total Posts',
      totalLikes: 'Total Likes',
      activeToday: 'Active Today',
      shareThoughts: 'Share your thoughts and experiences',
      newPost: 'New Post',
      createNewPost: 'Create New Post',
      postTitle: 'Title',
      enterTitle: 'Enter post title...',
      postContent: 'Content',
      shareExperience: 'Share your experience, questions or suggestions...',
      category: 'Category',
      selectCategory: 'Select Category',
      generalDiscussion: 'General Discussion',
      healthTips: 'Health Related',
      housing: 'Housing & Rental',
      employment: 'Employment',
      education: 'Education & Training',
      publishPost: 'Publish Post',
      cancel: 'Cancel',
      share: 'Share',
      previous: 'Previous',
      next: 'Next',
      comments: 'Comments',
      addComment: 'Add Comment',
      writeComment: 'Write your comment...',
      postComment: 'Post Comment',
      loginToComment: 'Please log in to comment',
    },
  }
  return translations[props.lang] || translations.zh
})

// 功能函数
const submitPost = () => {
  if (newPost.value.title && newPost.value.content && newPost.value.category) {
    const post = {
      id: posts.value.length + 1,
      title: filterContent(newPost.value.title),
      content: filterContent(newPost.value.content),
      category: newPost.value.category,
      author: props.currentUser.username,
      createdAt: new Date(),
      likes: 0,
      replies: [],
      liked: false,
      showComments: false,
    }
    posts.value.unshift(post)
    cancelNewPost()
  }
}

const cancelNewPost = () => {
  showNewPostForm.value = false
  newPost.value = {
    title: '',
    category: 'general',
    content: '',
  }
}

const toggleLike = (postId) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    if (post.liked) {
      post.likes--
    } else {
      post.likes++
    }
    post.liked = !post.liked
  }
}

const toggleComments = (postId) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    post.showComments = !post.showComments
    if (post.showComments && !newComments.value[postId]) {
      newComments.value[postId] = '' // 初始化评论输入框
    }
  }
}

const submitComment = (postId) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post && newComments.value[postId] && newComments.value[postId].trim() !== '') {
    const newReply = {
      id: post.replies.length + 1,
      author: props.currentUser.username,
      content: filterContent(newComments.value[postId]),
      createdAt: new Date(),
    }
    post.replies.push(newReply)
    newComments.value[postId] = '' // 清空输入框
  }
}

const cancelComment = (postId) => {
  newComments.value[postId] = '' // 清空输入框
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getCategoryName = (category) => {
  const categoryMap = {
    general: '综合讨论',
    health: '健康相关',
    housing: '住房租赁',
    employment: '工作求职',
    education: '教育培训',
  }
  return categoryMap[category] || category
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

/* 评论相关样式 */
.comments-section {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.comments-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
}

.comment-item {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e9ecef;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-avatar {
  width: 32px;
  height: 32px;
}

.avatar-circle-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  margin-bottom: 0.5rem;
}

.comment-author {
  color: #495057;
  font-size: 0.875rem;
}

.comment-time {
  font-size: 0.75rem;
}

.comment-text {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.add-comment-form {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.comment-textarea {
  resize: vertical;
  min-height: 60px;
}

.comment-actions {
  text-align: right;
}

.login-prompt {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
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

  .comments-section {
    padding: 0.75rem 1rem;
  }

  .comment-item {
    padding: 0.75rem;
  }

  .add-comment-form {
    padding: 0.75rem;
  }
}
</style>
