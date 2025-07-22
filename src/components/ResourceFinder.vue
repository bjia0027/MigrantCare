<template>
  <div class="resource-finder">
    <div class="container mt-4">
      <!-- Header Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              <i class="fas fa-search-location me-3"></i>
              资源查找中心
            </h1>
            <p class="lead text-muted">快速找到您附近的医疗机构、社区服务和支持资源</p>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="search-card">
            <h3 class="mb-4">
              <i class="fas fa-map-marker-alt text-primary me-2"></i>
              位置搜索
            </h3>
            <div class="row">
              <div class="col-md-8">
                <div class="input-group mb-3">
                  <span class="input-group-text">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="输入您的邮编或地址..."
                    v-model="searchLocation"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <select class="form-select" v-model="selectedCategory">
                  <option value="">所有类型</option>
                  <option value="hospital">医院</option>
                  <option value="clinic">诊所</option>
                  <option value="pharmacy">药房</option>
                  <option value="community">社区中心</option>
                  <option value="legal">法律援助</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary btn-lg" @click="searchResources">
              <i class="fas fa-search me-2"></i>
              搜索资源
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Categories -->
      <div class="row mb-5">
        <div class="col-12">
          <h3 class="mb-4">快速分类</h3>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('hospital')">
            <div class="category-icon">
              <i class="fas fa-hospital text-danger"></i>
            </div>
            <h5>医院</h5>
            <p>公立和私立医院，急诊服务</p>
            <span class="badge bg-danger">{{ hospitals.length }} 个</span>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('clinic')">
            <div class="category-icon">
              <i class="fas fa-user-md text-primary"></i>
            </div>
            <h5>诊所</h5>
            <p>全科医生，专科门诊</p>
            <span class="badge bg-primary">{{ clinics.length }} 个</span>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('pharmacy')">
            <div class="category-icon">
              <i class="fas fa-pills text-success"></i>
            </div>
            <h5>药房</h5>
            <p>处方药品，非处方药物</p>
            <span class="badge bg-success">{{ pharmacies.length }} 个</span>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('community')">
            <div class="category-icon">
              <i class="fas fa-users text-warning"></i>
            </div>
            <h5>社区中心</h5>
            <p>社区服务，文化活动</p>
            <span class="badge bg-warning">{{ communityServices.length }} 个</span>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('legal')">
            <div class="category-icon">
              <i class="fas fa-balance-scale text-info"></i>
            </div>
            <h5>法律援助</h5>
            <p>移民法律咨询，法律援助</p>
            <span class="badge bg-info">{{ legalServices.length }} 个</span>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="category-card" @click="filterByCategory('emergency')">
            <div class="category-icon">
              <i class="fas fa-ambulance text-danger"></i>
            </div>
            <h5>紧急服务</h5>
            <p>24小时急救，紧急联系</p>
            <span class="badge bg-danger">24/7</span>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div class="row" v-if="filteredResults.length > 0">
        <div class="col-12">
          <h3 class="mb-4">
            搜索结果
            <span class="text-muted">({{ filteredResults.length }} 个)</span>
          </h3>
        </div>
        <div class="col-lg-6 mb-4" v-for="resource in filteredResults" :key="resource.id">
          <div class="resource-card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title">{{ resource.name }}</h5>
                  <p class="card-subtitle text-muted">{{ resource.type }}</p>
                </div>
                <span class="badge" :class="getBadgeClass(resource.type)">
                  {{ getTypeLabel(resource.type) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="resource-info">
                <div class="info-item">
                  <i class="fas fa-map-marker-alt text-primary me-2"></i>
                  <span>{{ resource.address }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-phone text-success me-2"></i>
                  <span>{{ resource.phone }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock text-warning me-2"></i>
                  <span>{{ resource.hours }}</span>
                </div>
                <div class="info-item" v-if="resource.distance">
                  <i class="fas fa-route text-info me-2"></i>
                  <span>距离: {{ resource.distance }}</span>
                </div>
              </div>
              <div class="resource-actions mt-3">
                <button class="btn btn-primary btn-sm me-2">
                  <i class="fas fa-directions me-1"></i>
                  导航
                </button>
                <button class="btn btn-outline-secondary btn-sm me-2">
                  <i class="fas fa-star me-1"></i>
                  收藏
                </button>
                <button class="btn btn-outline-info btn-sm">
                  <i class="fas fa-info-circle me-1"></i>
                  详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="row" v-else-if="searchPerformed">
        <div class="col-12">
          <div class="no-results text-center">
            <i class="fas fa-search text-muted mb-3"></i>
            <h4>未找到相关资源</h4>
            <p class="text-muted">请尝试更改搜索条件或选择其他分类</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchLocation = ref('')
const selectedCategory = ref('')
const searchPerformed = ref(false)

// Sample data - in real app this would come from an API
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

const filteredResults = computed(() => {
  if (!selectedCategory.value) {
    return resources.value
  }
  return resources.value.filter((resource) => resource.type === selectedCategory.value)
})

const hospitals = computed(() => resources.value.filter((r) => r.type === 'hospital'))
const clinics = computed(() => resources.value.filter((r) => r.type === 'clinic'))
const pharmacies = computed(() => resources.value.filter((r) => r.type === 'pharmacy'))
const communityServices = computed(() => resources.value.filter((r) => r.type === 'community'))
const legalServices = computed(() => resources.value.filter((r) => r.type === 'legal'))

const searchResources = () => {
  searchPerformed.value = true
  // In a real app, this would trigger an API call
  console.log('Searching for:', searchLocation.value, 'Category:', selectedCategory.value)
}

const filterByCategory = (category) => {
  selectedCategory.value = category
  searchPerformed.value = true
}

const getBadgeClass = (type) => {
  const classes = {
    hospital: 'bg-danger',
    clinic: 'bg-primary',
    pharmacy: 'bg-success',
    community: 'bg-warning',
    legal: 'bg-info',
    emergency: 'bg-dark',
  }
  return classes[type] || 'bg-secondary'
}

const getTypeLabel = (type) => {
  const labels = {
    hospital: '医院',
    clinic: '诊所',
    pharmacy: '药房',
    community: '社区',
    legal: '法律',
    emergency: '急救',
  }
  return labels[type] || type
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
