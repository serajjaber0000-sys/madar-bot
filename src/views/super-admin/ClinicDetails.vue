<template>
  <AppLayout>
    <div class="clinic-details-page">
      <header class="page-header">
        <div>
          <router-link to="/super-admin/clinics" class="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            {{ t.backToList }}
          </router-link>
          <h1>{{ clinic.name || ('تفاصيل العيادة') }}</h1>
          <span v-if="clinic.status" :class="['status-badge', clinic.status]">{{ clinic.status }}</span>
        </div>
      </header>

      <div v-if="loading" class="loading-wrap"><div class="spinner"></div><p>{{ t.loading }}</p></div>

      <template v-else-if="clinic.id">
        <div class="clinic-hero glass">
          <div class="hero-avatar" :style="{ background: getAvatarColor(clinic.name) }">
            <img v-if="clinic.photoUrl" :src="clinic.photoUrl" :alt="clinic.name" />
            <span v-else>{{ getInitials(clinic.name) }}</span>
          </div>
          <div class="hero-info">
            <h2>{{ clinic.name }}</h2>
            <span class="hero-owner">{{ 'المالك:' }} {{ clinic.ownerName || '---' }}</span>
            <div class="hero-tags">
              <span :class="['badge', clinic.plan]">{{ clinic.plan || 'basic' }}</span>
              <span class="hero-email">{{ clinic.email || '---' }}</span>
            </div>
          </div>
          <div class="hero-actions">
            <button class="action-btn" :class="{ danger: clinic.status !== 'suspended' }" @click="toggleSuspend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
              {{ clinic.status === 'suspended' ? ('تفعيل') : ('تعليق') }}
            </button>
            <button class="action-btn plan" @click="showPlanModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {{ 'تغيير الخطة' }}
            </button>
            <button class="action-btn delete" @click="confirmDelete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              {{ t.delete }}
            </button>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card glass">
            <div class="stat-icon purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">{{ patients.length }}</span><span class="stat-label">{{ t.patients }}</span></div>
          </div>
          <div class="stat-card glass">
            <div class="stat-icon blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">{{ staff.length }}</span><span class="stat-label">{{ t.staff }}</span></div>
          </div>
          <div class="stat-card glass">
            <div class="stat-icon emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="stat-info"><span class="stat-value">${{ totalRevenue.toLocaleString() }}</span><span class="stat-label">{{ 'الإيرادات' }}</span></div>
          </div>
        </div>

        <div class="content-grid">
          <div class="info-card glass">
            <div class="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <h3>{{ 'معلومات العيادة' }}</h3>
            </div>
            <div class="card-body">
              <div class="info-row"><label>{{ t.name }}</label><span>{{ clinic.name }}</span></div>
              <div class="info-row"><label>{{ 'المالك' }}</label><span>{{ clinic.ownerName || '---' }}</span></div>
              <div class="info-row"><label>{{ t.email }}</label><span>{{ clinic.email || '---' }}</span></div>
              <div class="info-row"><label>{{ t.phone }}</label><span>{{ clinic.phone || '---' }}</span></div>
              <div class="info-row"><label>{{ t.address }}</label><span>{{ clinic.address || '---' }}</span></div>
              <div class="info-row"><label>{{ t.plan }}</label><span :class="['badge', clinic.plan]">{{ clinic.plan || 'basic' }}</span></div>
              <div class="info-row"><label>{{ 'تاريخ الإنشاء' }}</label><span>{{ formatDate(clinic.createdAt) }}</span></div>
            </div>
          </div>

          <div class="info-card glass">
            <div class="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3>{{ 'معلومات الاشتراك' }}</h3>
            </div>
            <div class="card-body">
              <div class="info-row"><label>{{ t.plan }}</label><span :class="['badge', clinic.plan]">{{ clinic.plan || 'basic' }}</span></div>
              <div class="info-row"><label>{{ 'الحالة' }}</label><span :class="['status-badge', clinic.status || 'active']">{{ clinic.status || 'active' }}</span></div>
              <div class="info-row"><label>{{ 'تاريخ البدء' }}</label><span>{{ formatDate(clinic.subscriptionStart) }}</span></div>
              <div class="info-row"><label>{{ 'تاريخ الانتهاء' }}</label><span>{{ formatDate(clinic.subscriptionEnd) }}</span></div>
              <div class="info-row"><label>{{ 'مدة الاشتراك' }}</label><span>{{ subDuration }}</span></div>
            </div>
          </div>

          <div class="info-card glass">
            <div class="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <h3>{{ t.staff }}</h3>
            </div>
            <div class="card-body">
              <div v-if="staff.length === 0" class="empty-text">{{ 'لا يوجد طاقم مسجل' }}</div>
              <div v-else class="list-items">
                <div v-for="s in staff" :key="s.id" class="list-item">
                  <div class="list-avatar" :style="{ background: getAvatarColor(s.fullName) }">{{ getInitials(s.fullName) }}</div>
                  <div class="list-info">
                    <span class="item-name">{{ s.fullName }}</span>
                    <span class="item-detail">{{ getRoleLabel(s.role) }}</span>
                  </div>
                  <span :class="['status-dot-sm', s.status || 'active']"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card glass">
            <div class="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <h3>{{ 'المرضى' }}</h3>
            </div>
            <div class="card-body">
              <div v-if="patients.length === 0" class="empty-text">{{ 'لا يوجد مرضى مسجلين' }}</div>
              <div v-else class="list-items">
                <div v-for="p in patients.slice(0, 8)" :key="p.id" class="list-item">
                  <div class="list-avatar small" :style="{ background: getAvatarColor(p.name) }">{{ getInitials(p.name) }}</div>
                  <div class="list-info">
                    <span class="item-name">{{ p.name }}</span>
                    <span class="item-detail">{{ p.phone || '---' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card glass full-width">
            <div class="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <h3>الملف العام — دليل الأطباء</h3>
            </div>
            <div class="card-body">
              <div class="public-toggle-row">
                <label>ظهور في دليل الأطباء</label>
                <label class="toggle-switch"><input type="checkbox" v-model="pubProfile.is_public" @change="savePublicField('is_public', pubProfile.is_public)" /><span class="toggle-slider"></span></label>
              </div>
              <div class="public-toggle-row">
                <label>حساب موثّق (شارة زرقاء)</label>
                <label class="toggle-switch"><input type="checkbox" v-model="pubProfile.verified" @change="savePublicField('verified', pubProfile.verified)" /><span class="toggle-slider"></span></label>
              </div>
              <div class="public-toggle-row">
                <label>مختبر طبي</label>
                <label class="toggle-switch"><input type="checkbox" v-model="pubProfile.is_lab" @change="savePublicField('is_lab', pubProfile.is_lab)" /><span class="toggle-slider"></span></label>
              </div>
              <div class="public-toggle-row">
                <label>مستشفى</label>
                <label class="toggle-switch"><input type="checkbox" v-model="pubProfile.is_hospital" @change="savePublicField('is_hospital', pubProfile.is_hospital)" /><span class="toggle-slider"></span></label>
              </div>
              <div class="public-field-row">
                <label>صور السلايدر</label>
                <div class="slider-images-wrap">
                  <div v-if="pubProfile.slider_images && pubProfile.slider_images.length" class="slider-images-grid">
                    <div v-for="(img, idx) in pubProfile.slider_images" :key="idx" class="slider-img-thumb">
                      <img :src="img" alt="" />
                      <button class="slider-img-del" @click="removeSliderImage(idx)">×</button>
                    </div>
                  </div>
                  <label class="slider-add-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    إضافة صورة
                    <input type="file" accept="image/*" style="display:none" @change="uploadSliderImage" />
                  </label>
                  <p v-if="sliderUploading" class="field-hint">جاري الرفع...</p>
                </div>
              </div>
              <div class="public-field-row">
                <label>رابط الخريطة</label>
                <input v-model="pubProfile.map_url" type="url" placeholder="https://maps.app.goo.gl/..." class="field-input" @change="savePublicField('map_url', pubProfile.map_url)" />
              </div>
              <div class="public-field-row">
                <label>المنطقة</label>
                <input v-model="pubProfile.area" type="text" placeholder="مثال: حي البعث" class="field-input" @change="savePublicField('area', pubProfile.area)" />
              </div>
              <div class="public-field-row">
                <label>نبذة عن الطبيب</label>
                <textarea v-model="pubProfile.doctor_bio" rows="2" class="field-input" placeholder="نبذة مختصرة..." @change="savePublicField('doctor_bio', pubProfile.doctor_bio)"></textarea>
              </div>
              <div class="public-field-row">
                <label>ملاحظات عامة</label>
                <textarea v-model="pubProfile.notes" rows="2" class="field-input" placeholder="ملاحظات تظهر في الملف العام..." @change="savePublicField('notes', pubProfile.notes)"></textarea>
              </div>
            </div>
          </div>
        </div>
      </template>

      <AppModal v-model="showPlanModal" title="تغيير الخطة" size="sm">
        <div class="plan-select-list">
          <button v-for="p in planOptions" :key="p.key" class="plan-option" :class="{ selected: newPlan === p.key }" @click="newPlan = p.key">
            <span class="plan-opt-name">{{ p.name }}</span>
            <span class="plan-opt-price">{{ p.price }} د.ع/شهرياً</span>
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
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { doctorProfilesRepo } from '@/services/clinic'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const clinicId = route.params.id
const clinic = ref({})
const patients = ref([])
const staff = ref([])
const loading = ref(true)
const showPlanModal = ref(false)
const newPlan = ref('basic')
const pubProfile = ref({ is_public: false, verified: false, is_lab: false, is_hospital: false, slider_images: [], map_url: '', area: '', doctor_bio: '', notes: '' })
const sliderUploading = ref(false)

const planOptions = [
  { key: 'basic', name: 'أساسي', price: 29 },
  { key: 'premium', name: 'متميز', price: 79 },
  { key: 'enterprise', name: 'مؤسسات', price: 199 }
]

const totalRevenue = computed(() => clinic.value.revenue || 0)

const subDuration = computed(() => {
  if (!clinic.value.subscriptionEnd) return '---'
  const end = new Date(clinic.value.subscriptionEnd)
  const start = clinic.value.subscriptionStart ? new Date(clinic.value.subscriptionStart) : new Date()
  const days = Math.ceil((end - start) / 86400000)
  if (days <= 0) return 'منتهي'
  if (days > 30) return `${Math.floor(days / 30)} ${'شهر'}`
  return `${days} ${'يوم'}`
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

function getRoleLabel(role) {
  const map = { doctor: 'طبيب', assistant: 'مساعد', owner: 'مالك', reception: 'استقبال' }
  return map[role] || role
}

function formatDate(ts) {
  if (!ts) return '---'
  return new Date(ts).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function toggleSuspend() {
  const newStatus = clinic.value.status === 'suspended' ? 'active' : 'suspended'
  const msg = `هل تريد ${newStatus === 'suspended' ? 'تعليق' : 'تفعيل'} العيادة؟`
  if (!confirm(msg)) return
  try {
    await updateDoc(doc(db, 'clinics', clinicId), { status: newStatus })
    clinic.value.status = newStatus
  } catch (err) {
  }
}

async function applyPlanChange() {
  try {
    await updateDoc(doc(db, 'clinics', clinicId), { plan: newPlan.value })
    clinic.value.plan = newPlan.value
    showPlanModal.value = false
  } catch (err) {
  }
}

async function confirmDelete() {
  const msg = 'هل أنت متأكد من حذف هذه العيادة؟ لا يمكن التراجع.'
  if (!confirm(msg)) return
  try {
    await deleteDoc(doc(db, 'clinics', clinicId))
    router.push('/super-admin/clinics')
  } catch (err) {
  }
}

async function savePublicField(field, value) {
  try {
    await doctorProfilesRepo.save(clinicId, { [field]: value })
  } catch (err) {}
}

async function uploadSliderImage(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!pubProfile.value.slider_images) pubProfile.value.slider_images = []
  if (pubProfile.value.slider_images.length >= 10) return
  sliderUploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, { method: 'POST', body: formData })
    const data = await res.json()
    if (data.success) {
      pubProfile.value.slider_images.push(data.data.url)
      await doctorProfilesRepo.save(clinicId, { slider_images: pubProfile.value.slider_images })
    }
  } catch (err) {}
  sliderUploading.value = false
  e.target.value = ''
}

async function removeSliderImage(idx) {
  pubProfile.value.slider_images.splice(idx, 1)
  await doctorProfilesRepo.save(clinicId, { slider_images: pubProfile.value.slider_images })
}

onMounted(async () => {
  try {
    const docSnap = await getDoc(doc(db, 'clinics', clinicId))
    if (docSnap.exists()) {
      clinic.value = { id: docSnap.id, ...docSnap.data() }
      newPlan.value = clinic.value.plan || 'basic'
    }

    const patientsSnap = await getDocs(query(collection(db, 'patients'), where('clinicId', '==', clinicId)))
    patients.value = patientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const staffSnap = await getDocs(query(collection(db, 'users'), where('clinicId', '==', clinicId)))
    staff.value = staffSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    try {
      const profile = await doctorProfilesRepo.getByClinic(clinicId)
      if (profile) {
        pubProfile.value = {
          is_public: profile.is_public || false,
          verified: profile.verified || false,
          is_lab: profile.is_lab || false,
          is_hospital: profile.is_hospital || false,
          slider_images: profile.slider_images || [],
          map_url: profile.map_url || '',
          area: profile.area || '',
          doctor_bio: profile.doctor_bio || '',
          notes: profile.notes || ''
        }
      }
    } catch (err) {}
  } catch (err) {
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.clinic-details-page { padding: 24px; max-width: 1200px; margin: 0 auto; animation: fadeUp 0.5s ease; }

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
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 8px 0 0; }
.btn-back {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
  background: #f1f5f9; color: #64748b; border-radius: 8px; text-decoration: none;
  font-size: 0.82rem; font-weight: 600; transition: all 0.2s;
}
.btn-back:hover { background: #e2e8f0; color: #1e293b; }
.status-badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 3px 12px; border-radius: 999px; text-transform: capitalize; margin-top: 8px; }
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.inactive { background: #f3f4f6; color: #6b7280; }
.status-badge.suspended { background: #fef2f2; color: #dc2626; }

.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 14px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.clinic-hero {
  display: flex; align-items: center; gap: 20px; padding: 28px; margin-bottom: 24px;
  flex-wrap: wrap;
}
.hero-avatar {
  width: 72px; height: 72px; border-radius: 20px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 1.5rem; overflow: hidden;
}
.hero-avatar img { width: 100%; height: 100%; object-fit: cover; }
.hero-info { flex: 1; min-width: 200px; }
.hero-info h2 { margin: 0 0 4px; font-size: 1.3rem; font-weight: 800; color: #1e293b; }
.hero-owner { font-size: 0.88rem; color: #64748b; }
.hero-tags { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.hero-email { font-size: 0.82rem; color: #94a3b8; }
.hero-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.action-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
  border: 1px solid #e2e8f0; border-radius: 10px; background: #fff;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.action-btn.danger { color: #dc2626; border-color: #fecaca; }
.action-btn.danger:hover { background: #fef2f2; }
.action-btn.plan { color: #7c3aed; border-color: #ddd6fe; }
.action-btn.plan:hover { background: #f5f3ff; }
.action-btn.delete { color: #dc2626; border-color: #fecaca; }
.action-btn.delete:hover { background: #fef2f2; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; transition: transform 0.3s ease; }
.stat-card:hover { transform: translateY(-4px); }
.stat-icon { width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; color: #fff; }
.stat-icon.purple { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.stat-icon.blue { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.stat-icon.green { background: linear-gradient(135deg, #059669, #34d399); }
.stat-icon.emerald { background: linear-gradient(135deg, #10b981, #6ee7b7); }
.stat-value { display: block; font-size: 1.6rem; font-weight: 800; color: #1e293b; }
.stat-label { font-size: 0.78rem; color: #64748b; }
.stat-info { display: flex; flex-direction: column; }

.content-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.info-card.full-width { grid-column: 1 / -1; }
.info-card { overflow: hidden; display: flex; flex-direction: column; }
.card-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.05);
}
.card-header svg { color: #7c3aed; }
.card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b; }
.card-body { padding: 16px 20px; flex: 1; }

.info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.info-row:last-child { border-bottom: none; }
.info-row label { color: #94a3b8; font-size: 0.85rem; }
.info-row span { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
.badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 3px 12px; border-radius: 999px; text-transform: capitalize; }
.badge.basic { background: #f3f4f6; color: #374151; }
.badge.premium { background: #fef3c7; color: #92400e; }
.badge.enterprise { background: #ede9fe; color: #5b21b6; }

.empty-text { color: #94a3b8; font-size: 0.85rem; padding: 16px 0; }
.list-items { display: flex; flex-direction: column; }
.list-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04);
}
.list-item:last-child { border-bottom: none; }
.list-avatar {
  width: 34px; height: 34px; border-radius: 10px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.list-avatar.small { width: 30px; height: 30px; font-size: 0.68rem; border-radius: 8px; }
.list-info { flex: 1; }
.item-name { display: block; font-weight: 600; font-size: 0.88rem; color: #1e293b; }
.item-detail { display: block; font-size: 0.78rem; color: #94a3b8; }
.status-dot-sm { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot-sm.active { background: #10b981; }
.status-dot-sm.inactive { background: #ef4444; }

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

.public-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.public-toggle-row label:first-child { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 26px; transition: 0.3s; }
.toggle-slider:before { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.toggle-switch input:checked + .toggle-slider { background: #10b981; }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(22px); }

.public-field-row { padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.public-field-row:last-child { border-bottom: none; }
.public-field-row > label { display: block; font-size: 0.82rem; font-weight: 600; color: #64748b; margin-bottom: 8px; }
.field-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; font-family: inherit; color: #1e293b; resize: vertical; }
.field-input:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
.field-hint { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }

.slider-images-wrap { display: flex; flex-direction: column; gap: 10px; }
.slider-images-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.slider-img-thumb { position: relative; width: 100px; height: 68px; border-radius: 8px; overflow: hidden; border: 2px solid #e2e8f0; }
.slider-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.slider-img-del { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 6px; border: none; background: rgba(220,38,38,0.85); color: #fff; font-size: 14px; display: grid; place-items: center; cursor: pointer; line-height: 1; }
.slider-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 2px dashed #e2e8f0; background: #f8fafc; font-size: 0.8rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.slider-add-btn:hover { border-color: #7c3aed; color: #7c3aed; }

@media (max-width: 768px) { .clinic-details-page { padding: 16px; } .stats-row { grid-template-columns: repeat(2, 1fr); } .content-grid { grid-template-columns: 1fr; } .clinic-hero { flex-direction: column; align-items: flex-start; } .hero-actions { width: 100%; } }
@media (max-width: 480px) { .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; } }
</style>
