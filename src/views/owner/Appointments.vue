<template>
  <AppLayout>
    <div class="appts-page">

      <header class="dh">
        <div class="dh-left">
          <div class="dh-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div>
            <h2>حجوزات اليوم</h2>
            <p>{{ todayStr }}</p>
          </div>
        </div>
        <div class="dh-right">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input v-model="searchQuery" placeholder="بحث بالاسم أو رقم الهاتف..." />
          </div>
        </div>
      </header>

      <!-- STATS -->
      <div class="stats">
        <div class="st st-total">
          <div class="st-num">{{ filteredList.length }}</div>
          <div class="st-label">الإجمالي</div>
        </div>
        <div class="st st-new">
          <div class="st-num">{{ newCount }}</div>
          <div class="st-label">مراجع جديد</div>
        </div>
        <div class="st st-old">
          <div class="st-num">{{ oldCount }}</div>
          <div class="st-label">مراجع سابق</div>
        </div>
        <div class="st st-in">
          <div class="st-num">{{ enteredCount }}</div>
          <div class="st-label">دخل</div>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="filteredList.length === 0" class="empty">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <p>{{ searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد حجوزات اليوم' }}</p>
      </div>

      <!-- QUEUE LIST -->
      <div v-else class="queue">
        <div v-for="(a, i) in filteredList" :key="a.id" class="q-card" :class="{ entered: a.entered === 1, missed: a.missed === 1 }">
          <div class="q-num">{{ i + 1 }}</div>
          <div class="q-info">
            <div class="q-name-row">
              <span class="q-name">{{ a.full_name || '---' }}</span>
              <span v-if="a.is_new_patient" class="q-badge new">مراجع جديد</span>
              <span v-else class="q-badge old">مراجع سابق</span>
              <span v-if="a.start_time" class="q-time">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ to12h(a.start_time) }}{{ a.end_time ? ' - ' + to12h(a.end_time) : '' }}
              </span>
            </div>
            <div class="q-meta">
              <span v-if="a.phone" class="q-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                {{ a.phone }}
              </span>
              <span class="q-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {{ a.booked_by_name || 'السكرتير' }}
              </span>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="q-actions">
            <label class="q-flag" :class="{ active: a.entered === 1 }" @click.prevent="toggleEntered(a)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              دخل
            </label>
            <label class="q-flag q-miss" :class="{ active: a.missed === 1 }" @click.prevent="toggleMissed(a)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              لم يحضر
            </label>
            <button class="q-del" @click="confirmDelete(a)" title="حذف الحجز">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE CONFIRM MODAL -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>تأكيد الحذف</h3>
            <button class="modal-close" @click="showDeleteConfirm = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showDeleteConfirm = false">إلغاء</button>
            <button class="btn btn-danger" :disabled="saving" @click="doDelete">حذف</button>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '../../stores/auth'
import { appointmentsRepo } from '../../services/clinic'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { to12h, timeUntil, playNotifSound } from '@/utils/time'

const authStore = useAuthStore()

const now = ref(Date.now())
let timerInterval = null
const countdownReactive = (date, time) => { now.value; return timeUntil(date, time) }
const clinicId = computed(() => authStore.clinicId)

const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const queueList = ref([])

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const todayStr = computed(() => new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const _n = new Date(); const todayKey = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`

const filteredList = computed(() => {
  let list = [...queueList.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      (a.full_name || '').toLowerCase().includes(q) ||
      (a.phone || '').includes(q)
    )
  }
  return list
})

const newCount = computed(() => queueList.value.filter(a => a.is_new_patient).length)
const oldCount = computed(() => queueList.value.filter(a => !a.is_new_patient).length)
const enteredCount = computed(() => queueList.value.filter(a => a.entered === 1).length)

async function toggleEntered(a) {
  if (a.entered === 1) {
    a.entered = 0
  } else {
    a.entered = 1
    a.missed = 0
  }
  try { await updateDoc(doc(db, 'appointments', a.id), { entered: a.entered, missed: a.missed }) } catch (e) {}
}

async function toggleMissed(a) {
  if (a.missed === 1) {
    a.missed = 0
  } else {
    a.missed = 1
    a.entered = 0
  }
  try { await updateDoc(doc(db, 'appointments', a.id), { missed: a.missed, entered: a.entered }) } catch (e) {}
}

function confirmDelete(a) {
  deleteTarget.value = a
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await appointmentsRepo.remove(deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (e) {}
  saving.value = false
}

let unsub = null
onMounted(async () => {
  timerInterval = setInterval(() => { now.value = Date.now() }, 60000)
  if (!clinicId.value) return

  unsub = onSnapshot(
    query(collection(db, 'appointments'), where('clinicId', '==', clinicId.value), where('appointment_date', '==', todayKey)),
    (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      queueList.value = list.map(a => ({
        ...a,
        full_name: a.full_name || '---',
        phone: a.phone || '',
        is_new_patient: a.is_new_patient ?? true
      })).sort((a, b) => (a.entered || 0) - (b.entered || 0) || (a.missed || 0) - (b.missed || 0) || (a.id || '').localeCompare(b.id || ''))
      loading.value = false
    }
  )
})

onUnmounted(() => { if (unsub) unsub(); if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.appts-page { padding: 24px; max-width: 1100px; margin: 0 auto; }

/* HEADER */
.dh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.dh-left { display: flex; align-items: center; gap: 14px; }
.dh-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #1150c9, #0d9488); display: grid; place-items: center; color: #fff; flex-shrink: 0; }
.dh h2 { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0; }
.dh p { font-size: 0.82rem; color: #64748b; margin: 4px 0 0; }
.search-box { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; min-width: 260px; }
.search-box:focus-within { border-color: #1150c9; box-shadow: 0 0 0 3px rgba(17,80,201,0.08); }
.search-box svg { color: #94a3b8; flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: 0.85rem; color: #1e293b; background: none; width: 100%; font-family: inherit; }
.search-box input::placeholder { color: #94a3b8; }

/* STATS */
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
.st { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 14px; text-align: center; position: relative; overflow: hidden; transition: transform 0.2s; }
.st:hover { transform: translateY(-2px); }
.st::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.st-total::before { background: #1150c9; }
.st-new::before { background: #d69e1f; }
.st-old::before { background: #0d9488; }
.st-in::before { background: #8b5cf6; }
.st-num { font-size: 1.4rem; font-weight: 800; color: #1e293b; }
.st-total .st-num { color: #1150c9; }
.st-new .st-num { color: #d69e1f; }
.st-old .st-num { color: #0d9488; }
.st-in .st-num { color: #8b5cf6; }
.st-label { font-size: 0.7rem; color: #64748b; font-weight: 600; margin-top: 4px; }

/* LOADING & EMPTY */
.loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #1150c9; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px; color: #94a3b8; }
.empty-icon { opacity: 0.4; }
.empty p { font-size: 0.92rem; margin: 0; }

/* QUEUE LIST */
.queue { display: flex; flex-direction: column; gap: 10px; }
.q-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; transition: all 0.25s ease; }
.q-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transform: translateY(-1px); }
.q-card.entered { border-right: 5px solid #10b981; background: linear-gradient(270deg, rgba(236,253,245,0.4), #fff); }
.q-card.missed { border-right: 5px solid #ef4444; background: linear-gradient(270deg, rgba(254,242,242,0.4), #fff); opacity: 0.75; }

.q-num { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #64748b; display: grid; place-items: center; font-size: 0.9rem; font-weight: 800; flex-shrink: 0; }
.q-card.entered .q-num { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #15803d; }
.q-card.missed .q-num { background: linear-gradient(135deg, #fef2f2, #fecaca); color: #dc2626; }

.q-info { flex: 1; min-width: 0; }
.q-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.q-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
.q-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 12px; border-radius: 999px; }
.q-badge.new { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; border: 1px solid rgba(146,64,14,0.12); }
.q-badge.old { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #15803d; border: 1px solid rgba(21,128,61,0.12); }
.q-time { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 600; color: #1150c9; background: #eff6ff; padding: 2px 10px; border-radius: 999px; }
.q-meta { display: flex; align-items: center; gap: 10px; margin-top: 5px; flex-wrap: wrap; }
.q-meta-item { display: inline-flex; align-items: center; gap: 4px; font-size: 0.74rem; color: #64748b; }

/* ACTIONS */
.q-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }
.q-flag { display: inline-flex; align-items: center; gap: 4px; padding: 7px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: 700; color: #64748b; background: #fff; transition: all 0.2s; user-select: none; }
.q-flag:hover { border-color: #0d9488; color: #0d9488; background: #f0fdfa; }
.q-flag.active { background: #dcfce7; border-color: #10b981; color: #15803d; }
.q-flag.q-miss:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.q-flag.q-miss.active { background: #fef2f2; border-color: #ef4444; color: #dc2626; }
.q-del { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: #fff; cursor: pointer; display: grid; place-items: center; color: #94a3b8; transition: all 0.2s; }
.q-del:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* MODAL */
.modal { background: #fff; border-radius: 20px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: slideUp 0.25s ease; }
.modal-sm { width: 360px; }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; cursor: pointer; display: grid; place-items: center; color: #64748b; transition: all 0.2s; }
.modal-close:hover { background: #e2e8f0; }
.modal-body { padding: 20px 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }

.form-field label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
.form-field label em { color: #ef4444; font-style: normal; }
.form-field input, .form-field textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; font-family: inherit; color: #1e293b; transition: border-color 0.2s; }
.form-field input:focus, .form-field textarea:focus { outline: none; border-color: #1150c9; }

.confirm-text { font-size: 0.9rem; color: #475569; text-align: center; margin: 0; }

.btn { padding: 10px 22px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-ghost { background: #f1f5f9; color: #64748b; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-primary { background: #1150c9; color: #fff; }
.btn-primary:hover { background: #0e42a8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .appts-page { padding: 16px; }
  .dh { flex-direction: column; align-items: flex-start; }
  .search-box { min-width: unset; width: 100%; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .q-card { flex-wrap: wrap; gap: 10px; }
  .q-actions { order: 5; width: 100%; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #f1f5f9; }
}
@media (max-width: 480px) {
  .stats { grid-template-columns: 1fr; }
  .q-name { font-size: 0.85rem; }
  .q-num { width: 34px; height: 34px; font-size: 0.8rem; }
}
</style>
