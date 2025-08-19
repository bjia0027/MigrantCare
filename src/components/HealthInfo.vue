<template>
  <div class="health-info">
    <div class="container mt-4">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              {{ texts.healthInfo }}
            </h1>
            <p class="lead text-muted">{{ texts.healthDesc }}</p>
          </div>
        </div>
      </div>

      <!-- 健康服务卡片 -->
      <div class="row mb-5">
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="health-card text-center h-100">
            <div class="health-icon text-success mb-3"></div>
            <h5>{{ texts.vaccination }}</h5>
            <p>{{ texts.vaccinationDesc }}</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="health-card text-center h-100">
            <div class="health-icon text-primary mb-3"></div>
            <h5>{{ texts.healthCheckup }}</h5>
            <p>{{ texts.healthCheckupDesc }}</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="health-card text-center h-100">
            <div class="health-icon text-warning mb-3"></div>
            <h5>{{ texts.medication }}</h5>
            <p>{{ texts.medicationDesc }}</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="health-card text-center h-100">
            <div class="health-icon text-danger mb-3"></div>
            <h5>{{ texts.emergency }}</h5>
            <p>{{ texts.emergencyDesc }}</p>
          </div>
        </div>
      </div>

      <!-- 疫苗接种信息 -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="info-section">
            <h3 class="section-title mb-4">
              {{ texts.vaccinationInfo }}
            </h3>
            <div class="row">
              <div class="col-lg-8">
                <div class="vaccination-details">
                  <p class="lead">{{ texts.vaccinationLead }}</p>
                  <p>{{ texts.vaccinationDetails }}</p>
                  <div class="vaccination-list">
                    <h5>{{ texts.requiredVaccinations }}</h5>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex align-items-center">
                        <span class="me-3">{{ texts.fluVaccine }}</span>
                      </li>
                      <li class="list-group-item d-flex align-items-center">
                        <span class="me-3">{{ texts.covidVaccine }}</span>
                      </li>
                      <li class="list-group-item d-flex align-items-center">
                        <span class="me-3">{{ texts.hepatitisVaccine }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="info-card">
                  <h5>{{ texts.bookVaccination }}</h5>
                  <p>{{ texts.bookVaccinationDesc }}</p>
                  <button class="btn btn-primary">
                    {{ texts.bookNow }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康检查信息 -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="info-section">
            <h3 class="section-title mb-4">
              {{ texts.healthCheckInfo }}
            </h3>
            <div class="row">
              <div class="col-lg-8">
                <p class="lead">{{ texts.healthCheckLead }}</p>
                <p>{{ texts.healthCheckDetails }}</p>

                <div class="checkup-includes mt-4">
                  <h5>{{ texts.checkupIncludes }}</h5>
                  <div class="row">
                    <div class="col-md-4">
                      <h6>{{ texts.physicalExam }}</h6>
                      <p>{{ texts.physicalExamDesc }}</p>
                    </div>
                    <div class="col-md-4">
                      <h6>{{ texts.chestXray }}</h6>
                      <p>{{ texts.chestXrayDesc }}</p>
                    </div>
                    <div class="col-md-4">
                      <h6>{{ texts.bloodTest }}</h6>
                      <p>{{ texts.bloodTestDesc }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <!-- 评分组件 -->
                <RatingComponent
                  v-if="currentUser && currentUser.username"
                  :target-id="'health-checkup-service'"
                  :target-type="'health-service'"
                  :interactive="true"
                  :current-user="currentUser"
                  class="mb-3"
                />
                <div class="info-card">
                  <h5>{{ texts.scheduleCheckup }}</h5>
                  <p>{{ texts.scheduleCheckupDesc }}</p>
                  <button class="btn btn-success">
                    {{ texts.scheduleNow }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 紧急联系信息 -->
      <div class="row">
        <div class="col-12">
          <div class="emergency-section">
            <h3 class="section-title text-danger mb-4">
              {{ texts.emergencyContacts }}
            </h3>
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="emergency-card">
                  <h5 class="text-danger">{{ texts.emergency911 }}</h5>
                  <p class="emergency-number">{{ texts.call }} 000</p>
                  <p>{{ texts.emergency911Desc }}</p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="emergency-card">
                  <h5 class="text-primary">{{ texts.nurseLine }}</h5>
                  <p class="emergency-number">{{ texts.call }} 1800 022 222</p>
                  <p>{{ texts.nurseLineDesc }}</p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="emergency-card">
                  <h5 class="text-primary">{{ texts.mentalHealth }}</h5>
                  <p class="emergency-number">{{ texts.call }} 13 11 14</p>
                  <p>{{ texts.mentalHealthDesc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

const texts = computed(() => {
  return props.lang === 'zh'
    ? {
        healthInfo: '健康信息中心',
        healthInfoDesc: '获取可靠的健康信息和医疗资源',
        searchPlaceholder: '搜索健康话题...',
        searchButton: '搜索',
        categories: '健康分类',
        general: '常规健康',
        mental: '心理健康',
        womens: '女性健康',
        childrens: '儿童健康',
        seniors: '老年健康',
        emergency: '急救信息',
        featuredArticles: '精选文章',
        readMore: '阅读更多',
        rateArticle: '为文章评分',
        submitRating: '提交评分',
        thankYou: '感谢您的评分！',
        averageRating: '平均评分',
        totalRatings: '总评分数',
        noRatings: '暂无评分',
        ratingSubmitted: '评分已提交',
        ratingError: '评分提交失败，请重试',
        selectRating: '请选择评分',
        ratingSuccess: '评分提交成功！',
      }
    : {
        healthInfo: 'Health Information Center',
        healthInfoDesc: 'Access reliable health information and medical resources',
        searchPlaceholder: 'Search health topics...',
        searchButton: 'Search',
        categories: 'Health Categories',
        general: 'General Health',
        mental: 'Mental Health',
        womens: "Women's Health",
        childrens: "Children's Health",
        seniors: 'Senior Health',
        emergency: 'Emergency Info',
        featuredArticles: 'Featured Articles',
        readMore: 'Read More',
        rateArticle: 'Rate this article',
        submitRating: 'Submit Rating',
        thankYou: 'Thank you for your rating!',
        averageRating: 'Average Rating',
        totalRatings: 'Total Ratings',
        noRatings: 'No ratings yet',
        ratingSubmitted: 'Rating submitted',
        ratingError: 'Failed to submit rating, please try again',
        selectRating: 'Please select a rating',
        ratingSuccess: 'Rating submitted successfully!',
      }
})

const submitRating = async (articleId, rating) => {
  if (!rating) {
    alert(texts.value.selectRating)
    return
  }

  try {
    await ratingComponent.value.submitRating(rating)
    alert(texts.value.ratingSuccess)
  } catch (error) {
    console.error('Rating submission error:', error)
    alert(texts.value.ratingError)
  }
}

const handleInfoRatingSubmitted = (ratingData) => {
  console.log('Health info rating submitted:', ratingData)
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

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e9ecef;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.section-title {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.content-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.exam-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.emergency-card {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 1rem;
  height: 100%;
}

.emergency-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.description {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .info-card {
    margin-bottom: 1rem;
  }

  .content-card {
    padding: 1rem;
  }
}
</style>
