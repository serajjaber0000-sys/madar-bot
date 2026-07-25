<template>
  <AppLayout>
    <div class="notifications-page">
      <header class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h1>الإشعارات</h1>
            <p class="subtitle" v-if="unreadCount > 0">{{ unreadCount }} إشعار غير مقروء</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="refresh-btn" @click="forceRefresh" :class="{ spinning: refreshing }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button v-if="unreadCount > 0" class="mark-read-btn" @click="markAllRead">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            تحديد الكل كمقروء
          </button>
        </div>
      </header>

      <!-- Upcoming Appointments Alert -->
      <div class="filter-tabs">
        <button v-for="tab in filterTabs" :key="tab.key" :class="['tab-btn', { active: activeFilter === tab.key }]" @click="activeFilter = tab.key">
          <span v-html="tab.icon" class="tab-icon"></span>
          {{ tab.label }}
          <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading-wrap">
        <div class="spinner-glow"></div>
        <p>جاري تحميل الإشعارات...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state glass-card">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>لا توجد إشعارات</h3>
        <p>ستظهر الإشعارات الجديدة هنا</p>
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="(notif, i) in filteredNotifications"
          :key="notif.id"
          :class="['notif-card glass-card', { unread: !notif.read, 'notif-appointment': notif.type?.includes('appointment'), 'notif-alert': notif.type === 'alert', 'notif-reminder': notif.type === 'reminder' }]"
          :style="{ animationDelay: i * 0.04 + 's' }"
          @click="markAsRead(notif)"
        >
          <div class="notif-unread-dot" v-if="!notif.read"></div>

          <div :class="['notif-icon', notif.type]">
            <svg v-if="notif.type?.includes('reminder')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
            <svg v-else-if="notif.type?.includes('appointment_booked')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            <svg v-else-if="notif.type?.includes('appointment_approved')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="notif.type?.includes('appointment_rejected') || notif.type?.includes('cancelled')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <svg v-else-if="notif.type === 'patient_registered'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>

          <div class="notif-body">
            <h4 class="notif-title">{{ notif.title }}</h4>
            <span class="notif-source" v-if="notif.from === 'super_admin'">خدمة العملاء</span>
            <span class="notif-source sec" v-else-if="notif.from === 'secretary'">السكرتير — إضافة حجز مريض</span>
            <p class="notif-message-text">{{ notif.message }}</p>
            <div class="notif-footer">
              <span class="notif-time">{{ timeAgo(notif.createdAt) }}</span>
              <span v-if="notif.appointmentDate" class="notif-date-badge">📅 {{ notif.appointmentDate }} {{ notif.appointmentTime }}</span>
            </div>
          </div>
          <button class="notif-delete-btn" @click="deleteNotification(notif, $event)" title="حذف الإشعار">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div v-if="toastMsg" class="toast-glass" :class="toastType">{{ toastMsg }}</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, onSnapshot, limit, addDoc } from 'firebase/firestore'

const { t } = useI18n()
const authStore = useAuthStore()

const notifications = ref([])
const loading = ref(true)
const refreshing = ref(false)
const activeFilter = ref('all')
const toastMsg = ref('')
const toastType = ref('')
let unsubscribeSnapshot = null

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const filterTabs = computed(() => [
  { key: 'all', label: 'الكل', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>', count: notifications.value.length },
  { key: 'unread', label: 'غير مقروء', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>', count: unreadCount.value }
])

const filteredNotifications = computed(() => {
  let list = [...notifications.value]
  if (activeFilter.value === 'unread') list = list.filter(n => !n.read)
  return list.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))
})

function dayKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'الآن'
  if (diff < 3600) { const mins = Math.floor(diff / 60); return `منذ ${mins} دقيقة` }
  if (diff < 86400) { const hours = Math.floor(diff / 3600); return `منذ ${hours} ساعة` }
  if (diff < 604800) { const days = Math.floor(diff / 86400); return `منذ ${days} يوم` }
  return date.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
}

async function markAsRead(notif) {
  if (notif.read) return
  try {
    await updateDoc(doc(db, 'notifications', notif.id), { read: true })
    const idx = notifications.value.findIndex(n => n.id === notif.id)
    if (idx !== -1) notifications.value[idx] = { ...notifications.value[idx], read: true }
    } catch (e) { }
}

async function markAllRead() {
  try {
    const unread = notifications.value.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })))
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    showToast('تم تحديد الكل كمقروء', 'success')
  } catch (e) { }
}

async function deleteNotification(notif, event) {
  event.stopPropagation()
  try {
    await deleteDoc(doc(db, 'notifications', notif.id))
    notifications.value = notifications.value.filter(n => n.id !== notif.id)
    showToast('تم حذف الإشعار', 'success')
  } catch (e) {
    showToast('حدث خطأ أثناء الحذف', 'error')
  }
}

async function forceRefresh() {
  refreshing.value = true
  try {
    const cid = authStore.clinicId
    const today = dayKey(new Date())
    const notSnap = await getDocs(query(collection(db, 'notifications'), where('clinicId', '==', cid), limit(200)))
  } catch (e) { }
  setTimeout(() => { refreshing.value = false }, 600)
}

function showToast(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

onMounted(async () => {
  try {
    const uid = authStore.uid
    const cid = authStore.clinicId

    unsubscribeSnapshot = onSnapshot(
      query(collection(db, 'notifications'), where('clinicId', '==', cid), limit(200)),
      (snap) => {
        notifications.value = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(n => (n.toUserId === uid || n.toUserId === 'all') && n.type !== 'message')
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        loading.value = false
      },
      (err) => { loading.value = false }
    )

    if (Notification.permission === 'default') Notification.requestPermission()
  } catch (err) { loading.value = false }
})

onUnmounted(() => {
  if (unsubscribeSnapshot) unsubscribeSnapshot()
})
</script>

<style scoped>
.notifications-page { padding: 24px; max-width: 900px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #1150c9, #14b8a6); display: grid; place-items: center; color: #fff; flex-shrink: 0; box-shadow: 0 4px 16px rgba(17,80,201,0.3); }
.page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--text, #1e293b); margin: 0; }
.subtitle { color: var(--text-muted, #64748b); font-size: 0.85rem; margin: 4px 0 0; }
.header-actions { display: flex; gap: 8px; align-items: center; }

.refresh-btn { width: 38px; height: 38px; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; background: #fff; display: grid; place-items: center; color: #64748b; cursor: pointer; transition: all 0.3s; }
.refresh-btn:hover { color: #1150c9; border-color: #1150c9; }
.refresh-btn.spinning svg { animation: spin 0.6s ease; }
@keyframes spin { to { transform: rotate(360deg); } }

.mark-read-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(17,80,201,0.08); border: 1px solid rgba(17,80,201,0.15); border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: #1150c9; cursor: pointer; transition: all 0.25s; }
.mark-read-btn:hover { background: rgba(17,80,201,0.15); transform: translateY(-1px); }

/* Alerts Section */
.alerts-section { margin-bottom: 24px; }
.alerts-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
.alert-card { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 12px; margin-bottom: 8px; animation: pulseIn 0.5s ease; position: relative; overflow: hidden; }
.alert-card.now { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fecaca; }
.alert-card.soon { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; }
.alert-card.upcoming { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; }
@keyframes pulseIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.alert-pulse { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
.alert-pulse.now { background: #ef4444; animation: pulse 1s ease-in-out infinite; }
.alert-pulse.soon { background: #f59e0b; }
.alert-pulse.upcoming { background: #10b981; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.alert-icon { font-size: 1.5rem; flex-shrink: 0; }
.alert-info { flex: 1; min-width: 0; }
.alert-info h4 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #1e293b; }
.alert-info p { margin: 2px 0 0; font-size: 0.78rem; color: #64748b; }
.alert-countdown { font-size: 0.82rem; font-weight: 800; padding: 4px 12px; border-radius: 8px; white-space: nowrap; }
.alert-countdown.now { background: #ef4444; color: #fff; animation: blink 1s ease-in-out infinite; }
.alert-countdown.soon { background: #f59e0b; color: #fff; }
.alert-countdown.upcoming { background: #10b981; color: #fff; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.filter-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; background: rgba(255,255,255,0.6); backdrop-filter: blur(8px); border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: var(--text-muted, #64748b); cursor: pointer; transition: all 0.25s; border: 1px solid rgba(255,255,255,0.3); }
.tab-btn.active { background: linear-gradient(135deg, #1150c9, #14b8a6); color: #fff; box-shadow: 0 2px 8px rgba(17,80,201,0.3); }
.tab-btn:hover:not(.active) { background: rgba(17,80,201,0.08); color: #1150c9; border-color: rgba(17,80,201,0.15); }
.tab-icon { display: flex; align-items: center; }
.tab-count { font-size: 0.7rem; background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 999px; }
.tab-btn:not(.active) .tab-count { background: rgba(17,80,201,0.1); color: #1150c9; }

.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 14px; }
.spinner-glow { width: 44px; height: 44px; border: 4px solid rgba(17,80,201,0.15); border-top-color: #1150c9; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loading-wrap p { color: var(--text-muted, #64748b); font-size: 0.88rem; }

.glass-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; transition: all 0.3s; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
.empty-icon { color: #d1d5db; margin-bottom: 16px; opacity: 0.5; }
.empty-state h3 { font-size: 1.15rem; font-weight: 700; color: var(--text, #1e293b); margin: 0 0 6px; }
.empty-state p { font-size: 0.88rem; color: var(--text-muted, #64748b); margin: 0; }

.notifications-list { display: flex; flex-direction: column; gap: 8px; }
.notif-card { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 14px; padding: 16px 20px; cursor: pointer; position: relative; animation: fadeUp 0.4s ease both; transition: all 0.25s; }
.notif-card:hover { transform: translateX(4px); box-shadow: 0 6px 20px rgba(17,80,201,0.08); }
.notif-card.unread { background: rgba(17,80,201,0.04); border-color: rgba(17,80,201,0.15); }
.notif-card.unread::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #1150c9, #14b8a6); border-radius: 16px 16px 0 0; }
.notif-appointment.unread { border-left: 3px solid #f59e0b; }
.notif-message.unread { border-left: 3px solid #1150c9; }
.notif-alert.unread { border-left: 3px solid #ef4444; }
.notif-reminder.unread { border-left: 3px solid #f59e0b; background: rgba(245,158,11,0.04); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.notif-unread-dot { position: absolute; top: 18px; right: 8px; width: 8px; height: 8px; border-radius: 50%; background: #1150c9; animation: blink 1.5s ease-in-out infinite; }

.notif-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.notif-icon.reminder { background: rgba(245,158,11,0.1); color: #f59e0b; }
.notif-icon.appointment_booked { background: rgba(245,158,11,0.1); color: #f59e0b; }
.notif-icon.appointment_approved { background: rgba(16,185,129,0.1); color: #10b981; }
.notif-icon.appointment_rejected, .notif-icon.appointment_cancelled { background: rgba(239,68,68,0.1); color: #ef4444; }
.notif-icon.message { background: rgba(17,80,201,0.1); color: #1150c9; }
.notif-icon.patient_registered { background: rgba(16,185,129,0.1); color: #10b981; }
.notif-icon:not(.reminder):not(.appointment_booked):not(.appointment_approved):not(.appointment_rejected):not(.appointment_cancelled):not(.message):not(.patient_registered) { background: rgba(17,80,201,0.08); color: #1150c9; }

.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 0.9rem; font-weight: 700; color: var(--text, #1e293b); margin: 0 0 4px; }
.notif-source {
  display: inline-block; font-size: 0.68rem; font-weight: 700; padding: 2px 10px;
  border-radius: 999px; margin-bottom: 4px;
  background: rgba(17,80,201,0.08); color: #1150c9;
}
.notif-source.sec {
  background: rgba(16,185,129,0.08); color: #0d9488;
}
.notif-message-text { font-size: 0.82rem; color: var(--text-muted, #64748b); margin: 0 0 6px; line-height: 1.5; }
.notif-footer { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.notif-time { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
.notif-date-badge { font-size: 0.7rem; font-weight: 600; color: #1150c9; background: rgba(17,80,201,0.08); padding: 2px 8px; border-radius: 6px; }

.notif-delete-btn { width: 30px; height: 30px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; transition: all 0.2s; opacity: 0; }
@media (max-width: 768px) { .notif-delete-btn { opacity: 1 !important; } }
.notif-card:hover .notif-delete-btn { opacity: 1; }
.notif-delete-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

.toast-glass { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: #fff; padding: 12px 28px; border-radius: 12px; font-size: 0.88rem; font-weight: 600; z-index: 999; backdrop-filter: blur(12px); animation: fadeUp 0.3s ease; }
.toast-glass.success { background: rgba(16,185,129,0.95); box-shadow: 0 8px 32px rgba(16,185,129,0.3); }
.toast-glass.info { background: rgba(17,80,201,0.95); box-shadow: 0 8px 32px rgba(17,80,201,0.3); }

@media (max-width: 768px) {
  .notifications-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .filter-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
}
</style>
