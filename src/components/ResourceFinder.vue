<template>
  <div class="resource-finder">
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="skip-link" @click="skipToMainContent">
      {{ texts.skipToMainContent }}
    </a>
    
    <div class="container-fluid">
      <!-- 页面标题 -->
      <header class="row mb-4">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              {{ texts.findResources }}
            </h1>
            <p class="lead text-muted">{{ texts.findResourcesDesc }}</p>
          </div>
        </div>
      </header>

      <!-- 搜索栏 -->
      <section class="row mb-4" aria-labelledby="search-section">
        <div class="col-12">
          <h2 id="search-section" class="visually-hidden">{{ texts.searchSection }}</h2>
          <div class="search-container">
            <div class="row align-items-end">
              <div class="col-md-4">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="locationSearch"
                    v-model="searchLocation"
                    :placeholder="texts.searchPlaceholder"
                    :aria-label="texts.searchPlaceholder"
                    @keyup.enter="searchResources"
                  />
                  <label for="locationSearch">{{ texts.currentLocation }}</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating">
                  <select 
                    class="form-select" 
                    id="radiusSelect" 
                    v-model="searchRadius"
                    :aria-label="texts.searchRadius"
                  >
                    <option value="1">1km</option>
                    <option value="5">5km</option>
                    <option value="10">10km</option>
                    <option value="20">20km</option>
                  </select>
                  <label for="radiusSelect">{{ texts.searchRadius }}</label>
                </div>
              </div>
              <div class="col-md-3">
                <button 
                  class="btn btn-primary btn-lg w-100" 
                  @click="searchResources"
                  :aria-label="texts.searchButtonAriaLabel"
                >
                  {{ texts.searchButton }}
                </button>
              </div>
              <div class="col-md-2">
                <button 
                  class="btn btn-outline-secondary btn-lg w-100" 
                  @click="getCurrentLocation"
                  :aria-label="texts.getCurrentLocationAriaLabel"
                  :disabled="gettingLocation"
                >
                  <span v-if="gettingLocation" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ gettingLocation ? texts.locating : texts.useCurrentLocation }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <!-- 地图和侧边栏布局 -->
      <main id="main-content" class="row" tabindex="-1">
        <!-- 地图区域 -->
        <div class="col-lg-8 col-md-7 mb-4">
          <div class="map-container" role="application" :aria-label="texts.mapAriaLabel">
            <div id="map" class="map-view" ref="mapContainer"></div>
            
            <!-- 地图控制按钮 -->
            <div class="map-controls">
              <button 
                class="btn btn-light btn-sm" 
                @click="zoomIn"
                :aria-label="texts.zoomIn"
                title="Zoom In"
              >
                <i class="fas fa-plus" aria-hidden="true"></i>
              </button>
              <button 
                class="btn btn-light btn-sm" 
                @click="zoomOut"
                :aria-label="texts.zoomOut"
                title="Zoom Out"
              >
                <i class="fas fa-minus" aria-hidden="true"></i>
              </button>
              <button 
                class="btn btn-light btn-sm" 
                @click="resetView"
                :aria-label="texts.resetView"
                title="Reset View"
              >
                <i class="fas fa-home" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 侧边栏列表 -->
        <aside class="col-lg-4 col-md-5">
          <div class="sidebar-container">
            <div class="sidebar-header">
              <h3 class="h5 mb-3">{{ texts.searchResults }} ({{ filteredResources.length }})</h3>
              
              <!-- 路线规划面板 -->
              <div v-if="showRoutePanel" class="route-panel mb-3">
                <h4 class="h6">{{ texts.routePlanning }}</h4>
                <div class="route-options mb-2">
                  <div class="btn-group" role="group" :aria-label="texts.routeMode">
                    <input type="radio" class="btn-check" id="driving" v-model="routeMode" value="driving">
                    <label class="btn btn-outline-primary btn-sm" for="driving">{{ texts.driving }}</label>
                    
                    <input type="radio" class="btn-check" id="walking" v-model="routeMode" value="walking">
                    <label class="btn btn-outline-primary btn-sm" for="walking">{{ texts.walking }}</label>
                  </div>
                </div>
                
                <div v-if="currentRoute" class="route-info">
                  <p class="small mb-1"><strong>{{ texts.distance }}:</strong> {{ currentRoute.distance }}</p>
                  <p class="small mb-1"><strong>{{ texts.duration }}:</strong> {{ currentRoute.duration }}</p>
                  <button class="btn btn-sm btn-outline-secondary" @click="copyRouteInstructions">
                    {{ texts.copyInstructions }}
                  </button>
                </div>
              </div>
              
              <!-- 行程单管理 -->
              <div class="itinerary-panel mb-3">
                <h4 class="h6">{{ texts.itinerary }}</h4>
                <div class="d-flex gap-2 mb-2">
                  <button class="btn btn-sm btn-outline-success" @click="saveItinerary">
                    {{ texts.saveItinerary }}
                  </button>
                  <button class="btn btn-sm btn-outline-info" @click="loadItinerary">
                    {{ texts.loadItinerary }}
                  </button>
                </div>
                <div v-if="savedLocations.length > 0" class="saved-locations">
                  <p class="small mb-1">{{ texts.savedLocations }} ({{ savedLocations.length }})</p>
                </div>
              </div>
            </div>
            
            <!-- 资源列表 -->
            <div class="sidebar-content" role="region" :aria-label="texts.resourceList">
              <div v-if="filteredResources.length > 0" class="resource-list">
                <div
                  v-for="(resource, index) in filteredResources"
                  :key="resource.id"
                  class="resource-item"
                  :class="{ 'highlighted': highlightedResource === resource.id }"
                  @mouseenter="highlightMarker(resource.id)"
                  @mouseleave="unhighlightMarker(resource.id)"
                  @click="selectResource(resource)"
                  @keydown.enter="selectResource(resource)"
                  @keydown.space.prevent="selectResource(resource)"
                  tabindex="0"
                  role="button"
                  :aria-label="`${resource.name}, ${resource.type}, ${resource.distance}`"
                >
                  <div class="resource-header">
                    <h5 class="resource-title">{{ resource.name }}</h5>
                    <span class="resource-type badge" :class="getCategoryClass(resource.type)">
                      {{ getCategoryName(resource.type) }}
                    </span>
                  </div>
                  <div class="resource-details">
                    <div class="detail-item">
                      <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                      <span>{{ resource.address }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-phone" aria-hidden="true"></i>
                      <span>{{ resource.phone }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-clock" aria-hidden="true"></i>
                      <span>{{ resource.hours }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-route" aria-hidden="true"></i>
                      <span>{{ resource.distance }}</span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <button 
                      class="btn btn-sm btn-outline-primary me-2"
                      @click.stop="getDirections(resource)"
                      :aria-label="`${texts.getDirections} ${resource.name}`"
                    >
                      <i class="fas fa-directions" aria-hidden="true"></i>
                      {{ texts.getDirections }}
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-success me-2"
                      @click.stop="addToItinerary(resource)"
                      :aria-label="`${texts.addToItinerary} ${resource.name}`"
                    >
                      <i class="fas fa-plus" aria-hidden="true"></i>
                      {{ texts.addToItinerary }}
                    </button>
                  </div>
                  
                  <!-- 评分组件 -->
                  <RatingComponent
                    v-if="currentUser && currentUser.username"
                    :target-id="`resource-${resource.id}`"
                    :target-type="'resource'"
                    :interactive="true"
                    :current-user="currentUser"
                    class="mt-2"
                  />
                </div>
              </div>
              
              <!-- 空状态 -->
              <div v-else class="empty-state text-center py-4">
                <i class="fas fa-search fa-3x text-muted mb-3" aria-hidden="true"></i>
                <h4 class="text-muted">{{ texts.noResourcesFound }}</h4>
                <p class="text-muted">{{ texts.tryDifferentSearch }}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import RatingComponent from './RatingComponent.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

// Reactive variables
const searchLocation = ref('')
const selectedCategory = ref('')
const searchPerformed = ref(false)
const searchRadius = ref(5)
const gettingLocation = ref(false)
const showRoutePanel = ref(false)
const routeMode = ref('driving')
const currentRoute = ref(null)
const highlightedResource = ref(null)
const savedLocations = ref([])
const userLocation = ref(null)

// Map related
const mapContainer = ref(null)
let map = null
let markers = []
let routeControl = null
let userMarker = null

const resourceCategories = ref([
  { type: '', name: '全部类型' },
  { type: 'hospital', name: '医院' },
  { type: 'clinic', name: '诊所' },
  { type: 'pharmacy', name: '药房' },
  { type: 'community', name: '社区中心' },
  { type: 'legal', name: '法律援助' },
])
const resources = ref([
  {
    id: 1,
    name: '墨尔本皇家医院',
    type: 'hospital',
    address: '300 Grattan Street, Parkville VIC 3050',
    phone: '(03) 9342 7000',
    hours: '24小时急诊',
    distance: '2.5km',
    lat: -37.7983,
    lng: 144.9564,
    services: ['急诊', '内科', '外科', '儿科']
  },
  {
    id: 2,
    name: '家庭医疗中心',
    type: 'clinic',
    address: '123 Collins Street, Melbourne VIC 3000',
    phone: '(03) 9123 4567',
    hours: '周一至周五 8:00-18:00',
    distance: '1.2km',
    lat: -37.8136,
    lng: 144.9631,
    services: ['全科医生', '健康检查', '疫苗接种']
  },
  {
    id: 3,
    name: 'Chemist Warehouse',
    type: 'pharmacy',
    address: '456 Burke Street, Melbourne VIC 3000',
    phone: '(03) 9234 5678',
    hours: '每日 8:00-22:00',
    distance: '0.8km',
    lat: -37.8142,
    lng: 144.9652,
    services: ['处方药', '非处方药', '健康咨询']
  },
  {
    id: 4,
    name: '华人社区中心',
    type: 'community',
    address: '789 Little Bourke Street, Melbourne VIC 3000',
    phone: '(03) 9345 6789',
    hours: '周一至周五 9:00-17:00',
    distance: '1.5km',
    lat: -37.8118,
    lng: 144.9648,
    services: ['语言服务', '文化活动', '社区支持']
  },
  {
    id: 5,
    name: '移民援助中心',
    type: 'legal',
    address: '321 Queen Street, Melbourne VIC 3000',
    phone: '(03) 9456 7890',
    hours: '周一至周五 9:00-17:00',
    distance: '2.1km',
    lat: -37.8124,
    lng: 144.9612,
    services: ['法律咨询', '签证服务', '移民指导']
  },
  {
    id: 6,
    name: 'St Vincent\'s Hospital',
    type: 'hospital',
    address: '41 Victoria Parade, Fitzroy VIC 3065',
    phone: '(03) 9231 2211',
    hours: '24小时急诊',
    distance: '3.2km',
    lat: -37.8099,
    lng: 144.9749,
    services: ['急诊', '心脏科', '神经科']
  },
  {
    id: 7,
    name: 'Priceline Pharmacy',
    type: 'pharmacy',
    address: '200 Bourke Street, Melbourne VIC 3000',
    phone: '(03) 9654 3210',
    hours: '周一至周六 8:00-21:00',
    distance: '1.0km',
    lat: -37.8136,
    lng: 144.9685,
    services: ['处方药', '美容产品', '健康检查']
  }
])

const filteredResources = computed(() => {
  if (!selectedCategory.value) {
    return resources.value
  }
  return resources.value.filter((resource) => resource.type === selectedCategory.value)
})

const texts = computed(() => {
  const translations = {
    zh: {
      findResources: '资源查找中心',
      findResourcesDesc: '快速找到您附近的医疗机构、社区服务和支持资源',
      skipToMainContent: '跳到主要内容',
      searchSection: '搜索区域',
      currentLocation: '当前位置',
      searchPlaceholder: '输入您的邮编或地址...',
      searchRadius: '搜索半径',
      searchButton: '搜索资源',
      searchButtonAriaLabel: '搜索附近的资源',
      useCurrentLocation: '当前位置',
      getCurrentLocationAriaLabel: '获取当前地理位置',
      locating: '定位中...',
      selectResourceType: '选择资源类型',
      searchResults: '搜索结果',
      mapAriaLabel: '显示资源位置的交互式地图',
      zoomIn: '放大地图',
      zoomOut: '缩小地图',
      resetView: '重置地图视图',
      routePlanning: '路线规划',
      routeMode: '出行方式',
      driving: '驾车',
      walking: '步行',
      distance: '距离',
      duration: '时长',
      copyInstructions: '复制路线',
      itinerary: '行程单',
      saveItinerary: '保存行程',
      loadItinerary: '加载行程',
      savedLocations: '已保存地点',
      resourceList: '资源列表',
      address: '地址：',
      phone: '电话：',
      hours: '营业时间：',
      getDirections: '获取路线',
      addToItinerary: '添加到行程',
      rate: '评分',
      reviewRating: '查看评分',
      noResourcesFound: '未找到相关资源',
      tryDifferentSearch: '请尝试更改搜索条件或选择其他分类',
      locationError: '无法获取位置信息',
      routeError: '无法计算路线',
      itinerarySaved: '行程已保存',
      itineraryLoaded: '行程已加载',
      locationAdded: '已添加到行程单'
    },
    en: {
      findResources: 'Resource Finder Center',
      findResourcesDesc: 'Quickly find nearby medical facilities, community services and support resources',
      skipToMainContent: 'Skip to main content',
      searchSection: 'Search section',
      currentLocation: 'Current Location',
      searchPlaceholder: 'Enter your postcode or address...',
      searchRadius: 'Search Radius',
      searchButton: 'Search Resources',
      searchButtonAriaLabel: 'Search for nearby resources',
      useCurrentLocation: 'Current Location',
      getCurrentLocationAriaLabel: 'Get current geographic location',
      locating: 'Locating...',
      selectResourceType: 'Select Resource Type',
      searchResults: 'Search Results',
      mapAriaLabel: 'Interactive map showing resource locations',
      zoomIn: 'Zoom in map',
      zoomOut: 'Zoom out map',
      resetView: 'Reset map view',
      routePlanning: 'Route Planning',
      routeMode: 'Travel mode',
      driving: 'Driving',
      walking: 'Walking',
      distance: 'Distance',
      duration: 'Duration',
      copyInstructions: 'Copy Route',
      itinerary: 'Itinerary',
      saveItinerary: 'Save Itinerary',
      loadItinerary: 'Load Itinerary',
      savedLocations: 'Saved Locations',
      resourceList: 'Resource list',
      address: 'Address:',
      phone: 'Phone:',
      hours: 'Hours:',
      getDirections: 'Get Directions',
      addToItinerary: 'Add to Itinerary',
      rate: 'Rate',
      reviewRating: 'Review Rating',
      noResourcesFound: 'No resources found',
      tryDifferentSearch: 'Please try changing search criteria or selecting other categories',
      locationError: 'Unable to get location information',
      routeError: 'Unable to calculate route',
      itinerarySaved: 'Itinerary saved',
      itineraryLoaded: 'Itinerary loaded',
      locationAdded: 'Added to itinerary'
    },
  }
  return translations[props.lang] || translations.zh
})

// Map initialization
const initMap = async () => {
  await nextTick()
  if (!mapContainer.value) return
  
  try {
    // Initialize map centered on Melbourne
    map = L.map(mapContainer.value).setView([-37.8136, 144.9631], 13)
    
    // Add OpenStreetMap tiles with error handling
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      retryUrl: true,
      timeout: 10000
    })
    
    tileLayer.on('tileerror', (e) => {
      console.warn('Tile loading error:', e)
    })
    
    tileLayer.addTo(map)
    
    // Add markers for resources
    addResourceMarkers()
    
    // Try to get user location (but don't block if it fails)
    setTimeout(() => {
      getCurrentLocation()
    }, 1000)
  } catch (error) {
    console.error('Map initialization error:', error)
  }
}

// Add resource markers to map
const addResourceMarkers = () => {
  clearMarkers()
  
  filteredResources.value.forEach(resource => {
    const icon = getMarkerIcon(resource.type)
    const marker = L.marker([resource.lat, resource.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <div class="marker-popup">
          <h6>${resource.name}</h6>
          <p class="small mb-1">${resource.address}</p>
          <p class="small mb-1">${resource.phone}</p>
          <p class="small mb-0">${resource.hours}</p>
        </div>
      `)
    
    marker.resourceId = resource.id
    markers.push(marker)
    
    // Add click event
    marker.on('click', () => selectResource(resource))
  })
}

// Get custom marker icon based on resource type
const getMarkerIcon = (type) => {
  const iconMap = {
    hospital: '🏥',
    clinic: '🏥',
    pharmacy: '💊',
    community: '🏢',
    legal: '⚖️'
  }
  
  return L.divIcon({
    html: `<div class="custom-marker ${type}">${iconMap[type] || '📍'}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  })
}

// Clear all markers
const clearMarkers = () => {
  markers.forEach(marker => map.removeLayer(marker))
  markers = []
}

// Get current location
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser')
    return
  }
  
  gettingLocation.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      try {
        const { latitude, longitude } = position.coords
        userLocation.value = { lat: latitude, lng: longitude }
        
        // Add user marker
        if (userMarker && map) {
          map.removeLayer(userMarker)
        }
        
        if (map) {
          userMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: '<div class="user-marker">📍</div>',
              className: 'user-div-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 20]
            })
          }).addTo(map).bindPopup('您的位置')
          
          // Update search location
          searchLocation.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          
          // Center map on user location
          map.setView([latitude, longitude], 15)
        }
        
        gettingLocation.value = false
      } catch (error) {
        console.error('Error processing geolocation:', error)
        gettingLocation.value = false
      }
    },
    (error) => {
      console.warn('Geolocation error:', error.message || error)
      // Don't show alert for geolocation errors, just log them
      gettingLocation.value = false
      
      // Handle specific error codes
      switch(error.code) {
        case error.PERMISSION_DENIED:
          console.warn('User denied the request for Geolocation.')
          break
        case error.POSITION_UNAVAILABLE:
          console.warn('Location information is unavailable.')
          break
        case error.TIMEOUT:
          console.warn('The request to get user location timed out.')
          break
        default:
          console.warn('An unknown error occurred.')
          break
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 600000
    }
  )
}

// Search resources
const searchResources = () => {
  searchPerformed.value = true
  addResourceMarkers()
  console.log('搜索资源:', searchLocation.value, selectedCategory.value, searchRadius.value)
}

// Map controls
const zoomIn = () => {
  if (map) map.zoomIn()
}

const zoomOut = () => {
  if (map) map.zoomOut()
}

const resetView = () => {
  if (map) {
    map.setView([-37.8136, 144.9631], 13)
    addResourceMarkers()
  }
}

// Resource interaction
const selectResource = (resource) => {
  if (map) {
    map.setView([resource.lat, resource.lng], 16)
    
    // Find and open popup for this resource
    const marker = markers.find(m => m.resourceId === resource.id)
    if (marker) {
      marker.openPopup()
    }
  }
}

const highlightMarker = (resourceId) => {
  highlightedResource.value = resourceId
  // Add visual highlight to marker if needed
}

const unhighlightMarker = (resourceId) => {
  if (highlightedResource.value === resourceId) {
    highlightedResource.value = null
  }
}

// Route planning
const getDirections = (resource) => {
  if (!userLocation.value) {
    alert('请先获取当前位置')
    return
  }
  
  showRoutePanel.value = true
  
  // Simulate route calculation
  const distance = calculateDistance(
    userLocation.value.lat, userLocation.value.lng,
    resource.lat, resource.lng
  )
  
  currentRoute.value = {
    distance: `${distance.toFixed(1)}km`,
    duration: routeMode.value === 'driving' ? `${Math.round(distance * 3)}分钟` : `${Math.round(distance * 12)}分钟`,
    instructions: [
      '从当前位置出发',
      `前往 ${resource.name}`,
      `地址: ${resource.address}`
    ]
  }
  
  // Draw route line on map
  if (routeControl) {
    map.removeControl(routeControl)
  }
  
  const routeLine = L.polyline([
    [userLocation.value.lat, userLocation.value.lng],
    [resource.lat, resource.lng]
  ], { color: 'blue', weight: 4 }).addTo(map)
  
  // Fit map to show route
  map.fitBounds(routeLine.getBounds(), { padding: [20, 20] })
}

// Calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Copy route instructions
const copyRouteInstructions = () => {
  if (currentRoute.value) {
    const instructions = [
      `路线: ${currentRoute.value.distance}, ${currentRoute.value.duration}`,
      ...currentRoute.value.instructions
    ].join('\n')
    
    navigator.clipboard.writeText(instructions).then(() => {
      alert('路线已复制到剪贴板')
    })
  }
}

// Itinerary management
const addToItinerary = (resource) => {
  if (!savedLocations.value.find(loc => loc.id === resource.id)) {
    savedLocations.value.push(resource)
    alert(texts.value.locationAdded)
  }
}

const saveItinerary = () => {
  if (savedLocations.value.length > 0) {
    localStorage.setItem('migrantcare-itinerary', JSON.stringify(savedLocations.value))
    alert(texts.value.itinerarySaved)
  }
}

const loadItinerary = () => {
  const saved = localStorage.getItem('migrantcare-itinerary')
  if (saved) {
    savedLocations.value = JSON.parse(saved)
    alert(texts.value.itineraryLoaded)
  }
}

// Accessibility
const skipToMainContent = () => {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
  }
}

// Utility functions
const getCategoryName = (type) => {
  const category = resourceCategories.value.find((cat) => cat.type === type)
  return category ? category.name : type
}

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

// Lifecycle hooks
onMounted(() => {
  // Initialize map with error handling
  try {
    initMap()
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
  
  // Load saved itinerary
  try {
    const saved = localStorage.getItem('migrantcare-itinerary')
    if (saved) {
      savedLocations.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load saved itinerary:', error)
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

/* Search container */
.search-container {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Visually hidden for screen readers */
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Resource categories */
.resource-categories {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-group-responsive .btn {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-group-responsive .btn:hover {
  transform: scale(1.05);
}

/* Map container */
.map-container {
  position: relative;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-view {
  height: 100%;
  width: 100%;
}

/* Map controls */
.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.map-controls .btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Custom markers */
:deep(.custom-marker) {
  font-size: 20px;
  text-align: center;
  line-height: 30px;
  border-radius: 50%;
  background: white;
  border: 2px solid #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(.custom-marker.hospital) {
  border-color: #dc3545;
}

:deep(.custom-marker.clinic) {
  border-color: #007bff;
}

:deep(.custom-marker.pharmacy) {
  border-color: #28a745;
}

:deep(.custom-marker.community) {
  border-color: #ffc107;
}

:deep(.custom-marker.legal) {
  border-color: #17a2b8;
}

:deep(.user-marker) {
  font-size: 16px;
  text-align: center;
  line-height: 20px;
  color: #007bff;
}

/* Marker popup */
:deep(.marker-popup h6) {
  margin-bottom: 8px;
  color: #333;
}

/* Sidebar */
.sidebar-container {
  height: 500px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Route panel */
.route-panel {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.route-info {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Itinerary panel */
.itinerary-panel {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.saved-locations {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Resource items */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-item {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.resource-item:hover,
.resource-item:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
  outline: none;
}

.resource-item.highlighted {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.resource-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.resource-type {
  font-size: 0.8rem;
}

.resource-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.detail-item i {
  width: 20px;
  text-align: center;
  margin-right: 0.5rem;
  color: #999;
}

.resource-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.resource-actions .btn {
  font-size: 0.85rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Focus styles for accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :deep(.custom-marker) {
    border-width: 3px;
  }
  
  .resource-item {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .resource-item,
  .btn-group-responsive .btn,
  .btn {
    transition: none;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .search-container {
    padding: 1rem;
  }

  .map-container {
    height: 300px;
    margin-bottom: 1rem;
  }
  
  .sidebar-container {
    height: auto;
    max-height: 400px;
  }
  
  .map-controls {
    top: 5px;
    right: 5px;
  }
  
  .map-controls .btn {
    width: 35px;
    height: 35px;
  }

  .resource-actions {
    flex-direction: column;
  }

  .resource-actions .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .search-container .row > div {
    margin-bottom: 0.5rem;
  }
  
  .map-container {
    height: 250px;
  }
  
  .sidebar-container {
    max-height: 300px;
  }

  .resource-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Print styles */
@media print {
  .map-controls,
  .btn {
    display: none;
  }
  
  .sidebar-container {
    height: auto;
    overflow: visible;
  }
}
</style>
