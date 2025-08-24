// 初始化医生数据的脚本
import { ClinicianAPI } from '../api/clinicianAPI.js'
import { ClinicianModel } from '../models/appointmentModels.js'

// 初始医生数据
const initialDoctors = [
  {
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@migrantcare.com',
    phone: '+61-3-9876-5432',
    timezone: 'Australia/Melbourne',
    businessHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '13:00', enabled: false },
      sunday: { start: '09:00', end: '13:00', enabled: false },
    },
    slotMins: 60,
    specialties: ['General Practice', 'Family Medicine'],
    languages: ['English', 'Mandarin'],
    qualifications: 'MBBS, FRACGP',
    experience: 15,
    bio: 'Dr. Smith specializes in family medicine and has extensive experience working with migrant communities.',
    isActive: true,
  },
  {
    name: 'Dr. Michael Johnson',
    email: 'michael.johnson@migrantcare.com',
    phone: '+61-3-9876-5433',
    timezone: 'Australia/Melbourne',
    businessHours: {
      monday: { start: '08:00', end: '16:00', enabled: true },
      tuesday: { start: '08:00', end: '16:00', enabled: true },
      wednesday: { start: '08:00', end: '16:00', enabled: true },
      thursday: { start: '08:00', end: '16:00', enabled: true },
      friday: { start: '08:00', end: '16:00', enabled: true },
      saturday: { start: '09:00', end: '12:00', enabled: true },
      sunday: { start: '09:00', end: '12:00', enabled: false },
    },
    slotMins: 30,
    specialties: ['Internal Medicine', 'Cardiology'],
    languages: ['English', 'Spanish', 'Arabic'],
    qualifications: 'MBBS, FRACP',
    experience: 12,
    bio: 'Dr. Johnson is a cardiologist with a passion for preventive medicine and community health.',
    isActive: true,
  },
  {
    name: 'Dr. Priya Patel',
    email: 'priya.patel@migrantcare.com',
    phone: '+61-3-9876-5434',
    timezone: 'Australia/Melbourne',
    businessHours: {
      monday: { start: '10:00', end: '18:00', enabled: true },
      tuesday: { start: '10:00', end: '18:00', enabled: true },
      wednesday: { start: '10:00', end: '18:00', enabled: true },
      thursday: { start: '10:00', end: '18:00', enabled: true },
      friday: { start: '10:00', end: '18:00', enabled: true },
      saturday: { start: '08:00', end: '14:00', enabled: true },
      sunday: { start: '08:00', end: '14:00', enabled: false },
    },
    slotMins: 45,
    specialties: ['Pediatrics', "Women's Health"],
    languages: ['English', 'Hindi', 'Gujarati'],
    qualifications: 'MBBS, FRACP (Paediatrics)',
    experience: 8,
    bio: "Dr. Patel specializes in pediatric care and women's health, with a focus on culturally sensitive healthcare.",
    isActive: true,
  },
  {
    name: 'Dr. Ahmed Hassan',
    email: 'ahmed.hassan@migrantcare.com',
    phone: '+61-3-9876-5435',
    timezone: 'Australia/Melbourne',
    businessHours: {
      monday: { start: '07:00', end: '15:00', enabled: true },
      tuesday: { start: '07:00', end: '15:00', enabled: true },
      wednesday: { start: '07:00', end: '15:00', enabled: true },
      thursday: { start: '07:00', end: '15:00', enabled: true },
      friday: { start: '07:00', end: '15:00', enabled: true },
      saturday: { start: '08:00', end: '12:00', enabled: false },
      sunday: { start: '08:00', end: '12:00', enabled: false },
    },
    slotMins: 30,
    specialties: ['Mental Health', 'Psychiatry'],
    languages: ['English', 'Arabic', 'French'],
    qualifications: 'MBBS, FRANZCP',
    experience: 10,
    bio: 'Dr. Hassan is a psychiatrist specializing in mental health support for refugees and migrants.',
    isActive: true,
  },
]

// 初始化函数
export async function initializeDoctors() {
  try {
    console.log('开始初始化医生数据...')

    for (const doctorData of initialDoctors) {
      try {
        // 检查医生是否已存在
        const existingDoctors = await ClinicianAPI.getAllClinicians()
        const exists = existingDoctors.some((doc) => doc.email === doctorData.email)

        if (!exists) {
          // 创建新医生
          const doctor = ClinicianModel.create(doctorData)
          await ClinicianAPI.createClinician(doctor)
          console.log(`已创建医生: ${doctorData.name}`)
        } else {
          console.log(`医生已存在: ${doctorData.name}`)
        }
      } catch (error) {
        console.error(`创建医生 ${doctorData.name} 时出错:`, error)
      }
    }

    console.log('医生数据初始化完成')
  } catch (error) {
    console.error('初始化医生数据时出错:', error)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDoctors()
}
