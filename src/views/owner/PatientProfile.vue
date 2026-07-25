<template>
  <AppLayout>
    <div class="pp">
      <button class="back-btn" @click="$router.push(`/clinic/${clinicId}/owner/patients`)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        المرضى
      </button>

      <div v-if="loading" class="pp-loading"><div class="spin"></div></div>

      <div v-else-if="!patient" class="pp-empty"><p>المريض غير موجود</p></div>

      <div v-else class="pp-grid">
        <!-- LEFT SIDEBAR -->
        <div class="pp-side">
          <div class="pp-card pp-profile">
            <div class="pp-avatar-lg" :style="{ background: avatarColor(patient.full_name || patient.fullName) }">{{ initials(patient.full_name || patient.fullName) }}</div>
            <h2 class="pp-name">{{ patient.full_name || patient.fullName }}</h2>
            <div class="pp-meta">
              <span>{{ patient.gender === 'male' || patient.gender === 'ذكر' ? '♂' : '♀' }}</span>
              <span>{{ patient.age }} سنة</span>
              <span>{{ patient.phone }}</span>
            </div>
            <span :class="['pp-status', patient.status]">{{ statusLabel(patient.status) }}</span>
            <div class="pp-visit-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              أول زيارة: {{ formatDate(patient.first_visit_date) }}
            </div>
            <div class="pp-side-actions">
              <button class="action-btn edit" @click="openEditPatient">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                تعديل
              </button>
              <button class="action-btn delete" @click="showDeletePatient = true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                حذف
              </button>
            </div>

            <!-- QR Code -->
            <div class="pp-qr-section" v-if="qrDataUrl">
              <div class="qr-divider"></div>
              <p class="qr-label">رمز QR للمريض</p>
              <div class="qr-wrap">
                <img :src="qrDataUrl" alt="باركود المريض" class="qr-img" />
              </div>
              <div class="qr-actions">
                <button class="action-btn qr-share" @click="shareQR">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  مشاركة
                </button>
                <button class="action-btn qr-download" @click="downloadQR">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  تحميل
                </button>
              </div>
            </div>
          </div>

          <div class="pp-card pp-stats-mini">
            <div class="ps-item"><span class="ps-val">{{ patientVisits.length }}</span><span class="ps-lbl">زيارات</span></div>
            <div class="ps-item"><span class="ps-val">{{ patient.sessionsCompleted || 0 }}/{{ patient.sessionsTotal || 0 }}</span><span class="ps-lbl">جلسات</span></div>
            <div class="ps-item"><span class="ps-val">{{ formatIQD(patient.amount || 0) }}</span><span class="ps-lbl">المبلغ</span></div>
            <div class="ps-item"><span class="ps-val">{{ formatIQD(paidAmount) }}</span><span class="ps-lbl">مدفوع</span></div>
            <div class="ps-item"><span class="ps-val">{{ formatIQD((patient.amount || 0) - paidAmount) }}</span><span class="ps-lbl">متبقي</span></div>
          </div>
        </div>

        <!-- RIGHT MAIN -->
        <div class="pp-main">
          <div class="pp-tabs">
            <button v-for="tab in tabs" :key="tab.key" :class="['pt-btn', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
              <span v-html="tab.icon"></span>
              {{ tab.label }}
            </button>
          </div>

          <!-- TAB: INFO -->
          <div v-if="activeTab === 'info'" class="pp-tab-content">
            <div class="info-grid">
              <div class="info-block"><h4>الاسم</h4><p>{{ patient.full_name || patient.fullName }}</p></div>
              <div class="info-block"><h4>العمر</h4><p>{{ patient.age || '-' }} سنة</p></div>
              <div class="info-block"><h4>الجنس</h4><p>{{ patient.gender === 'male' || patient.gender === 'ذكر' ? 'ذكر' : patient.gender === 'female' || patient.gender === 'أنثى' ? 'أنثى' : '-' }}</p></div>
              <div class="info-block"><h4>الهاتف</h4><p><a :href="`tel:${patient.phone}`">{{ patient.phone }}</a></p></div>
              <div class="info-block full"><h4>الأمراض المزمنة</h4><p>{{ patient.chronic_disease || patient.chronic_diseases || patient.chronicDiseases || 'لا يوجد' }}</p></div>
              <div class="info-block full"><h4>الحساسية</h4><p>{{ patient.allergies || 'لا يوجد' }}</p></div>

              <div class="info-block full"><h4>ملاحظات</h4><p>{{ patient.notes || 'لا يوجد' }}</p></div>
            </div>
          </div>

          <!-- TAB: TREATMENTS -->
          <div v-if="activeTab === 'treatments'" class="pp-tab-content">
            <div class="tab-header">
              <h3>العلاجات <span class="count-badge">{{ patientTreatments.length }}</span></h3>
              <button class="add-btn" @click="showAddTreatment = !showAddTreatment">+ إضافة علاج</button>
            </div>
            <div v-if="showAddTreatment" class="add-form">
              <input v-model="newTreatment.type" placeholder="نوع العلاج" />
              <textarea v-model="newTreatment.description" placeholder="الوصف" rows="2"></textarea>
              <div class="form-row">
                <input v-model="newTreatment.cost" type="number" placeholder="التكلفة (د.ع)" />
                <select v-model="newTreatment.status">
                  <option value="planned">مخطط</option>
                  <option value="in_progress">جاري</option>
                  <option value="completed">مكتمل</option>
                </select>
              </div>
              <div class="form-actions">
                <button class="cancel-btn" @click="showAddTreatment = false">إلغاء</button>
                <button class="save-btn" @click="addTreatment">حفظ</button>
              </div>
            </div>
            <div v-if="patientTreatments.length === 0" class="empty-tab">لا توجد علاجات</div>
            <div v-for="tx in patientTreatments" :key="tx.id" class="tx-card">
              <div class="tx-header">
                <span class="tx-type">{{ tx.type }}</span>
                <div class="tx-actions">
                  <span :class="['tx-badge', tx.status]">{{ tx.status === 'completed' ? 'مكتمل' : tx.status === 'in_progress' ? 'جاري' : 'مخطط' }}</span>
                  <button class="sm-btn edit" @click="editTreatment(tx)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="sm-btn delete" @click="deleteTreatment(tx.id)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              <p class="tx-desc">{{ tx.description }}</p>
              <div class="tx-footer">
                <span class="tx-date">{{ formatDate(tx.createdAt) }}</span>
                <span v-if="tx.cost" class="tx-cost">{{ formatIQD(tx.cost) }}</span>
              </div>
            </div>
          </div>

          <!-- TAB: PRESCRIPTIONS -->
          <div v-if="activeTab === 'prescriptions'" class="pp-tab-content">
            <div class="tab-header">
              <h3>الوصفات الطبية <span class="count-badge">{{ patientPrescriptions.length }}</span></h3>
              <button class="add-btn" @click="showAddRx = !showAddRx">+ وصفة جديدة</button>
            </div>
            <div v-if="showAddRx" class="add-form">
              <div v-for="(med, idx) in rxForm.medications" :key="idx" class="rx-med-row">
                <input v-model="med.name" placeholder="اسم الدواء" />
                <input v-model="med.dosage" placeholder="الجرعة" style="max-width:120px" />
                <input v-model="med.frequency" placeholder="التكرار" style="max-width:140px" />
                <button v-if="rxForm.medications.length > 1" class="sm-btn delete" @click="rxForm.medications.splice(idx, 1)">✕</button>
              </div>
              <button class="add-med-link" @click="rxForm.medications.push({ name: '', dosage: '', frequency: '' })">+ إضافة دواء</button>
              <textarea v-model="rxForm.notes" rows="2" placeholder="ملاحظات الطبيب..."></textarea>
              <div class="form-actions">
                <button class="cancel-btn" @click="showAddRx = false">إلغاء</button>
                <button class="save-btn" @click="saveRx">حفظ وطباعة</button>
              </div>
            </div>
            <div v-if="patientPrescriptions.length === 0" class="empty-tab">لا توجد وصفات</div>
            <div v-for="rx in patientPrescriptions" :key="rx.id" class="rx-card">
              <div class="rx-header">
                <div>
                  <span class="rx-date">{{ formatDate(rx.date) }}{{ rx.time ? ' • ' + rx.time : '' }}</span>
                  <span class="rx-doctor">{{ rx.doctorName || '' }}</span>
                </div>
                <div class="rx-actions">
                  <button class="sm-btn print" @click="printRx(rx)" title="طباعة">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  </button>
                  <button class="sm-btn delete" @click="deleteRx(rx.id)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div class="rx-meds">
                <div v-for="(med, j) in (rx.medications || [])" :key="j" class="rx-med-item">
                  <span class="rx-med-num">{{ j + 1 }}</span>
                  <span class="rx-med-name">{{ med.name }}</span>
                  <span v-if="med.dosage" class="rx-med-dose">{{ med.dosage }}</span>
                  <span v-if="med.frequency" class="rx-med-freq">{{ med.frequency }}</span>
                </div>
              </div>
              <p v-if="rx.notes" class="rx-notes">{{ rx.notes }}</p>
            </div>
          </div>

          <!-- TAB: VISITS -->
          <div v-if="activeTab === 'visits'" class="pp-tab-content">
            <div class="tab-header"><h3>الزيارات والمواعيد <span class="count-badge">{{ patientVisits.length }}</span></h3></div>
            <div v-if="patientVisits.length === 0" class="empty-tab">لا توجد زيارات</div>
            <div class="timeline">
              <div v-for="v in patientVisits" :key="v.id" :class="['tl-item', { upcoming: isUpcoming(v) }]">
                <div class="tl-dot" :class="v.status"></div>
                <div class="tl-content">
                  <div class="tl-head">
                    <span class="tl-date">{{ formatDate(v.date) }}</span>
                    <span class="tl-time">{{ v.time }}</span>
                    <span :class="['tl-badge', v.status]">{{ statusLabel(v.status) }}</span>
                  </div>
                  <p class="tl-type">{{ v.treatmentType || v.condition || v.type || '-' }}</p>
                  <p v-if="isUpcoming(v)" class="tl-reminder">جلسة قادمة قريبة!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: IMAGES -->
          <div v-if="activeTab === 'images'" class="pp-tab-content">
            <div class="tab-header">
              <h3>الصور والأشعة <span class="count-badge">{{ (patient.images || []).length }}</span></h3>
              <label class="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                رفع صورة
                <input type="file" accept="image/*" @change="handleImageUpload" hidden />
              </label>
            </div>
            <div v-if="uploadingImg" class="upload-progress"><div class="spin" style="width:20px;height:20px;border-width:2px;"></div> جاري الرفع...</div>
            <div v-if="(patient.images || []).length === 0 && !uploadingImg" class="empty-tab">لا توجد صور</div>
            <div class="img-grid">
              <div v-for="(img, idx) in (patient.images || [])" :key="idx" class="img-card" @click="previewImg = img.url">
                <img :src="img.url" :alt="img.type || 'xray'" />
                <div class="img-meta">
                  <span>{{ img.type || 'صورة' }}</span>
                  <span>{{ formatDate(img.date) }}</span>
                </div>
                <button class="img-del" @click.stop="deleteImage(idx)">✕</button>
              </div>
            </div>
            <div v-if="previewImg" class="img-preview-overlay" @click="previewImg = null">
              <img :src="previewImg" />
              <button class="preview-close" @click="previewImg = null">✕</button>
            </div>
          </div>

          <!-- TAB: SESSIONS -->
          <div v-if="activeTab === 'sessions'" class="pp-tab-content">
            <div class="tab-header">
              <h3>الجلسات <span class="count-badge">{{ patientSessions.length }}</span></h3>
              <button class="add-btn" @click="showAddSession = !showAddSession">+ إضافة جلسة</button>
            </div>
            <div v-if="showAddSession" class="add-form">
              <input v-model="newSession.type" placeholder="نوع الجلسة (تقويم، حشوة...)" />
              <div class="form-row">
                <div>
                  <label class="field-label">التاريخ</label>
                  <input v-model="newSession.date" type="date" />
                </div>
                <div>
                  <label class="field-label">الوقت</label>
                  <input v-model="newSession.time" type="time" />
                </div>
              </div>
              <div class="form-row">
                <select v-model="newSession.status">
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="missed">فائتة</option>
                </select>
                <select v-model="newSession.notify">
                  <option value="none">بدون تنبيه</option>
                  <option value="5">5 دقائق قبل</option>
                  <option value="15">15 دقيقة قبل</option>
                  <option value="30">30 دقيقة قبل</option>
                  <option value="60">ساعة قبل</option>
                </select>
              </div>
              <div class="form-actions">
                <button class="cancel-btn" @click="showAddSession = false">إلغاء</button>
                <button class="save-btn" @click="addSession">حفظ</button>
              </div>
            </div>

            <div class="session-progress">
              <div class="sp-bar"><div class="sp-fill" :style="{ width: sessionPercent + '%' }"></div></div>
              <span class="sp-text">{{ patient.sessionsCompleted || 0 }} / {{ patient.sessionsTotal || 0 }} جلسات مكتملة</span>
            </div>

            <div v-if="patientSessions.length === 0" class="empty-tab">لا توجد جلسات</div>
            <div class="session-list">
              <div v-for="(s, idx) in patientSessions" :key="idx" :class="['session-item', s.status]">
                <div class="si-num" :class="s.status">{{ idx + 1 }}</div>
                <div class="si-info">
                  <div class="si-top">
                    <span class="si-type">{{ s.type || 'جلسة' }}</span>
                    <span :class="['si-badge', s.status]">{{ s.status === 'completed' ? '✓ مكتملة' : s.status === 'missed' ? '✗ فائتة' : '● مجدولة' }}</span>
                  </div>
                  <div class="si-details">
                    <span>📅 {{ formatDate(s.date) }}</span>
                    <span v-if="s.time">⏰ {{ s.time }}</span>
                    <span v-if="s.notify && s.notify !== 'none'" class="si-notify">🔔 {{ s.notify }} دقيقة</span>
                  </div>
                </div>
                <div class="si-actions">
                  <span v-if="idx === nextSessionIndex" class="si-next">القادمة</span>
                  <button class="sm-btn delete" @click="deleteSession(idx)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EDIT PATIENT MODAL -->
      <div v-if="showEditPatient" class="modal-overlay" @click.self="showEditPatient = false">
        <div class="modal-box">
          <h3>تعديل بيانات المريض</h3>
          <div class="modal-grid">
            <div class="mg"><label>الاسم</label><input v-model="editForm.fullName" /></div>
            <div class="mg"><label>العمر</label><input v-model.number="editForm.age" type="number" /></div>
            <div class="mg"><label>الجنس</label>
              <select v-model="editForm.gender"><option value="male">ذكر</option><option value="female">أنثى</option><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select>
            </div>
            <div class="mg"><label>الهاتف</label><input v-model="editForm.phone" /></div>
            <div class="mg"><label>المبلغ (د.ع)</label><input v-model.number="editForm.amount" type="number" /></div>
            <div class="mg"><label>الجلسات</label><input v-model.number="editForm.sessionsTotal" type="number" /></div>
            <div class="mg full"><label>الأمراض المزمنة</label><input v-model="editForm.chronicDiseases" /></div>
            <div class="mg full"><label>الحساسية</label><input v-model="editForm.allergies" /></div>
            <div class="mg full"><label>ملاحظات</label><textarea v-model="editForm.notes" rows="2"></textarea></div>
          </div>
          <div class="modal-btns">
            <button class="cancel-btn" @click="showEditPatient = false">إلغاء</button>
            <button class="save-btn" @click="savePatientEdit" :disabled="saving">{{ saving ? '...' : 'حفظ' }}</button>
          </div>
        </div>
      </div>

      <!-- DELETE PATIENT CONFIRM -->
      <div v-if="showDeletePatient" class="modal-overlay" @click.self="showDeletePatient = false">
        <div class="modal-box sm">
          <h3>تأكيد الحذف</h3>
          <p class="delete-msg">هل أنت متأكد من حذف هذا المريض وكل بياناته؟ لا يمكن التراجع.</p>
          <div class="modal-btns">
            <button class="cancel-btn" @click="showDeletePatient = false">إلغاء</button>
            <button class="danger-btn" @click="deletePatient" :disabled="saving">حذف</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, onSnapshot, limit } from 'firebase/firestore'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const clinicId = computed(() => authStore.clinicId)
const patientId = route.params.patientId

const patient = ref(null)
const patientVisits = ref([])
const patientTreatments = ref([])
const patientPrescriptions = ref([])
const patientSessions = ref([])
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('info')
const showAddTreatment = ref(false)
const showAddSession = ref(false)
const showAddRx = ref(false)
const showEditPatient = ref(false)
const showDeletePatient = ref(false)
const uploadingImg = ref(false)
const previewImg = ref(null)

const newTreatment = ref({ type: '', description: '', cost: '', status: 'planned' })
const newSession = ref({ type: '', date: '', time: '', status: 'scheduled', notify: 'none' })
const rxForm = ref({ medications: [{ name: '', dosage: '', frequency: '' }], notes: '' })
const editForm = ref({})
let sessionCheckInterval = null
let unsubscribePrescriptions = null
let unsubscribePrescriptionsOld = null

const qrDataUrl = ref('')
const qrUrl = computed(() => {
  if (!patient.value || !clinicId.value) return ''
  return `${window.location.origin}/patient/${clinicId.value}/${patient.value.id}`
})

watch(qrUrl, async (url) => {
  if (!url) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } })
  } catch (e) { qrDataUrl.value = '' }
}, { immediate: true })

async function shareQR() {
  if (!qrUrl.value) return
  if (navigator.share) {
    try {
      await navigator.share({
        title: patient.value?.full_name || patient.value?.fullName || 'المريض',
        text: 'معلومات المريض',
        url: qrUrl.value,
      })
    } catch (e) {}
  } else {
    await navigator.clipboard.writeText(qrUrl.value)
    alert('تم نسخ الرابط')
  }
}

function downloadQR() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `patient-${patient.value?.id || 'qr'}.png`
  a.click()
}

const paidAmount = computed(() => patient.value?.paidAmount || 0)
const sessionPercent = computed(() => { const t2 = patient.value?.sessionsTotal || 0; const c = patient.value?.sessionsCompleted || 0; return t2 > 0 ? (c / t2 * 100) : 0 })
const nextSessionIndex = computed(() => patientSessions.value.findIndex(s => s.status === 'scheduled'))

const tabs = computed(() => [
  { key: 'info', label: 'المعلومات', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' },
  { key: 'treatments', label: 'العلاجات', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2h8l4 4v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>' },
  { key: 'prescriptions', label: 'الوصفات', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/></svg>' },
  { key: 'visits', label: 'الزيارات', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>' },
  { key: 'images', label: 'الصور', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
  { key: 'sessions', label: 'الجلسات', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' }
])

const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4','#f97316']
function avatarColor(n) { if (!n) return colors[0]; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length] }
function initials(n) { if (!n) return '?'; return n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() }
function formatIQD(n) { return new Intl.NumberFormat('ar-IQ').format(n || 0) + ' د.ع' }
function formatDate(s) { if (!s) return ''; try { return new Date(s).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return s } }
function statusLabel(s) { const m = { pending: 'معلّق', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي', active: 'جاري العلاج', new: 'جديد' }; return m[s] || s || '-' }
function isUpcoming(v) { if (!v.date) return false; const d = new Date(v.date); const now = new Date(); const diff = (d - now) / 86400000; return diff >= 0 && diff <= 2 }

function openEditPatient() {
  const p = patient.value
  editForm.value = {
    ...p,
    fullName: p.full_name || p.fullName || '',
    chronicDiseases: p.chronic_disease || p.chronic_diseases || p.chronicDiseases || '',
    sessionsTotal: p.sessions_total || p.sessionsTotal || 0,
    sessionsCompleted: p.sessions_completed || p.sessionsCompleted || 0,
  }
  showEditPatient.value = true
}

async function savePatientEdit() {
  saving.value = true
  try {
    const f = editForm.value
    const data = {
      full_name: f.fullName || f.full_name || '',
      age: f.age,
      gender: f.gender,
      phone: f.phone,
      amount: f.amount,
      sessions_total: f.sessionsTotal || f.sessions_total || 0,
      sessions_completed: f.sessionsCompleted || f.sessions_completed || 0,
      chronic_disease: f.chronicDiseases || f.chronic_disease || f.chronic_diseases || '',
      allergies: f.allergies || '',
      notes: f.notes || '',
    }
    await updateDoc(doc(db, 'patients', patientId), data)
    patient.value = { ...patient.value, ...data }
    showEditPatient.value = false
  } catch (e) { } finally { saving.value = false }
}

async function deletePatient() {
  saving.value = true
  try {
    await deleteDoc(doc(db, 'patients', patientId))
    router.push(`/clinic/${clinicId.value}/owner/patients`)
  } catch (e) { } finally { saving.value = false }
}

async function addTreatment() {
  if (!newTreatment.value.type) return
  try {
    await addDoc(collection(db, 'treatments'), { clinicId: clinicId.value, patientId, patientName: patient.value.full_name || patient.value.fullName, type: newTreatment.value.type, description: newTreatment.value.description, cost: parseFloat(newTreatment.value.cost) || 0, status: newTreatment.value.status, createdAt: new Date().toISOString() })
    newTreatment.value = { type: '', description: '', cost: '', status: 'planned' }
    showAddTreatment.value = false
    loadTreatments()
  } catch (e) { }
}

function editTreatment(tx) {
  newTreatment.value = { id: tx.id, type: tx.type, description: tx.description || '', cost: tx.cost || '', status: tx.status || 'planned' }
  showAddTreatment.value = true
}

async function deleteTreatment(id) {
  try {
    await deleteDoc(doc(db, 'treatments', id))
    patientTreatments.value = patientTreatments.value.filter(t => t.id !== id)
  } catch (e) { }
}

async function addSession() {
  if (!newSession.value.date) return
  try {
    const s = { ...newSession.value }
    const sessions = [...patientSessions.value, s]
    await updateDoc(doc(db, 'patients', patientId), { sessionsData: sessions, sessionsTotal: Math.max(patient.value.sessionsTotal || 0, sessions.length), sessionsCompleted: sessions.filter(x => x.status === 'completed').length })
    newSession.value = { type: '', date: '', time: '', status: 'scheduled', notify: 'none' }
    showAddSession.value = false
    patientSessions.value = sessions
    patient.value.sessionsTotal = Math.max(patient.value.sessionsTotal || 0, sessions.length)
    patient.value.sessionsCompleted = sessions.filter(x => x.status === 'completed').length
  } catch (e) { }
}

async function deleteSession(idx) {
  try {
    patientSessions.value.splice(idx, 1)
    await updateDoc(doc(db, 'patients', patientId), { sessionsData: patientSessions.value, sessionsTotal: patientSessions.value.length, sessionsCompleted: patientSessions.value.filter(s => s.status === 'completed').length })
    patient.value.sessionsTotal = patientSessions.value.length
    patient.value.sessionsCompleted = patientSessions.value.filter(s => s.status === 'completed').length
  } catch (e) { }
}

function checkSessionNotifications() {
  const now = new Date()
  patientSessions.value.forEach(s => {
    if (s.status !== 'scheduled' || !s.date || !s.time || !s.notify || s.notify === 'none') return
    const parts = s.date.split('-')
    const tParts = s.time.split(':')
    const sessionTime = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), parseInt(tParts[0]), parseInt(tParts[1]))
    const diff = (sessionTime - now) / 60000
    const notifyMin = parseInt(s.notify)
    if (diff > 0 && diff <= notifyMin && diff > notifyMin - 2) {
      if (Notification.permission === 'granted') {
        new Notification(`تنبيه جلسة - ${patient.value.full_name || patient.value.fullName}`, {
          body: `${s.type || 'جلسة'} | ${s.date} ${s.time}`,
          icon: '/favicon.ico'
        })
      }
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = 880; osc.type = 'sine'
        gain.gain.value = 0.3
        osc.start(); osc.stop(ctx.currentTime + 0.3)
        setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.connect(g2); g2.connect(ctx.destination); o2.frequency.value = 660; o2.type = 'sine'; g2.gain.value = 0.3; o2.start(); o2.stop(ctx.currentTime + 0.3) }, 300)
      } catch (e) {}
    }
  })
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingImg.value = true
  try {
    const fd = new FormData(); fd.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.data?.url) {
      const images = [...(patient.value.images || []), { url: data.data.url, date: new Date().toISOString(), type: file.name.includes('xray') ? 'أشعة' : 'صورة' }]
      await updateDoc(doc(db, 'patients', patientId), { images })
      patient.value.images = images
    }
  } catch (e) { }
  uploadingImg.value = false
}

async function deleteImage(idx) {
  try {
    const images = [...(patient.value.images || [])]
    images.splice(idx, 1)
    await updateDoc(doc(db, 'patients', patientId), { images })
    patient.value.images = images
  } catch (e) { }
}

async function saveRx() {
  if (rxForm.value.medications.every(m => !m.name)) return
  saving.value = true
  try {
    const now = new Date()
    const rxData = {
      patientId, patient_id: patientId,
      patientName: patient.value.full_name || patient.value.fullName,
      full_name: patient.value.full_name || patient.value.fullName,
      age: patient.value.age,
      medication: rxForm.value.medications.find(m => m.name)?.name || '',
      medications: rxForm.value.medications.filter(m => m.name),
      notes: rxForm.value.notes,
      doctorId: authStore.uid, doctorName: authStore.fullName || '',
      clinicId: clinicId.value, status: 'active',
      date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,
      time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      createdAt: now.toISOString()
    }
    const docRef = await addDoc(collection(db, 'prescriptions'), rxData)
    patientPrescriptions.value.unshift({ id: docRef.id, ...rxData })
    rxForm.value = { medications: [{ name: '', dosage: '', frequency: '' }], notes: '' }
    showAddRx.value = false
    setTimeout(() => printRx({ id: docRef.id, ...rxData }), 300)
  } catch (e) { alert('حدث خطأ أثناء الحفظ: ' + e.message) } finally { saving.value = false }
}

async function deleteRx(id) {
  try { await deleteDoc(doc(db, 'prescriptions', id)); patientPrescriptions.value = patientPrescriptions.value.filter(r => r.id !== id) } catch (e) { }
}

function printRx(rx) {
  const clinicName = authStore.clinicName || authStore.userProfile?.clinicName || 'عيادة طبية'
  const doctorName = rx.doctorName || authStore.fullName || 'د. ---'
  const medRows = (rx.medications || []).map((m, i) => `<tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#64748b;width:30px;">${i+1}</td><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;">${m.name||''}</td><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;">${m.dosage||'---'}</td><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#1150c9;font-weight:600;">${m.frequency||'---'}</td></tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>وصفة طبية</title></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;">
  <div style="max-width:210mm;margin:0 auto;padding:24px;background:#fff;min-height:260mm;position:relative;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #1150c9;margin-bottom:24px;">
      <div>      <h1 style="margin:0;font-size:1.6rem;font-weight:800;color:#1150c9;">⚕️ ${clinicName}</h1><p style="margin:4px 0 0;font-size:0.85rem;color:#94a3b8;">عيادة طبية متخصصة</p></div>
      <div style="text-align:right;"><h2 style="margin:0;font-size:1.1rem;font-weight:700;color:#1e293b;">وصفة طبية</h2><p style="margin:4px 0 0;font-size:0.8rem;color:#94a3b8;">${rx.date||''} ${rx.time||''}</p></div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:28px;">
      <div style="flex:1;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
        <h3 style="margin:0 0 8px;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">بيانات المريض</h3>
        <p style="margin:0;font-size:1rem;font-weight:700;color:#1e293b;">${rx.patientName||'---'}</p>
      </div>
      <div style="flex:1;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
        <h3 style="margin:0 0 8px;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">الطبيب</h3>
        <p style="margin:0;font-size:1rem;font-weight:700;color:#1e293b;">${doctorName}</p>
      </div>
    </div>
    <h3 style="margin:0 0 12px;font-size:0.85rem;font-weight:700;color:#1e293b;">💊 الأدوية والعلاجات</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <thead><tr style="background:#f1f5f9;"><th style="padding:10px 16px;text-align:left;font-size:0.75rem;font-weight:600;color:#64748b;">#</th><th style="padding:10px 16px;text-align:left;font-size:0.75rem;font-weight:600;color:#64748b;">الدواء</th><th style="padding:10px 16px;text-align:left;font-size:0.75rem;font-weight:600;color:#64748b;">الجرعة</th><th style="padding:10px 16px;text-align:left;font-size:0.75rem;font-weight:600;color:#64748b;">التكرار</th></tr></thead>
      <tbody>${medRows}</tbody>
    </table>
    ${rx.notes?`<div style="margin-top:24px;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;"><h3 style="margin:0 0 8px;font-size:0.8rem;font-weight:700;color:#92400e;">📝 ملاحظات</h3><p style="margin:0;font-size:0.9rem;color:#78350f;line-height:1.6;">${rx.notes}</p></div>`:''}
    <div style="position:absolute;bottom:40px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:flex-end;padding-top:24px;border-top:2px solid #e5e7eb;">
      <div style="text-align:center;"><div style="width:160px;border-bottom:1px solid #1e293b;margin-bottom:6px;height:40px;"></div><p style="margin:0;font-size:0.8rem;color:#64748b;font-weight:600;">${doctorName}</p><p style="margin:2px 0 0;font-size:0.72rem;color:#94a3b8;">توقيع الطبيب</p></div>
      <div style="text-align:center;"><div style="width:160px;border-bottom:1px solid #1e293b;margin-bottom:6px;height:40px;"></div><p style="margin:0;font-size:0.8rem;color:#64748b;font-weight:600;">${clinicName}</p><p style="margin:2px 0 0;font-size:0.72rem;color:#94a3b8;">ختم العيادة</p></div>
    </div>
    <div style="position:absolute;bottom:12px;left:24px;right:24px;text-align:center;font-size:0.65rem;color:#cbd5e1;">مدار | ${new Date().toLocaleString('ar-IQ')}</div>
  </div></body></html>`
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400)
}

function loadTreatments() {
  getDocs(query(collection(db, 'treatments'), where('patientId', '==', patientId), limit(100))).then(snap => {
    patientTreatments.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  })
}

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'patients', patientId))
    if (snap.exists()) patient.value = { id: snap.id, ...snap.data() }
    if (patient.value?.sessionsData) patientSessions.value = [...patient.value.sessionsData]
    loadTreatments()
    unsubscribePrescriptions = onSnapshot(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId.value), where('patientId', '==', patientId), limit(100)), s => {
      const map = new Map()
      s.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }))
      patientPrescriptions.value = [...map.values()].sort((a, b) => (b.date || b.createdAt || '').localeCompare(a.date || a.createdAt || ''))
    })
    unsubscribePrescriptionsOld = onSnapshot(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId.value), where('patient_id', '==', patientId), limit(100)), s => {
      const map = new Map(patientPrescriptions.value.map(r => [r.id, r]))
      s.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }))
      patientPrescriptions.value = [...map.values()].sort((a, b) => (b.date || b.createdAt || '').localeCompare(a.date || a.createdAt || ''))
    })
    if (Notification.permission === 'default') Notification.requestPermission()
    sessionCheckInterval = setInterval(checkSessionNotifications, 60000)
    checkSessionNotifications()
  } catch (e) { }
  loading.value = false
})

onUnmounted(() => { if (sessionCheckInterval) clearInterval(sessionCheckInterval); if (unsubscribePrescriptions) unsubscribePrescriptions(); if (unsubscribePrescriptionsOld) unsubscribePrescriptionsOld() })
</script>

<style scoped>
.pp { padding: 24px; max-width: 1200px; margin: 0 auto; }
.back-btn { display: inline-flex; align-items: center; gap: 8px; background: none; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 16px; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; margin-bottom: 20px; transition: all 0.2s; }
.back-btn:hover { border-color: #6366f1; color: #6366f1; }
.pp-loading { display: flex; align-items: center; justify-content: center; padding: 80px; }
.spin { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: sp 0.7s linear infinite; }
@keyframes sp { to { transform: rotate(360deg); } }
.pp-empty { text-align: center; padding: 80px; color: #94a3b8; }
.pp-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }

.pp-side { display: flex; flex-direction: column; gap: 16px; }
.pp-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; }
.pp-profile { text-align: center; }
.pp-avatar-lg { width: 80px; height: 80px; border-radius: 20px; display: grid; place-items: center; font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 auto 14px; }
.pp-name { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
.pp-meta { display: flex; justify-content: center; gap: 12px; font-size: 0.82rem; color: #64748b; margin-bottom: 12px; }
.pp-status { display: inline-block; padding: 4px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
.pp-status.active { background: #eef2ff; color: #6366f1; }
.pp-status.completed { background: #ecfdf5; color: #059669; }
.pp-status.new { background: #fffbeb; color: #d97706; }
.pp-visit-date { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; font-size: 0.78rem; color: #94a3b8; }

.pp-side-actions { display: flex; gap: 8px; margin-top: 16px; justify-content: center; }
.action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.action-btn.edit { background: #eef2ff; color: #6366f1; }
.action-btn.edit:hover { background: #6366f1; color: #fff; }
.action-btn.delete { background: #fef2f2; color: #dc2626; }
.action-btn.delete:hover { background: #dc2626; color: #fff; }

.pp-stats-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ps-item { text-align: center; padding: 12px 8px; background: #f8fafc; border-radius: 10px; }
.ps-val { display: block; font-size: 1rem; font-weight: 800; color: #1e293b; }
.ps-lbl { display: block; font-size: 0.7rem; color: #94a3b8; margin-top: 2px; }

.pp-main { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
.pp-tabs { display: flex; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
.pt-btn { display: flex; align-items: center; gap: 6px; padding: 14px 18px; border: none; background: none; font-size: 0.82rem; font-weight: 600; color: #64748b; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; transition: all 0.2s; }
.pt-btn.active { color: #6366f1; border-bottom-color: #6366f1; background: #f5f3ff; }
.pt-btn:hover:not(.active) { background: #f8fafc; }
.pp-tab-content { padding: 24px; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.tab-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
.count-badge { font-size: 0.72rem; background: #eef2ff; color: #6366f1; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.add-btn { padding: 8px 16px; border: 1px solid #6366f1; border-radius: 8px; background: #f5f3ff; color: #6366f1; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.add-btn:hover { background: #6366f1; color: #fff; }
.empty-tab { text-align: center; padding: 40px; color: #94a3b8; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-block { padding: 14px; background: #f8fafc; border-radius: 10px; }
.info-block.full { grid-column: 1 / -1; }
.info-block h4 { font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.info-block p { font-size: 0.9rem; color: #1e293b; margin: 0; font-weight: 500; }
.info-block a { color: #6366f1; text-decoration: none; }
.issue-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.issue-tag { padding: 4px 12px; background: #eef2ff; color: #6366f1; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.empty-text { color: #94a3b8; font-size: 0.85rem; }

.tx-card { padding: 16px; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 10px; transition: border-color 0.2s; }
.tx-card:hover { border-color: #e5e7eb; }
.tx-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tx-type { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
.tx-actions { display: flex; align-items: center; gap: 6px; }
.tx-badge { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.tx-badge.completed { background: #ecfdf5; color: #059669; }
.tx-badge.in_progress { background: #eef2ff; color: #6366f1; }
.tx-badge.planned { background: #fffbeb; color: #d97706; }
.tx-desc { font-size: 0.85rem; color: #64748b; margin: 0 0 8px; line-height: 1.5; }
.tx-footer { display: flex; justify-content: space-between; }
.tx-date { font-size: 0.75rem; color: #94a3b8; }
.tx-cost { font-size: 0.82rem; font-weight: 700; color: #10b981; }

.sm-btn { width: 28px; height: 28px; border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; background: #fff; display: grid; place-items: center; cursor: pointer; transition: all 0.2s; color: #94a3b8; }
.sm-btn.edit:hover { color: #6366f1; border-color: #6366f1; }
.sm-btn.delete:hover { color: #dc2626; border-color: #dc2626; }
.sm-btn.print:hover { color: #3b82f6; border-color: #3b82f6; }

.timeline { position: relative; padding-left: 24px; }
.timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }
.tl-item { position: relative; padding: 12px 0 12px 16px; }
.tl-dot { position: absolute; left: -20px; top: 16px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; }
.tl-dot.confirmed { background: #10b981; }
.tl-dot.pending { background: #f59e0b; }
.tl-dot.completed { background: #6366f1; }
.tl-dot.cancelled { background: #ef4444; }
.tl-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tl-date { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.tl-time { font-size: 0.78rem; color: #64748b; }
.tl-badge { font-size: 0.68rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
.tl-badge.pending { background: #fffbeb; color: #d97706; }
.tl-badge.confirmed { background: #ecfdf5; color: #059669; }
.tl-badge.completed { background: #eef2ff; color: #6366f1; }
.tl-badge.cancelled { background: #fef2f2; color: #dc2626; }
.tl-type { font-size: 0.82rem; color: #64748b; margin: 4px 0 0; }
.tl-reminder { font-size: 0.75rem; color: #f59e0b; font-weight: 600; margin: 4px 0 0; }
.tl-item.upcoming { background: #fffbeb; margin: -4px -8px; padding: 16px 16px 16px 24px; border-radius: 10px; }

.upload-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #6366f1; color: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.upload-progress { display: flex; align-items: center; gap: 8px; padding: 12px; color: #6366f1; font-size: 0.85rem; }
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.img-card { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer; transition: transform 0.2s; }
.img-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.img-card img { width: 100%; height: 140px; object-fit: cover; }
.img-meta { padding: 8px 12px; display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; }
.img-del { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border: none; border-radius: 6px; background: rgba(239,68,68,0.9); color: #fff; font-size: 0.7rem; cursor: pointer; display: grid; place-items: center; opacity: 0; transition: opacity 0.2s; }
.img-card:hover .img-del { opacity: 1; }
.img-preview-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.85); display: grid; place-items: center; cursor: pointer; }
.img-preview-overlay img { max-width: 90%; max-height: 90%; border-radius: 12px; }
.preview-close { position: fixed; top: 20px; right: 20px; width: 40px; height: 40px; border: none; border-radius: 50%; background: rgba(255,255,255,0.2); color: #fff; font-size: 1.2rem; cursor: pointer; }

.rx-card { border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.rx-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
.rx-date { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
.rx-doctor { display: block; font-size: 0.72rem; color: #94a3b8; }
.rx-actions { display: flex; gap: 4px; }
.rx-meds { padding: 12px 16px; }
.rx-med-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
.rx-med-item:last-child { border-bottom: none; }
.rx-med-num { width: 20px; height: 20px; border-radius: 5px; background: #6366f1; color: #fff; font-size: 0.65rem; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }
.rx-med-name { font-weight: 700; font-size: 0.85rem; color: #1e293b; }
.rx-med-dose { font-size: 0.78rem; color: #64748b; }
.rx-med-freq { font-size: 0.72rem; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 5px; margin-left: auto; }
.rx-notes { padding: 0 16px 12px; font-size: 0.8rem; color: #94a3b8; font-style: italic; margin: 0; }

.session-progress { margin-bottom: 20px; }
.sp-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.sp-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.5s ease; }
.sp-text { display: block; text-align: center; margin-top: 8px; font-size: 0.82rem; color: #64748b; font-weight: 600; }
.session-list { display: flex; flex-direction: column; gap: 8px; }
.session-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid #f1f5f9; transition: all 0.2s; }
.session-item:hover { border-color: #e5e7eb; }
.session-item.completed { background: #f0fdf4; border-color: #bbf7d0; }
.session-item.missed { background: #fef2f2; border-color: #fecaca; }
.session-item.scheduled { background: #eef2ff; border-color: #c7d2fe; }
.si-num { width: 36px; height: 36px; border-radius: 10px; color: #fff; font-size: 0.82rem; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }
.si-num.completed { background: #10b981; }
.si-num.missed { background: #ef4444; }
.si-num.scheduled { background: #6366f1; }
.si-info { flex: 1; min-width: 0; }
.si-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.si-type { font-weight: 700; font-size: 0.88rem; color: #1e293b; }
.si-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 5px; }
.si-badge.completed { background: #d1fae5; color: #059669; }
.si-badge.missed { background: #fee2e2; color: #dc2626; }
.si-badge.scheduled { background: #dbeafe; color: #2563eb; }
.si-details { display: flex; gap: 12px; font-size: 0.78rem; color: #64748b; flex-wrap: wrap; }
.si-notify { color: #f59e0b; font-weight: 600; }
.si-actions { display: flex; align-items: center; gap: 6px; }
.si-next { font-size: 0.68rem; font-weight: 600; color: #f59e0b; background: #fffbeb; padding: 3px 10px; border-radius: 6px; }

.rx-med-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.rx-med-row input { flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; outline: none; }
.rx-med-row input:focus { border-color: #6366f1; }
.add-med-link { background: none; border: none; color: #6366f1; font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 4px 0; margin-bottom: 8px; }
.add-med-link:hover { text-decoration: underline; }

.add-form { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
.add-form input, .add-form textarea, .add-form select { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; outline: none; font-family: inherit; }
.add-form input:focus, .add-form textarea:focus, .add-form select:focus { border-color: #6366f1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-label { font-size: 0.72rem; font-weight: 600; color: #64748b; margin-bottom: 4px; display: block; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; }
.save-btn { padding: 10px 20px; border: none; border-radius: 8px; background: #6366f1; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.save-btn:hover { background: #4f46e5; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cancel-btn { padding: 10px 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #64748b; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.cancel-btn:hover { background: #f1f5f9; }

.modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 90%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: 0 24px 48px rgba(0,0,0,0.15); }
.modal-box.sm { max-width: 400px; }
.modal-box h3 { margin: 0 0 20px; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.mg { display: flex; flex-direction: column; gap: 4px; }
.mg.full { grid-column: 1 / -1; }
.mg label { font-size: 0.78rem; font-weight: 600; color: #64748b; }
.mg input, .mg select, .mg textarea { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; outline: none; font-family: inherit; }
.mg input:focus, .mg select:focus, .mg textarea:focus { border-color: #6366f1; }
.modal-btns { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.danger-btn { padding: 10px 20px; border: none; border-radius: 8px; background: #dc2626; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.danger-btn:hover { background: #b91c1c; }
.delete-msg { font-size: 0.88rem; color: #64748b; line-height: 1.6; margin: 0; }

.pp-qr-section { margin-top: 16px; }
.qr-divider { height: 1px; background: #f1f5f9; margin: 16px 0; }
.qr-label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; text-align: center; }
.qr-wrap { display: flex; justify-content: center; padding: 16px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; }
.qr-img { width: 160px; height: 160px; border-radius: 8px; }
.qr-actions { display: flex; gap: 8px; margin-top: 10px; }
.qr-share, .qr-download { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; background: #fff !important; color: #6366f1 !important; font-size: 0.78rem !important; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.qr-share:hover, .qr-download:hover { background: #f5f3ff !important; border-color: #6366f1 !important; }

@media (max-width: 768px) { .pp-grid { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } .img-grid { grid-template-columns: repeat(2, 1fr); } .rx-med-row { flex-wrap: wrap; } .rx-med-row input { flex: 1 1 100%; max-width: 100% !important; } .form-row { grid-template-columns: 1fr; } .modal-grid { grid-template-columns: 1fr; } .pp-tabs { gap: 0; } .pp-tab-content { padding: 16px; } .pp-meta { flex-wrap: wrap; justify-content: center; } }
@media (max-width: 480px) { .pp { padding: 16px; } .pp-card { padding: 18px; } .pp-stats-mini { grid-template-columns: 1fr 1fr; gap: 8px; } .pp-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; } .pt-btn { padding: 12px 14px; font-size: 0.75rem; } .session-item { flex-wrap: wrap; gap: 10px; } .si-actions { width: 100%; justify-content: flex-end; padding-top: 6px; border-top: 1px solid #f1f5f9; } .img-grid { grid-template-columns: 1fr; } .rx-med-item { flex-wrap: wrap; gap: 6px; } .rx-med-freq { margin-left: 0; } }
</style>
