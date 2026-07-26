<template>
  <AppLayout :title="'إدارة الدليل'">
    <template #header>
      <h2 class="dl-title">الدليل العام</h2>
      <p class="dl-sub">إضافة وتعديل وحذف أطباء، صيدليات، مستشفيات، مختبرات، علاج طبيعي</p>
    </template>

    <div v-if="loading" class="dl-loading">
      <div class="dl-spinner"></div>
      <span>جاري التحميل...</span>
    </div>

    <template v-else>
      <div class="dl-header-actions">
        <button class="dl-btn dl-btn-primary" @click="openAdd()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة للدليل
        </button>
        <div class="dl-filters">
          <button v-for="f in typeFilters" :key="f.key" :class="['dl-filter-chip', filterType === f.key && 'active']" @click="filterType = f.key">
            {{ f.icon }} {{ f.label }}
            <span v-if="f.count !== undefined" class="dl-chip-count">{{ f.count }}</span>
          </button>
        </div>
        <div class="dl-count">العدد: {{ filteredListings.length }}</div>
      </div>

      <div v-if="filteredListings.length === 0" class="dl-empty">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
        <h3>لا يوجد سجلات في الدليل</h3>
        <p>اضغط "إضافة للدليل" لإضافة أول سجل</p>
      </div>

      <div v-else class="dl-grid">
        <div v-for="item in filteredListings" :key="item.id" class="dl-card">
          <div class="dl-card-top">
            <div class="dl-card-avatar" :style="{ background: getTypeColor(item) }">
              <img v-if="item.photoUrl" :src="item.photoUrl" alt="" />
              <span v-else>{{ getTypeIcon(item) }}</span>
            </div>
            <div class="dl-card-info">
              <div class="dl-card-name-row">
                <h4 class="dl-card-name">{{ getItemDisplayName(item) }}</h4>
                <span class="dl-card-type-badge" :style="{ background: getTypeColor(item) + '18', color: getTypeColor(item) }">{{ getTypeLabel(item) }}</span>
                <span v-if="item.is_24h" class="dl-card-24h">24 ساعة</span>
              </div>
              <span class="dl-card-spec" :style="{ color: getTypeColor(item) }">{{ item.specialty || '-' }}</span>
              <span class="dl-card-loc">{{ item.governorate || '' }}{{ item.governorate && item.area ? ' - ' : '' }}{{ item.area || '' }}</span>
            </div>
            <div class="dl-card-toggle">
              <label class="dl-switch">
                <input type="checkbox" :checked="item.enabled !== false" @change="toggleEnabled(item)" />
                <span class="dl-switch-slider"></span>
              </label>
            </div>
          </div>
          <div class="dl-card-meta">
            <span v-if="item.phone">📱 {{ item.phone }}</span>
            <span v-if="item.whatsapp">💬 {{ item.whatsapp }}</span>
            <span>👁 {{ item.view_count || 0 }}</span>
          </div>
          <div class="dl-card-actions">
            <button class="dl-btn-sm dl-btn-edit" @click="openEdit(item)">تعديل</button>
            <button class="dl-btn-sm dl-btn-delete" @click="confirmDelete(item)">حذف</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="dl-modal-overlay" @click.self="showModal = false">
          <div class="dl-modal">
            <div class="dl-modal-header">
              <h3>{{ editing ? 'تعديل السجل' : 'إضافة سجل جديد' }}</h3>
              <button class="dl-modal-close" @click="showModal = false">&times;</button>
            </div>
            <div class="dl-modal-body">

              <!-- Type Selector -->
              <div class="dl-field" v-if="!editing">
                <label>نوع المنشأة *</label>
                <div class="dl-type-grid">
                  <button v-for="t in facilityTypes" :key="t.value" :class="['dl-type-btn', form.facility_type === t.value && 'active']" @click="form.facility_type = t.value">
                    <span class="dl-type-icon">{{ t.icon }}</span>
                    <span>{{ t.label }}</span>
                  </button>
                </div>
              </div>

              <template v-if="form.facility_type">
                <!-- Name -->
                <div class="dl-field">
                  <label>{{ nameLabel }} *</label>
                  <input v-model="form.doctor_name" :placeholder="namePlaceholder" />
                </div>

                <!-- Specialty / Department -->
                <div class="dl-field">
                  <label>{{ specLabel }}</label>
                  <select v-model="form.specialty">
                    <option value="">اختر</option>
                    <option v-for="s in currentSpecs" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <!-- Governorate + Area -->
                <div class="dl-form-row">
                  <div class="dl-field">
                    <label>المحافظة *</label>
                    <select v-model="form.governorate">
                      <option value="">اختر المحافظة</option>
                      <option v-for="g in govs" :key="g" :value="g">{{ g }}</option>
                    </select>
                  </div>
                  <div class="dl-field">
                    <label>المنطقة</label>
                    <input v-model="form.area" placeholder="المنطقة الفرعية" />
                  </div>
                </div>

                <!-- Phones -->
                <div class="dl-form-row">
                  <div class="dl-field">
                    <label>رقم الهاتف</label>
                    <input v-model="form.phone" placeholder="07XX XXX XXXX" dir="ltr" />
                  </div>
                  <div class="dl-field">
                    <label>رقم الهاتف 2</label>
                    <input v-model="form.phone2" placeholder="07XX XXX XXXX" dir="ltr" />
                  </div>
                </div>

                <div class="dl-form-row">
                  <div class="dl-field">
                    <label>الواتساب</label>
                    <input v-model="form.whatsapp" placeholder="964XXXXXXXXXX" dir="ltr" />
                  </div>
                  <div class="dl-field">
                    <label>الموقع الإلكتروني</label>
                    <input v-model="form.website" placeholder="https://..." dir="ltr" />
                  </div>
                </div>

                <!-- Address + Map -->
                <div class="dl-field">
                  <label>العنوان</label>
                  <input v-model="form.address" placeholder="العنوان بالتفصيل" />
                </div>
                <div class="dl-field">
                  <label>رابط الخريطة (Google Maps)</label>
                  <input v-model="form.map_url" placeholder="https://maps.google.com/..." dir="ltr" />
                </div>

                <!-- Photo -->
                <div class="dl-field">
                  <label>الصورة</label>
                  <div class="dl-photo-upload">
                    <img v-if="form.photoUrl" :src="form.photoUrl" class="dl-photo-preview" />
                    <label class="dl-photo-btn">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {{ form.photoUrl ? 'تغيير الصورة' : 'اختر صورة' }}
                      <input type="file" accept="image/*" @change="onPhotoUpload" style="display:none" />
                    </label>
                    <button v-if="form.photoUrl" class="dl-photo-remove" @click="form.photoUrl = ''">&times;</button>
                    <span v-if="uploadingPhoto" class="dl-photo-loading">جاري الرفع...</span>
                  </div>
                </div>

                <!-- Bio -->
                <div class="dl-field">
                  <label>{{ bioLabel }}</label>
                  <textarea v-model="form.doctor_bio" rows="3" :placeholder="bioPlaceholder"></textarea>
                </div>

                <!-- Working Hours -->
                <div class="dl-field">
                  <div class="dl-24h-toggle">
                    <label class="dl-switch">
                      <input type="checkbox" v-model="form.is_24h" />
                      <span class="dl-switch-slider"></span>
                    </label>
                    <span class="dl-24h-label">⏰ مفتوح 24 ساعة</span>
                  </div>
                </div>
                <div class="dl-form-row" v-if="!form.is_24h">
                  <div class="dl-field">
                    <label>وقت الفتح</label>
                    <input v-model="form.clinic_open_time" type="time" />
                  </div>
                  <div class="dl-field">
                    <label>وقت الإغلاق</label>
                    <input v-model="form.clinic_close_time" type="time" />
                  </div>
                </div>
              </template>

            </div>
            <div class="dl-modal-footer">
              <button class="dl-btn dl-btn-ghost" @click="showModal = false">إلغاء</button>
              <button class="dl-btn dl-btn-primary" @click="save" :disabled="saving || !form.facility_type">
                <span v-if="saving" class="dl-btn-spinner"></span>
                {{ editing ? 'حفظ التعديلات' : 'إضافة للدليل' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDeleteModal" class="dl-modal-overlay" @click.self="showDeleteModal = false">
          <div class="dl-modal dl-modal-sm">
            <div class="dl-modal-header dl-modal-header-danger">
              <h3>تأكيد الحذف</h3>
              <button class="dl-modal-close" @click="showDeleteModal = false">&times;</button>
            </div>
            <div class="dl-modal-body" style="text-align:center;padding:24px">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <p style="margin-top:12px;font-weight:700;color:#1e293b">هل أنت متأكد من حذف<br/>{{ getItemDisplayName(deletingItem) }}؟</p>
              <p style="font-size:0.8rem;color:#94a3b8;margin-top:4px">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div class="dl-modal-footer">
              <button class="dl-btn dl-btn-ghost" @click="showDeleteModal = false">إلغاء</button>
              <button class="dl-btn dl-btn-danger" @click="doDelete">نعم، حذف</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { directoryListingsRepo } from '@/services/clinic'

const loading = ref(true)
const saving = ref(false)
const uploadingPhoto = ref(false)
const listings = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const editing = ref(false)
const editingId = ref(null)
const deletingItem = ref(null)
const filterType = ref('all')

const facilityTypes = [
  { value: 'doctor', icon: '🩺', label: 'طبيب' },
  { value: 'pharmacy', icon: '💊', label: 'صيدلية' },
  { value: 'hospital', icon: '🏥', label: 'مستشفى' },
  { value: 'lab', icon: '🔬', label: 'مختبر' },
  { value: 'physio', icon: '🦴', label: 'علاج طبيعي' }
]

const specsByType = {
  doctor: ['طب عام', 'أسنان', 'باطنية', 'قلب', 'عظام', 'أطفال', 'جلدية', 'نساء وتوليد', 'عيون', 'أنف وأذن', 'مسالك بولية', 'عصبية', 'جراحة عامة', 'أخرى'],
  pharmacy: ['صيدلية عامة', 'صيدلية تحليل', 'صيدلية مستشفى', 'أخرى'],
  hospital: ['مستشفى عام', 'مستشفى خاص', 'مركز طبي', 'عيادة متعددة التخصصات', 'أخرى'],
  lab: ['مختبر تحاليل', 'مختبر طبي', 'مركز أشعة', 'أخرى'],
  physio: ['علاج طبيعي', 'تمارين رياضية', 'علاج يدوي', 'إعادة تأهيل', 'أخرى']
}

const nameByType = {
  doctor: { label: 'اسم الطبيب', placeholder: 'د. محمد أحمد' },
  pharmacy: { label: 'اسم الصيدلية', placeholder: 'الصيدلية المركزية' },
  hospital: { label: 'اسم المستشفى / المركز', placeholder: 'المستشفى الأهلي' },
  lab: { label: 'اسم المختبر', placeholder: 'مختبر البركة' },
  physio: { label: 'اسم مركز العلاج', placeholder: 'مركز الشفاء للعلاج الطبيعي' }
}

const bioByType = {
  doctor: { label: 'نبذة عن الطبيب', placeholder: 'معلومات عن الطبيب وتخصصاته...' },
  pharmacy: { label: 'نبذة عن الصيدلية', placeholder: 'خدمات الصيدلية...' },
  hospital: { label: 'نبذة عن المستشفى', placeholder: 'أقسام المستشفى وخدماته...' },
  lab: { label: 'نبذة عن المختبر', placeholder: 'خدمات المختبر...' },
  physio: { label: 'نبذة عن المركز', placeholder: 'خدمات العلاج الطبيعي...' }
}

const govs = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']

const form = ref(getEmptyForm())

function getEmptyForm() {
  return {
    facility_type: 'doctor', doctor_name: '', specialty: '', governorate: '', area: '',
    phone: '', phone2: '', whatsapp: '', website: '', photoUrl: '', address: '', map_url: '',
    doctor_bio: '', is_24h: false, clinic_open_time: '', clinic_close_time: ''
  }
}

const nameLabel = computed(() => nameByType[form.value.facility_type]?.label || 'الاسم')
const namePlaceholder = computed(() => nameByType[form.value.facility_type]?.placeholder || '')
const specLabel = computed(() => {
  const t = form.value.facility_type
  return t === 'doctor' ? 'التخصص' : t === 'pharmacy' ? 'نوع الصيدلية' : t === 'hospital' ? 'نوع المستشفى' : t === 'lab' ? 'نوع المختبر' : 'نوع العلاج'
})
const bioLabel = computed(() => bioByType[form.value.facility_type]?.label || 'نبذة')
const bioPlaceholder = computed(() => bioByType[form.value.facility_type]?.placeholder || '')
const currentSpecs = computed(() => specsByType[form.value.facility_type] || [])

const typeFilters = computed(() => {
  const all = listings.value.length
  const doc = listings.value.filter(i => !i.facility_type || i.facility_type === 'doctor').length
  const pha = listings.value.filter(i => i.facility_type === 'pharmacy').length
  const hos = listings.value.filter(i => i.facility_type === 'hospital').length
  const lab = listings.value.filter(i => i.facility_type === 'lab').length
  const phy = listings.value.filter(i => i.facility_type === 'physio').length
  return [
    { key: 'all', icon: '📋', label: 'الكل', count: all },
    { key: 'doctor', icon: '🩺', label: 'أطباء', count: doc },
    { key: 'pharmacy', icon: '💊', label: 'صيدليات', count: pha },
    { key: 'hospital', icon: '🏥', label: 'مستشفيات', count: hos },
    { key: 'lab', icon: '🔬', label: 'مختبرات', count: lab },
    { key: 'physio', icon: '🦴', label: 'علاج طبيعي', count: phy }
  ]
})

const filteredListings = computed(() => {
  if (filterType.value === 'all') return listings.value
  return listings.value.filter(i => (i.facility_type || 'doctor') === filterType.value)
})

const typeColors = { doctor: '#0d9488', pharmacy: '#d69e1f', hospital: '#e11d48', lab: '#6366f1', physio: '#059669' }
const typeIcons = { doctor: '🩺', pharmacy: '💊', hospital: '🏥', lab: '🔬', physio: '🦴' }
const typeLabels = { doctor: 'طبيب', pharmacy: 'صيدلية', hospital: 'مستشفى', lab: 'مختبر', physio: 'علاج طبيعي' }

function getType(item) { return item.facility_type || 'doctor' }
function getTypeColor(item) { return typeColors[getType(item)] || '#475569' }
function getTypeIcon(item) { return typeIcons[getType(item)] || '📋' }
function getTypeLabel(item) { return typeLabels[getType(item)] || 'طبيب' }
function getItemDisplayName(item) {
  if (!item) return ''
  const t = getType(item)
  const name = item.doctor_name || ''
  if (t === 'doctor') return 'د. ' + name
  return name
}

async function loadListings() {
  loading.value = true
  try { listings.value = await directoryListingsRepo.listAll() } catch (e) { console.error(e) }
  loading.value = false
}

function openAdd(type) {
  editing.value = false
  editingId.value = null
  form.value = getEmptyForm()
  if (type) form.value.facility_type = type
  showModal.value = true
}

function openEdit(item) {
  editing.value = true
  editingId.value = item.id
  form.value = {
    facility_type: item.facility_type || 'doctor',
    doctor_name: item.doctor_name || '',
    specialty: item.specialty || '',
    governorate: item.governorate || '',
    area: item.area || '',
    phone: item.phone || '',
    phone2: item.phone2 || '',
    whatsapp: item.whatsapp || '',
    website: item.website || '',
    photoUrl: item.photoUrl || '',
    address: item.address || '',
    map_url: item.map_url || '',
    doctor_bio: item.doctor_bio || '',
    is_24h: item.is_24h || false,
    clinic_open_time: item.clinic_open_time || '',
    clinic_close_time: item.clinic_close_time || ''
  }
  showModal.value = true
}

async function onPhotoUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingPhoto.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    const key = import.meta.env.VITE_IMGBB_API_KEY
    if (!key) { alert('مفتاح imgBB غير موجود'); return }
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) form.value.photoUrl = data.data.url
    else alert('فشل رفع الصورة')
  } catch (err) { alert('خطأ في رفع الصورة: ' + err.message) }
  uploadingPhoto.value = false
  e.target.value = ''
}

async function save() {
  if (!form.value.doctor_name || !form.value.governorate) {
    return alert('يرجى تعبئة الحقول المطلوبة: الاسم، المحافظة')
  }
  saving.value = true
  try {
    if (editing.value) {
      await directoryListingsRepo.update(editingId.value, form.value)
    } else {
      await directoryListingsRepo.add(form.value)
    }
    showModal.value = false
    await loadListings()
  } catch (e) { console.error(e); alert('حدث خطأ: ' + e.message) }
  saving.value = false
}

function confirmDelete(item) { deletingItem.value = item; showDeleteModal.value = true }

async function doDelete() {
  try { await directoryListingsRepo.remove(deletingItem.value.id); showDeleteModal.value = false; await loadListings() } catch (e) { console.error(e) }
}

async function toggleEnabled(item) {
  const newEnabled = item.enabled === false ? true : false
  await directoryListingsRepo.update(item.id, { enabled: newEnabled })
  item.enabled = newEnabled
}

onMounted(loadListings)
</script>

<style scoped>
.dl-title{font:800 1.1rem/1.3 'Segoe UI',sans-serif;color:#0f172a;margin:0}
.dl-sub{font-size:0.8rem;color:#64748b;margin:2px 0 0}
.dl-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:#64748b}
.dl-spinner{width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0d9488;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.dl-header-actions{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.dl-count{font-size:0.8rem;color:#94a3b8;font-weight:600;margin-right:auto}
.dl-filters{display:flex;gap:6px;flex-wrap:wrap}
.dl-chip-count{background:rgba(255,255,255,0.3);padding:1px 6px;border-radius:8px;font-size:0.7rem}
.dl-filter-chip{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;font:600 0.75rem 'Segoe UI',sans-serif;color:#64748b;cursor:pointer;transition:all 0.2s;font-family:inherit}
.dl-filter-chip.active{background:#0d9488;color:#fff;border-color:#0d9488}
.dl-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;border:none;font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;font-family:inherit}
.dl-btn-primary{background:#0d9488;color:#fff}
.dl-btn-primary:active{background:#0f766e}
.dl-btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.dl-btn-ghost{background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0}
.dl-btn-danger{background:#ef4444;color:#fff}
.dl-btn-danger:active{background:#dc2626}
.dl-btn-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
.dl-empty{text-align:center;padding:48px 20px;background:#fff;border-radius:16px;border:1.5px solid #e2e8f0}
.dl-empty h3{font-size:1rem;font-weight:800;color:#475569;margin:12px 0 4px}
.dl-empty p{color:#94a3b8;font-size:0.82rem}
.dl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.dl-card{background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;padding:14px;transition:all 0.2s}
.dl-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06);border-color:#0d9488}
.dl-card-top{display:flex;align-items:center;gap:10px}
.dl-card-avatar{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.2rem;overflow:hidden;flex-shrink:0}
.dl-card-avatar img{width:100%;height:100%;object-fit:cover}
.dl-card-info{flex:1;min-width:0;display:flex;flex-direction:column}
.dl-card-name-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dl-card-name{font:700 0.85rem/1.2 'Segoe UI',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dl-card-type-badge{font-size:0.6rem;font-weight:700;padding:2px 6px;border-radius:6px;white-space:nowrap}
.dl-card-24h{font-size:0.6rem;font-weight:700;padding:2px 6px;border-radius:6px;background:#dcfce7;color:#16a34a;white-space:nowrap}
.dl-card-spec{font-size:0.72rem;font-weight:700}
.dl-card-loc{font-size:0.68rem;color:#94a3b8}
.dl-card-toggle{flex-shrink:0}
.dl-switch{position:relative;display:inline-block;width:40px;height:22px}
.dl-switch input{opacity:0;width:0;height:0}
.dl-switch-slider{position:absolute;cursor:pointer;inset:0;background:#e2e8f0;border-radius:22px;transition:0.3s}
.dl-switch-slider::before{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:3px;right:3px;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.15)}
.dl-switch input:checked + .dl-switch-slider{background:#0d9488}
.dl-switch input:checked + .dl-switch-slider::before{transform:translateX(-18px)}
.dl-card-meta{display:flex;gap:12px;margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;font-size:0.7rem;color:#94a3b8}
.dl-card-actions{display:flex;gap:6px;margin-top:8px}
.dl-btn-sm{padding:6px 14px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;font-weight:700;font-size:0.75rem;cursor:pointer;transition:all 0.2s;font-family:inherit}
.dl-btn-edit{color:#0d9488;border-color:#d1e8e5}
.dl-btn-edit:active{background:#f0fdf9}
.dl-btn-delete{color:#ef4444;border-color:#fecaca}
.dl-btn-delete:active{background:#fef2f2}
.dl-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);display:grid;place-items:center;z-index:9999;padding:16px}
.dl-modal{background:#fff;border-radius:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.dl-modal-sm{max-width:380px}
.dl-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1.5px solid #f1f5f9}
.dl-modal-header h3{font:800 0.95rem/1.2 'Segoe UI',sans-serif;color:#0f172a}
.dl-modal-header-danger h3{color:#ef4444}
.dl-modal-close{background:none;border:none;font-size:1.5rem;color:#94a3b8;cursor:pointer;line-height:1}
.dl-modal-body{padding:20px}
.dl-modal-footer{display:flex;justify-content:flex-end;gap:8px;padding:16px 20px;border-top:1.5px solid #f1f5f9}
.dl-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dl-field{margin-bottom:14px}
.dl-field label{display:block;font:700 0.75rem/1.2 'Segoe UI',sans-serif;color:#475569;margin-bottom:5px}
.dl-field input,.dl-field select,.dl-field textarea{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #e2e8f0;font:600 0.82rem 'Segoe UI',sans-serif;color:#0f172a;background:#f8fafc;outline:none;transition:border-color 0.2s}
.dl-field input:focus,.dl-field select:focus,.dl-field textarea:focus{border-color:#0d9488;background:#fff}
.dl-field textarea{resize:vertical;min-height:60px}
.dl-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.dl-type-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;border-radius:12px;border:1.5px solid #e2e8f0;background:#f8fafc;font:600 0.75rem 'Segoe UI',sans-serif;color:#475569;cursor:pointer;transition:all 0.2s;font-family:inherit}
.dl-type-btn.active{border-color:#0d9488;background:#f0fdf9;color:#0d9488}
.dl-type-icon{font-size:1.3rem}
.dl-24h-toggle{display:flex;align-items:center;gap:10px}
.dl-24h-label{font:700 0.82rem 'Segoe UI',sans-serif;color:#475569}
.dl-photo-upload{display:flex;align-items:center;gap:10px}
.dl-photo-preview{width:64px;height:64px;border-radius:12px;object-fit:cover;border:2px solid #e2e8f0}
.dl-photo-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1.5px dashed #0d9488;background:#f0fdf9;color:#0d9488;font:600 0.78rem 'Segoe UI',sans-serif;cursor:pointer;transition:all 0.2s}
.dl-photo-btn:hover{background:#0d9488;color:#fff;border-style:solid}
.dl-photo-remove{background:none;border:none;font-size:1.2rem;color:#ef4444;cursor:pointer;padding:4px 8px}
.dl-photo-loading{font-size:0.75rem;color:#94a3b8}
.modal-fade-enter-active,.modal-fade-leave-active{transition:all 0.25s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
@media(max-width:480px){
  .dl-grid{grid-template-columns:1fr}
  .dl-form-row{grid-template-columns:1fr}
  .dl-type-grid{grid-template-columns:repeat(2,1fr)}
  .dl-header-actions{flex-direction:column;align-items:stretch}
  .dl-count{margin-right:0}
}
</style>
