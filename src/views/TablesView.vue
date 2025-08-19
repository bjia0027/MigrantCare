<template>
  <div class="container py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1>{{ texts.interactiveTables }}</h1>
          <div class="btn-group">
            <button 
              class="btn" 
              :class="lang === 'zh' ? 'btn-primary' : 'btn-outline-primary'"
              @click="setLanguage('zh')"
            >
              中文
            </button>
            <button 
              class="btn" 
              :class="lang === 'en' ? 'btn-primary' : 'btn-outline-primary'"
              @click="setLanguage('en')"
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppointmentTable :lang="lang" />
    
    <ForumPostsTable :lang="lang" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppointmentTable from '../components/AppointmentTable.vue'
import ForumPostsTable from '../components/ForumPostsTable.vue'

const props = defineProps({
  lang: {
    type: String,
    default: 'zh'
  }
})

const lang = ref(props.lang)

watch(() => props.lang, (newLang) => {
  lang.value = newLang
})

const texts = computed(() => {
  return lang.value === 'zh'
    ? {
        interactiveTables: '交互式表格',
      }
    : {
        interactiveTables: 'Interactive Tables',
      }
})

const setLanguage = (newLang) => {
  lang.value = newLang
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>