<template>
  <div class="data-table-container">
    <h2 class="mb-4">{{ texts.forumPosts }}</h2>

    <!-- 全局搜索 -->
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input
          type="text"
          class="form-control"
          v-model="globalSearch"
          :placeholder="texts.searchAllFields"
          aria-label="Search all fields"
        />
        <button 
          v-if="globalSearch" 
          class="btn btn-outline-secondary" 
          type="button"
          @click="globalSearch = ''"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 列筛选 -->
    <div class="row mb-3">
      <div class="col-md-3 mb-2">
        <label for="titleFilter" class="form-label">{{ texts.title }}</label>
        <input
          type="text"
          class="form-control"
          id="titleFilter"
          v-model="filters.title"
          :placeholder="texts.filterByTitle"
        />
      </div>
      <div class="col-md-3 mb-2">
        <label for="authorFilter" class="form-label">{{ texts.author }}</label>
        <input
          type="text"
          class="form-control"
          id="authorFilter"
          v-model="filters.author"
          :placeholder="texts.filterByAuthor"
        />
      </div>
      <div class="col-md-3 mb-2">
        <label for="categoryFilter" class="form-label">{{ texts.category }}</label>
        <select
          class="form-select"
          id="categoryFilter"
          v-model="filters.category"
        >
          <option value="">{{ texts.all }}</option>
          <option value="health">{{ texts.health }}</option>
          <option value="education">{{ texts.education }}</option>
          <option value="employment">{{ texts.employment }}</option>
          <option value="housing">{{ texts.housing }}</option>
          <option value="community">{{ texts.community }}</option>
        </select>
      </div>
      <div class="col-md-3 mb-2">
        <label for="dateFilter" class="form-label">{{ texts.createdAfter }}</label>
        <input
          type="date"
          class="form-control"
          id="dateFilter"
          v-model="filters.createdAfter"
        />
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="mb-3">
      <label class="form-label">{{ texts.tags }}</label>
      <div class="d-flex flex-wrap gap-2">
        <button 
          v-for="tag in availableTags" 
          :key="tag"
          class="btn btn-sm"
          :class="selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-primary'"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th @click="sort('id')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('id')">
              ID
              <i v-if="sortColumn === 'id'" :class="getSortIconClass('id')"></i>
            </th>
            <th @click="sort('title')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('title')">
              {{ texts.title }}
              <i v-if="sortColumn === 'title'" :class="getSortIconClass('title')"></i>
            </th>
            <th @click="sort('author')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('author')">
              {{ texts.author }}
              <i v-if="sortColumn === 'author'" :class="getSortIconClass('author')"></i>
            </th>
            <th @click="sort('createdAt')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('createdAt')">
              {{ texts.createdAt }}
              <i v-if="sortColumn === 'createdAt'" :class="getSortIconClass('createdAt')"></i>
            </th>
            <th @click="sort('category')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('category')">
              {{ texts.category }}
              <i v-if="sortColumn === 'category'" :class="getSortIconClass('category')"></i>
            </th>
            <th @click="sort('likes')" scope="col" class="sortable" :aria-sort="getSortAriaLabel('likes')">
              {{ texts.likes }}
              <i v-if="sortColumn === 'likes'" :class="getSortIconClass('likes')"></i>
            </th>
            <th scope="col">{{ texts.tags }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredData.length === 0">
            <td colspan="7" class="text-center py-4">
              <div class="empty-state">
                <i class="fas fa-search fa-3x mb-3"></i>
                <p>{{ texts.noResults }}</p>
              </div>
            </td>
          </tr>
          <tr 
            v-for="post in paginatedData" 
            :key="post.id"
            tabindex="0"
            class="table-row"
          >
            <td>{{ post.id }}</td>
            <td>{{ post.title }}</td>
            <td>{{ post.author }}</td>
            <td>{{ formatDate(post.createdAt) }}</td>
            <td>
              <span class="badge bg-info">{{ getCategoryText(post.category) }}</span>
            </td>
            <td>
              <i class="fas fa-heart text-danger"></i> {{ post.likes }}
            </td>
            <td>
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag" 
                  class="badge bg-secondary me-1"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div>
        {{ texts.showing }} {{ startIndex + 1 }}-{{ endIndex }} {{ texts.of }} {{ filteredData.length }} {{ texts.entries }}
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
              <i class="fas fa-angle-double-left"></i>
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fas fa-angle-left"></i>
            </button>
          </li>
          <li 
            v-for="page in visiblePageNumbers" 
            :key="page" 
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fas fa-angle-right"></i>
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
              <i class="fas fa-angle-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
})

const route = useRoute()
const router = useRouter()

const availableTags = [
  'newcomer', 'family', 'healthcare', 'jobs', 'language', 'housing', 
  'education', 'legal', 'culture', 'community'
]

const posts = ref([
  { 
    id: 1, 
    title: '如何找到合适的家庭医生？', 
    author: 'Maria Chen', 
    createdAt: '2023-04-15', 
    category: 'health', 
    likes: 24, 
    tags: ['healthcare', 'newcomer']
  },
  { 
    id: 2, 
    title: '分享我的语言学习经验', 
    author: 'Ahmed Khan', 
    createdAt: '2023-04-18', 
    category: 'education', 
    likes: 36, 
    tags: ['language', 'education']
  },
  { 
    id: 3, 
    title: '求职技巧：如何准备面试', 
    author: 'Carlos Rodriguez', 
    createdAt: '2023-04-20', 
    category: 'employment', 
    likes: 42, 
    tags: ['jobs', 'newcomer']
  },
  { 
    id: 4, 
    title: '租房注意事项和权益保护', 
    author: 'Fatima Ali', 
    createdAt: '2023-04-22', 
    category: 'housing', 
    likes: 31, 
    tags: ['housing', 'legal']
  },
  { 
    id: 5, 
    title: '社区活动：多元文化节', 
    author: 'John Smith', 
    createdAt: '2023-04-25', 
    category: 'community', 
    likes: 18, 
    tags: ['community', 'culture']
  },
  { 
    id: 6, 
    title: '儿童教育资源分享', 
    author: 'Priya Patel', 
    createdAt: '2023-04-28', 
    category: 'education', 
    likes: 29, 
    tags: ['education', 'family']
  },
  { 
    id: 7, 
    title: '心理健康：如何应对文化冲击', 
    author: 'Elena Petrova', 
    createdAt: '2023-05-01', 
    category: 'health', 
    likes: 45, 
    tags: ['healthcare', 'culture']
  },
  { 
    id: 8, 
    title: '移民法律常见问题解答', 
    author: 'David Wong', 
    createdAt: '2023-05-03', 
    category: 'education', 
    likes: 37, 
    tags: ['legal', 'newcomer']
  },
  { 
    id: 9, 
    title: '如何申请政府福利项目', 
    author: 'Sarah Johnson', 
    createdAt: '2023-05-05', 
    category: 'community', 
    likes: 33, 
    tags: ['newcomer', 'legal']
  },
  { 
    id: 10, 
    title: '分享我的创业经历', 
    author: 'Miguel Hernandez', 
    createdAt: '2023-05-08', 
    category: 'employment', 
    likes: 51, 
    tags: ['jobs', 'community']
  },
  { 
    id: 11, 
    title: '冬季健康：预防感冒和流感', 
    author: 'Aisha Mohammed', 
    createdAt: '2023-05-10', 
    category: 'health', 
    likes: 27, 
    tags: ['healthcare', 'family']
  },
  { 
    id: 12, 
    title: '如何帮助孩子适应新学校', 
    author: 'Li Wei', 
    createdAt: '2023-05-12', 
    category: 'education', 
    likes: 39, 
    tags: ['education', 'family']
  },
  { 
    id: 13, 
    title: '远程工作机会分享', 
    author: 'Sophia Garcia', 
    createdAt: '2023-05-15', 
    category: 'employment', 
    likes: 44, 
    tags: ['jobs', 'newcomer']
  },
  { 
    id: 14, 
    title: '社区义工机会', 
    author: 'Omar Hassan', 
    createdAt: '2023-05-18', 
    category: 'community', 
    likes: 22, 
    tags: ['community', 'newcomer']
  },
  { 
    id: 15, 
    title: '紧急医疗服务指南', 
    author: 'Emma Wilson', 
    createdAt: '2023-05-20', 
    category: 'health', 
    likes: 35, 
    tags: ['healthcare', 'newcomer']
  },
  { 
    id: 16, 
    title: '如何提高英语口语', 
    author: 'Raj Singh', 
    createdAt: '2023-05-22', 
    category: 'education', 
    likes: 48, 
    tags: ['language', 'education']
  },
  { 
    id: 17, 
    title: '职业技能培训项目', 
    author: 'Natalia Ivanova', 
    createdAt: '2023-05-25', 
    category: 'employment', 
    likes: 32, 
    tags: ['jobs', 'education']
  },
  { 
    id: 18, 
    title: '经济适用房申请流程', 
    author: 'James Lee', 
    createdAt: '2023-05-28', 
    category: 'housing', 
    likes: 41, 
    tags: ['housing', 'legal']
  },
  { 
    id: 19, 
    title: '社区安全与防范', 
    author: 'Amina Diallo', 
    createdAt: '2023-05-30', 
    category: 'community', 
    likes: 26, 
    tags: ['community', 'family']
  },
  { 
    id: 20, 
    title: '儿童保健服务', 
    author: 'Thomas Brown', 
    createdAt: '2023-06-01', 
    category: 'health', 
    likes: 30, 
    tags: ['healthcare', 'family']
  },
  { 
    id: 21, 
    title: '成人继续教育课程', 
    author: 'Mei Lin', 
    createdAt: '2023-06-03', 
    category: 'education', 
    likes: 25, 
    tags: ['education', 'newcomer']
  },
  { 
    id: 22, 
    title: '简历撰写技巧', 
    author: 'Roberto Silva', 
    createdAt: '2023-06-05', 
    category: 'employment', 
    likes: 38, 
    tags: ['jobs', 'newcomer']
  },
  { 
    id: 23, 
    title: '租房合同注意事项', 
    author: 'Zainab Ahmed', 
    createdAt: '2023-06-08', 
    category: 'housing', 
    likes: 29, 
    tags: ['housing', 'legal']
  },
  { 
    id: 24, 
    title: '社区食品银行资源', 
    author: 'Daniel Kim', 
    createdAt: '2023-06-10', 
    category: 'community', 
    likes: 23, 
    tags: ['community', 'newcomer']
  },
  { 
    id: 25, 
    title: '心理健康资源', 
    author: 'Isabella Martinez', 
    createdAt: '2023-06-12', 
    category: 'health', 
    likes: 47, 
    tags: ['healthcare', 'newcomer']
  },
  { 
    id: 26, 
    title: '语言交换活动', 
    author: 'Yusuf Ali', 
    createdAt: '2023-06-15', 
    category: 'education', 
    likes: 34, 
    tags: ['language', 'community']
  },
  { 
    id: 27, 
    title: '创业资源和支持', 
    author: 'Grace Wang', 
    createdAt: '2023-06-18', 
    category: 'employment', 
    likes: 40, 
    tags: ['jobs', 'community']
  },
  { 
    id: 28, 
    title: '冬季住房保暖技巧', 
    author: 'Mohammed Al-Farsi', 
    createdAt: '2023-06-20', 
    category: 'housing', 
    likes: 21, 
    tags: ['housing', 'newcomer']
  },
  { 
    id: 29, 
    title: '社区艺术项目', 
    author: 'Anna Kowalski', 
    createdAt: '2023-06-22', 
    category: 'community', 
    likes: 28, 
    tags: ['community', 'culture']
  },
  { 
    id: 30, 
    title: '疫苗接种信息', 
    author: 'Samuel Osei', 
    createdAt: '2023-06-25', 
    category: 'health', 
    likes: 43, 
    tags: ['healthcare', 'family']
  },
])

const currentPage = ref(1)
const itemsPerPage = 10
const sortColumn = ref('createdAt')
const sortDirection = ref('desc')
const globalSearch = ref('')
const filters = ref({
  title: '',
  author: '',
  category: '',
  createdAfter: ''
})
const selectedTags = ref([])

let debounceTimeout = null
const debounce = (fn, delay) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(fn, delay)
}

onMounted(() => {
  const { page, sort, dir, search, tags, ...filterParams } = route.query
  
  if (page) currentPage.value = parseInt(page)
  if (sort) sortColumn.value = sort
  if (dir) sortDirection.value = dir
  if (search) globalSearch.value = search
  if (tags) selectedTags.value = tags.split(',')
  
  Object.keys(filterParams).forEach(key => {
    if (key in filters.value) {
      filters.value[key] = filterParams[key]
    }
  })
})

watch([currentPage, sortColumn, sortDirection, globalSearch, filters, selectedTags], () => {
  debounce(() => {
    const query = {
      page: currentPage.value,
      sort: sortColumn.value,
      dir: sortDirection.value
    }
    
    if (globalSearch.value) query.search = globalSearch.value
    if (selectedTags.value.length > 0) query.tags = selectedTags.value.join(',')
    
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) query[key] = value
    })
    
    router.replace({ query })
  }, 300)
}, { deep: true })

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const filteredData = computed(() => {
  let result = [...posts.value]
  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    result = result.filter(item => {
      return Object.entries(item).some(([key, value]) => {
        if (key === 'tags') return false
        return String(value).toLowerCase().includes(searchTerm)
      })
    })
  }
  
  if (filters.value.title) {
    const titleFilter = filters.value.title.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(titleFilter)
    )
  }
  
  if (filters.value.author) {
    const authorFilter = filters.value.author.toLowerCase()
    result = result.filter(item => 
      item.author.toLowerCase().includes(authorFilter)
    )
  }
  
  if (filters.value.category) {
    result = result.filter(item => item.category === filters.value.category)
  }
  
  if (filters.value.createdAfter) {
    const filterDate = new Date(filters.value.createdAfter)
    result = result.filter(item => new Date(item.createdAt) >= filterDate)
  }
  
  if (selectedTags.value.length > 0) {
    result = result.filter(item => 
      selectedTags.value.some(tag => item.tags.includes(tag))
    )
  }
  
  result.sort((a, b) => {
    let valueA = a[sortColumn.value]
    let valueB = b[sortColumn.value]
    
    if (sortColumn.value === 'createdAt') {
      valueA = new Date(valueA)
      valueB = new Date(valueB)
    } 
    else if (sortColumn.value === 'likes' || sortColumn.value === 'id') {
      valueA = Number(valueA)
      valueB = Number(valueB)
    }
    else if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }
    
    if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

const paginatedData = computed(() => {
  const startIdx = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(startIdx, startIdx + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage) || 1
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage, filteredData.value.length)
})

const visiblePageNumbers = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l
  
  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
      range.push(i)
    }
  }
  
  range.forEach(i => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })
  
  return rangeWithDots
})

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
  currentPage.value = 1
}

const getSortIconClass = (column) => {
  if (sortColumn.value !== column) return ''
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

const getSortAriaLabel = (column) => {
  if (sortColumn.value !== column) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(props.lang === 'zh' ? 'zh-CN' : 'en-US')
}

const getCategoryText = (category) => {
  switch (category) {
    case 'health': return texts.value.health
    case 'education': return texts.value.education
    case 'employment': return texts.value.employment
    case 'housing': return texts.value.housing
    case 'community': return texts.value.community
    default: return category
  }
}
const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        forumPosts: '社区帖子',
        searchAllFields: '搜索所有字段',
        title: '标题',
        author: '作者',
        createdAt: '创建时间',
        category: '分类',
        likes: '点赞数',
        tags: '标签',
        all: '全部',
        health: '健康',
        education: '教育',
        employment: '就业',
        housing: '住房',
        community: '社区',
        filterByTitle: '按标题筛选',
        filterByAuthor: '按作者筛选',
        createdAfter: '创建日期晚于',
        noResults: '没有找到匹配的记录',
        showing: '显示',
        of: '共',
        entries: '条记录',
      }
    : {
        forumPosts: 'Forum Posts',
        searchAllFields: 'Search all fields',
        title: 'Title',
        author: 'Author',
        createdAt: 'Created At',
        category: 'Category',
        likes: 'Likes',
        tags: 'Tags',
        all: 'All',
        health: 'Health',
        education: 'Education',
        employment: 'Employment',
        housing: 'Housing',
        community: 'Community',
        filterByTitle: 'Filter by title',
        filterByAuthor: 'Filter by author',
        createdAfter: 'Created after',
        noResults: 'No matching records found',
        showing: 'Showing',
        of: 'of',
        entries: 'entries',
      }
})
</script>

<style scoped>
.data-table-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.empty-state {
  color: #6c757d;
}

.table-row {
  cursor: pointer;
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-row:focus {
  outline: 2px solid #0d6efd;
  outline-offset: -2px;
}

@media (max-width: 768px) {
  .data-table-container {
    padding: 1rem;
  }
  
  /* 在小屏幕上将表格转换为卡片视图 */
  .table-responsive {
    overflow-x: auto;
  }
}
</style>