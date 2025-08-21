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
                   <button class="btn btn-primary" @click="handleBookVaccination"> 
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
                   <button class="btn btn-success" @click="handleScheduleCheckup"> 
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
import { useAuthStore } from '../stores/auth.js'

// Auth store
const authStore = useAuthStore() 
 
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
         healthDesc: '获取可靠的健康信息和医疗资源', 
         vaccination: '疫苗接种', 
         vaccinationDesc: '了解疫苗接种信息和预约服务', 
         healthCheckup: '健康检查', 
         healthCheckupDesc: '定期健康检查和体检服务', 
         medication: '药物管理', 
         medicationDesc: '药物信息和用药指导', 
         emergency: '急救信息', 
         emergencyDesc: '紧急情况处理和急救知识', 
         vaccinationInfo: '疫苗接种信息', 
         vaccinationLead: '疫苗接种是预防疾病的重要手段', 
         vaccinationDetails: '我们提供各种疫苗接种服务，确保您的健康安全。', 
         requiredVaccinations: '推荐疫苗', 
         fluVaccine: '流感疫苗', 
         covidVaccine: '新冠疫苗', 
         hepatitisVaccine: '肝炎疫苗', 
         bookVaccination: '预约接种', 
         bookVaccinationDesc: '在线预约疫苗接种服务', 
         bookNow: '立即预约', 
         healthCheckInfo: '健康检查信息', 
         healthCheckLead: '定期健康检查有助于早期发现健康问题', 
         healthCheckDetails: '我们提供全面的健康检查服务。', 
         checkupIncludes: '检查项目包括', 
         physicalExam: '体格检查', 
         physicalExamDesc: '全面的身体检查', 
         chestXray: '胸部X光', 
         chestXrayDesc: '肺部健康检查', 
         bloodTest: '血液检查', 
         bloodTestDesc: '血液成分分析', 
         scheduleCheckup: '预约检查', 
         scheduleCheckupDesc: '在线预约健康检查服务', 
         scheduleNow: '立即预约', 
         bookingSuccess: '预约成功！我们会尽快联系您确认预约时间。',
         scheduleSuccess: '预约成功！我们会尽快联系您确认检查时间。',
         loginRequired: '请先登录后再进行预约。',
         emergencyContacts: '紧急联系方式', 
         emergency911: '紧急求助', 
         call: '拨打', 
         emergency911Desc: '紧急情况请立即拨打', 
         searchPlaceholder: '搜索健康话题...', 
         searchButton: '搜索', 
         categories: '健康分类', 
         general: '常规健康', 
         mental: '心理健康', 
         womens: '女性健康', 
         childrens: '儿童健康', 
         seniors: '老年健康', 
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
         healthDesc: 'Access reliable health information and medical resources', 
         vaccination: 'Vaccination', 
         vaccinationDesc: 'Learn about vaccination information and booking services', 
         healthCheckup: 'Health Checkup', 
         healthCheckupDesc: 'Regular health checkups and medical examination services', 
         medication: 'Medication Management', 
         medicationDesc: 'Medication information and usage guidance', 
         emergency: 'Emergency Info', 
         emergencyDesc: 'Emergency response and first aid knowledge', 
         vaccinationInfo: 'Vaccination Information', 
         vaccinationLead: 'Vaccination is an important means of disease prevention', 
         vaccinationDetails: 'We provide various vaccination services to ensure your health and safety.', 
         requiredVaccinations: 'Recommended Vaccines', 
         fluVaccine: 'Flu Vaccine', 
         covidVaccine: 'COVID-19 Vaccine', 
         hepatitisVaccine: 'Hepatitis Vaccine', 
         bookVaccination: 'Book Vaccination', 
         bookVaccinationDesc: 'Online vaccination booking service', 
         bookNow: 'Book Now', 
         healthCheckInfo: 'Health Check Information', 
         healthCheckLead: 'Regular health checks help detect health problems early', 
         healthCheckDetails: 'We provide comprehensive health check services.', 
         checkupIncludes: 'Checkup Includes', 
         physicalExam: 'Physical Examination', 
         physicalExamDesc: 'Comprehensive physical examination', 
         chestXray: 'Chest X-ray', 
         chestXrayDesc: 'Lung health examination', 
         bloodTest: 'Blood Test', 
         bloodTestDesc: 'Blood composition analysis', 
         scheduleCheckup: 'Schedule Checkup', 
         scheduleCheckupDesc: 'Online health checkup booking service', 
         scheduleNow: 'Schedule Now', 
         bookingSuccess: 'Booking successful! We will contact you soon to confirm the appointment time.',
         scheduleSuccess: 'Appointment successful! We will contact you soon to confirm the checkup time.',
         loginRequired: 'Please log in first to make an appointment.', 
         emergencyContacts: 'Emergency Contacts', 
         emergency911: 'Emergency Help', 
         call: 'Call', 
         emergency911Desc: 'Call immediately in emergency situations', 
         searchPlaceholder: 'Search health topics...', 
         searchButton: 'Search', 
         categories: 'Health Categories', 
         general: 'General Health', 
         mental: 'Mental Health', 
         womens: "Women's Health", 
         childrens: "Children's Health", 
         seniors: 'Senior Health', 
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
 
 const handleBookVaccination = () => {
  if (!authStore.isAuthenticated) {
    alert(texts.value.loginRequired)
    return
  }
  alert(texts.value.bookingSuccess || '预约成功！我们会尽快联系您确认预约时间。')
}

const handleScheduleCheckup = () => {
  if (!authStore.isAuthenticated) {
    alert(texts.value.loginRequired)
    return
  }
  alert(texts.value.scheduleSuccess || '预约成功！我们会尽快联系您确认检查时间。')
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
 
 .health-card {
   background: white;
   padding: 2rem;
   border-radius: 1rem;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
   transition: transform 0.3s ease, box-shadow 0.3s ease;
   border: 1px solid #e9ecef;
 }
 
 .health-card:hover {
   transform: translateY(-5px);
   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
 }
 
 .health-icon {
   margin-bottom: 1rem;
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
