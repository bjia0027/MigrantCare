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

// 多语言文本
const texts = computed(() => {
  const translations = {
    zh: {
      healthInfo: '健康信息中心',
      healthDesc: '为移民朋友提供全面的健康信息和医疗指导',
      vaccination: '疫苗接种',
      vaccinationDesc: '了解必要的疫苗接种要求和时间安排',
      healthCheckup: '体检指南',
      healthCheckupDesc: '移民体检要求和注意事项详细说明',
      medication: '常用药品',
      medicationDesc: '在澳洲常见病症的用药指导和购买建议',
      emergency: '紧急求助',
      emergencyDesc: '紧急情况下的求助电话和处理流程',
      vaccinationInfo: '疫苗接种信息',
      vaccinationLead: '疫苗接种是保护您和他人健康的重要措施。',
      vaccinationDetails: '根据澳洲卫生部的规定，移民朋友需要完成以下疫苗接种。',
      requiredVaccinations: '必需疫苗',
      fluVaccine: '流感疫苗 - 每年接种一次',
      covidVaccine: 'COVID-19疫苗 - 根据最新政策要求',
      hepatitisVaccine: '乙肝疫苗 - 根据检查结果决定',
      bookVaccination: '预约疫苗接种',
      bookVaccinationDesc: '点击下面的按钮预约疫苗接种服务。',
      bookNow: '立即预约',
      healthCheckInfo: '移民体检指南',
      healthCheckLead: '移民体检是签证申请的重要环节。',
      healthCheckDetails: '体检必须在指定的体检医院进行，检查结果直接影响签证审批。',
      checkupIncludes: '体检项目包括',
      physicalExam: '身体检查',
      physicalExamDesc: '包括身高、体重、血压、心率等基本指标',
      chestXray: '胸部X光',
      chestXrayDesc: '检查肺部健康状况，排除传染性疾病',
      bloodTest: '血液检查',
      bloodTestDesc: 'HIV、梅毒、乙肝等传染病检查',
      scheduleCheckup: '预约体检',
      scheduleCheckupDesc: '联系指定医院预约体检时间。',
      scheduleNow: '预约体检',
      emergencyContacts: '紧急联系方式',
      emergency911: '紧急电话',
      call: '拨打',
      emergency911Desc: '警察、消防、救护车',
      nurseLine: '医疗热线',
      nurseLineDesc: '24小时健康咨询',
      mentalHealth: '心理健康热线',
      mentalHealthDesc: '24小时心理支持服务',
    },
    en: {
      healthInfo: 'Health Information Center',
      healthDesc: 'Comprehensive health information and medical guidance for migrants',
      vaccination: 'Vaccination',
      vaccinationDesc: 'Learn about required vaccinations and scheduling',
      healthCheckup: 'Health Checkup Guide',
      healthCheckupDesc: 'Detailed requirements and notes for migration health checks',
      medication: 'Common Medications',
      medicationDesc:
        'Medication guidance and purchasing advice for common conditions in Australia',
      emergency: 'Emergency Help',
      emergencyDesc: 'Emergency contact numbers and procedures',
      vaccinationInfo: 'Vaccination Information',
      vaccinationLead: 'Vaccination is an important measure to protect your health and others.',
      vaccinationDetails:
        'According to Australian Department of Health regulations, migrants need to complete the following vaccinations.',
      requiredVaccinations: 'Required Vaccinations',
      fluVaccine: 'Flu Vaccine - Annual vaccination',
      covidVaccine: 'COVID-19 Vaccine - According to latest policy requirements',
      hepatitisVaccine: 'Hepatitis B Vaccine - Based on test results',
      bookVaccination: 'Book Vaccination',
      bookVaccinationDesc: 'Click the button below to book vaccination services.',
      bookNow: 'Book Now',
      healthCheckInfo: 'Migration Health Check Guide',
      healthCheckLead: 'Health checks are an important part of visa applications.',
      healthCheckDetails:
        'Health checks must be conducted at designated medical centers, and results directly affect visa approval.',
      checkupIncludes: 'Health Check Includes',
      physicalExam: 'Physical Examination',
      physicalExamDesc:
        'Including height, weight, blood pressure, heart rate and other basic indicators',
      chestXray: 'Chest X-ray',
      chestXrayDesc: 'Check lung health and rule out infectious diseases',
      bloodTest: 'Blood Test',
      bloodTestDesc: 'HIV, syphilis, hepatitis B and other infectious disease testing',
      scheduleCheckup: 'Schedule Health Check',
      scheduleCheckupDesc: 'Contact designated hospitals to schedule health check appointments.',
      scheduleNow: 'Schedule Now',
      emergencyContacts: 'Emergency Contacts',
      emergency911: 'Emergency Services',
      call: 'Call',
      emergency911Desc: 'Police, Fire, Ambulance',
      nurseLine: 'Health Hotline',
      nurseLineDesc: '24-hour health consultation',
      mentalHealth: 'Mental Health Hotline',
      mentalHealthDesc: '24-hour psychological support services',
    },
  }
  return translations[props.lang] || translations.zh
})

// 健康信息评分功能
const handleInfoRatingSubmitted = (ratingData) => {
  console.log('健康信息评分已提交:', ratingData)
  // 这里可以添加提交成功的提示
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
