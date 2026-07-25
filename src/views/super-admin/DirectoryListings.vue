<template>
  <AppLayout :title="'إدارة دليل الأطباء'">
    <template #header>
      <h2 class="dl-title">دليل الأطباء غير المشتركين</h2>
      <p class="dl-sub">إضافة وتعديل وحذف أطباء في الدليل العام بدون اشتراك</p>
    </template>

    <div v-if="loading" class="dl-loading">
      <div class="dl-spinner"></div>
      <span>جاري التحميل...</span>
    </div>

    <template v-else>
      <div class="dl-header-actions">
        <button class="dl-btn dl-btn-primary" @click="openAdd">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة طبيب
        </button>
        <div class="dl-count">العدد: {{ listings.length }}</div>
      </div>

      <div v-if="listings.length === 0" class="dl-empty">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
        <h3>لا يوجد أطباء في الدليل</h3>
        <p>اضغط "إضافة طبيب" لإضافة أول طبيب</p>
      </div>

      <div v-else class="dl-grid">
        <div v-for="item in listings" :key="item.id" class="dl-card">
          <div class="dl-card-top">
            <div class="dl-card-avatar" :style="{ background: getSpecColor(item.specialty) }">
              <img v-if="item.photoUrl" :src="item.photoUrl" alt="" />
              <span v-else>{{ getInitials(item.doctor_name) }}</span>
            </div>
            <div class="dl-card-info">
              <h4 class="dl-card-name">د. {{ item.doctor_name }}</h4>
              <span class="dl-card-spec" :style="{ color: getSpecColor(item.specialty) }">{{ item.specialty || '-' }}</span>
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
              <h3>{{ editing ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد' }}</h3>
              <button class="dl-modal-close" @click="showModal = false">&times;</button>
            </div>
            <div class="dl-modal-body">
              <div class="dl-form-row">
                <div class="dl-field">
                  <label>اسم الطبيب *</label>
                  <input v-model="form.doctor_name" placeholder="د. محمد أحمد" />
                </div>
                <div class="dl-field">
                  <label>التخصص *</label>
                  <select v-model="form.specialty">
                    <option value="">اختر التخصص</option>
                    <option v-for="s in specs" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>
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
              <div class="dl-form-row">
                <div class="dl-field">
                  <label>رقم الهاتف</label>
                  <input v-model="form.phone" placeholder="07XX XXX XXXX" dir="ltr" />
                </div>
                <div class="dl-field">
                  <label>رقم الواتساب</label>
                  <input v-model="form.whatsapp" placeholder="964XXXXXXXXXX" dir="ltr" />
                </div>
              </div>
              <div class="dl-field">
                <label>العنوان</label>
                <input v-model="form.address" placeholder="عنوان العيادة بالتفصيل" />
              </div>
              <div class="dl-field">
                <label>رابط الصورة</label>
                <input v-model="form.photoUrl" placeholder="https://..." dir="ltr" />
              </div>
              <div class="dl-field">
                <label>نبذة عن الطبيب</label>
                <textarea v-model="form.doctor_bio" rows="3" placeholder="معلومات عن الطبيب وتخصصاته..."></textarea>
              </div>
              <div class="dl-form-row">
                <div class="dl-field">
                  <label>وقت الفتح</label>
                  <input v-model="form.clinic_open_time" type="time" />
                </div>
                <div class="dl-field">
                  <label>وقت الإغلاق</label>
                  <input v-model="form.clinic_close_time" type="time" />
                </div>
              </div>
            </div>
            <div class="dl-modal-footer">
              <button class="dl-btn dl-btn-ghost" @click="showModal = false">إلغاء</button>
              <button class="dl-btn dl-btn-primary" @click="save" :disabled="saving">
                <span v-if="saving" class="dl-btn-spinner"></span>
                {{ editing ? 'حفظ التعديلات' : 'إضافة الطبيب' }}
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
              <p style="margin-top:12px;font-weight:700;color:#1e293b">هل أنت متأكد من حذف<br/>د. {{ deletingItem?.doctor_name }}؟</p>
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
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { directoryListingsRepo } from '@/services/clinic'

const loading = ref(true)
const saving = ref(false)
const listings = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const editing = ref(false)
const editingId = ref(null)
const deletingItem = ref(null)

const form = ref({
  doctor_name: '', specialty: '', governorate: '', area: '',
  phone: '', whatsapp: '', photoUrl: '', address: '',
  doctor_bio: '', clinic_open_time: '', clinic_close_time: ''
})

const specs = ['طب عام', 'أسنان', 'باطنية', 'قلب', 'عظام', 'أطفال', 'جلدية', 'نساء وتوليد', 'عيون', 'أنف وأذن', 'مسالك بولية', 'عصبية', 'جراحة عامة', 'صيدلية', 'أخرى']
const govs = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']

const specColors = { 'باطنية': '#4f46e5', 'قلب': '#e11d48', 'عظام': '#059669', 'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'عيون': '#0891b2', 'أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9', 'عصبية': '#8b5cf6', 'عام': '#475569', 'طب عام': '#475569', 'صيدلية': '#d69e1f' }
const defaultC = ['#0d9488', '#14b8a6', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444']

function getSpecColor(spec) {
  if (!spec) return '#475569'
  const l = spec.toLowerCase().trim()
  for (const [k, v] of Object.entries(specColors)) { if (l.includes(k.toLowerCase())) return v }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultC[Math.abs(h) % defaultC.length]
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

async function loadListings() {
  loading.value = true
  try {
    listings.value = await directoryListingsRepo.listAll()
  } catch (e) { console.error(e) }
  loading.value = false
}

function openAdd() {
  editing.value = false
  editingId.value = null
  form.value = { doctor_name: '', specialty: '', governorate: '', area: '', phone: '', whatsapp: '', photoUrl: '', address: '', doctor_bio: '', clinic_open_time: '', clinic_close_time: '' }
  showModal.value = true
}

function openEdit(item) {
  editing.value = true
  editingId.value = item.id
  form.value = {
    doctor_name: item.doctor_name || '',
    specialty: item.specialty || '',
    governorate: item.governorate || '',
    area: item.area || '',
    phone: item.phone || '',
    whatsapp: item.whatsapp || '',
    photoUrl: item.photoUrl || '',
    address: item.address || '',
    doctor_bio: item.doctor_bio || '',
    clinic_open_time: item.clinic_open_time || '',
    clinic_close_time: item.clinic_close_time || ''
  }
  showModal.value = true
}

async function save() {
  if (!form.value.doctor_name || !form.value.specialty || !form.value.governorate) {
    return alert('يرجى تعبئة الحقول المطلوبة: الاسم، التخصص، المحافظة')
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

function confirmDelete(item) {
  deletingItem.value = item
  showDeleteModal.value = true
}

async function doDelete() {
  try {
    await directoryListingsRepo.remove(deletingItem.value.id)
    showDeleteModal.value = false
    await loadListings()
  } catch (e) { console.error(e) }
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

.dl-header-actions{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.dl-count{font-size:0.8rem;color:#94a3b8;font-weight:600}

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
.dl-card-avatar{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:0.8rem;overflow:hidden;flex-shrink:0}
.dl-card-avatar img{width:100%;height:100%;object-fit:cover}
.dl-card-info{flex:1;min-width:0;display:flex;flex-direction:column}
.dl-card-name{font:700 0.85rem/1.2 'Segoe UI',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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

/* Modal */
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

.modal-fade-enter-active,.modal-fade-leave-active{transition:all 0.25s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}

@media(max-width:480px){
  .dl-grid{grid-template-columns:1fr}
  .dl-form-row{grid-template-columns:1fr}
  .dl-modal{border-radius:16px}
}
</style>
