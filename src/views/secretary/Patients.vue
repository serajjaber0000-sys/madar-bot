<template>
  <AppLayout>

      <!-- VIEW: PATIENTS LIST -->
      <section v-if="currentView === 'list'" class="view active">
        <header class="view-header">
          <div class="view-title">
            <h2>المرضى</h2>
            <p>إجمالي المرضى: {{ patients.length }}</p>
          </div>
          <div class="view-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="بحث بالاسم أو رقم الهاتف أو رقم الملف..."
              />
            </div>
            <button class="btn btn-primary btn-lg" @click="openModalForCreate">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
              </svg>
              <span>إضافة مريض جديد</span>
            </button>
          </div>
        </header>

        <div class="table-card">
          <!-- Desktop table -->
          <div class="table-wrap table-wrap-desktop">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">تسلسل</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الملف</th>
                  <th>العمر</th>
                  <th>الجنس</th>
                  <th>رقم الهاتف</th>
                  <th>العنوان</th>
                  <th class="col-report">تقرير</th>
                  <th class="col-actions">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(patient, idx) in patients" :key="patient.id">
                  <td class="col-seq">{{ idx + 1 }}</td>
                  <td>{{ patient.full_name }}</td>
                  <td>{{ patient.file_number || '—' }}</td>
                  <td>{{ patient.age || '—' }}</td>
                  <td>{{ patient.gender || '—' }}</td>
                  <td>{{ patient.phone || '—' }}</td>
                  <td>{{ patient.address || '—' }}</td>
                  <td class="col-report">
                    <button class="icon-btn" title="عرض التقرير" @click="openReport(patient)">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2v6h6M9 13h6M9 17h6" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </td>
                  <td class="col-actions">
                    <div class="row-actions">
                      <button class="icon-btn" title="عرض" @click="openViewPatientModal(patient.id)">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button class="icon-btn" title="تعديل" @click="openModalForEdit(patient.id)">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="icon-btn" title="حذف" @click="confirmDeletePatient(patient)">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile cards (outside table) -->
          <div class="patient-mobile-card" v-for="patient in patients" :key="'m-' + patient.id">
            <div class="pmc-name">{{ patient.full_name }}</div>
            <div class="pmc-row">
              <span>رقم الملف: {{ patient.file_number || '—' }}</span>
              <span>العمر: {{ patient.age || '—' }}</span>
              <span>{{ patient.gender || '—' }}</span>
              <span>{{ patient.phone || '—' }}</span>
            </div>
            <div class="pmc-actions">
              <button class="icon-btn" @click="openReport(patient)" title="تقرير">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h6" stroke-linecap="round"/></svg>
              </button>
              <button class="icon-btn" @click="openViewPatientModal(patient.id)" title="عرض">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="icon-btn" @click="openModalForEdit(patient.id)" title="تعديل">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="icon-btn" @click="confirmDeletePatient(patient)" title="حذف">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
          <div v-if="patients.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="10" cy="7" r="4"/>
            </svg>
            <p>لا يوجد مرضى مطابقون. اضغط "إضافة مريض جديد" للبدء.</p>
          </div>
        </div>
      </section>

      <!-- VIEW: PATIENT REPORT -->
      <section v-if="currentView === 'report'" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'list'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>تقرير المريض</h2>
              <p>تفاصيل الحالة والمرض</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="btn btn-gold btn-lg" @click="reportEditMode = true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 20h9" stroke-linecap="round"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>تعديل</span>
            </button>
            <button class="btn btn-primary btn-lg" @click="saveReport">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حفظ</span>
            </button>
            <button class="btn btn-danger btn-lg" @click="deleteReport">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </header>

        <div v-if="reportPatient" class="report-patient-bar">
          <div class="report-patient-item">
            <span class="report-patient-label">الاسم</span>
            <span class="report-patient-value">{{ reportPatient.full_name }}</span>
          </div>
          <div class="report-patient-item">
            <span class="report-patient-label">العمر</span>
            <span class="report-patient-value">{{ reportPatient.age || '—' }}</span>
          </div>
          <div class="report-patient-item">
            <span class="report-patient-label">الجنس</span>
            <span class="report-patient-value">{{ reportPatient.gender || '—' }}</span>
          </div>
        </div>

        <div class="table-card report-body-card">
          <textarea
            v-model="reportContent"
            class="report-textarea"
            :disabled="!reportEditMode"
            placeholder="اكتب تفاصيل الحالة والمرض هنا..."
          ></textarea>
        </div>
      </section>

      <!-- MODAL: CREATE / EDIT PATIENT -->
      <div v-if="showPatientModal" class="modal-overlay" @click.self="showPatientModal = false">
        <div class="modal">
          <header class="modal-header">
            <h3>{{ editingPatientId ? 'تعديل بيانات المريض' : 'إضافة مريض جديد' }}</h3>
            <button class="icon-btn" title="إغلاق" @click="showPatientModal = false">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
              </svg>
            </button>
          </header>

          <form class="modal-body" @submit.prevent="handleFormSubmit">
            <input type="hidden" />

            <div class="form-grid">
              <div class="form-field">
                <label>الاسم الكامل <em>*</em></label>
                <input
                  v-model="patientForm.full_name"
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد علي"
                />
              </div>

              <div class="form-field">
                <label>المواليد</label>
                <div class="date-picker">
                  <button type="button" class="date-picker-btn" @click="openDatePickerFor('birth')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                    </svg>
                    <span v-if="patientForm.birth_date" class="date-picker-placeholder">{{ formatDateDisplay(patientForm.birth_date) }}</span>
                    <span v-else class="date-picker-placeholder">اختر تاريخ الميلاد</span>
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label>العمر</label>
                <input v-model="patientForm.age" type="number" min="0" max="130" placeholder="مثال: 35" readonly style="background: var(--gray-100); cursor: not-allowed;" />
              </div>

              <div class="form-field">
                <label>الجنس</label>
                <select v-model="patientForm.gender">
                  <option value="">— اختر —</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div class="form-field">
                <label>فصيلة الدم</label>
                <select v-model="patientForm.blood_type">
                  <option value="">— اختر —</option>
                  <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
                </select>
              </div>

              <div class="form-field">
                <label>الوزن (كغم)</label>
                <input v-model="patientForm.weight" type="number" min="0" max="500" step="0.1" placeholder="مثال: 70" />
              </div>

              <div class="form-field">
                <label>الطول (سم)</label>
                <input v-model="patientForm.height" type="number" min="0" max="300" step="0.1" placeholder="مثال: 170" />
              </div>

              <div class="form-field">
                <label>رقم الهاتف</label>
                <input v-model="patientForm.phone" type="tel" placeholder="مثال: 07701234567" />
              </div>

              <div class="form-field">
                <label>تاريخ أول زيارة</label>
                <div class="date-picker">
                  <button type="button" class="date-picker-btn" @click="openDatePickerFor('visit')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                    </svg>
                    <span v-if="patientForm.first_visit_date" class="date-picker-placeholder">{{ formatDateDisplay(patientForm.first_visit_date) }}</span>
                    <span v-else class="date-picker-placeholder">اختر التاريخ</span>
                  </button>
                </div>
              </div>

              <div class="form-field form-field-full">
                <label>العنوان</label>
                <input v-model="patientForm.address" type="text" placeholder="مثال: بغداد - الكرادة" />
              </div>

              <div class="form-field form-field-full">
                <label>مرض مزمن</label>
                <textarea v-model="patientForm.chronic_disease" rows="2" placeholder="اكتب هنا إن كان المريض يعاني من مرض مزمن..."></textarea>
              </div>

              <div class="form-field form-field-full">
                <label>ملاحظات</label>
                <textarea v-model="patientForm.notes" rows="3" placeholder="ملاحظات إضافية عن المريض..."></textarea>
              </div>
            </div>

            <p v-if="formSubmitted && !patientForm.full_name.trim()" class="form-error">الاسم الكامل مطلوب</p>
          </form>

          <footer class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="showPatientModal = false">إلغاء</button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="handleFormSubmit">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ saving ? 'جاري الحفظ...' : 'حفظ' }}</span>
            </button>
          </footer>
        </div>
      </div>

      <!-- DATE PICKER POPUP -->
      <div
        v-if="activeDatePicker"
        class="date-picker-popup"
        :style="datePickerPopupStyle"
      >
        <div class="dp-header">
          <button class="dp-nav" @click="dpNavPrev">&laquo;</button>
          <button class="dp-title" @click="dpToggleYearPicker">
            {{ dpMonthNames[dpMonth] }} {{ dpYear }}
          </button>
          <button class="dp-nav" @click="dpNavNext">&raquo;</button>
        </div>
        <div v-if="dpShowYears" class="dp-days dp-years-grid">
          <button
            v-for="yr in dpYearRange"
            :key="yr"
            :class="['dp-year', yr === dpTodayYear ? 'today' : '', yr === dpYear ? 'selected' : '']"
            @click="dpSelectYear(yr)"
          >{{ yr }}</button>
        </div>
        <template v-else>
          <div class="dp-weekdays">
            <span v-for="wd in dpWeekdayNames" :key="wd">{{ wd }}</span>
          </div>
          <div class="dp-days">
            <button
              v-for="(day, i) in dpDays"
              :key="i"
              :class="['dp-day', day.otherMonth ? 'other-month' : '', day.isToday ? 'today' : '', day.isSelected ? 'selected' : '']"
              @click="dpSelectDay(day)"
            >{{ day.num }}</button>
          </div>
        </template>
      </div>

      <!-- MODAL: VIEW PATIENT -->
      <div v-if="showViewModal && viewPatientData" class="modal-overlay" @click.self="showViewModal = false">
        <div class="modal modal-sm">
          <header class="modal-header">
            <h3>معلومات المريض</h3>
            <button class="icon-btn" title="إغلاق" @click="showViewModal = false">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
              </svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="view-patient-grid">
              <div class="view-patient-item">
                <span class="view-patient-label">الاسم الكامل</span>
                <span class="view-patient-value">{{ viewPatientData.full_name }}</span>
              </div>
              <div class="view-patient-item">
                <span class="view-patient-label">رقم الملف</span>
                <span class="view-patient-value">{{ viewPatientData.file_number || '—' }}</span>
              </div>
              <div class="view-patient-item">
                <span class="view-patient-label">العمر</span>
                <span class="view-patient-value">{{ viewPatientData.age || '—' }}</span>
              </div>
              <div class="view-patient-item">
                <span class="view-patient-label">الجنس</span>
                <span class="view-patient-value">{{ viewPatientData.gender || '—' }}</span>
              </div>
              <div class="view-patient-item">
                <span class="view-patient-label">رقم الهاتف</span>
                <span class="view-patient-value">{{ viewPatientData.phone || '—' }}</span>
              </div>
              <div class="view-patient-item">
                <span class="view-patient-label">تاريخ أول زيارة</span>
                <span class="view-patient-value">{{ formatDateDisplay(viewPatientData.first_visit_date) }}</span>
              </div>
              <div class="view-patient-item view-patient-item-full">
                <span class="view-patient-label">العنوان</span>
                <span class="view-patient-value">{{ viewPatientData.address || '—' }}</span>
              </div>
              <div class="view-patient-item view-patient-item-full">
                <span class="view-patient-label">ملاحظات</span>
                <span class="view-patient-value">{{ viewPatientData.notes || '—' }}</span>
              </div>
              <div class="view-patient-item view-patient-item-full">
                <span class="view-patient-label">مرض مزمن</span>
                <span class="view-patient-value">{{ viewPatientData.chronic_disease || '—' }}</span>
              </div>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="btn btn-ghost" @click="showViewModal = false">إغلاق</button>
          </footer>
        </div>
      </div>

      <!-- MODAL: CONFIRM DELETE -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal modal-sm">
          <header class="modal-header">
            <h3>تأكيد الحذف</h3>
          </header>
          <div class="modal-body">
            <p class="confirm-text">هل أنت متأكد من حذف المريض "<span style="color: var(--red-600);">{{ deletePatientName }}</span>"؟ لا يمكن التراجع عن هذا الإجراء.</p>
          </div>
          <footer class="modal-footer">
            <button class="btn btn-ghost" @click="showDeleteModal = false">إلغاء</button>
            <button class="btn btn-danger" @click="deletePatient">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حذف نهائيًا</span>
            </button>
          </footer>
        </div>
      </div>

      <!-- TOAST -->
      <transition name="toast-fade">
        <div v-if="toast.show" :class="['toast', toast.type]">
          {{ toast.message }}
        </div>
      </transition>

  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { patientsRepo, reportsRepo } from '../../services/clinic.js'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const authStore = useAuthStore()
const clinicId = computed(() => authStore.clinicId)

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const currentView = ref('list')
const rawPatients = ref([])
const patients = computed(() => {
  let list = rawPatients.value
  if (searchTerm.value.trim()) {
    const t = searchTerm.value.trim().toLowerCase()
    list = list.filter(p =>
      (p.full_name || '').toLowerCase().includes(t) ||
      (p.phone || '').includes(t) ||
      (p.file_number || '').includes(t)
    )
  }
  return list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'ar'))
})
const searchTerm = ref('')

const showPatientModal = ref(false)
const editingPatientId = ref(null)
const formSubmitted = ref(false)
const saving = ref(false)
const patientForm = reactive({
  full_name: '', birth_date: '', age: '',
  gender: '', blood_type: '', weight: '', height: '',
  phone: '', first_visit_date: '', address: '',
  chronic_disease: '', notes: '', is_walkin: false
})

const showViewModal = ref(false)
const viewPatientData = ref(null)

const showDeleteModal = ref(false)
const deletePatientId = ref(null)
const deletePatientName = ref('')

const reportPatient = ref(null)
const reportContent = ref('')
const reportEditMode = ref(false)

const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function calculateAge(birthIso) {
  if (!birthIso) return ''
  const parts = birthIso.split('-')
  if (parts.length !== 3) return ''
  const bd = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--
  return age >= 0 ? age : ''
}

function resetForm() {
  patientForm.full_name = ''
  patientForm.birth_date = ''
  patientForm.age = ''
  patientForm.gender = ''
  patientForm.blood_type = ''
  patientForm.weight = ''
  patientForm.height = ''
  patientForm.phone = ''
  patientForm.address = ''
  patientForm.first_visit_date = ''
  patientForm.notes = ''
  patientForm.chronic_disease = ''
  patientForm.is_walkin = false
  formSubmitted.value = false
}

watch(() => patientForm.birth_date, (val) => {
  patientForm.age = calculateAge(val)
})

function openModalForCreate() {
  editingPatientId.value = null
  resetForm()
  showPatientModal.value = true
}

async function openModalForEdit(id) {
  try {
    const p = await patientsRepo.get(id)
    if (!p) { showToast('المريض غير موجود', 'error'); return }
    editingPatientId.value = id
    patientForm.full_name = p.full_name || ''
    patientForm.birth_date = p.birth_date || ''
    patientForm.age = p.age ?? ''
    patientForm.gender = p.gender || ''
    patientForm.blood_type = p.blood_type || ''
    patientForm.weight = p.weight ?? ''
    patientForm.height = p.height ?? ''
    patientForm.phone = p.phone || ''
    patientForm.first_visit_date = p.first_visit_date || ''
    patientForm.address = p.address || ''
    patientForm.chronic_disease = p.chronic_disease || ''
    patientForm.notes = p.notes || ''
    patientForm.is_walkin = p.is_walkin || false
    formSubmitted.value = false
    showPatientModal.value = true
  } catch (e) {
    console.error('Failed to load patient for edit:', e)
    showToast('خطأ في تحميل بيانات المريض', 'error')
  }
}

async function handleFormSubmit() {
  if (saving.value) return
  formSubmitted.value = true
  if (!patientForm.full_name || !patientForm.full_name.trim()) {
    showToast('الاسم الكامل مطلوب', 'error')
    return
  }
  const data = { ...patientForm }
  if (data.age !== '' && data.age !== null) data.age = Number(data.age)
  if (data.weight !== '' && data.weight !== null) data.weight = Number(data.weight)
  else data.weight = null
  if (data.height !== '' && data.height !== null) data.height = Number(data.height)
  else data.height = null

  saving.value = true
  try {
    if (editingPatientId.value) {
      await patientsRepo.update(editingPatientId.value, data)
      showToast('تم تعديل بيانات المريض بنجاح')
    } else {
      await patientsRepo.create(clinicId.value, data)
      showToast('تم إضافة المريض بنجاح')
    }
    showPatientModal.value = false
  } catch (e) {
    console.error('Failed to save patient:', e)
    showToast('حدث خطأ أثناء الحفظ', 'error')
  } finally {
    saving.value = false
  }
}

async function openViewPatientModal(id) {
  try {
    const p = await patientsRepo.get(id)
    if (!p) { showToast('المريض غير موجود', 'error'); return }
    viewPatientData.value = p
    showViewModal.value = true
  } catch (e) {
    console.error('Failed to load patient:', e)
    showToast('خطأ في تحميل بيانات المريض', 'error')
  }
}

function confirmDeletePatient(patient) {
  deletePatientId.value = patient.id
  deletePatientName.value = patient.full_name
  showDeleteModal.value = true
}

async function deletePatient() {
  try {
    await patientsRepo.remove(deletePatientId.value)
    showDeleteModal.value = false
    showToast('تم حذف المريض بنجاح')
  } catch (e) {
    console.error('Failed to delete patient:', e)
    showToast('حدث خطأ أثناء الحذف', 'error')
  }
}

async function openReport(patient) {
  reportPatient.value = patient
  reportEditMode.value = false
  currentView.value = 'report'
  await loadReport()
}

async function loadReport() {
  if (!reportPatient.value) return
  try {
    const report = await reportsRepo.get(clinicId.value, reportPatient.value.id)
    reportContent.value = report?.content || ''
  } catch (e) {
    console.error('Failed to load report:', e)
    reportContent.value = ''
  }
}

async function saveReport() {
  if (!reportPatient.value) return
  try {
    await reportsRepo.save(clinicId.value, reportPatient.value.id, reportContent.value)
    reportEditMode.value = false
    showToast('تم حفظ التقرير بنجاح')
  } catch (e) {
    console.error('Failed to save report:', e)
    showToast('حدث خطأ أثناء حفظ التقرير', 'error')
  }
}

async function deleteReport() {
  if (!reportPatient.value) return
  try {
    await reportsRepo.remove(clinicId.value, reportPatient.value.id)
    reportContent.value = ''
    reportEditMode.value = false
    showToast('تم حذف التقرير بنجاح')
  } catch (e) {
    console.error('Failed to delete report:', e)
    showToast('حدث خطأ أثناء حذف التقرير', 'error')
  }
}

const dpMonthNames = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
]
const dpWeekdayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

const activeDatePicker = ref(null)
const dpYear = ref(new Date().getFullYear())
const dpMonth = ref(new Date().getMonth())
const dpShowYears = ref(false)
const datePickerPopupStyle = ref({})

function openDatePickerFor(instance) {
  if (activeDatePicker.value === instance) {
    activeDatePicker.value = null
    return
  }
  const currentVal = instance === 'birth' ? patientForm.birth_date : patientForm.first_visit_date
  if (currentVal) {
    const parts = currentVal.split('-')
    if (parts.length === 3) {
      dpYear.value = Number(parts[0])
      dpMonth.value = Number(parts[1]) - 1
    }
  } else {
    dpYear.value = new Date().getFullYear()
    dpMonth.value = new Date().getMonth()
  }
  dpShowYears.value = false
  activeDatePicker.value = instance
  nextTick(() => {
    const btns = document.querySelectorAll('.date-picker-btn')
    const btn = instance === 'birth' ? btns[0] : btns[1]
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const isTopHalf = rect.top < window.innerHeight / 2
      datePickerPopupStyle.value = {
        top: isTopHalf ? (rect.bottom + 8) + 'px' : 'auto',
        bottom: isTopHalf ? 'auto' : (window.innerHeight - rect.top + 8) + 'px',
        right: rect.right + 'px',
        left: 'auto'
      }
    }
  })
}

function dpNavPrev() {
  if (dpShowYears.value) { dpYear.value -= 9 }
  else if (dpMonth.value === 0) { dpMonth.value = 11; dpYear.value-- }
  else { dpMonth.value-- }
}

function dpNavNext() {
  if (dpShowYears.value) { dpYear.value += 9 }
  else if (dpMonth.value === 11) { dpMonth.value = 0; dpYear.value++ }
  else { dpMonth.value++ }
}

function dpToggleYearPicker() { dpShowYears.value = !dpShowYears.value }

const dpTodayYear = new Date().getFullYear()

const dpYearRange = computed(() => {
  const start = dpYear.value - 4
  return Array.from({ length: 9 }, (_, i) => start + i)
})

function dpSelectYear(yr) { dpYear.value = yr; dpShowYears.value = false }

const dpDays = computed(() => {
  const firstDay = new Date(dpYear.value, dpMonth.value, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(dpYear.value, dpMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(dpYear.value, dpMonth.value, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const currentVal = activeDatePicker.value === 'birth' ? patientForm.birth_date : patientForm.first_visit_date
  const result = []
  for (let i = 0; i < startDay; i++) {
    result.push({ num: prevMonthDays - startDay + 1 + i, otherMonth: true, isToday: false, isSelected: false, iso: '' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${dpYear.value}-${String(dpMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    result.push({ num: d, otherMonth: false, isToday: iso === todayStr, isSelected: iso === currentVal, iso })
  }
  const remaining = 42 - result.length
  for (let d = 1; d <= remaining; d++) {
    result.push({ num: d, otherMonth: true, isToday: false, isSelected: false, iso: '' })
  }
  return result
})

function dpSelectDay(day) {
  if (day.otherMonth || !day.iso) return
  if (activeDatePicker.value === 'birth') { patientForm.birth_date = day.iso }
  else { patientForm.first_visit_date = day.iso }
  activeDatePicker.value = null
}

function handleDocumentClick(e) {
  if (!activeDatePicker.value) return
  const popup = document.querySelector('.date-picker-popup')
  if (popup && popup.contains(e.target)) return
  const btns = document.querySelectorAll('.date-picker-btn')
  for (const btn of btns) { if (btn.contains(e.target)) return }
  activeDatePicker.value = null
}

let unsubPatients = null

onMounted(() => {
  if (!clinicId.value) return
  const q = query(collection(db, 'patients'), where('clinicId', '==', clinicId.value))
  unsubPatients = onSnapshot(q, (snap) => {
    rawPatients.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
  document.addEventListener('mousedown', handleDocumentClick)
})

onUnmounted(() => {
  if (unsubPatients) unsubPatients()
  document.removeEventListener('mousedown', handleDocumentClick)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.patient-mobile-card { display: none; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr !important; }
  .table-wrap-desktop { display: none !important; }
  .patient-mobile-card {
    display: flex !important;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  .patient-mobile-card:last-child { border-bottom: none; }
  .pmc-name {
    font-size: 1rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 2px;
  }
  .pmc-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 0.8rem;
    color: #64748b;
  }
  .pmc-row span { white-space: nowrap; }
  .pmc-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .pmc-actions .icon-btn {
    width: 36px;
    height: 36px;
  }
}
@media (max-width: 480px) {
  .view-patient-grid { grid-template-columns: 1fr !important; }
  .report-patient-bar { flex-direction: column; gap: 10px; }
}
</style>
