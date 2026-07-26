<template>
  <div class="bk-page">
    <nav class="bk-nav">
      <router-link to="/" class="bk-nav-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </router-link>
      <h1 class="bk-nav-title">حجوزاتي</h1>
      <button v-if="bookings.length > 0" class="bk-nav-icon" @click="openChat" title="محادثة السكرتير">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span v-if="unreadChatCount > 0" class="bk-bell-badge">{{ unreadChatCount }}</span>
      </button>
      <button class="bk-nav-icon" @click="showNotifications = !showNotifications" :class="{ active: showNotifications }">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span v-if="unreadCount > 0" class="bk-bell-badge">{{ unreadCount }}</span>
      </button>
    </nav>

    <!-- NOTIFICATIONS PANEL -->
    <Transition name="bk-notif">
      <div v-if="showNotifications" class="bk-notif-panel">
        <div class="bk-notif-header">
          <span class="bk-notif-title">الإشعارات</span>
          <div class="bk-notif-actions" v-if="patientNotifications.length > 0">
            <button class="bk-notif-clear" @click="markAllRead">تحديد الكل كمقروء</button>
            <button class="bk-notif-del-all" @click="deleteAllNotifications">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              حذف الكل
            </button>
          </div>
        </div>
        <div v-if="patientNotifications.length === 0" class="bk-notif-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <p>لا توجد إشعارات بعد</p>
        </div>
        <div v-else class="bk-notif-list">
          <div v-for="n in patientNotifications" :key="n.id" class="bk-notif-item" :class="{ unread: !n.read }">
            <div class="bk-notif-icon" :class="'bk-notif-icon-' + (n.type === 'booking_approved' ? 'approved' : n.type === 'booking_rejected' ? 'rejected' : 'pending')">
              <svg v-if="n.type === 'booking_approved'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="n.type === 'booking_rejected'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div class="bk-notif-body">
              <p class="bk-notif-msg">{{ n.message }}</p>
              <span class="bk-notif-time">{{ timeAgoAr(n.created_at) }}</span>
            </div>
            <button class="bk-notif-del" @click="deleteNotification(n)" title="حذف">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- TOAST NOTIFICATION -->
    <Transition name="bk-toast">
      <div v-if="toast.show" class="bk-toast" :class="'bk-toast-' + toast.type">
        <div class="bk-toast-icon">
          <svg v-if="toast.type === 'approved'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type === 'rejected'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div class="bk-toast-body">
          <span class="bk-toast-title">{{ toast.title }}</span>
          <span class="bk-toast-msg">{{ toast.msg }}</span>
        </div>
      </div>
    </Transition>

    <div class="bk-content">
      <div v-if="bookings.length === 0" class="bk-empty">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#cbd5e1" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <h3>لا توجد حجوزات بعد</h3>
        <p>ابحث عن طبيب واحجز موعدك الآن</p>
        <router-link to="/" class="bk-empty-link">تصفح الأطباء</router-link>
      </div>

      <div v-else class="bk-list">
        <div v-for="b in bookings" :key="b.id" class="bk-card">
          <div class="bk-card-header">
            <div class="bk-card-status-dot" :style="{ background: statusColor(b.status) }"></div>
            <div class="bk-card-info">
              <h3 class="bk-card-doctor">د. {{ b.doctor_name || 'غير محدد' }}</h3>
              <span v-if="b.specialty" class="bk-card-spec">{{ b.specialty }}</span>
            </div>
            <span class="bk-card-badge" :style="{ background: statusColor(b.status) + '15', color: statusColor(b.status) }">{{ statusLabel(b.status) }}</span>
          </div>

          <div class="bk-card-body">
            <div v-if="b.appointment_date" class="bk-card-row">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>{{ formatArabicDate(b.appointment_date) }}{{ b.start_time ? ' — ' + to12h(b.start_time) : '' }}</span>
            </div>
            <div v-if="b.location" class="bk-card-row">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ b.location }}</span>
            </div>
            <div v-if="b.patient_name || b.full_name" class="bk-card-row">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>{{ b.patient_name || b.full_name }}</span>
            </div>
            <div v-if="b.position > 1" class="bk-card-position">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <span>أنت رقم <strong>{{ b.position }}</strong> في قائمة الانتظار — هناك <strong>{{ b.position - 1 }}</strong> مريض قبلك</span>
            </div>
            <div v-else-if="b.position === 1 && (b.status === 'pending' || b.status === 'booked' || b.status === 'approved')" class="bk-card-position bk-card-position-first">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>أنت التالي في قائمة الانتظار</span>
            </div>
            <div v-if="b.status === 'approved' && b.appointment_date" class="bk-card-countdown">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ timeUntilReactive(b.appointment_date, b.start_time) }}</span>
            </div>
            <button class="bk-card-chat-btn" @click="openChatForBooking(b)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              تواصل مع السكرتير
            </button>
          </div>

          <div v-if="b.reason" class="bk-card-footer">
            <span class="bk-card-reason">{{ b.reason }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc as fsDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { to12h, formatArabicDate, timeUntil, timeAgoAr, playNotifSound } from '@/utils/time'

const router = useRouter()

const now = ref(Date.now())
let timerInterval = null
const timeUntilReactive = (date, time) => { now.value; return timeUntil(date, time) }

const bookings = ref([])
let unsubBookings = null

const patientNotifications = ref([])
let unsubNotifications = null
const showNotifications = ref(false)
const toast = ref({ show: false, type: '', title: '', msg: '' })
let toastTimer = null

const unreadChatCount = ref(0)
let unsubChatRooms = null

function showToast(type, title, msg) {
  toast.value = { show: true, type, title, msg }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value.show = false }, 5000)
}

const unreadCount = computed(() => patientNotifications.value.filter(n => !n.read).length)
let lastNotifCount = 0

function getDeviceId() {
  let id = localStorage.getItem('madar_device_id')
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('madar_device_id', id)
  }
  return id
}

function statusColor(status) {
  const map = { 'pending':'#f59e0b','booked':'#f59e0b','approved':'#059669','rejected':'#ef4444','completed':'#0d9488','cancelled':'#94a3b8' }
  return map[status] || '#94a3b8'
}

function statusLabel(status) {
  const map = { 'pending':'بانتظار الموافقة','booked':'بانتظار الموافقة','approved':'تم القبول','rejected':'مرفوض','completed':'مكتمل','cancelled':'ملغي' }
  return map[status] || status || 'غير محدد'
}

async function markAllRead() {
  for (const n of patientNotifications.value) {
    if (!n.read) {
      try { await updateDoc(fsDoc(db, 'patient_notifications', n.id), { read: true }) } catch {}
    }
  }
}

async function deleteNotification(n) {
  try { await deleteDoc(fsDoc(db, 'patient_notifications', n.id)) } catch {}
}

async function deleteAllNotifications() {
  for (const n of patientNotifications.value) {
    try { await deleteDoc(fsDoc(db, 'patient_notifications', n.id)) } catch {}
  }
}

function openChat() {
  const approved = bookings.value.find(b => b.status === 'approved' || b.status === 'completed')
  const clinicId = approved?.clinicId || bookings.value[0]?.clinicId
  if (clinicId) {
    router.push({ path: '/chat', query: { clinicId } })
  }
}

function openChatForBooking(b) {
  if (b.clinicId) {
    router.push({ path: '/chat', query: { clinicId: b.clinicId } })
  }
}

async function calculatePositions(list) {
  const byDoctorDate = {}
  for (const b of list) {
    const key = (b.clinicId || '') + '_' + (b.appointment_date || '')
    if (!byDoctorDate[key]) byDoctorDate[key] = []
    byDoctorDate[key].push(b)
  }
  for (const key of Object.keys(byDoctorDate)) {
    const group = byDoctorDate[key]
      .filter(b => b.status !== 'cancelled' && b.status !== 'rejected')
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
    group.forEach((b, idx) => { b.position = idx + 1 })
  }
}

function listenUnreadChat(deviceId) {
  if (unsubChatRooms) unsubChatRooms()

  unsubChatRooms = onSnapshot(
    query(collection(db, 'patient_chat_rooms'), where('device_id', '==', deviceId)),
    (roomSnap) => {
      let total = 0
      roomSnap.docs.forEach(d => {
        total += d.data().unread_from_staff || 0
      })
      unreadChatCount.value = total
    }, () => { unreadChatCount.value = 0 }
  )
}

onMounted(() => {
  timerInterval = setInterval(() => { now.value = Date.now() }, 60000)
  const deviceId = getDeviceId()
  const phone = localStorage.getItem('user_phone') || ''

  const q1 = query(collection(db, 'appointments'), where('device_id', '==', deviceId))
  unsubBookings = onSnapshot(q1, async (snap1) => {
    const list = []
    snap1.forEach(d => list.push({ id: d.id, ...d.data() }))

    if (phone) {
      try {
        const q2 = query(collection(db, 'appointments'), where('phone', '==', phone))
        const snap2 = await import('firebase/firestore').then(m => m.getDocs(q2))
        snap2.forEach(d => {
          if (!list.find(b => b.id === d.id)) list.push({ id: d.id, ...d.data() })
        })
      } catch {}
    }

    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    await calculatePositions(list)
    bookings.value = list

    listenUnreadChat(deviceId)
  }, () => {})

  const qNotif = query(collection(db, 'patient_notifications'), where('device_id', '==', deviceId))
  unsubNotifications = onSnapshot(qNotif, (snap) => {
    const list = []
    snap.forEach(d => list.push({ id: d.id, ...d.data() }))
    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    const newCount = list.filter(n => !n.read).length
    if (lastNotifCount > 0 && newCount > lastNotifCount) {
      const latest = list.find(n => !n.read)
      if (latest?.type === 'booking_approved') {
        playNotifSound('approval')
        showToast('approved', 'تم قبول حجزك', latest.message)
      } else if (latest?.type === 'booking_rejected') {
        playNotifSound('rejection')
        showToast('rejected', 'تم رفض حجزك', latest.message)
      } else {
        playNotifSound('default')
        showToast('info', 'إشعار جديد', latest?.message || '')
      }
    }
    lastNotifCount = newCount
    patientNotifications.value = list
  }, () => {})
})

onUnmounted(() => {
  if (unsubBookings) unsubBookings()
  if (unsubNotifications) unsubNotifications()
  if (unsubChatRooms) unsubChatRooms()
  if (timerInterval) clearInterval(timerInterval)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.bk-page{font-family:inherit;direction:rtl;color:#1e293b;background:#f0f2f5;min-height:100vh;min-height:100dvh;padding-bottom:80px;-webkit-font-smoothing:antialiased;-webkit-overflow-scrolling:touch}
*{margin:0;padding:0;box-sizing:border-box}
.bk-nav{position:sticky;top:0;z-index:100;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 12px rgba(15,118,110,.25);display:flex;align-items:center;padding:0 12px;height:56px}
.bk-nav-back{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff;text-decoration:none;transition:background .15s}
.bk-nav-back:active{background:rgba(255,255,255,.2)}
.bk-nav-title{flex:1;text-align:center;font:800 .95rem 'Tajawal',sans-serif;color:#fff}
.bk-nav-icon{position:relative;width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff;background:none;border:none;cursor:pointer;transition:background .15s}
.bk-nav-icon:active,.bk-nav-icon.active{background:rgba(255,255,255,.2)}
.bk-bell-badge{position:absolute;top:4px;left:4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font:700 .65rem 'Tajawal',sans-serif;display:grid;place-items:center;line-height:1}

.bk-notif-panel{background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,.08);max-height:50vh;overflow-y:auto;-webkit-overflow-scrolling:touch}
.bk-notif-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid #f1f5f9}
.bk-notif-title{font:800 .88rem 'Tajawal',sans-serif;color:#1e293b}
.bk-notif-actions{display:flex;align-items:center;gap:12px}
.bk-notif-clear{font:600 .72rem 'Tajawal',sans-serif;color:#0d9488;background:none;border:none;cursor:pointer}
.bk-notif-del-all{display:inline-flex;align-items:center;gap:4px;font:600 .72rem 'Tajawal',sans-serif;color:#ef4444;background:none;border:none;cursor:pointer}
.bk-notif-del-all:active{opacity:.7}
.bk-notif-empty{padding:32px 16px;text-align:center;color:#94a3b8}
.bk-notif-empty p{font-size:.82rem;margin-top:8px}
.bk-notif-list{padding:8px 0}
.bk-notif-item{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;transition:background .15s}
.bk-notif-item.unread{background:#f0f7ff}
.bk-notif-item:active{background:#f8fafc}
.bk-notif-icon{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}
.bk-notif-icon-approved{background:#dcfce7;color:#16a34a}
.bk-notif-icon-rejected{background:#fee2e2;color:#dc2626}
.bk-notif-icon-pending{background:#fef3c7;color:#d97706}
.bk-notif-body{flex:1;min-width:0}
.bk-notif-msg{font-size:.82rem;color:#1e293b;line-height:1.5;margin-bottom:3px}
.bk-notif-time{font-size:.68rem;color:#94a3b8}
.bk-notif-del{width:28px;height:28px;border-radius:8px;border:none;background:none;color:#94a3b8;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:all .15s}
.bk-notif-del:active{background:#fee2e2;color:#ef4444}
.bk-notif-enter-active{transition:all .2s ease-out}
.bk-notif-leave-active{transition:all .15s ease-in}
.bk-notif-enter-from{opacity:0;transform:translateY(-8px)}
.bk-notif-leave-to{opacity:0;transform:translateY(-4px)}

.bk-toast{position:fixed;bottom:90px;left:16px;right:16px;max-width:400px;margin:0 auto;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:1000;backdrop-filter:blur(12px)}
.bk-toast-approved{background:rgba(220,252,231,.95);border:1px solid #86efac;color:#15803d}
.bk-toast-rejected{background:rgba(254,226,226,.95);border:1px solid #fca5a5;color:#dc2626}
.bk-toast-info{background:rgba(254,243,199,.95);border:1px solid #fcd34d;color:#92400e}
.bk-toast-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}
.bk-toast-approved .bk-toast-icon{background:#16a34a;color:#fff}
.bk-toast-rejected .bk-toast-icon{background:#dc2626;color:#fff}
.bk-toast-info .bk-toast-icon{background:#d97706;color:#fff}
.bk-toast-body{flex:1;min-width:0}
.bk-toast-title{display:block;font-size:.82rem;font-weight:800;margin-bottom:2px}
.bk-toast-msg{display:block;font-size:.72rem;opacity:.8;line-height:1.4}
.bk-toast-enter-active{transition:all .3s cubic-bezier(.4,0,.2,1)}
.bk-toast-leave-active{transition:all .2s ease-in}
.bk-toast-enter-from{opacity:0;transform:translateY(20px) scale(.95)}
.bk-toast-leave-to{opacity:0;transform:translateY(-10px) scale(.95)}

.bk-content{padding:16px}
.bk-empty{text-align:center;padding:60px 20px;color:#94a3b8}
.bk-empty h3{font-size:1.05rem;font-weight:800;color:#475569;margin:16px 0 4px}
.bk-empty p{font-size:.88rem;margin-bottom:20px}
.bk-empty-link{display:inline-block;padding:12px 28px;border-radius:12px;background:#0d9488;color:#fff;text-decoration:none;font:700 .88rem 'Tajawal',sans-serif}

.bk-list{display:flex;flex-direction:column;gap:12px}
.bk-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.bk-card-header{display:flex;align-items:center;gap:10px;padding:16px 16px 12px}
.bk-card-status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.bk-card-info{flex:1;min-width:0}
.bk-card-doctor{font:800 .92rem 'Tajawal',sans-serif;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bk-card-spec{font-size:.75rem;color:#64748b;font-weight:600;display:block}
.bk-card-badge{padding:4px 12px;border-radius:8px;font-size:.72rem;font-weight:700;white-space:nowrap;flex-shrink:0}

.bk-card-body{padding:0 16px 12px;display:flex;flex-direction:column;gap:8px}
.bk-card-row{display:flex;align-items:center;gap:8px;font-size:.82rem;color:#475569}
.bk-card-row svg{flex-shrink:0}
.bk-card-position{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#e6f5f3;border-radius:10px;font-size:.82rem;color:#0d9488;font-weight:600}
.bk-card-position svg{flex-shrink:0}
.bk-card-position strong{font-weight:800}
.bk-card-position-first{background:#f0fdf4;color:#059669}
.bk-card-countdown{display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:10px;font-size:.82rem;color:#0369a1;font-weight:700;border:1px solid #bae6fd}
.bk-card-countdown svg{flex-shrink:0;color:#0284c7}

.bk-card-chat-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1px solid #0d9488;background:linear-gradient(135deg,#f0fdfa,#ccfbf1);color:#0d9488;font:700 .78rem 'Tajawal',sans-serif;cursor:pointer;transition:all .15s;width:100%;justify-content:center}
.bk-card-chat-btn:active{background:#0d9488;color:#fff}

.bk-card-footer{padding:10px 16px;border-top:1px solid #f1f5f9}
.bk-card-reason{font-size:.78rem;color:#64748b}

@media(max-width:480px){
  .bk-content{padding:12px}
  .bk-card-header{padding:14px 14px 10px}
  .bk-card-body{padding:0 14px 10px}
}
</style>
