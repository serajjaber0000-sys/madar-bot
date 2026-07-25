<template>
  <AppLayout>
    <div class="maintenance-page">
      <header class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">الصيانة والإشعارات</h1>
            <p class="page-subtitle">إرسال الرسائل للعيادات وإدارة وضع الصيانة</p>
          </div>
        </div>
      </header>

      <div class="two-col">
        <!-- Send Messages -->
        <div class="card glass">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <path d="M2.5 4l7.5 5.5L17.5 4"/>
                <rect x="2.5" y="4" width="15" height="12" rx="2"/>
              </svg>
              إرسال إشعار للعيادات
            </h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">العنوان</label>
              <input v-model="msgForm.title" type="text" class="form-input" placeholder="عنوان الإشعار..." />
            </div>

            <div class="form-group">
              <label class="form-label">الرسالة</label>
              <textarea v-model="msgForm.body" class="form-textarea" rows="4" placeholder="نص الرسالة..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">الأولوية</label>
              <div class="priority-options">
                <button
                  :class="['priority-btn', { active: msgForm.priority === 'normal' }]"
                  @click="msgForm.priority = 'normal'"
                >
                  <span class="priority-dot normal"></span>
                  عادية
                </button>
                <button
                  :class="['priority-btn', { active: msgForm.priority === 'urgent' }]"
                  @click="msgForm.priority = 'urgent'"
                >
                  <span class="priority-dot urgent"></span>
                  عاجلة
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">العيادات المستهدفة</label>
              <div class="target-options">
                <button
                  :class="['target-btn', { active: msgForm.target === 'all' }]"
                  @click="msgForm.target = 'all'; msgForm.selectedClinics = []"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <circle cx="10" cy="10" r="8"/>
                    <path d="M2 10h16M10 2a15 15 0 0 1 4 18M10 2a15 15 0 0 0-4 18"/>
                  </svg>
                  جميع العيادات
                </button>
                <button
                  :class="['target-btn', { active: msgForm.target === 'specific' }]"
                  @click="msgForm.target = 'specific'"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <circle cx="7" cy="6" r="3"/>
                    <path d="M2.5 17.5v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v1"/>
                  </svg>
                  عيادات محددة
                </button>
              </div>
            </div>

            <div v-if="msgForm.target === 'specific'" class="form-group">
              <label class="form-label">اختر العيادات</label>
              <div class="multi-select glass">
                <div
                  v-for="clinic in clinicsList"
                  :key="clinic.id"
                  :class="['multi-option', { selected: msgForm.selectedClinics.includes(clinic.id) }]"
                  @click="toggleClinic(clinic.id)"
                >
                  <div class="multi-check">
                    <svg v-if="msgForm.selectedClinics.includes(clinic.id)" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <div v-else class="multi-unchecked"></div>
                  </div>
                  <span class="multi-name">{{ clinic.name }}</span>
                </div>
              </div>
            </div>

            <button
              class="btn btn-primary send-btn"
              :disabled="sending || !canSend"
              @click="sendMessage"
            >
              <svg v-if="!sending" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M2.5 10l15-7.5-7.5 15v-6.5H10L2.5 10z"/>
              </svg>
              <span v-if="sending" class="spinner-sm"></span>
              {{ sending ? 'جاري الإرسال...' : 'إرسال الإشعار' }}
            </button>
          </div>
        </div>

        <!-- Maintenance Mode -->
        <div class="card glass">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
                <path d="M10 2L2 7l8 5 8-5-8-5z"/>
                <path d="M2 13l8 5 8-5"/>
              </svg>
              وضع الصيانة
            </h3>
          </div>
          <div class="card-body">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">تفعيل وضع الصيانة</span>
                <span class="toggle-desc">
                  {{ maintenanceEnabled ? 'الوضع مفعّل حالياً - جميع المستخدمين يرون صفحة الصيانة' : 'الوضع غير مفعّل - المنصة تعمل بشكل طبيعي' }}
                </span>
              </div>
              <button
                :class="['toggle-switch', { on: maintenanceEnabled }]"
                @click="toggleMaintenance"
                :disabled="savingMaintenance"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="form-group" style="margin-top: 20px;">
              <label class="form-label">رسالة الصيانة</label>
              <textarea
                v-model="maintenanceMessage"
                class="form-textarea"
                rows="3"
                placeholder="الموقع قيد الصيانة، يرجى المحاولة لاحقاً"
              ></textarea>
            </div>

            <button
              class="btn btn-primary send-btn"
              :disabled="savingMaintenance || !maintenanceMessage.trim()"
              @click="saveMaintenanceMessage"
            >
              <svg v-if="!savingMaintenance" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M16.5 5.5l-11 11-4-4"/>
              </svg>
              <span v-if="savingMaintenance" class="spinner-sm"></span>
              {{ savingMaintenance ? 'جاري الحفظ...' : 'حفظ الرسالة' }}
            </button>

            <div v-if="maintenanceUpdatedAt" class="last-updated">
              آخر تحديث: {{ formatTime(maintenanceUpdatedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Messages -->
      <div class="card glass" style="margin-top: 20px;">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
              <circle cx="10" cy="10" r="8.5"/>
              <path d="M10 6v4l2.5 2.5"/>
            </svg>
            آخر الإشعارات المرسلة
          </h3>
        </div>
        <div v-if="loadingMessages" class="card-loading">
          <div class="spinner"></div>
          جاري تحميل الإشعارات...
        </div>
        <div v-else-if="sentMessages.length === 0" class="empty-state">
          <p class="empty-desc">لم تُرسل أي إشعارات بعد</p>
        </div>
        <div v-else class="messages-list">
          <div v-for="msg in sentMessages" :key="msg.id" class="message-row">
            <div class="message-priority-bar" :class="{ urgent: msg.priority === 'urgent' }"></div>
            <div class="message-content">
              <div class="message-top">
                <span class="message-title">{{ msg.title }}</span>
                <span :class="['badge', msg.priority === 'urgent' ? 'badge-danger' : 'badge-outline']">
                  {{ msg.priority === 'urgent' ? 'عاجلة' : 'عادية' }}
                </span>
              </div>
              <p class="message-body">{{ msg.body }}</p>
              <div class="message-meta">
                <span>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12">
                    <circle cx="10" cy="10" r="8.5"/>
                    <path d="M10 6v4l2.5 2.5"/>
                  </svg>
                  {{ formatTime(msg.createdAt) }}
                </span>
                <span>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12">
                    <circle cx="7" cy="6" r="3"/>
                    <path d="M2.5 17.5v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v1"/>
                  </svg>
                  {{ msg.targetClinicId === 'all' ? 'جميع العيادات' : `عيادة محددة (${msg.targetClinicIds?.length || 1})` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <transition name="toast-fade">
        <div v-if="toast.show" :class="['toast', `toast--${toast.type}`]">
          <svg v-if="toast.type === 'success'" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/config'
import { collection, getDocs, doc, setDoc, addDoc, getDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()

const clinicsList = ref([])
const sending = ref(false)
const loadingMessages = ref(true)
const sentMessages = ref([])
const savingMaintenance = ref(false)
const maintenanceEnabled = ref(false)
const maintenanceMessage = ref('')
const maintenanceUpdatedAt = ref(null)

const msgForm = ref({
  title: '',
  body: '',
  priority: 'normal',
  target: 'all',
  selectedClinics: []
})

const toast = ref({ show: false, type: 'success', message: '' })

const canSend = computed(() => {
  if (!msgForm.value.title.trim() || !msgForm.value.body.trim()) return false
  if (msgForm.value.target === 'specific' && msgForm.value.selectedClinics.length === 0) return false
  return true
})

function toggleClinic(id) {
  const idx = msgForm.value.selectedClinics.indexOf(id)
  if (idx >= 0) msgForm.value.selectedClinics.splice(idx, 1)
  else msgForm.value.selectedClinics.push(id)
}

function showToast(type, message) {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  if (!canSend.value) return
  sending.value = true
  try {
    const title = msgForm.value.title.trim()
    const body = msgForm.value.body.trim()
    const priority = msgForm.value.priority
    const now = new Date().toISOString()

    await addDoc(collection(db, 'platform_notifications'), {
      title,
      body,
      priority,
      targetClinicId: msgForm.value.target === 'all' ? 'all' : null,
      targetClinicIds: msgForm.value.target === 'specific' ? msgForm.value.selectedClinics : [],
      sentBy: authStore.user?.uid || 'super_admin',
      createdAt: now
    })

    const targetClinics = msgForm.value.target === 'all'
      ? clinicsList.value
      : clinicsList.value.filter(c => msgForm.value.selectedClinics.includes(c.id))

    for (const clinic of targetClinics) {
      await addDoc(collection(db, 'notifications'), {
        clinicId: clinic.id,
        toUserId: 'all',
        type: 'platform_announcement',
        title,
        message: body,
        priority,
        from: 'super_admin',
        read: false,
        createdAt: now
      })
    }

    msgForm.value = { title: '', body: '', priority: 'normal', target: 'all', selectedClinics: [] }
    await loadMessages()
    showToast('success', 'تم إرسال الإشعار بنجاح')
  } catch (err) {
    showToast('error', 'حدث خطأ أثناء الإرسال')
  } finally {
    sending.value = false
  }
}

async function toggleMaintenance() {
  savingMaintenance.value = true
  maintenanceEnabled.value = !maintenanceEnabled.value
  try {
    await setDoc(doc(db, 'platform_settings', 'maintenance'), {
      enabled: maintenanceEnabled.value,
      message: maintenanceMessage.value || 'الموقع قيد الصيانة، يرجى المحاولة لاحقاً',
      updatedAt: new Date().toISOString()
    }, { merge: true })
    showToast('success', maintenanceEnabled.value ? 'تم تفعيل وضع الصيانة' : 'تم إلغاء وضع الصيانة')
  } catch (err) {
    maintenanceEnabled.value = !maintenanceEnabled.value
    showToast('error', 'حدث خطأ أثناء الحفظ')
  } finally {
    savingMaintenance.value = false
  }
}

async function saveMaintenanceMessage() {
  savingMaintenance.value = true
  try {
    await setDoc(doc(db, 'platform_settings', 'maintenance'), {
      message: maintenanceMessage.value.trim(),
      updatedAt: new Date().toISOString()
    }, { merge: true })
    maintenanceUpdatedAt.value = new Date().toISOString()
    showToast('success', 'تم حفظ رسالة الصيانة')
  } catch (err) {
    showToast('error', 'حدث خطأ أثناء الحفظ')
  } finally {
    savingMaintenance.value = false
  }
}

async function loadMessages() {
  loadingMessages.value = true
  try {
    const snap = await getDocs(collection(db, 'platform_notifications'))
    sentMessages.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 10)
  } catch (err) {
  } finally {
    loadingMessages.value = false
  }
}

async function loadMaintenance() {
  try {
    const snap = await getDoc(doc(db, 'platform_settings', 'maintenance'))
    if (snap.exists()) {
      const data = snap.data()
      maintenanceEnabled.value = data.enabled || false
      maintenanceMessage.value = data.message || ''
      maintenanceUpdatedAt.value = data.updatedAt || null
    }
  } catch (err) {}
}

async function loadClinics() {
  try {
    const snap = await getDocs(collection(db, 'clinics'))
    clinicsList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {}
}

onMounted(() => {
  loadClinics()
  loadMessages()
  loadMaintenance()
})
</script>

<style scoped>
.maintenance-page { padding: 24px; max-width: 1400px; margin: 0 auto; animation: fadeUp 0.5s ease; }

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

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.card { border-radius: 18px; overflow: hidden; }
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.04);
}
.card-title {
  font-size: 15px; font-weight: 700; color: #0a2757;
  display: flex; align-items: center; gap: 8px; margin: 0;
}
.card-body { padding: 24px; }
.card-loading { padding: 40px; text-align: center; color: #9ca3af; font-size: 14px; }

.form-group { margin-bottom: 18px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.form-input, .form-textarea {
  width: 100%; padding: 10px 14px; border-radius: 12px; border: 1.5px solid #e5e7eb;
  font-size: 0.88rem; font-family: inherit; color: #1e293b; background: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
}
.form-input:focus, .form-textarea:focus {
  outline: none; border-color: #1150c9; box-shadow: 0 0 0 3px rgba(17,80,201,0.1); background: #fff;
}
.form-textarea { resize: vertical; min-height: 80px; }

.priority-options, .target-options { display: flex; gap: 10px; flex-wrap: wrap; }

.priority-btn, .target-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
  border-radius: 12px; border: 1.5px solid #e5e7eb; background: #fff;
  font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}
.priority-btn:hover, .target-btn:hover { border-color: #c7d2fe; color: #1150c9; }
.priority-btn.active { border-color: #1150c9; background: #f5f3ff; color: #1150c9; box-shadow: 0 2px 8px rgba(17,80,201,0.15); }
.target-btn.active { border-color: #1150c9; background: #f5f3ff; color: #1150c9; box-shadow: 0 2px 8px rgba(17,80,201,0.15); }

.priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.priority-dot.normal { background: #10B981; }
.priority-dot.urgent { background: #EF4444; }

.multi-select {
  max-height: 220px; overflow-y: auto; padding: 8px;
}
.multi-option {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 10px; cursor: pointer; transition: background 0.15s;
}
.multi-option:hover { background: rgba(17,80,201,0.04); }
.multi-option.selected { background: rgba(17,80,201,0.08); }
.multi-check { flex-shrink: 0; color: #1150c9; }
.multi-unchecked { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid #d1d5db; }
.multi-name { font-size: 0.88rem; color: #374151; font-weight: 500; }

.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
  border-radius: 12px; font-size: 0.88rem; font-weight: 700;
  text-decoration: none; transition: all 0.2s; border: none; cursor: pointer; white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #1150c9, #14b8a6);
  color: #fff; box-shadow: 0 2px 12px rgba(17,80,201,0.35);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(17,80,201,0.5); transform: translateY(-1px);
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn { width: 100%; justify-content: center; }

.spinner-sm {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}

.spinner {
  width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #1150c9;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px;
}

/* Toggle */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px; background: #f9fafb; border-radius: 14px;
}
.toggle-info { display: flex; flex-direction: column; gap: 4px; }
.toggle-label { font-size: 0.95rem; font-weight: 700; color: #0a2757; }
.toggle-desc { font-size: 0.78rem; color: #9ca3af; }
.toggle-switch {
  width: 52px; height: 28px; border-radius: 14px; border: none;
  background: #d1d5db; cursor: pointer; position: relative; transition: background 0.3s;
  flex-shrink: 0; padding: 0;
}
.toggle-switch.on { background: linear-gradient(135deg, #10B981, #059669); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
  border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-switch.on .toggle-knob { transform: translateX(24px); }

.last-updated { margin-top: 14px; font-size: 0.78rem; color: #9ca3af; text-align: center; }

/* Messages List */
.messages-list { padding: 4px 0; }
.message-row {
  display: flex; align-items: stretch; border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: background 0.15s;
}
.message-row:last-child { border-bottom: none; }
.message-row:hover { background: rgba(0,0,0,0.01); }
.message-priority-bar { width: 4px; background: #10B981; flex-shrink: 0; border-radius: 0 4px 4px 0; }
.message-priority-bar.urgent { background: #EF4444; }
.message-content { flex: 1; padding: 14px 20px; }
.message-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.message-title { font-size: 0.9rem; font-weight: 700; color: #0a2757; }
.message-body { font-size: 0.82rem; color: #6b7280; margin: 0 0 8px; line-height: 1.5; }
.message-meta { display: flex; gap: 16px; font-size: 0.75rem; color: #9ca3af; flex-wrap: wrap; }
.message-meta span { display: flex; align-items: center; gap: 4px; }

.empty-state { padding: 40px 20px; text-align: center; color: #9ca3af; }
.empty-desc { margin: 0; font-size: 0.88rem; color: #94a3b8; }

.badge {
  display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: 11px;
  font-weight: 600; white-space: nowrap;
}
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-outline { background: #f3f4f6; color: #374151; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px; padding: 12px 24px;
  border-radius: 12px; font-size: 0.88rem; font-weight: 600; color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15); z-index: 9999;
}
.toast--success { background: #059669; }
.toast--error { background: #dc2626; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

@media (max-width: 1024px) { .two-col { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .maintenance-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
