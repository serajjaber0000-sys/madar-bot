<template>
  <AppLayout>
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-left">
          <h1 class="page-title">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
              <circle cx="10" cy="10" r="8.5"/>
              <path d="M10 6v4l2.5 2.5"/>
            </svg>
            لوحة تحكم مدير النظام
          </h1>
          <p class="page-subtitle">نظرة عامة على جميع العيادات وأداء المنصة</p>
        </div>
        <div class="header-actions">
          <router-link to="/super-admin/clinics/add" class="btn btn-primary">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>
            </svg>
            إضافة عيادة
          </router-link>
          <router-link to="/super-admin/subscriptions" class="btn btn-outline">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
              <rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 8h16"/>
            </svg>
            إدارة الاشتراكات
          </router-link>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card glass glass--primary">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <path d="M2.5 17.5h15M5 17.5V6l5-3.5 5 3.5v11.5"/>
              <path d="M7.5 17.5v-4h5v4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">إجمالي العيادات</span>
            <span class="stat-value">{{ totalClinics }}</span>
            <span class="stat-meta">مسجلة في المنصة</span>
          </div>
        </div>

        <div class="stat-card glass glass--success">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <circle cx="7" cy="6" r="3"/>
              <path d="M2.5 17.5v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v1"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">إجمالي المرضى</span>
            <span class="stat-value">{{ formatNumber(totalPatients) }}</span>
            <span class="stat-meta">عبر جميع العيادات</span>
          </div>
        </div>

        <div class="stat-card glass glass--accent">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <line x1="10" y1="1.5" x2="10" y2="18.5"/>
              <path d="M14.5 4H9.5a3.5 3.5 0 0 0 0 7h1a3.5 3.5 0 0 1 0 7H5.5"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">إجمالي الإيرادات</span>
            <span class="stat-value">{{ formatNumber(totalRevenue) }} د.ع</span>
            <span class="stat-meta">إجمالي الأرباح</span>
          </div>
        </div>

        <div class="stat-card glass glass--purple">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <circle cx="10" cy="6" r="3"/>
              <path d="M3 17.5v-1a4.5 4.5 0 0 1 4.5-4.5h5A4.5 4.5 0 0 1 17 16.5v1"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">دليل الأطباء</span>
            <span class="stat-value">{{ totalListings }}</span>
            <span class="stat-meta">طبيب غير مشترك</span>
          </div>
        </div>
      </div>

      <!-- Revenue Chart + Platform Performance -->
      <div class="dashboard-row">
        <div class="card card--chart">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/>
                <polyline points="5.5 13 8.5 9 11 11.5 14.5 7"/>
              </svg>
              نظرة عامة على الإيرادات
            </h3>
            <span class="card-badge">آخر 6 أشهر</span>
          </div>
          <div class="chart-container">
            <svg viewBox="0 0 500 180" class="revenue-chart" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>
              <line x1="40" y1="55" x2="480" y2="55" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>
              <line x1="40" y1="90" x2="480" y2="90" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>
              <line x1="40" y1="125" x2="480" y2="125" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>
              <line x1="40" y1="160" x2="480" y2="160" stroke="#e5e7eb" stroke-width="1"/>

              <!-- Y axis labels -->
              <text x="35" y="24" text-anchor="end" fill="#9ca3af" font-size="10">50k د.ع</text>
              <text x="35" y="59" text-anchor="end" fill="#9ca3af" font-size="10">40k د.ع</text>
              <text x="35" y="94" text-anchor="end" fill="#9ca3af" font-size="10">30k د.ع</text>
              <text x="35" y="129" text-anchor="end" fill="#9ca3af" font-size="10">20k د.ع</text>
              <text x="35" y="164" text-anchor="end" fill="#9ca3af" font-size="10">10k د.ع</text>

              <!-- Gradient fill -->
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#1150c9" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#1150c9" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path :d="areaPath" fill="url(#chartGrad)"/>

              <!-- Line -->
              <polyline :points="chartPoints" fill="none" stroke="#1150c9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Data points -->
              <circle v-for="(point, i) in chartDataPoints" :key="i" :cx="point.x" :cy="point.y" r="4" fill="#1150c9" stroke="#fff" stroke-width="2"/>

              <!-- X axis labels -->
              <text v-for="(label, i) in chartLabels" :key="'l'+i" :x="40 + i * 88" y="175" text-anchor="middle" fill="#9ca3af" font-size="10">{{ label }}</text>
            </svg>
          </div>
        </div>

        <div class="card card--performance">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <circle cx="10" cy="10" r="8.5"/>
                <path d="M10 6v4l2.5 2.5"/>
              </svg>
              أداء المنصة
            </h3>
          </div>
          <div class="performance-list">
            <div class="perf-item">
              <span class="perf-label">وقت تشغيل العيادة</span>
              <div class="perf-bar-track"><div class="perf-bar" style="width: 99.8%"></div></div>
              <span class="perf-value perf-value--green">99.8%</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">استجابة API</span>
              <div class="perf-bar-track"><div class="perf-bar" style="width: 92%"></div></div>
              <span class="perf-value">45ms</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">الجلسات النشطة</span>
              <div class="perf-bar-track"><div class="perf-bar" style="width: 78%"></div></div>
              <span class="perf-value">312</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">المساحة المستخدمة</span>
              <div class="perf-bar-track"><div class="perf-bar" style="width: 45%"></div></div>
              <span class="perf-value">4.5 GB</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">استخدام الذكاء الاصطناعي</span>
              <div class="perf-bar-track"><div class="perf-bar perf-bar--purple" style="width: 62%"></div></div>
              <span class="perf-value">62%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Clinics + Quick Actions -->
      <div class="dashboard-row">
        <div class="card card--table">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <path d="M2.5 17.5h15M5 17.5V6l5-3.5 5 3.5v11.5"/>
              </svg>
              العيادات الأخيرة
            </h3>
            <router-link to="/super-admin/clinics" class="card-link">
              عرض الكل
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="13 13 7 7M7 13V7h6"/>
              </svg>
            </router-link>
          </div>

          <div v-if="loading" class="card-loading">
            <div class="spinner"></div>
            جاري تحميل العيادات...
          </div>

          <div v-else-if="recentClinics.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
              <path d="M3 21h18M5 21V7l7-4 7 4v14"/>
            </svg>
            <p class="empty-title">لا توجد عيادات بعد</p>
            <p class="empty-desc">أضف أول عيادة أسنان إلى المنصة.</p>
            <router-link to="/super-admin/clinics/add" class="btn btn-primary btn-sm">إضافة أول عيادة</router-link>
          </div>

          <div v-else class="clinic-list">
            <div v-for="(clinic, index) in recentClinics" :key="clinic.id" class="clinic-row">
              <div class="clinic-index">{{ index + 1 }}</div>
              <div class="clinic-info">
                <router-link :to="`/super-admin/clinics/${clinic.id}`" class="clinic-name">
                  {{ clinic.name }}
                </router-link>
                <span class="clinic-owner">{{ clinic.ownerName || 'بدون مالك' }}</span>
              </div>
              <div class="clinic-meta">
                <span class="clinic-email">{{ clinic.email || '-' }}</span>
              </div>
              <span :class="['badge', subscriptionBadgeClass(clinic.subscription)]">
                {{ formatSubscription(clinic.subscription) }}
              </span>
              <span :class="['badge', statusBadgeClass(clinic.status)]">
                {{ formatStatus(clinic.status) }}
              </span>
              <router-link :to="`/super-admin/clinics/${clinic.id}`" class="btn btn-ghost btn-xs">
                عرض
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <polyline points="13 13 7 7M7 13V7h6"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>

        <div class="card card--actions">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <circle cx="10" cy="10" r="8.5"/>
                <line x1="10" y1="6" x2="10" y2="14"/>
                <line x1="6" y1="10" x2="14" y2="10"/>
              </svg>
              إجراءات سريعة
            </h3>
          </div>
          <div class="actions-grid">
            <router-link to="/super-admin/clinics/add" class="action-card">
              <div class="action-icon action-icon--primary">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                  <path d="M2.5 17.5h15M5 17.5V6l5-3.5 5 3.5v11.5"/>
                  <line x1="10" y1="8.5" x2="10" y2="13.5"/><line x1="7.5" y1="11" x2="12.5" y2="11"/>
                </svg>
              </div>
              <span class="action-label">إضافة عيادة جديدة</span>
              <span class="action-desc">تسجيل عيادة أسنان جديدة</span>
            </router-link>

            <router-link to="/super-admin/subscriptions" class="action-card">
              <div class="action-icon action-icon--accent">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                  <rect x="2" y="4" width="16" height="12" rx="2"/>
                  <path d="M2 8h16"/>
                  <circle cx="5" cy="13" r="1"/>
                </svg>
              </div>
              <span class="action-label">الاشتراكات</span>
              <span class="action-desc">إدارة الخطط والفوترة</span>
            </router-link>

            <router-link to="/super-admin/clinics" class="action-card">
              <div class="action-icon action-icon--success">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                  <circle cx="7" cy="6" r="3"/>
                  <path d="M2.5 17.5v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v1"/>
                </svg>
              </div>
              <span class="action-label">عرض جميع العيادات</span>
              <span class="action-desc">تصفح وإدارة العيادات</span>
            </router-link>

            <router-link to="/super-admin/directory-listings" class="action-card">
              <div class="action-icon action-icon--purple">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                  <circle cx="10" cy="6" r="3"/>
                  <path d="M3 17.5v-1a4.5 4.5 0 0 1 4.5-4.5h5A4.5 4.5 0 0 1 17 16.5v1"/>
                  <circle cx="15" cy="8" r="2"/>
                  <path d="M17 14v-0.5a2.5 2.5 0 0 0-2-2.45"/>
                </svg>
              </div>
              <span class="action-label">دليل الأطباء</span>
              <span class="action-desc">إدارة الأطباء غير المشتركين</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import AppLayout from '@/components/AppLayout.vue'

const loading = ref(true)
const totalClinics = ref(0)
const activeSubscriptions = ref(0)
const totalRevenue = ref(0)
const totalPatients = ref(0)
const totalListings = ref(0)
const recentClinics = ref([])

const formatNumber = (num) => Number(num).toLocaleString('ar-IQ')

const formatSubscription = (type) => {
  const labels = { basic: 'أساسي', premium: 'متميز', enterprise: 'مؤسسات', trial: 'تجريبي' }
  return labels[type] || type || 'غير معروف'
}

const subscriptionBadgeClass = (type) => {
  const classes = { basic: 'badge-outline', premium: 'badge-warning', enterprise: 'badge-purple', trial: 'badge-info' }
  return classes[type] || 'badge-outline'
}

const formatStatus = (status) => {
  const labels = { active: 'نشط', suspended: 'معلّق', trial: 'تجريبي', inactive: 'غير نشط' }
  return labels[status] || status || 'غير معروف'
}

const statusBadgeClass = (status) => {
  const classes = { active: 'badge-success', suspended: 'badge-danger', trial: 'badge-info', inactive: 'badge-outline' }
  return classes[status] || 'badge-outline'
}

const chartLabels = ['فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو']
const chartValues = computed(() => [22000, 31000, 28000, 38000, 42000, totalRevenue.value || 35000])

const chartDataPoints = computed(() => {
  const maxVal = 50000
  const minVal = 10000
  const startX = 40
  const endX = 480
  const step = (endX - startX) / (chartValues.value.length - 1)
  return chartValues.value.map((val, i) => ({
    x: startX + i * step,
    y: 160 - ((val - minVal) / (maxVal - minVal)) * 140
  }))
})

const chartPoints = computed(() => {
  return chartDataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const points = chartDataPoints.value
  if (points.length === 0) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpx2 = curr.x - (curr.x - prev.x) / 3
    d += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`
  }
  d += ` L${points[points.length - 1].x},160 L${points[0].x},160 Z`
  return d
})

const fetchData = async () => {
  loading.value = true
  try {
    const snapshot = await getDocs(collection(db, 'clinics'))
    const clinics = []
    let activeCount = 0
    let patientsCount = 0
    let revenue = 0

    snapshot.forEach((doc) => {
      const data = doc.data()
      clinics.push({ id: doc.id, ...data })
      if (data.status === 'active') activeCount++
      patientsCount += data.patientCount || 0
      revenue += data.monthlyFee || 0
    })

    totalClinics.value = snapshot.size
    activeSubscriptions.value = activeCount
    totalPatients.value = patientsCount
    totalRevenue.value = revenue

    recentClinics.value = clinics
      .sort((a, b) => {
        const ta = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime()
        const tb = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime()
        return tb - ta
      })
      .slice(0, 6)

    try {
      const listingsSnap = await getDocs(collection(db, 'directory_listings'))
      totalListings.value = listingsSnap.size
    } catch {}
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0a2757;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #1150c9, #14b8a6);
  color: #fff;
  box-shadow: 0 2px 12px rgba(17,80,201,0.35);
}

.btn-primary:hover {
  box-shadow: 0 4px 20px rgba(17,80,201,0.5);
  transform: translateY(-1px);
}

.btn-outline {
  background: #fff;
  color: #374151;
  border: 1.5px solid #e5e7eb;
}

.btn-outline:hover {
  border-color: #1150c9;
  color: #1150c9;
  background: #faf5ff;
}

.btn-ghost {
  background: none;
  color: #1150c9;
  padding: 4px 8px;
}

.btn-ghost:hover {
  background: #f3f0ff;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 12px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.glass {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.glass--primary .stat-icon-wrap {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  color: #1150c9;
}

.glass--success .stat-icon-wrap {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}

.glass--accent .stat-icon-wrap {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.glass--purple .stat-icon-wrap {
  background: linear-gradient(135deg, #ede9fe, #c4b5fd);
  color: #7c3aed;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #0a2757;
  line-height: 1.2;
  margin: 2px 0;
}

.stat-meta {
  font-size: 11px;
  color: #9ca3af;
}

/* Row Layout */
.dashboard-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

/* Cards */
.card {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0a2757;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.card-badge {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.card-link {
  font-size: 13px;
  color: #1150c9;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.card-link:hover {
  color: #5b4cdb;
}

/* Chart */
.chart-container {
  padding: 16px 12px;
  height: 200px;
}

.revenue-chart {
  width: 100%;
  height: 100%;
}

/* Performance */
.performance-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perf-item {
  display: grid;
  grid-template-columns: 120px 1fr 50px;
  align-items: center;
  gap: 12px;
}

.perf-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.perf-bar-track {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.perf-bar {
  height: 100%;
  background: linear-gradient(90deg, #1150c9, #14b8a6);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.perf-bar--purple {
  background: linear-gradient(90deg, #14b8a6, #c084fc);
}

.perf-value {
  font-size: 13px;
  font-weight: 700;
  color: #0a2757;
  text-align: left;
}

.perf-value--green {
  color: #059669;
}

/* Clinic List */
.clinic-list {
  padding: 4px 0;
}

.clinic-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
}

.clinic-row:last-child {
  border-bottom: none;
}

.clinic-row:hover {
  background: #f9fafb;
}

.clinic-index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clinic-info {
  flex: 1;
  min-width: 0;
}

.clinic-name {
  font-size: 14px;
  font-weight: 600;
  color: #0a2757;
  text-decoration: none;
  display: block;
}

.clinic-name:hover {
  color: #1150c9;
}

.clinic-owner {
  font-size: 12px;
  color: #9ca3af;
  display: block;
}

.clinic-meta {
  flex: 1;
  min-width: 0;
}

.clinic-email {
  font-size: 13px;
  color: #6b7280;
}

/* Badge */
.badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-success { background: #d1fae5; color: #065f46; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-purple { background: #ede9fe; color: #5b21b6; }
.badge-outline { background: #f3f4f6; color: #374151; }

/* Loading */
.card-loading {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #1150c9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 12px 0 4px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 12px;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-card:hover {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.action-icon--primary { background: #ede9fe; color: #1150c9; }
.action-icon--accent { background: #fef3c7; color: #d97706; }
.action-icon--success { background: #d1fae5; color: #059669; }
.action-icon--purple { background: #fce7f3; color: #db2777; }

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #0a2757;
  margin-bottom: 2px;
}

.action-desc {
  font-size: 11px;
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
  .clinic-row { flex-wrap: wrap; gap: 8px; padding: 12px 16px; }
  .clinic-meta { width: 100%; }
  .perf-item { grid-template-columns: 80px 1fr 40px; }
}
</style>
