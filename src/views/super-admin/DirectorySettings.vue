<template>
  <AppLayout title="إدارة دليل الأطباء">
    <!-- Loading -->
    <div v-if="loading" class="ds-loading">
      <div class="ds-spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="ds-error">
      <p>{{ error }}</p>
      <button class="ds-retry-btn" @click="fetchDoctors">إعادة المحاولة</button>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="ds-stats">
        <div class="ds-stat-card ds-stat-blue">
          <div class="ds-stat-num">{{ doctors.length }}</div>
          <div class="ds-stat-label">إجمالي الأطباء</div>
        </div>
        <div class="ds-stat-card ds-stat-green">
          <div class="ds-stat-num">{{ doctors.filter(d => d.is_public).length }}</div>
          <div class="ds-stat-label">منشور</div>
        </div>
        <div class="ds-stat-card ds-stat-purple">
          <div class="ds-stat-num">{{ doctors.filter(d => d.verified).length }}</div>
          <div class="ds-stat-label">موثق</div>
        </div>
        <div class="ds-stat-card ds-stat-amber">
          <div class="ds-stat-num">{{ doctors.filter(d => d.is_top_rated).length }}</div>
          <div class="ds-stat-label">مميز</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="ds-card">
        <div class="ds-card-header">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1150c9" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <h3>إجراءات سريعة</h3>
        </div>
        <div class="ds-quick-actions">
          <button class="ds-qa-btn ds-qa-green" @click="bulkAction('is_public', true)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            تفعيل الكل (ظهور)
          </button>
          <button class="ds-qa-btn ds-qa-gray" @click="bulkAction('is_public', false)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            إيقاف الكل (ظهور)
          </button>
          <button class="ds-qa-btn ds-qa-purple" @click="bulkAction('verified', true)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            تفعيل الكل (توثيق)
          </button>
          <button class="ds-qa-btn ds-qa-gray" @click="bulkAction('verified', false)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            إيقاف الكل (توثيق)
          </button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="ds-card ds-card-compact">
        <div class="ds-filter-row">
          <div class="ds-search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
            <input v-model="searchQuery" type="text" placeholder="بحث عن طبيب أو عيادة..." />
          </div>
          <select v-model="filterStatus" class="ds-select">
            <option value="all">الكل</option>
            <option value="public">منشور</option>
            <option value="private">غير منشور</option>
            <option value="verified">موثق</option>
            <option value="top_rated">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      <!-- Doctors List -->
      <div class="ds-doctors-list">
        <div v-for="doctor in filteredDoctors" :key="doctor.id" class="ds-doctor-card">
          <!-- Header -->
          <div class="ds-doc-header">
            <div class="ds-doc-avatar" :style="{ background: doctor.photoUrl ? 'transparent' : '#1150c9' }">
              <img v-if="doctor.photoUrl" :src="doctor.photoUrl" alt="" />
              <span v-else>{{ getInitials(doctor.doctor_name) }}</span>
            </div>
            <div class="ds-doc-info">
              <h4 class="ds-doc-name">{{ doctor.doctor_name }}</h4>
              <p class="ds-doc-spec">{{ doctor.specialty || 'غير محدد' }}</p>
            </div>
            <div class="ds-doc-meta">
              <span class="ds-doc-meta-item" title="المشاهدات">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ doctor.view_count || 0 }}
              </span>
              <span class="ds-doc-meta-item" title="التقييم">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ doctor.rating_avg ? doctor.rating_avg.toFixed(1) : '0.0' }}
              </span>
            </div>
          </div>

          <!-- Controls -->
          <div class="ds-doc-controls">
            <div class="ds-control-row">
              <div class="ds-control">
                <span class="ds-control-label">الظهور في الدليل</span>
                <button :class="['ds-toggle', doctor.is_public && 'on']" @click="togglePublic(doctor)">
                  <span class="ds-toggle-knob"></span>
                </button>
              </div>
              <div class="ds-control">
                <span class="ds-control-label">شارة التوثيق</span>
                <button :class="['ds-toggle', doctor.verified && 'on']" @click="toggleVerified(doctor)">
                  <span class="ds-toggle-knob"></span>
                </button>
              </div>
              <div class="ds-control">
                <span class="ds-control-label">تمييز علوي</span>
                <button :class="['ds-toggle ds-toggle-amber', doctor.is_top_rated && 'on']" @click="toggleTopRated(doctor)">
                  <span class="ds-toggle-knob"></span>
                </button>
              </div>
              <div class="ds-control ds-control-rating">
                <span class="ds-control-label">التقييم اليدوي</span>
                <div class="ds-rating-input">
                  <input v-model.number="doctor.rating_avg" type="number" min="0" max="5" step="0.1" @change="updateRating(doctor)" />
                  <div class="ds-rating-stars">
                    <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" width="16" height="16" :fill="i <= Math.round(doctor.rating_avg || 0) ? '#f59e0b' : '#e5e7eb'" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="ds-notes-row">
              <label class="ds-control-label">ملاحظات</label>
              <textarea v-model="doctor.notes" rows="2" placeholder="ملاحظات داخلية..." @change="saveNotes(doctor)"></textarea>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredDoctors.length === 0" class="ds-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <p>لا توجد نتائج مطابقة</p>
        </div>
      </div>

      <!-- Toast -->
      <Transition name="ds-toast">
        <div v-if="toast.show" class="ds-toast" :class="'ds-toast-' + toast.type">{{ toast.message }}</div>
      </Transition>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import AppLayout from '@/components/AppLayout.vue'

const loading = ref(true)
const error = ref(null)
const doctors = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const toast = ref({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const filteredDoctors = computed(() => {
  let result = [...doctors.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(d =>
      (d.doctor_name && d.doctor_name.toLowerCase().includes(q)) ||
      (d.specialty && d.specialty.toLowerCase().includes(q)) ||
      (d.clinic_name && d.clinic_name.toLowerCase().includes(q))
    )
  }
  switch (filterStatus.value) {
    case 'public': result = result.filter(d => d.is_public); break
    case 'private': result = result.filter(d => !d.is_public); break
    case 'verified': result = result.filter(d => d.verified); break
    case 'top_rated': result = result.filter(d => d.is_top_rated); break
  }
  result.sort((a, b) => {
    if (a.is_top_rated && !b.is_top_rated) return -1
    if (!a.is_top_rated && b.is_top_rated) return 1
    return (b.rating_avg || 0) - (a.rating_avg || 0)
  })
  return result
})

async function fetchDoctors() {
  loading.value = true
  error.value = null
  try {
    const snapshot = await getDocs(collection(db, 'doctor_profiles'))
    doctors.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    error.value = 'فشل في تحميل البيانات: ' + (e.message || 'خطأ غير معروف')
  } finally {
    loading.value = false
  }
}

async function updateDoctorField(doctorId, field, value) {
  try {
    await updateDoc(doc(db, 'doctor_profiles', doctorId), { [field]: value })
  } catch (e) {
    showToast('خطأ في الحفظ: ' + e.message, 'error')
  }
}

function togglePublic(doctor) {
  doctor.is_public = !doctor.is_public
  updateDoctorField(doctor.id, 'is_public', doctor.is_public)
  showToast(doctor.is_public ? 'تم تفعيل الظهور' : 'تم إخفاء الطبيب')
}

function toggleVerified(doctor) {
  doctor.verified = !doctor.verified
  updateDoctorField(doctor.id, 'verified', doctor.verified)
  showToast(doctor.verified ? 'تم تفعيل التوثيق' : 'تم إلغاء التوثيق')
}

function toggleTopRated(doctor) {
  doctor.is_top_rated = !doctor.is_top_rated
  updateDoctorField(doctor.id, 'is_top_rated', doctor.is_top_rated)
  showToast(doctor.is_top_rated ? 'تم تمييز الطبيب' : 'تم إلغاء التمييز')
}

function updateRating(doctor) {
  if (doctor.rating_avg < 0) doctor.rating_avg = 0
  if (doctor.rating_avg > 5) doctor.rating_avg = 5
  updateDoctorField(doctor.id, 'rating_avg', doctor.rating_avg)
  showToast('تم تحديث التقييم')
}

function saveNotes(doctor) {
  updateDoctorField(doctor.id, 'notes', doctor.notes || '')
  showToast('تم حفظ الملاحظات')
}

async function bulkAction(field, value) {
  const label = field === 'is_public' ? (value ? 'الظهور' : 'الإخفاء') : (value ? 'التوثيق' : 'إلغاء التوثيق')
  if (!confirm(`هل أنت متأكد من ${value ? 'تفعيل' : 'إيقاف'} ${label} لجميع الأطباء؟`)) return

  try {
    const promises = doctors.value.map(d => updateDoc(doc(db, 'doctor_profiles', d.id), { [field]: value }))
    await Promise.all(promises)
    doctors.value.forEach(d => { d[field] = value })
    showToast(`تم ${value ? 'تفعيل' : 'إيقاف'} ${label} لجميع الأطباء`)
  } catch (e) {
    showToast('خطأ في التحديث: ' + e.message, 'error')
  }
}

onMounted(() => { fetchDoctors() })
</script>

<style scoped>
.ds-loading, .ds-error { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 16px; }
.ds-spinner { width: 40px; height: 40px; border: 3.5px solid #e2e8f0; border-top-color: #1150c9; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ds-loading p, .ds-error p { font: 500 0.9rem 'Tajawal', sans-serif; color: #64748b; }
.ds-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 32px; }
.ds-retry-btn { padding: 10px 24px; border: none; border-radius: 10px; background: #1150c9; color: #fff; font: 700 0.85rem 'Cairo', sans-serif; cursor: pointer; }

/* Stats */
.ds-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.ds-stat-card { border-radius: 14px; padding: 18px 14px; text-align: center; }
.ds-stat-num { font: 800 1.5rem/1 'Cairo', sans-serif; }
.ds-stat-label { font: 500 0.72rem 'Tajawal', sans-serif; color: #64748b; margin-top: 4px; }
.ds-stat-blue { background: #eff6ff; } .ds-stat-blue .ds-stat-num { color: #1150c9; }
.ds-stat-green { background: #f0fdf4; } .ds-stat-green .ds-stat-num { color: #10b981; }
.ds-stat-purple { background: #f5f3ff; } .ds-stat-purple .ds-stat-num { color: #7c3aed; }
.ds-stat-amber { background: #fffbeb; } .ds-stat-amber .ds-stat-num { color: #d97706; }

/* Cards */
.ds-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; padding: 20px; margin-bottom: 16px; }
.ds-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.ds-card-header h3 { font: 700 1rem/1 'Cairo', sans-serif; color: #1150c9; }
.ds-card-compact { padding: 14px 16px; }

/* Quick Actions */
.ds-quick-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.ds-qa-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; border: none; font: 700 0.82rem 'Cairo', sans-serif; color: #fff; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
.ds-qa-btn:active { transform: scale(0.97); }
.ds-qa-green { background: #10b981; }
.ds-qa-purple { background: #7c3aed; }
.ds-qa-gray { background: #6b7280; }

/* Filter */
.ds-filter-row { display: flex; gap: 10px; }
.ds-search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 0 14px; transition: border-color 0.2s; }
.ds-search-box:focus-within { border-color: #1150c9; }
.ds-search-box input { flex: 1; border: none; outline: none; background: none; padding: 11px 0; font: 500 0.88rem 'Tajawal', sans-serif; color: #0f172a; }
.ds-select { border: 2px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font: 500 0.85rem 'Tajawal', sans-serif; color: #475569; background: #f8fafc; cursor: pointer; outline: none; transition: border-color 0.2s; }
.ds-select:focus { border-color: #1150c9; }

/* Doctor Cards */
.ds-doctors-list { display: flex; flex-direction: column; gap: 12px; }
.ds-doctor-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; overflow: hidden; }
.ds-doc-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.ds-doc-avatar { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: #fff; font: 800 0.95rem 'Cairo', sans-serif; overflow: hidden; flex-shrink: 0; }
.ds-doc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ds-doc-info { flex: 1; min-width: 0; }
.ds-doc-name { font: 700 0.95rem/1.2 'Cairo', sans-serif; color: #1e293b; }
.ds-doc-spec { font: 500 0.8rem 'Tajawal', sans-serif; color: #64748b; margin-top: 2px; }
.ds-doc-meta { display: flex; gap: 12px; flex-shrink: 0; }
.ds-doc-meta-item { display: flex; align-items: center; gap: 4px; font: 600 0.78rem 'Tajawal', sans-serif; color: #64748b; }

/* Controls */
.ds-doc-controls { padding: 16px 20px; }
.ds-control-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ds-control { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border-radius: 12px; gap: 8px; }
.ds-control-label { font: 600 0.78rem 'Cairo', sans-serif; color: #475569; white-space: nowrap; }
.ds-control-rating { flex-direction: column; align-items: stretch; gap: 8px; }

/* Toggle Switch */
.ds-toggle { position: relative; width: 52px; height: 28px; border-radius: 14px; border: none; background: #d1d5db; cursor: pointer; transition: background 0.25s; padding: 0; flex-shrink: 0; }
.ds-toggle.on { background: #10b981; }
.ds-toggle-amber.on { background: #f59e0b; }
.ds-toggle-knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 11px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); transition: transform 0.25s; }
.ds-toggle.on .ds-toggle-knob { transform: translateX(24px); }

/* Rating */
.ds-rating-input { display: flex; align-items: center; gap: 8px; }
.ds-rating-input input { width: 52px; border: 2px solid #e2e8f0; border-radius: 8px; padding: 6px 4px; text-align: center; font: 600 0.82rem 'Tajawal', sans-serif; color: #1e293b; outline: none; transition: border-color 0.2s; }
.ds-rating-input input:focus { border-color: #1150c9; }
.ds-rating-stars { display: flex; gap: 2px; }

/* Notes */
.ds-notes-row { margin-top: 12px; }
.ds-notes-row textarea { width: 100%; border: 2px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font: 500 0.82rem 'Tajawal', sans-serif; color: #1e293b; background: #f8fafc; resize: none; outline: none; transition: border-color 0.2s; }
.ds-notes-row textarea:focus { border-color: #1150c9; background: #fff; }

/* Empty */
.ds-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; }
.ds-empty p { font: 500 0.9rem 'Tajawal', sans-serif; color: #94a3b8; margin-top: 12px; }

/* Toast */
.ds-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999; padding: 12px 24px; border-radius: 12px; color: #fff; font: 600 0.85rem 'Cairo', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.ds-toast-success { background: #10b981; }
.ds-toast-error { background: #ef4444; }
.ds-toast-enter-active { animation: toastIn 0.3s ease; }
.ds-toast-leave-active { animation: toastOut 0.2s ease; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toastOut { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(12px); } }

/* Responsive */
@media (max-width: 768px) {
  .ds-stats { grid-template-columns: repeat(2, 1fr); }
  .ds-control-row { grid-template-columns: 1fr 1fr; }
  .ds-filter-row { flex-direction: column; }
  .ds-quick-actions { flex-direction: column; }
  .ds-qa-btn { justify-content: center; }
}
@media (max-width: 480px) {
  .ds-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .ds-stat-card { padding: 14px 10px; }
  .ds-stat-num { font-size: 1.2rem; }
  .ds-doc-header { padding: 14px 16px; }
  .ds-doc-controls { padding: 14px 16px; }
  .ds-control-row { grid-template-columns: 1fr; }
  .ds-control { justify-content: space-between; }
}
</style>
