<template>
  <AppLayout :title="'إدارة السلايدر'">
    <template #header>
      <h2 class="sm-title">إدارة السلايدر الإعلاني</h2>
      <p class="sm-sub">إدارة الشرائح المعروضة في دليل الأطباء</p>
    </template>

    <div v-if="loading" class="sm-loading">
      <div class="sm-spinner"></div>
      <span>جاري التحميل...</span>
    </div>

    <template v-else>
      <!-- Settings Card -->
      <div class="sm-card">
        <div class="sm-card-header">
          <div class="sm-card-icon" style="background: #eff6ff; color: #1150c9">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <h3 class="sm-card-title">الإعدادات العامة</h3>
            <p class="sm-card-desc">تحكم بسرعة التبديل وال选项</p>
          </div>
        </div>
        <div class="sm-settings-grid">
          <div class="sm-field">
            <label>فترة التبديل</label>
            <div class="sm-select-wrap">
              <select v-model="settings.interval" @change="saveSettings">
                <option :value="3">3 ثوانٍ</option>
                <option :value="5">5 ثوانٍ</option>
                <option :value="8">8 ثوانٍ</option>
                <option :value="10">10 ثوانٍ</option>
              </select>
            </div>
          </div>
          <div class="sm-field">
            <label>نوع الانتقال</label>
            <div class="sm-select-wrap">
              <select v-model="settings.transition" @change="saveSettings">
                <option value="fade">تلاشي (Fade)</option>
                <option value="slide">انزلاق (Slide)</option>
              </select>
            </div>
          </div>
          <div class="sm-field sm-field-checks">
            <label>خيارات العرض</label>
            <div class="sm-checks-row">
              <label class="sm-check">
                <input type="checkbox" v-model="settings.auto_play" @change="saveSettings" />
                <span class="sm-check-box"></span>
                <span>تشغيل تلقائي</span>
              </label>
              <label class="sm-check">
                <input type="checkbox" v-model="settings.show_dots" @change="saveSettings" />
                <span class="sm-check-box"></span>
                <span>النقاط</span>
              </label>
              <label class="sm-check">
                <input type="checkbox" v-model="settings.show_arrows" @change="saveSettings" />
                <span class="sm-check-box"></span>
                <span>الأسهم</span>
              </label>
              <label class="sm-check">
                <input type="checkbox" v-model="settings.loop" @change="saveSettings" />
                <span class="sm-check-box"></span>
                <span>تكرار</span>
              </label>
            </div>
          </div>
        </div>
        <div v-if="settingsSaving" class="sm-saving">
          <div class="sm-mini-spin"></div>
          جاري الحفظ...
        </div>
      </div>

      <!-- Slides Header -->
      <div class="sm-slides-header">
        <div class="sm-slides-count">
          <span class="sm-count-num">{{ slides.length }}</span>
          <span>شريحة</span>
        </div>
        <button class="sm-btn-add" @click="openAddModal">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
          شريحة جديدة
        </button>
      </div>

      <!-- Slides Grid -->
      <div class="sm-slides-grid" v-if="slides.length">
        <div v-for="slide in slides" :key="slide.id" class="sm-slide-card">
          <div class="sm-slide-img">
            <img v-if="slide.image_url" :src="slide.image_url" :alt="slide.title" />
            <div v-else class="sm-slide-no-img">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <div class="sm-slide-overlay">
              <button class="sm-slide-act sm-slide-edit" @click="openEditModal(slide)" title="تعديل">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="sm-slide-act sm-slide-del" @click="deleteSlide(slide)" title="حذف">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span class="sm-slide-order">#{{ slide.order }}</span>
            <span :class="['sm-slide-status', slide.enabled ? 'on' : 'off']">{{ slide.enabled ? 'مفعّل' : 'معطّل' }}</span>
          </div>
          <div class="sm-slide-info">
            <h4>{{ slide.title || 'بدون عنوان' }}</h4>
            <p>{{ slide.description || 'بدون وصف' }}</p>
            <div class="sm-slide-meta">
              <button class="sm-slide-move" :disabled="slides.indexOf(slide) === 0" @click="moveSlide(slides.indexOf(slide), -1)" title="تحريك لأعلى">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6" stroke-linecap="round"/></svg>
              </button>
              <button class="sm-slide-move" :disabled="slides.indexOf(slide) === slides.length - 1" @click="moveSlide(slides.indexOf(slide), 1)" title="تحريك لأسفل">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6" stroke-linecap="round"/></svg>
              </button>
              <label class="sm-toggle" :title="slide.enabled ? 'تعطيل' : 'تفعيل'">
                <input type="checkbox" :checked="slide.enabled" @change="toggleSlide(slide)" />
                <span class="sm-toggle-track"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="sm-empty">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        <p>لا توجد شرائح بعد</p>
        <button class="sm-btn-add sm-btn-add-sm" @click="openAddModal">أضف أول شريحة</button>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="sm-modal-backdrop" @click.self="closeModal">
        <div class="sm-modal">
          <div class="sm-modal-head">
            <h3>{{ editingSlide ? 'تعديل الشريحة' : 'شريحة جديدة' }}</h3>
            <button class="sm-modal-close" @click="closeModal">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="sm-modal-body">
            <!-- Image Upload -->
            <div class="sm-upload-section">
              <label class="sm-label">صورة الشريحة</label>

              <!-- Preview after upload -->
              <div v-if="formData.image_url" class="sm-preview">
                <img :src="formData.image_url" />
                <div class="sm-preview-badge">صورة مرفوعة</div>
                <button class="sm-preview-del" @click="removeImage">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
                </button>
              </div>

              <!-- Upload progress -->
              <div v-if="uploading" class="sm-upload-progress">
                <div class="sm-upload-spinner"></div>
                <div class="sm-upload-info">
                  <span class="sm-upload-text">جاري رفع الصورة...</span>
                  <div class="sm-upload-bar"><div class="sm-upload-bar-fill"></div></div>
                </div>
              </div>

              <!-- Drop zone -->
              <label v-if="!uploading && !formData.image_url" class="sm-dropzone">
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                <div class="sm-dropzone-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <span class="sm-dropzone-text">اضغط أو اسحب صورة هنا</span>
                <span class="sm-dropzone-hint">PNG, JPG, WebP — حد أقصى 5MB</span>
              </label>
            </div>

            <!-- Title -->
            <div class="sm-field-modal">
              <label class="sm-label">العنوان</label>
              <input v-model="formData.title" type="text" class="sm-input" placeholder="عنوان الشريحة..." />
            </div>

            <!-- Description -->
            <div class="sm-field-modal">
              <label class="sm-label">الوصف</label>
              <textarea v-model="formData.description" rows="2" class="sm-input sm-textarea" placeholder="وصف الشريحة..."></textarea>
            </div>

            <!-- Link -->
            <div class="sm-field-modal">
              <label class="sm-label">رابط الزر (اختياري)</label>
              <input v-model="formData.link_url" type="url" class="sm-input" placeholder="https://example.com" />
            </div>

            <!-- Link Target -->
            <div class="sm-field-modal" v-if="formData.link_url">
              <label class="sm-label">فتح الرابط في</label>
              <div class="sm-radio-group">
                <label class="sm-radio"><input type="radio" v-model="formData.link_target" value="_blank" /><span></span>نافذة جديدة</label>
                <label class="sm-radio"><input type="radio" v-model="formData.link_target" value="_self" /><span></span>نفس الصفحة</label>
              </div>
            </div>

            <!-- Dates -->
            <div class="sm-dates-row">
              <div class="sm-field-modal">
                <label class="sm-label">من تاريخ</label>
                <input v-model="formData.start_date" type="date" class="sm-input" />
              </div>
              <div class="sm-field-modal">
                <label class="sm-label">إلى تاريخ</label>
                <input v-model="formData.end_date" type="date" class="sm-input" />
              </div>
            </div>

            <!-- Enabled -->
            <div class="sm-enabled-row">
              <div>
                <span class="sm-label">حالة الشريحة</span>
                <p class="sm-enabled-desc">{{ formData.enabled ? 'ستظهر في السلايدر' : 'لن تظهر في السلايدر' }}</p>
              </div>
              <label class="sm-toggle lg">
                <input type="checkbox" v-model="formData.enabled" />
                <span class="sm-toggle-track"></span>
              </label>
            </div>
          </div>

          <div class="sm-modal-foot">
            <button class="sm-btn-cancel" @click="closeModal">إلغاء</button>
            <button class="sm-btn-save" :disabled="saving || !formData.image_url" @click="saveSlide">
              <div v-if="saving" class="sm-btn-spin"></div>
              {{ saving ? 'جاري الحفظ...' : (editingSlide ? 'تحديث' : 'إضافة') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div v-if="toast.show" :class="['sm-toast', toast.type === 'error' ? 'sm-toast-err' : 'sm-toast-ok']">
        {{ toast.message }}
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import AppLayout from '@/components/AppLayout.vue'

const loading = ref(true)
const slides = ref([])
const settingsSaving = ref(false)
const showModal = ref(false)
const editingSlide = ref(null)
const saving = ref(false)
const uploading = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const settings = ref({
  interval: 5,
  auto_play: true,
  transition: 'fade',
  show_dots: true,
  show_arrows: true,
  loop: true,
})

const defaultForm = {
  title: '',
  description: '',
  image_url: '',
  delete_url: '',
  link_url: '',
  link_target: '_blank',
  start_date: '',
  end_date: '',
  enabled: true,
}

const formData = ref({ ...defaultForm })

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function loadSlides() {
  try {
    const q = query(collection(db, 'site_sliders'), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    slides.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    showToast('خطأ في تحميل الشرائح', 'error')
  }
}

async function loadSettings() {
  try {
    const snap = await getDoc(doc(db, 'site_sliders_settings', 'global'))
    if (snap.exists()) {
      settings.value = { ...settings.value, ...snap.data() }
    }
  } catch (e) {}
}

async function saveSettings() {
  settingsSaving.value = true
  try {
    await setDoc(doc(db, 'site_sliders_settings', 'global'), settings.value, { merge: true })
    showToast('تم حفظ الإعدادات')
  } catch (e) {
    showToast('خطأ في الحفظ', 'error')
  } finally {
    settingsSaving.value = false
  }
}

function openAddModal() {
  editingSlide.value = null
  formData.value = { ...defaultForm }
  showModal.value = true
}

function openEditModal(slide) {
  editingSlide.value = slide
  formData.value = {
    title: slide.title || '',
    description: slide.description || '',
    image_url: slide.image_url || '',
    delete_url: slide.delete_url || '',
    link_url: slide.link_url || '',
    link_target: slide.link_target || '_blank',
    start_date: slide.start_date || '',
    end_date: slide.end_date || '',
    enabled: slide.enabled !== false,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingSlide.value = null
}

async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY
  if (!apiKey) {
    showToast('مفتاح imgbb غير متوفر', 'error')
    return
  }

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: fd })
    const result = await res.json()
    if (!result.success) throw new Error(result.error?.message || 'فشل الرفع')
    formData.value.image_url = result.data.url
    formData.value.delete_url = result.data.delete_url
    showToast('تم رفع الصورة بنجاح')
  } catch (e) {
    showToast('خطأ في رفع الصورة: ' + e.message, 'error')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

function removeImage() {
  formData.value.image_url = ''
  formData.value.delete_url = ''
}

async function saveSlide() {
  if (!formData.value.image_url) return
  saving.value = true
  try {
    const maxOrder = slides.value.length > 0 ? Math.max(...slides.value.map(s => s.order || 0)) : 0
    const payload = {
      title: formData.value.title,
      description: formData.value.description,
      image_url: formData.value.image_url,
      delete_url: formData.value.delete_url,
      link_url: formData.value.link_url,
      link_target: formData.value.link_target,
      start_date: formData.value.start_date,
      end_date: formData.value.end_date,
      enabled: formData.value.enabled,
    }

    if (editingSlide.value) {
      await updateDoc(doc(db, 'site_sliders', editingSlide.value.id), payload)
      showToast('تم تحديث الشريحة')
    } else {
      payload.order = maxOrder + 1
      payload.created_at = new Date().toISOString()
      await addDoc(collection(db, 'site_sliders'), payload)
      showToast('تم إضافة الشريحة')
    }

    closeModal()
    await loadSlides()
  } catch (e) {
    showToast('خطأ في الحفظ: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function deleteSlide(slide) {
  if (!confirm('هل أنت متأكد من حذف هذه الشريحة؟')) return
  try {
    await deleteDoc(doc(db, 'site_sliders', slide.id))
    if (slide.delete_url) {
      try { await fetch(slide.delete_url) } catch {}
    }
    await loadSlides()
    showToast('تم حذف الشريحة')
  } catch (e) {
    showToast('خطأ في الحذف', 'error')
  }
}

async function toggleSlide(slide) {
  slide.enabled = !slide.enabled
  try {
    await updateDoc(doc(db, 'site_sliders', slide.id), { enabled: slide.enabled })
    showToast(slide.enabled ? 'تم التفعيل' : 'تم التعطيل')
  } catch (e) {
    slide.enabled = !slide.enabled
    showToast('خطأ في التحديث', 'error')
  }
}

async function moveSlide(idx, direction) {
  const newIdx = idx + direction
  if (newIdx < 0 || newIdx >= slides.value.length) return

  const arr = [...slides.value]
  const temp = { ...arr[idx] }
  const other = { ...arr[newIdx] }

  const tempOrder = temp.order
  temp.order = other.order
  other.order = tempOrder

  arr[idx] = other
  arr[newIdx] = temp
  slides.value = arr

  try {
    await updateDoc(doc(db, 'site_sliders', temp.id), { order: temp.order })
    await updateDoc(doc(db, 'site_sliders', other.id), { order: other.order })
  } catch (e) {
    await loadSlides()
    showToast('خطأ في إعادة الترتيب', 'error')
  }
}

onMounted(async () => {
  await Promise.all([loadSlides(), loadSettings()])
  loading.value = false
})
</script>

<style scoped>
* { font-family: 'Tajawal', 'Cairo', system-ui, sans-serif; }

.sm-title { font: 800 1.15rem/1 'Cairo', sans-serif; color: #1150c9; margin: 0; }
.sm-sub { font: 400 0.78rem 'Tajawal', sans-serif; color: #94a3b8; margin: 2px 0 0; }

.sm-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #64748b; }
.sm-spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #1150c9; border-radius: 50%; animation: smSpin 0.7s linear infinite; }
@keyframes smSpin { to { transform: rotate(360deg); } }

/* Settings Card */
.sm-card { background: #fff; border-radius: 16px; border: 1px solid #e8ecf1; padding: 24px; margin-bottom: 24px; }
.sm-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.sm-card-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.sm-card-title { font: 700 0.95rem/1 'Cairo', sans-serif; color: #1e293b; margin: 0; }
.sm-card-desc { font: 400 0.75rem 'Tajawal', sans-serif; color: #94a3b8; margin: 2px 0 0; }
.sm-settings-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.sm-field label { display: block; font: 600 0.75rem 'Cairo', sans-serif; color: #64748b; margin-bottom: 6px; }
.sm-select-wrap select { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #f8fafc; font: 500 0.85rem 'Tajawal', sans-serif; color: #334155; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: 12px center; padding-left: 32px; }
.sm-select-wrap select:focus { outline: none; border-color: #1150c9; }
.sm-checks-row { display: flex; gap: 16px; flex-wrap: wrap; }
.sm-check { display: flex; align-items: center; gap: 6px; cursor: pointer; font: 500 0.82rem 'Tajawal', sans-serif; color: #475569; }
.sm-check input { display: none; }
.sm-check-box { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 5px; display: flex; align-items: center; justify-content: center; background: #f8fafc; flex-shrink: 0; transition: all 0.2s; }
.sm-check input:checked + .sm-check-box { background: #1150c9; border-color: #1150c9; }
.sm-check input:checked + .sm-check-box::after { content: ''; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg) translateY(-1px); }
.sm-saving { display: flex; align-items: center; gap: 8px; margin-top: 12px; font: 400 0.78rem 'Tajawal', sans-serif; color: #94a3b8; }
.sm-mini-spin { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #1150c9; border-radius: 50%; animation: smSpin 0.7s linear infinite; }

/* Slides Header */
.sm-slides-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.sm-slides-count { display: flex; align-items: baseline; gap: 6px; font: 600 0.9rem 'Cairo', sans-serif; color: #475569; }
.sm-count-num { font: 800 1.3rem 'Cairo', sans-serif; color: #1150c9; }
.sm-btn-add { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; border: none; background: linear-gradient(135deg, #1150c9, #0d9488); color: #fff; font: 700 0.85rem 'Cairo', sans-serif; cursor: pointer; transition: all 0.2s; }
.sm-btn-add:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(17, 80, 201, 0.3); }
.sm-btn-add-sm { padding: 8px 16px; font-size: 0.8rem; }

/* Slides Grid */
.sm-slides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 16px; margin-bottom: 24px; }
.sm-slide-card { background: #fff; border-radius: 14px; border: 1px solid #e8ecf1; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.sm-slide-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.sm-slide-img { position: relative; height: 180px; background: #f1f5f9; overflow: hidden; }
.sm-slide-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sm-slide-no-img { width: 100%; height: 100%; display: grid; place-items: center; }
.sm-slide-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.2s; }
.sm-slide-card:hover .sm-slide-overlay { opacity: 1; }
.sm-slide-act { width: 36px; height: 36px; border-radius: 10px; border: none; display: grid; place-items: center; cursor: pointer; transition: all 0.2s; }
.sm-slide-edit { background: rgba(255,255,255,0.9); color: #1150c9; }
.sm-slide-edit:hover { background: #fff; }
.sm-slide-del { background: rgba(255,255,255,0.9); color: #dc2626; }
.sm-slide-del:hover { background: #fff; }
.sm-slide-order { position: absolute; top: 8px; right: 8px; padding: 3px 8px; border-radius: 6px; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); color: #fff; font: 700 0.7rem 'Cairo', sans-serif; }
.sm-slide-status { position: absolute; top: 8px; left: 8px; padding: 3px 10px; border-radius: 6px; font: 700 0.7rem 'Cairo', sans-serif; color: #fff; }
.sm-slide-status.on { background: #10b981; }
.sm-slide-status.off { background: #94a3b8; }

.sm-slide-info { padding: 14px 16px; }
.sm-slide-info h4 { font: 700 0.9rem/1.3 'Cairo', sans-serif; color: #1e293b; margin: 0 0 4px; }
.sm-slide-info p { font: 400 0.78rem 'Tajawal', sans-serif; color: #94a3b8; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sm-slide-meta { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.sm-slide-move { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; display: grid; place-items: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
.sm-slide-move:hover { border-color: #1150c9; color: #1150c9; }
.sm-slide-move:disabled { opacity: 0.3; cursor: not-allowed; }

/* Toggle */
.sm-toggle { position: relative; cursor: pointer; }
.sm-toggle input { display: none; }
.sm-toggle-track { display: block; width: 40px; height: 22px; border-radius: 12px; background: #cbd5e1; position: relative; transition: background 0.2s; }
.sm-toggle-track::after { content: ''; position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.2s; }
.sm-toggle input:checked + .sm-toggle-track { background: #10b981; }
.sm-toggle input:checked + .sm-toggle-track::after { transform: translateX(-18px); }
.sm-toggle.lg .sm-toggle-track { width: 48px; height: 26px; }
.sm-toggle.lg .sm-toggle-track::after { width: 22px; height: 22px; }
.sm-toggle.lg input:checked + .sm-toggle-track::after { transform: translateX(-22px); }

/* Empty */
.sm-empty { text-align: center; padding: 48px 24px; background: #fff; border-radius: 14px; border: 1px solid #e8ecf1; }
.sm-empty p { font: 500 0.9rem 'Tajawal', sans-serif; color: #94a3b8; margin: 16px 0; }

/* Modal */
.sm-modal-backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.sm-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: modalUp 0.3s ease; }
@keyframes modalUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.sm-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.sm-modal-head h3 { font: 700 1rem/1 'Cairo', sans-serif; color: #1150c9; margin: 0; }
.sm-modal-close { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f1f5f9; display: grid; place-items: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
.sm-modal-close:hover { background: #fee2e2; color: #dc2626; }
.sm-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.sm-modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }

.sm-label { display: block; font: 600 0.78rem 'Cairo', sans-serif; color: #475569; margin-bottom: 6px; }
.sm-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font: 500 0.88rem 'Tajawal', sans-serif; color: #1e293b; background: #f8fafc; transition: border-color 0.2s; box-sizing: border-box; }
.sm-input:focus { outline: none; border-color: #1150c9; background: #fff; }
.sm-textarea { resize: none; }

.sm-field-modal { }

/* Upload */
.sm-upload-section { }
.sm-preview { position: relative; border-radius: 12px; overflow: hidden; border: 2px solid #10b981; margin-bottom: 8px; }
.sm-preview img { width: 100%; height: 140px; object-fit: cover; display: block; }
.sm-preview-badge { position: absolute; bottom: 8px; right: 8px; padding: 4px 10px; border-radius: 8px; background: rgba(16, 185, 129, 0.9); backdrop-filter: blur(4px); color: #fff; font: 700 0.7rem 'Cairo', sans-serif; }
.sm-preview-del { position: absolute; top: 8px; left: 8px; width: 28px; height: 28px; border-radius: 8px; border: none; background: rgba(220, 38, 38, 0.9); color: #fff; display: grid; place-items: center; cursor: pointer; }

.sm-upload-progress { display: flex; align-items: center; gap: 12px; padding: 16px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; }
.sm-upload-spinner { width: 24px; height: 24px; border: 3px solid #bfdbfe; border-top-color: #1150c9; border-radius: 50%; animation: smSpin 0.7s linear infinite; flex-shrink: 0; }
.sm-upload-info { flex: 1; }
.sm-upload-text { font: 600 0.82rem 'Cairo', sans-serif; color: #1150c9; }
.sm-upload-bar { height: 4px; background: #dbeafe; border-radius: 4px; margin-top: 6px; overflow: hidden; }
.sm-upload-bar-fill { width: 60%; height: 100%; background: linear-gradient(90deg, #1150c9, #0d9488); border-radius: 4px; animation: smProgress 1.5s ease-in-out infinite; }
@keyframes smProgress { 0% { width: 20%; } 50% { width: 80%; } 100% { width: 20%; } }

.sm-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; border: 2px dashed #d1d5db; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.sm-dropzone:hover { border-color: #1150c9; background: #eff6ff; }
.sm-dropzone input { display: none; }
.sm-dropzone-text { font: 600 0.85rem 'Cairo', sans-serif; color: #64748b; margin-top: 10px; }
.sm-dropzone-hint { font: 400 0.72rem 'Tajawal', sans-serif; color: #94a3b8; margin-top: 4px; }

.sm-dates-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.sm-radio-group { display: flex; gap: 16px; }
.sm-radio { display: flex; align-items: center; gap: 6px; cursor: pointer; font: 500 0.82rem 'Tajawal', sans-serif; color: #475569; }
.sm-radio input { display: none; }
.sm-radio span { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.sm-radio input:checked + span { border-color: #1150c9; }
.sm-radio input:checked + span::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #1150c9; }

.sm-enabled-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #f8fafc; border-radius: 12px; }
.sm-enabled-desc { font: 400 0.72rem 'Tajawal', sans-serif; color: #94a3b8; margin: 2px 0 0; }

.sm-btn-cancel { padding: 10px 20px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; font: 600 0.85rem 'Cairo', sans-serif; color: #64748b; cursor: pointer; transition: all 0.2s; }
.sm-btn-cancel:hover { background: #f1f5f9; }
.sm-btn-save { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 10px; border: none; background: linear-gradient(135deg, #1150c9, #0d9488); color: #fff; font: 700 0.85rem 'Cairo', sans-serif; cursor: pointer; transition: all 0.2s; }
.sm-btn-save:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(17, 80, 201, 0.3); }
.sm-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.sm-btn-spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: smSpin 0.7s linear infinite; }

/* Toast */
.sm-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 100; padding: 12px 24px; border-radius: 12px; color: #fff; font: 600 0.85rem 'Cairo', sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,0.15); animation: toastIn 0.3s ease; }
.sm-toast-ok { background: #10b981; }
.sm-toast-err { background: #dc2626; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

@media (max-width: 640px) {
  .sm-settings-grid { grid-template-columns: 1fr; }
  .sm-slides-grid { grid-template-columns: 1fr; }
  .sm-dates-row { grid-template-columns: 1fr; }
  .sm-modal { margin: 8px; border-radius: 16px; }
}
</style>
