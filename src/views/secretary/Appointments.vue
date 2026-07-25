<template>
  <AppLayout>

      <!-- VIEW: patients-list -->
      <section v-if="currentView === 'patients-list'" class="view active">
        <header class="view-header">
          <div class="view-title">
            <h2>المواعيد</h2>
            <p>إجمالي المرضى: {{ patientsList.length }}</p>
          </div>
          <div class="view-actions">
            <div class="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="searchQuery" type="text" placeholder="بحث بالاسم أو رقم الهاتف..." @input="onSearchInput" />
            </div>
            <div class="queue-launcher-group">
              <button class="btn btn-gold btn-lg" @click="openTodayQueue">حجوزات اليوم</button>
            </div>
          </div>
        </header>

        <div v-if="loading" class="empty-state"><p>جاري التحميل...</p></div>
        <div v-else-if="filteredPatients.length === 0" class="empty-state"><p>لا توجد نتائج</p></div>

        <div v-else class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">تسلسل</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th>آخر زيارة</th>
                  <th>الموعد القادم</th>
                  <th class="col-book">حجز موعد</th>
                  <th class="col-history">سجل الزيارات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in filteredPatients" :key="p.id">
                  <td class="col-seq" style="text-align:center">{{ i + 1 }}</td>
                  <td class="cell-name">{{ p.full_name || '---' }}</td>
                  <td class="cell-muted">{{ p.phone || '---' }}</td>
                  <td class="date-value">{{ p.last_visit ? formatArabicDate(p.last_visit) : '---' }}</td>
                  <td>
                    <span v-if="p.next_appointment" class="next-appt-cell">
                      <span class="date-value">{{ formatArabicDate(p.next_appointment) }}</span>
                      <button class="icon-btn" title="تعديل الموعد" @click="openEditAppointment(p)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </span>
                    <span v-else class="cell-muted">--- </span>
                  </td>
                  <td style="text-align:center">
                    <button class="btn-table btn-table-book" @click="openBookModal(p)">حجز</button>
                  </td>
                  <td style="text-align:center">
                    <button class="btn-table btn-table-history" @click="openHistory(p)">سجل</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- VIEW: today-queue -->
      <section v-if="currentView === 'today-queue'" class="view active">
        <header class="view-header">
          <div class="view-title">
            <div class="view-title-with-back">
              <button class="icon-btn back-btn" @click="currentView = 'patients-list'" title="رجوع">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
              </button>
              <div>
                <h2>حجوزات اليوم</h2>
                <p>إجمالي الحجوزات: {{ queueList.length }}</p>
              </div>
            </div>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary" @click="openAddPatientModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              إضافة مريض
            </button>
          </div>
        </header>

        <!-- PENDING BOOKING REQUESTS -->
        <div v-if="pendingRequests.length > 0" class="pending-section">
          <div class="pending-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>طلبات حجز بانتظار الموافقة ({{ pendingRequests.length }})</span>
          </div>
          <div class="pending-list">
            <div v-for="pr in pendingRequests" :key="pr.id" class="pending-card">
              <div class="pending-card-top">
                <span class="pending-patient-name">{{ pr.patient_name || pr.full_name || '---' }}</span>
                <span v-if="pr.appointment_date" class="pending-date">{{ formatArabicDate(pr.appointment_date) }}{{ pr.start_time ? ' — ' + to12h(pr.start_time) : '' }}</span>
              </div>
              <div v-if="pr.phone" class="pending-phone">{{ pr.phone }}</div>
              <div v-if="pr.reason" class="pending-reason">السبب: {{ pr.reason }}</div>
              <div class="pending-actions">
                <button class="pending-btn pending-btn-reject" @click="rejectBooking(pr)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  رفض
                </button>
                <button class="pending-btn pending-btn-time" @click="openSetTimeModal(pr)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  تحديد الوقت
                </button>
                <button class="pending-btn pending-btn-approve" @click="approveBooking(pr)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  موافقة
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SET TIME MODAL -->
        <div v-if="showSetTimeModal" class="modal-overlay" @click.self="showSetTimeModal = false">
          <div class="modal modal-sm">
            <div class="modal-header">
              <h3>تحديد موعد المريض</h3>
              <button class="icon-btn" @click="showSetTimeModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="consultation-patient-info">
                <span class="cp-name">{{ setTimeTarget?.patient_name || setTimeTarget?.full_name || '' }}</span>
                <span v-if="setTimeTarget?.phone" class="cp-phone">{{ setTimeTarget.phone }}</span>
              </div>
              <div class="form-field" style="margin-top:12px">
                <label>التاريخ</label>
                <input v-model="setTimeDate" type="date" />
              </div>
              <div class="form-field" style="margin-top:12px">
                <label>الوقت</label>
                <input v-model="setTimeTime" type="time" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showSetTimeModal = false">إلغاء</button>
              <button class="btn btn-primary" :disabled="saving" @click="confirmSetTime">
                {{ saving ? 'جاري الحفظ...' : 'موافقة وتحديد الوقت' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="queueLoading" class="empty-state"><p>جاري التحميل...</p></div>
        <div v-else-if="queueList.length === 0 && pendingRequests.length === 0" class="empty-state"><p>لا توجد حجوزات اليوم</p></div>

        <div v-else class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">تسلسل</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th>نوع المريض</th>
                  <th class="col-flag">دخل</th>
                  <th class="col-flag">لم يحضر</th>
                  <th class="col-flag">حذف</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in queueList" :key="a.id" :class="{ row_entered: a.entered === 1, row_missed: a.missed === 1 }">
                  <td class="col-seq" style="text-align:center">{{ i + 1 }}</td>
                  <td class="cell-name">
                    <div class="queue-name-cell">
                      <div class="queue-name-line">
                        <span>{{ a.full_name || '---' }}</span>
                        <span v-if="a.start_time || a.end_time" class="queue-time-badge">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {{ to12h(a.start_time) || '' }}{{ a.start_time && a.end_time ? ' - ' : '' }}{{ to12h(a.end_time) || '' }}
                        </span>
                      </div>
                      <span v-if="a.entered" class="queue-status-stripe entered">دخل</span>
                      <span v-if="a.missed" class="queue-status-stripe missed">لم يحضر</span>
                    </div>
                  </td>
                  <td class="cell-muted">{{ a.phone || '---' }}</td>
                  <td style="text-align:center">
                    <span v-if="a.is_new_patient" class="patient-type-badge new">جديد</span>
                    <span v-else class="patient-type-badge old">سابق</span>
                  </td>
                  <td style="text-align:center">
                    <input type="checkbox" class="queue-checkbox" :checked="a.entered === 1" @change="handleEntered(a, $event.target.checked)" />
                  </td>
                  <td style="text-align:center">
                    <input type="checkbox" class="queue-checkbox" :checked="a.missed === 1" @change="handleMissed(a, $event.target.checked)" />
                  </td>
                  <td style="text-align:center">
                    <button class="icon-btn" title="حذف الحجز" @click="confirmDeleteQueue(a)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- BOOKING MODAL -->
      <div v-if="showBookingModal" class="modal-overlay" @click.self="showBookingModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingAppointment ? 'تعديل الموعد' : 'حجز موعد' }}</h3>
            <button class="icon-btn" @click="showBookingModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label>المريض</label>
              <input type="text" :value="bookingPatientName" disabled style="font-weight:900;color:var(--blue-700)" />
            </div>
            <div class="form-field" style="margin-top:16px">
              <label>التاريخ <em>*</em></label>
              <div class="date-picker">
                <button class="date-picker-btn" :class="{ open: showBookingDatePicker }" @click="showBookingDatePicker = !showBookingDatePicker">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span v-if="bookingForm.date" class="date-picker-text has-value">{{ formatArabicDate(bookingForm.date) }}</span>
                  <span v-else class="date-picker-placeholder">اختر التاريخ...</span>
                </button>
                <ArabicDatePicker v-if="showBookingDatePicker" :modelValue="bookingForm.date" @update:modelValue="onBookingDatePicked" />
              </div>
            </div>
            <div class="form-field" style="margin-top:16px">
              <button :class="['btn', 'btn-ghost', 'booking-time-toggle-btn', { active: showTimeFields }]" @click="showTimeFields = !showTimeFields">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                حجز بالساعات (اختياري)
                <span>{{ showTimeFields ? '▾' : '◂' }}</span>
              </button>
              <div v-if="showTimeFields" class="booking-time-fields">
                <div class="form-field"><label>من</label><input v-model="bookingForm.start_time" type="time" /></div>
                <div class="form-field"><label>إلى</label><input v-model="bookingForm.end_time" type="time" /></div>
              </div>
            </div>
            <div class="form-field" style="margin-top:16px">
              <label>ملاحظات</label>
              <textarea v-model="bookingForm.notes" rows="3" placeholder="ملاحظات الموعد..."></textarea>
            </div>
            <div v-if="existingPatientWarning" class="existing-patient-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ existingPatientWarning }}</span>
            </div>
            <div v-if="suggestedTime" class="suggested-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>الوقت المقترح: <strong>{{ suggestedTime }}</strong></span>
              <button class="use-suggested-btn" @click="useSuggestedTime">استخدمه</button>
            </div>
            <div v-if="bookingError" class="form-error">{{ bookingError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showBookingModal = false">إلغاء</button>
            <button class="btn btn-primary" :disabled="saving || !bookingForm.date" @click="saveBooking">
              {{ saving ? 'جاري الحفظ...' : editingAppointment ? 'حفظ التعديل' : 'حجز الموعد' }}
            </button>
          </div>
        </div>
      </div>

      <!-- HISTORY MODAL -->
      <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>سجل زيارات - {{ historyPatientName }}</h3>
            <button class="icon-btn" @click="showHistoryModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="historyLoading" class="empty-state" style="padding:24px"><p>جاري التحميل...</p></div>
            <div v-else-if="historyList.length === 0" class="empty-state" style="padding:24px"><p>لا توجد زيارات سابقة</p></div>
            <div v-else class="history-list">
              <div v-for="h in historyList" :key="h.id" class="history-item">
                <div>
                  <div class="history-item-date">{{ formatArabicDate(h.appointment_date) }}</div>
                  <div v-if="h.notes" class="history-item-notes">{{ h.notes }}</div>
                </div>
                <button class="icon-btn" title="حذف" @click="deleteFromHistory(h)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showHistoryModal = false">إغلاق</button>
          </div>
        </div>
      </div>

      <!-- ADD PATIENT MODAL (full form) -->
      <div v-if="showAddPatientModal" class="modal-overlay" @click.self="showAddPatientModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>إضافة مريض جديد</h3>
            <button class="icon-btn" @click="showAddPatientModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field">
                <label>الاسم الكامل <em>*</em></label>
                <input v-model="newPatientForm.full_name" type="text" placeholder="مثال: أحمد محمد علي" />
              </div>
              <div class="form-field">
                <label>العمر</label>
                <input v-model.number="newPatientForm.age" type="number" min="0" max="130" placeholder="مثال: 35" />
              </div>
              <div class="form-field">
                <label>الجنس</label>
                <select v-model="newPatientForm.gender">
                  <option value="">— اختر —</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
              <div class="form-field">
                <label>فصيلة الدم</label>
                <select v-model="newPatientForm.blood_type">
                  <option value="">— اختر —</option>
                  <option v-for="bt in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bt" :value="bt">{{ bt }}</option>
                </select>
              </div>
              <div class="form-field">
                <label>الوزن (كغم)</label>
                <input v-model.number="newPatientForm.weight" type="number" min="0" max="500" step="0.1" placeholder="مثال: 70" />
              </div>
              <div class="form-field">
                <label>الطول (سم)</label>
                <input v-model.number="newPatientForm.height" type="number" min="0" max="300" step="0.1" placeholder="مثال: 170" />
              </div>
              <div class="form-field">
                <label>رقم الهاتف</label>
                <input v-model="newPatientForm.phone" type="tel" placeholder="مثال: 07701234567" />
              </div>
              <div class="form-field form-field-full">
                <label>العنوان</label>
                <input v-model="newPatientForm.address" type="text" placeholder="مثال: بغداد - الكرادة" />
              </div>
              <div class="form-field form-field-full">
                <label>مرض مزمن</label>
                <textarea v-model="newPatientForm.chronic_disease" rows="2" placeholder="اكتب هنا إن كان المريض يعاني من مرض مزمن..."></textarea>
              </div>
              <div class="form-field form-field-full">
                <label>ملاحظات</label>
                <textarea v-model="newPatientForm.notes" rows="2" placeholder="ملاحظات إضافية عن المريض..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showAddPatientModal = false">إلغاء</button>
            <button class="btn btn-primary" :disabled="saving || !newPatientForm.full_name.trim()" @click="saveNewPatient">
              {{ saving ? 'جاري الحفظ...' : 'حفظ المريض' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CONSULTATION FEE MODAL (when entering patient) -->
      <div v-if="showConsultationFeeModal" class="modal-overlay" @click.self="showConsultationFeeModal = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>تأكيد دخول المريض</h3>
            <button class="icon-btn" @click="showConsultationFeeModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="consultation-patient-info">
              <span class="cp-name">{{ consultationFeeTarget?.full_name || '' }}</span>
              <span v-if="consultationFeeTarget?.phone" class="cp-phone">{{ consultationFeeTarget.phone }}</span>
            </div>
            <div class="form-field">
              <label>كشف الحساب (د.ع)</label>
              <input v-model="consultationFeeInput" type="number" min="0" placeholder="0" @keyup.enter="confirmConsultationFee" />
              <span class="field-hint">سعر الكشفية: {{ defaultExamFee }} د.ع (يُحدده الدكتور من الإعدادات)</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showConsultationFeeModal = false">إلغاء</button>
            <button class="btn btn-primary" :disabled="saving" @click="confirmConsultationFee">
              {{ saving ? 'جاري الحفظ...' : 'تأكيد الدخول' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CONFIRM DELETE MODAL -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>تأكيد الحذف</h3>
            <button class="icon-btn" @click="showDeleteConfirm = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showDeleteConfirm = false">إلغاء</button>
            <button class="btn btn-danger" :disabled="saving" @click="deleteAppointment">حذف</button>
          </div>
        </div>
      </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ArabicDatePicker from '@/components/ArabicDatePicker.vue'
import { useAuthStore } from '../../stores/auth'
import { appointmentsRepo, patientsRepo, settingsRepo } from '../../services/clinic'
import { db } from '../../firebase/config'
import { collection, query, where, getDocs, addDoc, updateDoc, doc as fsDoc } from 'firebase/firestore'
import { to12h, formatArabicDate, playNotifSound } from '@/utils/time'

const authStore = useAuthStore()

const currentView = ref('patients-list')
const loading = ref(false)
const queueLoading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const searchTimeout = ref(null)

const patientsList = ref([])
const queueList = ref([])
const pendingRequests = ref([])

// Set time modal
const showSetTimeModal = ref(false)
const setTimeTarget = ref(null)
const setTimeDate = ref('')
const setTimeTime = ref('')

// Modals
const showBookingModal = ref(false)
const showHistoryModal = ref(false)
const showDeleteConfirm = ref(false)
const showBookingDatePicker = ref(false)
const showTimeFields = ref(false)
const showConsultationFeeModal = ref(false)
const showAddPatientModal = ref(false)

// Booking
const editingAppointment = ref(null)
const editingPatientRef = ref(null)
const deleteTarget = ref(null)
const historyPatientId = ref(null)
const historyPatientName = ref('')
const historyLoading = ref(false)
const historyList = ref([])
const bookingPatientName = ref('')
const bookingError = ref('')
const existingPatientWarning = ref('')
const suggestedTime = ref('')

const bookingForm = ref({ date: '', start_time: '', end_time: '', notes: '' })

// Consultation fee
const consultationFeeTarget = ref(null)
const consultationFeeInput = ref(0)
const defaultExamFee = ref(0)

// New patient form (full)
const newPatientForm = ref({
  full_name: '', age: null, gender: '', blood_type: '',
  weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: ''
})

// Daily refresh timer
let midnightTimer = null

const todayStr = () => {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const filteredPatients = computed(() => {
  let list = [...patientsList.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.file_number || '').includes(q)
    )
  }
  return list
})

function onSearchInput() {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { loadAppointmentsView(searchQuery.value) }, 300)
}

async function loadAppointmentsView(searchTerm) {
  loading.value = true
  try {
    patientsList.value = await appointmentsRepo.listWithInfo(authStore.clinicId, searchTerm || null)
  } catch (e) { console.error('Error loading appointments:', e) }
  finally { loading.value = false }
}

async function openTodayQueue() {
  currentView.value = 'today-queue'
  queueLoading.value = true
  try {
    const queue = await appointmentsRepo.listByDate(authStore.clinicId, todayStr())
    queueList.value = queue.map(a => ({
      ...a,
      full_name: a.full_name || '---',
      phone: a.phone || '',
      is_new_patient: a.is_new_patient ?? true
    }))
  } catch (e) { console.error('Error fetching queue:', e) }
  finally { queueLoading.value = false }
  loadPendingRequests()
}

async function loadPendingRequests() {
  try {
    const snap = await getDocs(query(collection(db, 'notifications'), where('clinicId', '==', authStore.clinicId), where('type', '==', 'booking_request'), where('status', '==', 'pending')))
    pendingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('Error loading pending requests:', e); pendingRequests.value = [] }
}

async function approveBooking(pr) {
  saving.value = true
  try {
    await updateDoc(fsDoc(db, 'notifications', pr.id), { status: 'approved', handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', authStore.clinicId), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(fsDoc(db, 'appointments', d.id), { status: 'approved' })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id,
        type: 'booking_approved',
        message: `تمت موافقة على حجزك عند د. ${pr.doctor_name || ''} — بانتظار تحديد الوقت`,
        doctor_name: pr.doctor_name || '',
        clinicId: authStore.clinicId,
        appointment_date: pr.appointment_date || '',
        status: 'approved',
        read: false,
        created_at: new Date().toISOString()
      })
    }
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== pr.id)
  } catch (e) { console.error('Error approving booking:', e) }
  saving.value = false
}

async function rejectBooking(pr) {
  saving.value = true
  try {
    await updateDoc(fsDoc(db, 'notifications', pr.id), { status: 'rejected', handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', authStore.clinicId), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(fsDoc(db, 'appointments', d.id), { status: 'rejected' })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id,
        type: 'booking_rejected',
        message: `تم رفض طلب الحجز عند د. ${pr.doctor_name || ''}`,
        doctor_name: pr.doctor_name || '',
        clinicId: authStore.clinicId,
        status: 'rejected',
        read: false,
        created_at: new Date().toISOString()
      })
    }
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== pr.id)
  } catch (e) { console.error('Error rejecting booking:', e) }
  saving.value = false
}

function openSetTimeModal(pr) {
  setTimeTarget.value = pr
  setTimeDate.value = pr.appointment_date || todayStr()
  setTimeTime.value = pr.start_time || ''
  showSetTimeModal.value = true
}

async function confirmSetTime() {
  if (!setTimeTarget.value) return
  saving.value = true
  try {
    const pr = setTimeTarget.value
    await updateDoc(fsDoc(db, 'notifications', pr.id), { status: 'approved', appointment_date: setTimeDate.value, start_time: setTimeTime.value, handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', authStore.clinicId), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(fsDoc(db, 'appointments', d.id), { status: 'approved', appointment_date: setTimeDate.value, start_time: setTimeTime.value })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id,
        type: 'booking_approved',
        message: `تمت الموافقة على حجزك عند د. ${pr.doctor_name || ''} — ${formatArabicDate(setTimeDate.value)}${setTimeTime.value ? ' الساعة ' + to12h(setTimeTime.value) : ''}`,
        doctor_name: pr.doctor_name || '',
        clinicId: authStore.clinicId,
        appointment_date: setTimeDate.value,
        start_time: setTimeTime.value,
        status: 'approved',
        read: false,
        created_at: new Date().toISOString()
      })
    }
    showSetTimeModal.value = false
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== pr.id)
  } catch (e) { console.error('Error setting time:', e) }
  saving.value = false
}

function openBookModal(patient) {
  editingAppointment.value = null
  editingPatientRef.value = patient
  bookingPatientName.value = patient.full_name || ''
  bookingForm.value = { date: '', start_time: '', end_time: '', notes: '' }
  showBookingDatePicker.value = false
  showTimeFields.value = false
  bookingError.value = ''
  existingPatientWarning.value = ''
  suggestedTime.value = ''

  try {
    const todayAppts = queueList.value.filter(a => a.patient_id === patient.id)
    if (todayAppts.length > 0) {
      existingPatientWarning.value = `لدى ${patient.full_name} موعد مسجل اليوم بالفعل`
    }
  } catch (e) {}

  try {
    const todayAppts = queueList.value.filter(a => a.end_time)
    const sorted = [...todayAppts].sort((a, b) => b.end_time.localeCompare(a.end_time))
    if (sorted.length > 0) {
      const lastEnd = sorted[0].end_time
      const [h, m] = lastEnd.split(':').map(Number)
      const nextMin = m + 15
      const nextH = h + Math.floor(nextMin / 60)
      const nextM = nextMin % 60
      if (nextH < 24) suggestedTime.value = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`
    }
  } catch (e) {}

  showBookingModal.value = true
}

function useSuggestedTime() {
  bookingForm.value.start_time = suggestedTime.value
  const [h, m] = suggestedTime.value.split(':').map(Number)
  const endMin = m + 15
  const endH = h + Math.floor(endMin / 60)
  const endM = endMin % 60
  bookingForm.value.end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  showTimeFields.value = true
  suggestedTime.value = ''
}

function openEditAppointment(patient) {
  if (!patient.next_appointment_id) return
  editingAppointment.value = { id: patient.next_appointment_id, patient_id: patient.id, appointment_date: patient.next_appointment }
  editingPatientRef.value = patient
  bookingPatientName.value = patient.full_name || ''
  bookingForm.value = { date: patient.next_appointment || '', start_time: '', end_time: '', notes: '' }
  showBookingDatePicker.value = false
  showTimeFields.value = false
  bookingError.value = ''
  showBookingModal.value = true
}

function onBookingDatePicked(val) {
  bookingForm.value.date = val
  showBookingDatePicker.value = false
}

async function saveBooking() {
  if (!bookingForm.value.date) return
  saving.value = true
  bookingError.value = ''
  try {
    const isNew = !editingAppointment.value
    const patientRef = editingPatientRef.value
    if (editingAppointment.value) {
      await appointmentsRepo.update(editingAppointment.value.id, bookingForm.value.date, bookingForm.value.notes, bookingForm.value.start_time, bookingForm.value.end_time)
    } else {
      const patientCreated = patientRef?.created_at || ''
      const is_new = patientCreated ? (Date.now() - new Date(patientCreated).getTime()) < 7 * 86400000 : true
      await appointmentsRepo.create(authStore.clinicId, patientRef?.id || historyPatientId.value, bookingForm.value.date, bookingForm.value.notes, bookingForm.value.start_time, bookingForm.value.end_time, null, null, {
        full_name: patientRef?.full_name || '',
        phone: patientRef?.phone || '',
        is_new_patient: is_new
      })
    }
    if (isNew) {
      try {
        await addDoc(collection(db, 'notifications'), {
          clinicId: authStore.clinicId, toUserId: 'all', type: 'appointment_booked',
          title: 'إضافة حجز مريض',
          message: `تم حجز موعد للمريض ${editingPatientRef.value?.full_name || ''} بتاريخ ${bookingForm.value.date}`,
          from: 'secretary', read: false, createdAt: new Date().toISOString()
        })
      } catch (e) {}
    }
    showBookingModal.value = false
    await loadAppointmentsView(searchQuery.value)
    if (currentView.value === 'today-queue') await openTodayQueue()
  } catch (e) { console.error('Error saving booking:', e); bookingError.value = 'حدث خطأ أثناء الحفظ' }
  finally { saving.value = false }
}

async function openHistory(patient) {
  historyPatientId.value = patient.id
  historyPatientName.value = patient.full_name || ''
  historyLoading.value = true
  showHistoryModal.value = true
  try { historyList.value = await appointmentsRepo.listForPatient(authStore.clinicId, patient.id) }
  catch (e) { historyList.value = [] }
  finally { historyLoading.value = false }
}

async function deleteFromHistory(appt) {
  try {
    await appointmentsRepo.remove(appt.id)
    historyList.value = historyList.value.filter(h => h.id !== appt.id)
    await loadAppointmentsView(searchQuery.value)
  } catch (e) { console.error('Error deleting from history:', e) }
}

// Consultation fee — auto-fill from doctor settings
function handleEntered(appt, checked) {
  if (checked) {
    consultationFeeTarget.value = appt
    consultationFeeInput.value = defaultExamFee.value || 0
    showConsultationFeeModal.value = true
  } else {
    doMarkEntered(appt, false, null)
  }
}

async function confirmConsultationFee() {
  if (!consultationFeeTarget.value) return
  const fee = Number(consultationFeeInput.value) || 0
  const appt = consultationFeeTarget.value
  showConsultationFeeModal.value = false
  await doMarkEntered(appt, true, fee)
  consultationFeeTarget.value = null
}

async function doMarkEntered(appt, value, consultationFee) {
  try {
    await appointmentsRepo.markEntered(appt.id, value, consultationFee)
    appt.entered = value ? 1 : 0
    if (value) appt.missed = 0
    if (consultationFee !== null && consultationFee !== undefined) appt.consultation_fee = consultationFee
  } catch (e) { console.error('Error marking entered:', e) }
}

async function handleMissed(appt, checked) {
  try {
    await appointmentsRepo.markMissed(appt.id, checked)
    appt.missed = checked ? 1 : 0
    if (checked) appt.entered = 0
  } catch (e) { console.error('Error marking missed:', e) }
}

function confirmDeleteQueue(appt) { deleteTarget.value = appt; showDeleteConfirm.value = true }

async function deleteAppointment() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await appointmentsRepo.remove(deleteTarget.value.id)
    queueList.value = queueList.value.filter(a => a.id !== deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadAppointmentsView(searchQuery.value)
  } catch (e) { console.error('Error deleting:', e) }
  finally { saving.value = false }
}

// ADD PATIENT (full form)
function openAddPatientModal() {
  newPatientForm.value = { full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' }
  showAddPatientModal.value = true
}

async function saveNewPatient() {
  if (!newPatientForm.value.full_name.trim()) return
  saving.value = true
  try {
    const created = await patientsRepo.create(authStore.clinicId, { ...newPatientForm.value })
    showAddPatientModal.value = false
    await loadAppointmentsView(searchQuery.value)
    if (currentView.value === 'today-queue') await openTodayQueue()
  } catch (e) { console.error('Error saving patient:', e) }
  finally { saving.value = false }
}

// Setup daily refresh timer
function setupMidnightRefresh() {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
  const msUntilMidnight = tomorrow - now
  midnightTimer = setTimeout(() => {
    loadAppointmentsView(searchQuery.value)
    if (currentView.value === 'today-queue') openTodayQueue()
    setupMidnightRefresh()
  }, msUntilMidnight)
}

onMounted(async () => {
  loadAppointmentsView()
  setupMidnightRefresh()
  // Load doctor's default exam fee
  try {
    const feeSettings = await settingsRepo.getFeeSettings(authStore.clinicId)
    defaultExamFee.value = feeSettings.exam_fee || 0
  } catch (e) { defaultExamFee.value = 0 }
})

onUnmounted(() => {
  if (midnightTimer) clearTimeout(midnightTimer)
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
})
</script>

<style scoped>
.pending-section { margin-bottom: 24px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: 14px; padding: 16px; }
.pending-header { display: flex; align-items: center; gap: 10px; font-size: 0.92rem; font-weight: 800; color: #92400e; margin-bottom: 14px; }
.pending-list { display: flex; flex-direction: column; gap: 12px; }
.pending-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
.pending-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.pending-patient-name { font-weight: 800; color: #1150c9; font-size: 0.95rem; }
.pending-date { font-size: 0.78rem; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 3px 10px; border-radius: 8px; }
.pending-phone { font-size: 0.82rem; color: #64748b; margin-bottom: 4px; }
.pending-reason { font-size: 0.78rem; color: #94a3b8; margin-bottom: 8px; }
.pending-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.pending-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s; }
.pending-btn-reject { background: #fee2e2; color: #dc2626; }
.pending-btn-reject:hover { background: #fecaca; }
.pending-btn-time { background: #eff6ff; color: #1150c9; }
.pending-btn-time:hover { background: #dbeafe; }
.pending-btn-approve { background: #dcfce7; color: #16a34a; }
.pending-btn-approve:hover { background: #bbf7d0; }
.patient-type-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
.patient-type-badge.new { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; border: 1px solid rgba(29,78,216,0.2); }
.patient-type-badge.old { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #15803d; border: 1px solid rgba(21,128,61,0.2); }
.row_entered { background: rgba(16, 185, 129, 0.03); }
.row_missed { background: rgba(239, 68, 68, 0.03); opacity: 0.7; }
.existing-patient-warning { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 10px 14px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; color: #92400e; font-size: 0.82rem; font-weight: 600; margin-bottom: 12px; }
.suggested-time { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e40af; font-size: 0.82rem; font-weight: 600; margin-bottom: 12px; }
.use-suggested-btn { margin-right: auto; background: #1150c9; color: #fff; border: none; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
.use-suggested-btn:hover { background: #1e40af; }
.consultation-patient-info { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px; }
.cp-name { font-size: 0.95rem; font-weight: 800; color: #1150c9; }
.cp-phone { font-size: 0.82rem; color: #64748b; }
.field-hint { display: block; font-size: 0.72rem; color: #94a3b8; margin-top: 4px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field-full { grid-column: 1 / -1; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; } .view-header { flex-direction: column; align-items: flex-start; } .view-actions { width: 100%; } }
</style>
