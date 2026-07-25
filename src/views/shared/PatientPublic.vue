<template>
  <div class="mpub">

    <!-- LOADING -->
    <div v-if="loading" class="mpub-loading">
      <div class="mpub-spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!patient" class="mpub-notfound">
      <div class="mpub-notfound-icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="#cbd5e1" stroke="none"/><circle cx="15" cy="10" r="1" fill="#cbd5e1" stroke="none"/></svg>
      </div>
      <h2>المريض غير موجود</h2>
      <p>الرابط غير صالح أو تم حذف بيانات المريض</p>
      <button class="mpub-retry" @click="reload">إعادة المحاولة</button>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>

      <!-- HERO HEADER -->
      <div class="mpub-hero">
        <div class="mpub-hero-bg"></div>
        <div class="mpub-hero-content">
          <div class="mpub-brand">
            <div class="mpub-brand-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span>مدار</span>
          </div>

          <!-- Doctor Card -->
          <div class="mpub-doc" v-if="doctorInfo">
            <div class="mpub-doc-avatar" :style="{ background: doctorInfo.photoUrl ? 'none' : 'linear-gradient(135deg, #1150c9, #0d9488)' }">
              <img v-if="doctorInfo.photoUrl" :src="doctorInfo.photoUrl" alt="" />
              <span v-else>{{ doctorInitials }}</span>
            </div>
            <div class="mpub-doc-info">
              <h1 class="mpub-doc-name">{{ doctorInfo.doctor_name || 'الطبيب المعالج' }}</h1>
              <p class="mpub-doc-clinic" v-if="doctorInfo.clinic_name">{{ doctorInfo.clinic_name }}</p>
              <p class="mpub-doc-bio" v-if="doctorInfo.doctor_bio">{{ doctorInfo.doctor_bio }}</p>
            </div>
            <div class="mpub-doc-contacts">
              <a v-if="doctorInfo.phone1" :href="`tel:${doctorInfo.phone1}`" class="mpub-doc-contact">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ doctorInfo.phone1 }}
              </a>
              <span v-if="doctorInfo.clinic_address" class="mpub-doc-contact">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ doctorInfo.clinic_address }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PATIENT CARD -->
      <div class="mpub-patient">
        <div class="mpub-patient-main">
          <div class="mpub-patient-avatar" :style="{ background: avatarColor(patient.full_name || patient.fullName) }">
            {{ initials(patient.full_name || patient.fullName) }}
          </div>
          <div class="mpub-patient-info">
            <h2 class="mpub-patient-name">{{ patient.full_name || patient.fullName }}</h2>
            <div class="mpub-patient-meta">
              <span class="mpub-badge mpub-badge-male" v-if="patientGenderLabel === 'ذكر'">ذكر</span>
              <span class="mpub-badge mpub-badge-female" v-else-if="patientGenderLabel === 'أنثى'">أنثى</span>
              <span class="mpub-badge" v-if="patient.age">{{ patient.age }} سنة</span>
              <a v-if="patient.phone" :href="`tel:${patient.phone}`" class="mpub-badge mpub-badge-phone">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ patient.phone }}
              </a>
              <span v-if="patient.file_number" class="mpub-badge mpub-badge-file">رقم الملف: {{ patient.file_number }}</span>
            </div>
          </div>
        </div>
        <div class="mpub-patient-qr" v-if="patientQrUrl">
          <img :src="patientQrUrl" alt="QR" />
        </div>
      </div>

      <!-- TABS -->
      <div class="mpub-tabs">
        <button v-for="tab in tabs" :key="tab.key" :class="['mpub-tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
          <span class="mpub-tab-label">{{ tab.label }}</span>
          <span v-if="tab.count" class="mpub-tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- TAB: INFO -->
      <div v-if="activeTab === 'info'" class="mpub-panel">
        <div class="mpub-grid">
          <div class="mpub-field" v-for="field in patientFields" :key="field.label" :class="{ full: field.full }">
            <span class="mpub-field-label">{{ field.label }}</span>
            <span class="mpub-field-value">{{ field.value }}</span>
          </div>
        </div>
      </div>

      <!-- TAB: DIAGNOSES -->
      <div v-if="activeTab === 'diagnoses'" class="mpub-panel">
        <div v-if="diagnoses.length === 0" class="mpub-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M9 12h6M12 9v6"/><circle cx="12" cy="12" r="10"/></svg>
          <p>لا توجد تشخيصات مسجلة</p>
        </div>
        <div v-for="d in diagnoses" :key="d.id" class="mpub-record">
          <div class="mpub-record-header">
            <div class="mpub-record-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {{ formatDate(d.appointment_date || d.createdAt) }}
            </div>
            <span class="mpub-record-badge mpub-badge-blue">تشخيص</span>
          </div>
          <div class="mpub-record-body" v-if="d.content">
            <div class="mpub-teeth-map" v-if="d.teeth && d.teeth.length">
              <span v-for="t in d.teeth" :key="t" class="mpub-tooth">{{ t }}</span>
            </div>
            <p class="mpub-record-text">{{ d.content }}</p>
          </div>
        </div>
      </div>

      <!-- TAB: PRESCRIPTIONS -->
      <div v-if="activeTab === 'prescriptions'" class="mpub-panel">
        <div v-if="prescriptions.length === 0" class="mpub-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          <p>لا توجد وصفات طبية مسجلة</p>
        </div>
        <div v-for="rx in prescriptions" :key="rx.id" class="mpub-record">
          <div class="mpub-record-header">
            <div class="mpub-record-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {{ formatDate(rx.date || rx.createdAt) }}
            </div>
            <span v-if="rx.doctorName" class="mpub-record-doctor">{{ rx.doctorName }}</span>
          </div>
          <div class="mpub-meds">
            <template v-for="(med, i) in rx.medications || [{ name: rx.medication, dosage: rx.dosage, frequency: rx.frequency }]" :key="i">
              <div v-if="med.name" class="mpub-med">
                <div class="mpub-med-num">{{ i + 1 }}</div>
                <div class="mpub-med-info">
                  <span class="mpub-med-name">{{ med.name }}</span>
                  <span class="mpub-med-detail" v-if="med.dosage || med.frequency">{{ med.dosage }} <template v-if="med.dosage && med.frequency">—</template> {{ med.frequency }}</span>
                </div>
              </div>
            </template>
          </div>
          <p class="mpub-record-note" v-if="rx.notes">{{ rx.notes }}</p>
        </div>
      </div>

      <!-- TAB: VISITS -->
      <div v-if="activeTab === 'visits'" class="mpub-panel">
        <div v-if="visits.length === 0" class="mpub-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>لا توجد زيارات مسجلة</p>
        </div>
        <div v-for="v in visits" :key="v.id" class="mpub-record">
          <div class="mpub-record-header">
            <div class="mpub-record-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {{ formatDate(v.date || v.createdAt) }}
            </div>
            <span :class="['mpub-record-badge', visitBadgeClass(v.status)]">{{ visitStatusLabel(v.status) }}</span>
          </div>
          <div class="mpub-record-body">
            <p class="mpub-record-text" v-if="v.treatmentType || v.condition || v.type">{{ v.treatmentType || v.condition || v.type }}</p>
            <p class="mpub-record-note" v-if="v.notes">{{ v.notes }}</p>
          </div>
        </div>
      </div>

      <!-- SHARE ACTIONS -->
      <div class="mpub-actions">
        <button class="mpub-action mpub-action-whatsapp" @click="shareWhatsApp">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          مشاركة عبر واتساب
        </button>
        <button class="mpub-action mpub-action-copy" @click="copyLink">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {{ copied ? 'تم النسخ!' : 'نسخ الرابط' }}
        </button>
      </div>

      <!-- FOOTER -->
      <div class="mpub-footer">
        <div class="mpub-footer-line"></div>
        <p>مدار — نظام إدارة العيادات الطبية</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore'
import { settingsRepo } from '@/services/clinic'
import QRCode from 'qrcode'

const route = useRoute()
const loading = ref(true)
const patient = ref(null)
const doctorInfo = ref(null)
const diagnoses = ref([])
const prescriptions = ref([])
const visits = ref([])
const activeTab = ref('info')
const copied = ref(false)
const patientQrUrl = ref('')

const clinicId = computed(() => route.params.clinicId)
const patientId = computed(() => route.params.patientId)

const doctorInitials = computed(() => {
  const n = doctorInfo.value?.doctor_name
  if (!n) return 'د'
  return n.split(' ').map(w => w[0]).join('').substring(0, 2)
})

const patientGenderLabel = computed(() => {
  const g = patient.value?.gender
  if (g === 'male' || g === 'ذكر') return 'ذكر'
  if (g === 'female' || g === 'أنثى') return 'أنثى'
  return ''
})

const patientFields = computed(() => {
  if (!patient.value) return []
  const p = patient.value
  return [
    { label: 'الاسم الكامل', value: p.full_name || p.fullName || '-' },
    { label: 'العمر', value: p.age ? p.age + ' سنة' : '-' },
    { label: 'الجنس', value: patientGenderLabel.value || '-' },
    { label: 'رقم الهاتف', value: p.phone || '-' },
    { label: 'العنوان', value: p.address || '-', full: true },
    { label: 'الأمراض المزمنة', value: p.chronicDiseases || p.chronic_diseases || 'لا يوجد', full: true },
    { label: 'الحساسية', value: p.allergies || 'لا يوجد', full: true },
    { label: 'ملاحظات', value: p.notes || 'لا يوجد', full: true },
  ]
})

const tabs = computed(() => [
  { key: 'info', label: 'المعلومات', count: 0 },
  { key: 'diagnoses', label: 'التشخيصات', count: diagnoses.value.length },
  { key: 'prescriptions', label: 'الوصفات', count: prescriptions.value.length },
  { key: 'visits', label: 'الزيارات', count: visits.value.length },
])

const colors = ['#1150c9', '#0d9488', '#d69e25', '#dc2626', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316']
function avatarColor(name) {
  if (!name) return colors[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}
function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
function formatDate(s) {
  if (!s) return '-'
  try { return new Date(s).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return s }
}
function visitStatusLabel(s) {
  return { pending: 'معلّق', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي', active: 'جاري' }[s] || s || '-'
}
function visitBadgeClass(s) {
  return { completed: 'mpub-badge-green', pending: 'mpub-badge-yellow', confirmed: 'mpub-badge-blue', cancelled: 'mpub-badge-red', active: 'mpub-badge-green' }[s] || ''
}

function shareWhatsApp() {
  if (!patient.value) return
  const name = patient.value.full_name || patient.value.fullName || 'المريض'
  const text = 'مرحباً، بيانات المريض ' + name + '\n' + window.location.href
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function reload() { window.location.reload() }

async function generateQr() {
  try {
    patientQrUrl.value = await QRCode.toDataURL(window.location.href, {
      width: 100, margin: 1, color: { dark: '#1150c9', light: '#ffffff' }
    })
  } catch { /* ignore */ }
}

onMounted(async () => {
  try {
    const cid = clinicId.value
    const pid = patientId.value
    if (!cid || !pid) { loading.value = false; return }

    const [pSnap, dsSnap] = await Promise.all([
      getDoc(doc(db, 'patients', pid)),
      settingsRepo.getDoctorInfo(cid).catch(() => null)
    ])

    if (pSnap.exists()) {
      patient.value = { id: pSnap.id, ...pSnap.data() }
    } else {
      loading.value = false
      return
    }

    if (dsSnap) doctorInfo.value = dsSnap

    generateQr()

    const [diagSnap, rxSnap, vSnap] = await Promise.all([
      getDocs(query(collection(db, 'diagnoses'), where('clinicId', '==', cid), where('patient_id', '==', pid), limit(50))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', cid), where('patientId', '==', pid), limit(50))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, 'visits'), where('clinicId', '==', cid), where('patientId', '==', pid), limit(50))).catch(() => ({ docs: [] })),
    ])

    diagnoses.value = diagSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    prescriptions.value = rxSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    visits.value = vSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800;900&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Noto Kufi Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f0f4f8;
  color: #1a2332;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.mpub { min-height: 100vh; padding: 0; max-width: 520px; margin: 0 auto; padding-bottom: 32px; }

.mpub-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; gap: 16px; color: #94a3b8; }
.mpub-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1150c9; border-radius: 50%; animation: mspin 0.7s linear infinite; }
@keyframes mspin { to { transform: rotate(360deg); } }

.mpub-notfound { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; gap: 16px; padding: 32px; }
.mpub-notfound-icon { width: 80px; height: 80px; border-radius: 20px; background: #f1f5f9; display: grid; place-items: center; }
.mpub-notfound h2 { font-size: 1.1rem; font-weight: 800; color: #1a2332; }
.mpub-notfound p { font-size: 0.82rem; color: #94a3b8; text-align: center; }
.mpub-retry { margin-top: 8px; padding: 10px 24px; border: none; border-radius: 10px; background: #1150c9; color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }

.mpub-hero { position: relative; padding: 20px 20px 28px; overflow: hidden; }
.mpub-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1150c9 0%, #0d6fc4 40%, #0d9488 100%); }
.mpub-hero-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%); }
.mpub-hero-content { position: relative; z-index: 1; }

.mpub-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
.mpub-brand-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.2); display: grid; place-items: center; color: #fff; }
.mpub-brand span { color: #fff; font-size: 1rem; font-weight: 900; }

.mpub-doc { display: flex; flex-direction: column; gap: 12px; }
.mpub-doc-avatar { width: 64px; height: 64px; border-radius: 16px; display: grid; place-items: center; color: #fff; font-size: 1.3rem; font-weight: 900; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.mpub-doc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.mpub-doc-info { flex: 1; }
.mpub-doc-name { font-size: 1.15rem; font-weight: 900; color: #fff; margin: 0; line-height: 1.3; }
.mpub-doc-clinic { font-size: 0.85rem; color: rgba(255,255,255,0.85); font-weight: 600; margin: 2px 0 0; }
.mpub-doc-bio { font-size: 0.78rem; color: rgba(255,255,255,0.65); margin: 4px 0 0; }
.mpub-doc-contacts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.mpub-doc-contact { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; color: rgba(255,255,255,0.85); text-decoration: none; padding: 4px 10px; background: rgba(255,255,255,0.15); border-radius: 8px; transition: background 0.2s; }
.mpub-doc-contact:hover { background: rgba(255,255,255,0.25); }

.mpub-patient { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff; border-radius: 16px; padding: 20px; margin: -12px 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; z-index: 2; }
.mpub-patient-main { display: flex; gap: 14px; align-items: center; flex: 1; min-width: 0; }
.mpub-patient-avatar { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: #fff; font-size: 0.95rem; font-weight: 800; flex-shrink: 0; }
.mpub-patient-info { flex: 1; min-width: 0; }
.mpub-patient-name { font-size: 1.1rem; font-weight: 800; color: #1a2332; margin: 0 0 6px; }
.mpub-patient-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.mpub-patient-qr { flex-shrink: 0; }
.mpub-patient-qr img { width: 64px; height: 64px; border-radius: 8px; border: 2px solid #f1f5f9; }

.mpub-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: #f1f5f9; color: #64748b; }
.mpub-badge-male { background: #dbeafe; color: #2563eb; }
.mpub-badge-female { background: #fce7f3; color: #db2777; }
.mpub-badge-phone { background: #f0fdf4; color: #16a34a; text-decoration: none; cursor: pointer; }
.mpub-badge-file { background: #fef3c7; color: #d97706; }

.mpub-tabs { display: flex; gap: 4px; padding: 4px; background: #fff; border-radius: 14px; margin: 0 16px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mpub-tab { flex: 1; padding: 10px 4px; border: none; background: none; font-size: 0.75rem; font-weight: 700; color: #94a3b8; cursor: pointer; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px; font-family: inherit; }
.mpub-tab.active { background: linear-gradient(135deg, #1150c9, #0d9488); color: #fff; box-shadow: 0 2px 8px rgba(17,80,201,0.3); }
.mpub-tab:hover:not(.active) { background: #f8fafc; color: #475569; }
.mpub-tab-count { font-size: 0.6rem; padding: 1px 5px; border-radius: 8px; background: rgba(255,255,255,0.2); }
.mpub-tab:not(.active) .mpub-tab-count { background: #f1f5f9; color: #94a3b8; }

.mpub-panel { background: #fff; border-radius: 16px; margin: 0 16px 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

.mpub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mpub-field { display: flex; flex-direction: column; gap: 4px; }
.mpub-field.full { grid-column: 1 / -1; }
.mpub-field-label { font-size: 0.68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.03em; }
.mpub-field-value { font-size: 0.88rem; color: #1a2332; line-height: 1.5; }

.mpub-empty { text-align: center; padding: 40px 20px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.mpub-empty p { font-size: 0.88rem; }

.mpub-record { padding: 14px; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 10px; transition: border-color 0.2s; }
.mpub-record:hover { border-color: #e2e8f0; }
.mpub-record:last-child { margin-bottom: 0; }
.mpub-record-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.mpub-record-date { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; color: #1a2332; }
.mpub-record-doctor { font-size: 0.72rem; color: #94a3b8; }
.mpub-record-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.mpub-badge-blue { background: #eef2ff; color: #4f46e5; }
.mpub-badge-green { background: #ecfdf5; color: #059669; }
.mpub-badge-yellow { background: #fffbeb; color: #d97706; }
.mpub-badge-red { background: #fef2f2; color: #dc2626; }

.mpub-record-body { margin-top: 4px; }
.mpub-record-text { font-size: 0.85rem; color: #475569; line-height: 1.6; white-space: pre-wrap; }
.mpub-record-note { font-size: 0.78rem; color: #94a3b8; font-style: italic; margin-top: 6px; }

.mpub-teeth-map { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.mpub-tooth { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: #fef3c7; color: #d97706; font-size: 0.7rem; font-weight: 700; }

.mpub-meds { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.mpub-med { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
.mpub-med-num { width: 24px; height: 24px; border-radius: 7px; background: linear-gradient(135deg, #1150c9, #0d9488); color: #fff; font-size: 0.65rem; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }
.mpub-med-info { flex: 1; min-width: 0; }
.mpub-med-name { display: block; font-weight: 700; font-size: 0.85rem; color: #1a2332; }
.mpub-med-detail { display: block; font-size: 0.75rem; color: #64748b; margin-top: 1px; }

.mpub-actions { display: flex; gap: 10px; margin: 0 16px 16px; }
.mpub-action { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 16px; border: none; border-radius: 14px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.mpub-action-whatsapp { background: linear-gradient(135deg, #25d366, #128c7e); color: #fff; }
.mpub-action-whatsapp:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,211,102,0.3); }
.mpub-action-copy { background: #eef2ff; color: #1150c9; }
.mpub-action-copy:hover { background: #1150c9; color: #fff; }

.mpub-footer { text-align: center; padding: 16px; }
.mpub-footer-line { width: 40px; height: 3px; border-radius: 2px; background: linear-gradient(135deg, #1150c9, #0d9488); margin: 0 auto 12px; }
.mpub-footer p { color: #94a3b8; font-size: 0.72rem; font-weight: 600; }

@media (max-width: 480px) {
  .mpub-hero { padding: 16px 16px 24px; }
  .mpub-patient { margin: -12px 12px 12px; padding: 16px; }
  .mpub-tabs { margin: 0 12px 12px; }
  .mpub-panel { margin: 0 12px 12px; padding: 16px; }
  .mpub-actions { margin: 0 12px 12px; }
  .mpub-grid { grid-template-columns: 1fr; }
  .mpub-doc-avatar { width: 52px; height: 52px; font-size: 1.1rem; }
  .mpub-tab { padding: 9px 4px; font-size: 0.7rem; }
}

@media (min-width: 768px) {
  .mpub-hero { padding: 28px 28px 32px; border-radius: 0 0 24px 24px; }
  .mpub-patient { margin: -16px 24px 20px; padding: 24px; border-radius: 20px; }
  .mpub-tabs { margin: 0 24px 20px; }
  .mpub-panel { margin: 0 24px 20px; padding: 24px; }
  .mpub-actions { margin: 0 24px 20px; }
}
</style>