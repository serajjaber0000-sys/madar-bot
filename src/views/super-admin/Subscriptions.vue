<template>
  <AppLayout>
    <div class="subscriptions-page">
      <header class="page-header">
        <div>
          <h1>{{ t.subscriptions }}</h1>
          <p class="subtitle">{{ 'إدارة اشتراكات العيادات والفوترة' }}</p>
        </div>
      </header>

      <div v-if="loading" class="loading-wrap"><div class="spinner"></div><p>{{ t.loading }}</p></div>

      <template v-else>
        <div class="stats-row">
          <div class="stat-card glass">
            <div class="stat-icon blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">{{ clinics.length }}</span><span class="stat-label">{{ 'إجمالي العيادات' }}</span></div>
          </div>
          <div class="stat-card glass">
            <div class="stat-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">{{ activeSubscriptions }}</span><span class="stat-label">{{ 'اشتراكات نشطة' }}</span></div>
          </div>
          <div class="stat-card glass">
            <div class="stat-icon emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">د.ع{{ estimatedRevenue.toLocaleString() }}</span><span class="stat-label">{{ 'الإيرادات المقدرة' }}</span></div>
          </div>
          <div class="stat-card glass">
            <div class="stat-icon amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">{{ expiringSoon }}</span>            <span class="stat-label">{{ 'تنتهي قريباً' }}</span></div>
          </div>
        </div>

        <div class="plans-section">
          <h2 class="section-title">{{ 'الخطط والأسعار' }}</h2>
          <div class="plans-grid">
            <div v-for="plan in plans" :key="plan.key" class="plan-card glass" :class="{ featured: plan.featured }">
              <div class="plan-badge" v-if="plan.featured">{{ 'الأكثر شيوعاً' }}</div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price-value">د.ع{{ plan.price }}</span>
                <span class="price-period">/{{ 'شهر' }}</span>
              </div>
              <ul class="plan-features">
                <li v-for="(f, i) in plan.features" :key="i">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ f }}
                </li>
              </ul>
              <div class="plan-count">{{ planCounts[plan.key] || 0 }} {{ 'عيادة' }}</div>
            </div>
          </div>
        </div>

        <div class="revenue-section glass">
          <h2 class="section-title">{{ 'الإيرادات الشهرية' }}</h2>
          <div class="chart-wrap">
            <svg class="revenue-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <path :d="chartAreaPath" fill="url(#grad)" />
              <polyline :points="chartLinePoints" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle v-for="(pt, i) in chartPoints" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="#7c3aed" stroke="#fff" stroke-width="2" />
              <text v-for="(lbl, i) in chartLabels" :key="'l'+i" :x="lbl.x" y="195" fill="#94a3b8" font-size="11" text-anchor="middle">{{ lbl.text }}</text>
            </svg>
          </div>
        </div>

        <div class="table-card glass">
          <div class="table-header">
            <h3>{{ 'اشتراكات العيادات' }}</h3>
          </div>
          <div v-if="clinics.length === 0" class="empty-state">{{ 'لا توجد عيادات' }}</div>
          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ 'العيادة' }}</th>
                  <th>{{ t.plan }}</th>
                  <th>{{ 'تاريخ البدء' }}</th>
                  <th>{{ 'تاريخ الانتهاء' }}</th>
                  <th>{{ t.status }}</th>
                  <th>{{ 'إجراءات' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(clinic, index) in clinics" :key="clinic.id">
                  <td>{{ index + 1 }}</td>
                  <td><router-link :to="`/super-admin/clinics/${clinic.id}`" class="link">{{ clinic.name }}</router-link></td>
                  <td><span :class="['badge', clinic.plan]">{{ clinic.plan || 'basic' }}</span></td>
                  <td>{{ formatDate(clinic.subscriptionStart) }}</td>
                  <td>{{ formatDate(clinic.subscriptionEnd) }}</td>
                  <td><span :class="['status-badge', getSubStatus(clinic)]">{{ getSubStatus(clinic) }}</span></td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-sm plan-btn" @click="openPlanModal(clinic)">{{ 'تغيير' }}</button>
                      <button class="btn-sm extend-btn" @click="extendSubscription(clinic)">{{ 'تمديد' }}</button>
                      <button class="btn-sm suspend-btn" @click="toggleSuspend(clinic)">{{ clinic.status === 'suspended' ? 'تفعيل' : 'تعليق' }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <AppModal v-model="showPlanModal" title="تغيير الخطة" size="sm">
        <div class="plan-select-list">
          <button v-for="p in plans" :key="p.key" class="plan-option" :class="{ selected: selectedPlan === p.key }" @click="selectedPlan = p.key">
            <span class="plan-opt-name">{{ p.name }}</span>
            <span class="plan-opt-price">د.ع{{ p.price }}/mo</span>
          </button>
        </div>
        <template #footer>
          <button class="btn-cancel" @click="showPlanModal = false">{{ t.cancel }}</button>
          <button class="btn-save" @click="applyPlanChange">{{ t.save }}</button>
        </template>
      </AppModal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const { t } = useI18n()
const authStore = useAuthStore()

const clinics = ref([])
const loading = ref(true)
const showPlanModal = ref(false)
const selectedPlan = ref('basic')
const editingClinic = ref(null)

const plans = [
  { key: 'basic', name: 'أساسي', price: 29, featured: false, features: ['3 أطباء', '500 مريض', 'تقارير أساسية', 'دعم عبر البريد'] },
  { key: 'premium', name: 'متميز', price: 79, featured: true, features: ['10 أطباء', '2000 مريض', 'تقارير متقدمة', 'مساعد ذكي', 'دعم أولوي'] },
  { key: 'enterprise', name: 'مؤسسات', price: 199, featured: false, features: ['أطباء غير محدود', 'مرضى غير محدود', 'تعدد الفروع', 'API مخصص', 'مدير حساب مخصص'] }
]

const activeSubscriptions = computed(() => clinics.value.filter(c => getSubStatus(c) === 'active').length)
const estimatedRevenue = computed(() => clinics.value.filter(c => getSubStatus(c) === 'active').reduce((s, c) => s + (plans.find(p => p.key === (c.plan || 'basic'))?.price || 29), 0))
const expiringSoon = computed(() => {
  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 86400000)
  return clinics.value.filter(c => {
    if (!c.subscriptionEnd) return false
    const end = new Date(c.subscriptionEnd)
    return end > now && end <= thirtyDays
  }).length
})

const planCounts = computed(() => {
  const counts = {}
  clinics.value.forEach(c => { const pk = c.plan || 'basic'; counts[pk] = (counts[pk] || 0) + 1 })
  return counts
})

const chartData = computed(() => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return months.map((m, i) => ({ label: m, value: Math.floor(3000 + Math.random() * 8000 + (i < new Date().getMonth() + 1 ? 2000 : 0)) }))
})

const chartPoints = computed(() => {
  const data = chartData.value
  const max = Math.max(...data.map(d => d.value))
  const w = 700, h = 170, pad = 40
  const step = (w - pad * 2) / (data.length - 1)
  return data.map((d, i) => ({ x: pad + i * step, y: h - (d.value / max) * (h - 20) }))
})

const chartLinePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const chartAreaPath = computed(() => {
  const pts = chartPoints.value
  if (!pts.length) return ''
  const pad = 40
  let d = `M${pts[0].x},${pts[0].y} `
  pts.slice(1).forEach(p => { d += `L${p.x},${p.y} ` })
  d += `L${pts[pts.length - 1].x},170 L${pts[0].x},170 Z`
  return d
})
const chartLabels = computed(() => chartData.value.map((d, i) => ({ text: d.label, x: chartPoints.value[i]?.x || 0 })))

function formatDate(ts) {
  if (!ts) return '---'
  return new Date(ts).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getSubStatus(clinic) {
  if (clinic.status === 'suspended') return 'suspended'
  if (!clinic.subscriptionEnd) return 'active'
  return new Date(clinic.subscriptionEnd) > new Date() ? 'active' : 'expired'
}

function openPlanModal(clinic) {
  editingClinic.value = clinic
  selectedPlan.value = clinic.plan || 'basic'
  showPlanModal.value = true
}

async function applyPlanChange() {
  if (!editingClinic.value) return
  try {
    await updateDoc(doc(db, 'clinics', editingClinic.value.id), { plan: selectedPlan.value })
    const idx = clinics.value.findIndex(c => c.id === editingClinic.value.id)
    if (idx !== -1) clinics.value[idx].plan = selectedPlan.value
    showPlanModal.value = false
  } catch (err) {
  }
}

async function extendSubscription(clinic) {
  const currentEnd = clinic.subscriptionEnd ? new Date(clinic.subscriptionEnd) : new Date()
  const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + 30 * 86400000)
  try {
    await updateDoc(doc(db, 'clinics', clinic.id), { subscriptionEnd: newEnd.toISOString() })
    clinic.subscriptionEnd = newEnd.toISOString()
  } catch (err) {
  }
}

async function toggleSuspend(clinic) {
  const newStatus = clinic.status === 'suspended' ? 'active' : 'suspended'
  try {
    await updateDoc(doc(db, 'clinics', clinic.id), { status: newStatus })
    clinic.status = newStatus
  } catch (err) {
  }
}

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'clinics'))
    clinics.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.subscriptions-page { padding: 24px; max-width: 1400px; margin: 0 auto; animation: fadeUp 0.5s ease; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.glass {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.85rem; margin: 4px 0 0; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; transition: transform 0.3s ease; }
.stat-card:hover { transform: translateY(-4px); }
.stat-icon { width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; color: #fff; }
.stat-icon.blue { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.stat-icon.green { background: linear-gradient(135deg, #059669, #34d399); }
.stat-icon.emerald { background: linear-gradient(135deg, #10b981, #6ee7b7); }
.stat-icon.amber { background: linear-gradient(135deg, #d97706, #fbbf24); }
.stat-value { display: block; font-size: 1.6rem; font-weight: 800; color: #1e293b; }
.stat-label { font-size: 0.78rem; color: #64748b; }
.stat-info { display: flex; flex-direction: column; }

.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 14px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.section-title { font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 0 0 20px; }

.plans-section { margin-bottom: 32px; }
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.plan-card {
  padding: 0; overflow: hidden; position: relative; display: flex; flex-direction: column;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
}
.plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
.plan-card.featured { border: 2px solid #7c3aed; }
.plan-badge {
  background: linear-gradient(135deg, #7c3aed, #14b8a6); color: #fff;
  font-size: 0.72rem; font-weight: 700; text-align: center; padding: 6px 12px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.plan-name { padding: 20px 24px 0; font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
.plan-price { padding: 8px 24px 16px; }
.price-value { font-size: 2.2rem; font-weight: 800; color: #7c3aed; }
.price-period { font-size: 0.88rem; color: #94a3b8; }
.plan-features { list-style: none; padding: 0 24px; margin: 0; flex: 1; }
.plan-features li {
  display: flex; align-items: center; gap: 8px; padding: 7px 0;
  font-size: 0.85rem; color: #475569;
}
.plan-features svg { color: #10b981; flex-shrink: 0; }
.plan-count {
  padding: 14px 24px; border-top: 1px solid rgba(0,0,0,0.05);
  font-size: 0.82rem; color: #94a3b8; font-weight: 600;
}

.revenue-section { padding: 24px; margin-bottom: 32px; }
.chart-wrap { overflow-x: auto; }
.revenue-chart { width: 100%; height: 200px; min-width: 500px; }

.table-card { overflow: hidden; margin-bottom: 24px; }
.table-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
.empty-state { text-align: center; padding: 60px 24px; color: #94a3b8; }
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 14px 16px; text-align: right; font-size: 0.78rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
  background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.05);
}
.data-table td { padding: 14px 16px; font-size: 0.88rem; color: #1e293b; border-bottom: 1px solid rgba(0,0,0,0.04); }
.data-table tbody tr:hover { background: rgba(0,0,0,0.02); }
.link { color: #7c3aed; text-decoration: none; font-weight: 600; }
.link:hover { text-decoration: underline; }
.badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 3px 12px; border-radius: 999px; text-transform: capitalize; }
.badge.basic { background: #f3f4f6; color: #374151; }
.badge.premium { background: #fef3c7; color: #92400e; }
.badge.enterprise { background: #ede9fe; color: #5b21b6; }
.status-badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 3px 12px; border-radius: 999px; text-transform: capitalize; }
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.expired { background: #fef2f2; color: #dc2626; }
.status-badge.suspended { background: #fef3c7; color: #d97706; }
.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-sm {
  padding: 5px 12px; border: none; border-radius: 8px;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.plan-btn { background: #ede9fe; color: #6d28d9; }
.plan-btn:hover { background: #ddd6fe; }
.extend-btn { background: #d1fae5; color: #059669; }
.extend-btn:hover { background: #a7f3d0; }
.suspend-btn { background: #fef3c7; color: #d97706; }
.suspend-btn:hover { background: #fde68a; }

.plan-select-list { display: flex; flex-direction: column; gap: 10px; }
.plan-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 12px;
  background: #fff; cursor: pointer; transition: all 0.2s;
}
.plan-option:hover { border-color: #7c3aed; }
.plan-option.selected { border-color: #7c3aed; background: #f5f3ff; }
.plan-opt-name { font-weight: 700; color: #1e293b; }
.plan-opt-price { font-size: 0.88rem; color: #7c3aed; font-weight: 600; }
.btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; color: #64748b; font-size: 0.88rem; font-weight: 600; cursor: pointer; }
.btn-save { padding: 10px 22px; border: none; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; }

@media (max-width: 1024px) { .plans-grid { grid-template-columns: 1fr; } .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .subscriptions-page { padding: 16px; } .stats-row { grid-template-columns: 1fr; } .revenue-chart { min-width: 100%; height: 160px; } }
</style>
