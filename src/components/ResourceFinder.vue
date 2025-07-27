<template>
  <div class="resource-finder">
    <div class="container mt-4">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              {{ texts.findResources }}
            </h1>
            <p class="lead text-muted">{{ texts.findResourcesDesc }}</p>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="search-container">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="locationSearch"
                    v-model="searchLocation"
                    :placeholder="texts.searchPlaceholder"
                  />
                  <label for="locationSearch">{{ texts.currentLocation }}</label>
                </div>
              </div>
              <div class="col-md-6 mt-3 mt-md-0">
                <button class="btn btn-primary btn-lg w-100" @click="searchResources">
                  {{ texts.searchButton }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资源类型按钮 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="resource-categories">
            <h5 class="mb-3">{{ texts.selectResourceType }}</h5>
            <div class="btn-group-responsive">
              <button
                v-for="category in resourceCategories"
                :key="category.type"
                class="btn me-2 mb-2"
                :class="selectedCategory === category.type ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedCategory = category.type"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="row" v-if="filteredResources.length > 0">
        <div class="col-12 mb-3">
          <h4>{{ texts.searchResults }} ({{ filteredResources.length }})</h4>
        </div>
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="col-lg-6 col-md-12 mb-4"
        >
          <div class="resource-card h-100">
            <div class="resource-header">
              <h5 class="resource-title">{{ resource.name }}</h5>
              <span class="resource-type badge" :class="getCategoryClass(resource.type)">
                {{ getCategoryName(resource.type) }}
              </span>
            </div>
            <div class="resource-details">
              <div class="detail-item">
                <strong>{{ texts.address }}</strong> {{ resource.address }}
              </div>
              <div class="detail-item">
                <strong>{{ texts.phone }}</strong> {{ resource.phone }}
              </div>
              <div class="detail-item">
                <strong>{{ texts.hours }}</strong> {{ resource.hours }}
              </div>
              <div class="detail-item">
                <strong>{{ texts.distance }}</strong> {{ resource.distance }}
              </div>
            </div>
            <div class="resource-actions">
              <button class="btn btn-sm btn-outline-primary me-2">
                {{ texts.getDirections }}
              </button>
              <button class="btn btn-sm btn-outline-warning me-2">
                {{ texts.rate }}
              </button>
              <button class="btn btn-sm btn-outline-info">
                {{ texts.reviewRating }}
              </button>
            </div>
            <!-- 评分组件 -->
            <RatingComponent
              v-if="currentUser && currentUser.username"
              :target-id="`resource-${resource.id}`"
              :target-type="'resource'"
              :interactive="true"
              :current-user="currentUser"
              class="mt-3"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="row">
        <div class="col-12">
          <div class="empty-state text-center py-5">
            <div class="empty-icon mb-3 text-muted"></div>
            <h4 class="text-muted">{{ texts.noResourcesFound }}</h4>
            <p class="text-muted">{{ texts.tryDifferentSearch }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RatingComponent from './RatingComponent.vue'

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
const searchLocation = ref('')
const selectedCategory = ref('')
const searchPerformed = ref(false)

// 资源类别数据
const resourceCategories = ref([
  { type: '', name: '全部类型' },
  { type: 'hospital', name: '医院' },
  { type: 'clinic', name: '诊所' },
  { type: 'pharmacy', name: '药房' },
  { type: 'community', name: '社区中心' },
  { type: 'legal', name: '法律援助' },
])

// 资源数据
const resources = ref([
  {
    id: 1,
    name: '墨尔本皇家医院',
    type: 'hospital',
    address: '300 Grattan Street, Parkville VIC 3050',
    phone: '(03) 9342 7000',
    hours: '24小时急诊',
    distance: '2.5km',
  },
  {
    id: 2,
    name: '家庭医疗中心',
    type: 'clinic',
    address: '123 Collins Street, Melbourne VIC 3000',
    phone: '(03) 9123 4567',
    hours: '周一至周五 8:00-18:00',
    distance: '1.2km',
  },
  {
    id: 3,
    name: 'Chemist Warehouse',
    type: 'pharmacy',
    address: '456 Burke Street, Melbourne VIC 3000',
    phone: '(03) 9234 5678',
    hours: '每日 8:00-22:00',
    distance: '0.8km',
  },
  {
    id: 4,
    name: '华人社区中心',
    type: 'community',
    address: '789 Little Bourke Street, Melbourne VIC 3000',
    phone: '(03) 9345 6789',
    hours: '周一至周五 9:00-17:00',
    distance: '1.5km',
  },
  {
    id: 5,
    name: '移民法律援助中心',
    type: 'legal',
    address: '321 Queen Street, Melbourne VIC 3000',
    phone: '(03) 9456 7890',
    hours: '周一至周五 9:00-17:00',
    distance: '2.1km',
  },
])

const filteredResources = computed(() => {
  if (!selectedCategory.value) {
    return resources.value
  }
  return resources.value.filter((resource) => resource.type === selectedCategory.value)
})

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      findResources: '资源查找中心',
      findResourcesDesc: '快速找到您附近的医疗机构、社区服务和支持资源',
      currentLocation: '当前位置',
      searchPlaceholder: '输入您的邮编或地址...',
      searchButton: '搜索资源',
      selectResourceType: '选择资源类型',
      searchResults: '搜索结果',
      address: '地址：',
      phone: '电话：',
      hours: '营业时间：',
      distance: '距离：',
      getDirections: '获取路线',
      rate: '评分',
      reviewRating: '查看评分',
      noResourcesFound: '未找到相关资源',
      tryDifferentSearch: '请尝试更改搜索条件或选择其他分类',
    },
    en: {
      findResources: 'Resource Finder Center',
      findResourcesDesc:
        'Quickly find nearby medical facilities, community services and support resources',
      currentLocation: 'Current Location',
      searchPlaceholder: 'Enter your postcode or address...',
      searchButton: 'Search Resources',
      selectResourceType: 'Select Resource Type',
      searchResults: 'Search Results',
      address: 'Address:',
      phone: 'Phone:',
      hours: 'Hours:',
      distance: 'Distance:',
      getDirections: 'Get Directions',
      rate: 'Rate',
      reviewRating: 'Review Rating',
      noResourcesFound: 'No resources found',
      tryDifferentSearch: 'Please try changing search criteria or selecting other categories',
    },
  }
  return translations[props.lang] || translations.zh
})

// 搜索功能
const searchResources = () => {
  searchPerformed.value = true
  console.log('搜索资源:', searchLocation.value, selectedCategory.value)
}

// 获取类别名称
const getCategoryName = (type) => {
  const category = resourceCategories.value.find((cat) => cat.type === type)
  return category ? category.name : type
}

// 获取类别样式
const getCategoryClass = (type) => {
  const classMap = {
    hospital: 'bg-danger',
    clinic: 'bg-primary',
    pharmacy: 'bg-success',
    community: 'bg-warning',
    legal: 'bg-info',
    emergency: 'bg-danger',
  }
  return classMap[type] || 'bg-secondary'
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

.search-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.resource-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
}

.card-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.card-body {
  padding: 1.5rem;
}

.resource-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.info-item i {
  width: 20px;
  text-align: center;
}

.resource-actions .btn {
  font-size: 0.85rem;
}

.no-results {
  padding: 3rem;
  color: #6c757d;
}

.no-results i {
  font-size: 4rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .search-card {
    padding: 1rem;
  }

  .category-card {
    margin-bottom: 1rem;
  }

  .resource-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .resource-actions .me-2 {
    margin-right: 0 !important;
  }
}
</style>
