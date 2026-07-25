<template>
  <AppLayout>
    <div class="clinics-page">
      <header class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
          </div>
          <div>
            <h1 class="page-title">{{ t.clinics }}</h1>
            <p class="page-subtitle">إدارة جميع العيادات السنية على المنصة</p>
          </div>
        </div>
        <router-link to="/super-admin/clinics/add" class="btn btn-primary">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>
          </svg>
          {{ t.addClinic }}
        </router-link>
      </header>

      <div class="stats-grid">
        <div class="stat-card glass glass--primary">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M2.5 17.5h15M5 17.5V6l5-3.5 5 3.5v11.5"/><path d="M7.5 17.5v-4h5v4"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">إجمالي العيادات</span>
            <span class="stat-value">{{ clinics.length }}</span>
          </div>
        </div>
        <div class="stat-card glass glass--success">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ t.active }}</span>
            <span class="stat-value">{{ activeCount }}</span>
          </div>
        </div>
        <div class="stat-card glass glass--danger">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ t.suspended }}</span>
            <span class="stat-value">{{ suspendedCount }}</span>
          </div>
        </div>
        <div class="stat-card glass glass--purple">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="7" cy="6" r="3"/><path d="M2.5 17.5v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v1"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ t.totalPatients }}</span>
            <span class="stat-value">{{ totalPatients.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="controls-bar glass">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالاسم، المالك، البريد..."
          />
        </div>
        <div class="filter-chips">
          <button
            v-for="filter in filters"
            :key="filter.key"
            class="chip"
            :class="{ active: activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            <span class="chip-dot" :style="{ background: filter.color }"></span>
            {{ filter.label }}
            <span class="chip-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
        <p>{{ t.loading }}</p>
      </div>

      <div v-else-if="filteredClinics.length === 0" class="empty-full glass">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>
        <p class="empty-title">لا توجد عيادات</p>
        <p class="empty-desc">لم نتمكن من العثور على عيادات تطابق بحثك</p>
      </div>

      <div v-else class="clinics-grid">
        <div
          v-for="clinic in filteredClinics"
          :key="clinic.id"
          class="clinic-card glass"
          @click="goToClinic(clinic.id)"
        >
          <div class="clinic-card-top">
            <div class="clinic-avatar" :style="{ background: getAvatarColor(clinic.name) }">
              <img v-if="clinic.photoUrl" :src="clinic.photoUrl" :alt="clinic.name" />
              <span v-else>{{ getInitials(clinic.name) }}</span>
            </div>
            <div class="clinic-badges">
              <span :class="['plan-badge', clinic.plan || 'basic']">{{ formatPlan(clinic.plan) }}</span>
              <span :class="['status-badge', clinic.status || 'active']">{{ formatStatus(clinic.status) }}</span>
            </div>
          </div>
          <div class="clinic-card-body">
            <h3 class="clinic-name">{{ clinic.name }}</h3>
            <span class="clinic-owner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
              {{ clinic.ownerName || '---' }}
            </span>
            <div class="clinic-details">
              <span class="detail-item" v-if="clinic.email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
                {{ clinic.email }}
              </span>
              <span class="detail-item" v-if="clinic.phone">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ clinic.phone }}
              </span>
            </div>
          </div>
          <div class="clinic-card-footer">
            <div class="patient-count">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>{{ clinic.patientsCount || 0 }} مريض</span>
            </div>
            <div class="card-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import AppLayout from '@/components/AppLayout.vue'
import { db } from '@/firebase/config'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()
const { t } = useI18n()

const clinics = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')

const activeCount = computed(() => clinics.value.filter(c => c.status === 'active').length)
const suspendedCount = computed(() => clinics.value.filter(c => c.status === 'suspended').length)
const totalPatients = computed(() => clinics.value.reduce((sum, c) => sum + (c.patientsCount || c.patientCount || 0), 0))

const filters = computed(() => [
  { key: 'all', label: t.value.all, color: '#1150c9', count: clinics.value.length },
  { key: 'active', label: t.value.active, color: '#10B981', count: activeCount.value },
  { key: 'suspended', label: t.value.suspended, color: '#EF4444', count: suspendedCount.value },
])

const filteredClinics = computed(() => {
  let list = clinics.value
  if (activeFilter.value !== 'all') {
    list = list.filter(c => (c.status || 'active') === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.ownerName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    )
  }
  return list
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name) {
  const colors = ['#7c3aed', '#2563eb', '#0d9488', '#d97706', '#db2777', '#e11d48', '#06b6d4']
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

function formatPlan(plan) {
  const labels = { basic: 'أساسي', premium: 'متميز', enterprise: 'مؤسسات', trial: 'تجريبي' }
  return labels[plan] || plan || 'أساسي'
}

function formatStatus(status) {
  const labels = { active: 'نشط', suspended: 'معلّق', inactive: 'غير نشط' }
  return labels[status] || status || 'Active'
}

function goToClinic(id) {
  router.push(`/super-admin/clinics/${id}`)
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
.clinics-page { padding: 24px; max-width: 1400px; margin: 0 auto; animation: fadeUp 0.5s ease; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }

.glass {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, #1150c9, #14b8a6);
  color: #fff; display: grid; place-items: center;
  box-shadow: 0 4px 15px rgba(17,80,201,0.3); flex-shrink: 0;
}
.page-title { margin: 0; font-size: 1.4rem; font-weight: 800; color: #0a2757; }
.page-subtitle { margin: 4px 0 0; font-size: 0.85rem; color: #6b7280; }

.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
  border-radius: 12px; font-size: 0.88rem; font-weight: 700;
  text-decoration: none; transition: all 0.2s; border: none; cursor: pointer; white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #1150c9, #14b8a6);
  color: #fff; box-shadow: 0 2px 12px rgba(17,80,201,0.35);
}
.btn-primary:hover {
  box-shadow: 0 4px 20px rgba(17,80,201,0.5); transform: translateY(-1px);
}

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card {
  border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 14px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
.stat-icon-wrap {
  width: 48px; height: 48px; border-radius: 14px;
  display: grid; place-items: center; flex-shrink: 0;
}
.glass--primary { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
.glass--primary .stat-icon-wrap { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #1150c9; }
.glass--success { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
.glass--success .stat-icon-wrap { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.glass--danger { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
.glass--danger .stat-icon-wrap { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; }
.glass--purple { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
.glass--purple .stat-icon-wrap { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #7c3aed; }
.stat-content { display: flex; flex-direction: column; }
.stat-label { font-size: 0.75rem; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
.stat-value { font-size: 1.6rem; font-weight: 800; color: #0a2757; line-height: 1.2; margin-top: 2px; }

.controls-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 20px; margin-bottom: 20px; flex-wrap: wrap;
}
.search-box {
  display: flex; align-items: center; gap: 10px; flex: 1; min-width: 250px;
  padding: 10px 16px; background: #f9fafb; border-radius: 12px; border: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-box:focus-within { border-color: #1150c9; box-shadow: 0 0 0 3px rgba(17,80,201,0.1); }
.search-box svg { color: #94a3b8; flex-shrink: 0; }
.search-box input {
  flex: 1; border: none; background: none; font-size: 0.88rem;
  color: #1e293b; outline: none; font-family: inherit;
}
.search-box input::placeholder { color: #94a3b8; }

.filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
  border-radius: 10px; border: 1.5px solid #e5e7eb; background: #fff;
  font-size: 0.82rem; font-weight: 600; color: #64748b;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.chip:hover { border-color: #c7d2fe; color: #1150c9; }
.chip.active { border-color: #1150c9; background: #f5f3ff; color: #1150c9; box-shadow: 0 2px 8px rgba(17,80,201,0.15); }
.chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chip-count { background: #f3f4f6; padding: 1px 7px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; }
.chip.active .chip-count { background: #ede9fe; color: #1150c9; }

.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 14px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #1150c9; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loading-wrap p { color: #94a3b8; font-size: 0.9rem; margin: 0; }

.empty-full { text-align: center; padding: 80px 24px; }
.empty-title { margin: 16px 0 4px; font-size: 1.1rem; font-weight: 700; color: #374151; }
.empty-desc { margin: 0; font-size: 0.88rem; color: #94a3b8; }

.clinics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

.clinic-card {
  border-radius: 18px; overflow: hidden; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column;
}
.clinic-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  border-color: rgba(17,80,201,0.3);
}

.clinic-card-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 24px 0; }
.clinic-avatar {
  width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 1.2rem; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.clinic-avatar img { width: 100%; height: 100%; object-fit: cover; }
.clinic-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.plan-badge {
  display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px;
  border-radius: 20px; text-transform: capitalize; letter-spacing: 0.2px;
}
.plan-badge.basic { background: #f3f4f6; color: #374151; }
.plan-badge.premium { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }
.plan-badge.enterprise { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #5b21b6; }
.plan-badge.trial { background: #dbeafe; color: #1e40af; }
.status-badge {
  display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px;
  border-radius: 20px; text-transform: capitalize;
}
.status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.suspended { background: #fef2f2; color: #991b1b; }
.status-badge.inactive { background: #f3f4f6; color: #6b7280; }

.clinic-card-body { padding: 16px 24px; flex: 1; }
.clinic-name { margin: 0 0 6px; font-size: 1.05rem; font-weight: 700; color: #0a2757; }
.clinic-owner {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; color: #64748b; margin-bottom: 12px;
}
.clinic-details { display: flex; flex-direction: column; gap: 6px; }
.detail-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.detail-item svg { flex-shrink: 0; }

.clinic-card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 24px; border-top: 1px solid rgba(0,0,0,0.04);
}
.patient-count {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 600; color: #1150c9;
}
.patient-count svg { color: #a78bfa; }
.card-arrow { color: #d1d5db; transition: color 0.2s, transform 0.2s; }
.clinic-card:hover .card-arrow { color: #1150c9; transform: translateX(-4px); }

@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .clinics-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .controls-bar { flex-direction: column; align-items: stretch; }
  .search-box { min-width: 0; }
  .clinics-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
</style>
