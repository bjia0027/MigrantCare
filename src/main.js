//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./components/HealthInfo.vue') },
    { path: '/login', component: () => import('./components/LoginForm.vue') },
    { 
      path: '/health', 
      component: () => import('./components/HealthInfo.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/resources', 
      component: () => import('./components/ResourceFinder.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/forum', 
      component: () => import('./components/CommunityForum.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/appointments', 
      component: () => import('./components/AppointmentManager.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/tables', 
      component: () => import('./views/TablesView.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/deployment', 
      component: () => import('./views/DeploymentInfo.vue')
    },
    { 
      path: '/admin', 
      component: () => import('./components/AdminAudit.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.authReady) {
    await authStore.initAuthListener()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    // 如果需要管理员权限但用户不是管理员，重定向到首页
    next('/')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(pinia)
app.use(router)
const authStore = useAuthStore()
authStore.initAuthListener().then(() => {
  app.mount('#app')
})
