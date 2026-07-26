<template>
  <AppLayout>
    <div class="sc-page">
      <div class="sc-layout" :class="{ 'chat-open': activeRoom }">

        <!-- SIDEBAR: chat list -->
        <aside class="sc-sidebar" :class="{ open: sidebarOpen }">
          <div class="sc-sb-head">
            <h3>محادثات المرضى</h3>
            <button class="sc-sb-close" @click="sidebarOpen = false">✕</button>
          </div>
          <div v-if="rooms.length === 0" class="sc-sb-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>لا توجد محادثات بعد</p>
          </div>
          <div v-else class="sc-sb-list">
            <div v-for="r in rooms" :key="r.roomId" class="sc-sb-item" :class="{ active: activeRoom === r.roomId }" @click="openRoom(r)">
              <div class="sc-sb-avatar" :style="{ background: avatarColor(r.patient_name) }">{{ initials(r.patient_name) }}</div>
              <div class="sc-sb-info">
                <div class="sc-sb-top">
                  <span class="sc-sb-name">{{ r.patient_name || 'مريض' }}</span>
                  <span class="sc-sb-time">{{ timeStr(r.lastTime) }}</span>
                </div>
                <div class="sc-sb-bottom">
                  <span class="sc-sb-preview">{{ r.lastMsg || '...' }}</span>
                  <span v-if="r.unread > 0" class="sc-sb-badge">{{ r.unread }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- MAIN CHAT AREA -->
        <main class="sc-main">
          <template v-if="activeRoom">
            <div class="sc-chat-head">
              <button class="sc-back-btn" @click="activeRoom = null">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="sc-ch-info">
                <h2>{{ activeRoomName }}</h2>
                <span class="sc-ch-device">{{ activeRoomDevice }}</span>
              </div>
            </div>

            <div class="sc-messages" ref="msgBox">
              <div v-if="chatLoading" class="sc-loading"><div class="sc-spinner"></div></div>
              <div v-else-if="chatMessages.length === 0" class="sc-empty">
                <p>ابدأ المحادثة مع المريض</p>
              </div>
              <template v-for="(g, gi) in chatGroups" :key="gi">
                <div class="sc-date"><span>{{ g.label }}</span></div>
                <div v-for="m in g.items" :key="m.id" class="sc-row" :class="{ own: m.sender === 'staff' }">
                  <div v-if="m.sender === 'patient'" class="sc-avatar" :style="{ background: avatarColor(activeRoomName) }">{{ initials(activeRoomName) }}</div>
                  <div class="sc-bubble" :class="{ own: m.sender === 'staff' }">
                    <p class="sc-text">{{ m.text }}</p>
                    <div class="sc-meta">
                      <span class="sc-time">{{ timeStr(m.timestamp) }}</span>
                      <span v-if="m.sender === 'staff'" class="sc-check" :class="{ read: m.read }">
                        <svg v-if="!m.read" width="16" height="11" viewBox="0 0 16 11"><path d="M1 5.5l3.5 3.5L11 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg v-else width="16" height="11" viewBox="0 0 16 11"><path d="M1 5.5l3.5 3.5L11 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5.5l3.5 3.5L15 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="sc-input">
              <input ref="inputBox" v-model="newMsg" class="sc-input-box" placeholder="اكتب رد..." @keydown.enter="send" />
              <button class="sc-send-btn" @click="send" :disabled="!newMsg.trim()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </template>

          <div v-else class="sc-placeholder">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#cbd5e1" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h3>اختر محادثة</h3>
            <p>اختر مريضاً من القائمة للبدء بالمحادثة</p>
          </div>
        </main>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import {
  collection, query, where, addDoc, doc, setDoc, onSnapshot,
  updateDoc, increment
} from 'firebase/firestore'
import { playNotifSound } from '@/utils/time'

const auth = useAuthStore()
const clinicId = computed(() => auth.clinicId)
const staffName = computed(() => auth.fullName || 'السكرتير')

const rooms = ref([])
const activeRoom = ref(null)
const chatMessages = ref([])
const chatLoading = ref(false)
const newMsg = ref('')
const msgBox = ref(null)
const inputBox = ref(null)
const sidebarOpen = ref(false)

let unsubRooms = null
let unsubChat = null
let lastRoomUnread = 0

const activeRoomName = computed(() => {
  const r = rooms.value.find(r => r.roomId === activeRoom.value)
  return r?.patient_name || 'مريض'
})

const activeRoomDevice = computed(() => {
  const r = rooms.value.find(r => r.roomId === activeRoom.value)
  return r?.device_id || ''
})

const colors = ['#1150c9','#0d9488','#d69e1f','#8b5cf6','#ec4899','#ef4444','#06b6d4','#f97316']
function avatarColor(n) { if (!n) return colors[0]; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length] }
function initials(n) { if (!n) return '?'; return n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() }
function timeStr(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const msgDay = d.toISOString().split('T')[0]
  const time = d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
  if (msgDay === today) return time
  const yesterday = new Date(now - 86400000).toISOString().split('T')[0]
  if (msgDay === yesterday) return 'أمس ' + time
  return d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' }) + ' ' + time
}

const chatGroups = computed(() => {
  const result = []
  let curDate = ''
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  chatMessages.value.forEach(m => {
    const d = m.timestamp ? new Date(m.timestamp).toISOString().split('T')[0] : ''
    if (d !== curDate) {
      curDate = d
      let label = d
      if (d === today) label = 'اليوم'
      else if (d === yesterday) label = 'أمس'
      else label = new Date(d).toLocaleDateString('ar-IQ', { weekday: 'long', month: 'long', day: 'numeric' })
      result.push({ label, items: [] })
    }
    result[result.length - 1].items.push(m)
  })
  return result
})

async function scroll() {
  await nextTick()
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

async function send() {
  const text = newMsg.value.trim()
  if (!text || !activeRoom.value) return
  newMsg.value = ''

  const room = rooms.value.find(r => r.roomId === activeRoom.value)

  try {
    await addDoc(collection(db, 'patient_chat_messages'), {
      roomId: activeRoom.value,
      clinicId: clinicId.value,
      device_id: room?.device_id || '',
      sender: 'staff',
      sender_name: staffName.value,
      text,
      timestamp: new Date().toISOString(),
      read: false
    })

    await setDoc(doc(db, 'patient_chat_rooms', activeRoom.value), {
      last_msg: text,
      last_msg_time: new Date().toISOString(),
      last_sender: 'staff',
      unread_from_staff: increment(1)
    }, { merge: true })

    await scroll()
  } catch (err) {
    newMsg.value = text
    console.error('Send failed:', err)
  }
}

async function markAsRead(roomId) {
  const q = query(
    collection(db, 'patient_chat_messages'),
    where('roomId', '==', roomId)
  )
  const snap = await import('firebase/firestore').then(m => m.getDocs(q))
  for (const d of snap.docs) {
    const m = d.data()
    if (m.sender === 'patient' && !m.read) {
      try { await updateDoc(doc(db, 'patient_chat_messages', d.id), { read: true }) } catch {}
    }
  }
}

function openRoom(r) {
  activeRoom.value = r.roomId
  sidebarOpen.value = false
  listenChat(r.roomId)
  if (r.unread > 0) {
    markAsRead(r.roomId)
    setDoc(doc(db, 'patient_chat_rooms', r.roomId), { unread_count: 0 }, { merge: true }).catch(() => {})
  }
}

function listenChat(roomId) {
  if (unsubChat) unsubChat()
  chatLoading.value = true
  const q = query(
    collection(db, 'patient_chat_messages'),
    where('roomId', '==', roomId)
  )
  unsubChat = onSnapshot(q, (snap) => {
    chatMessages.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))
    chatLoading.value = false
    scroll()
  }, () => { chatLoading.value = false })
}

onMounted(() => {
  if (!clinicId.value) return

  unsubRooms = onSnapshot(
    query(collection(db, 'patient_chat_rooms'), where('clinicId', '==', clinicId.value)),
    (snap) => {
      const result = snap.docs.map(d => {
        const r = d.data()
        return {
          roomId: d.id,
          patient_name: r.patient_name || 'مريض',
          device_id: r.device_id || '',
          lastMsg: r.last_msg || '',
          lastTime: r.last_msg_time || r.created_at || '',
          unread: r.unread_count || 0,
          created_at: r.created_at || ''
        }
      }).sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || ''))

      const totalUnread = result.reduce((s, r) => s + r.unread, 0)
      if (lastRoomUnread > 0 && totalUnread > lastRoomUnread) {
        playNotifSound('chat')
      }
      lastRoomUnread = totalUnread

      rooms.value = result
    },
    () => {}
  )
})

onUnmounted(() => {
  if (unsubRooms) unsubRooms()
  if (unsubChat) unsubChat()
})
</script>

<style scoped>
.sc-page{font-family:inherit;height:calc(100vh - 48px)}
.sc-layout{display:flex;height:100%;overflow:hidden}

.sc-sidebar{width:320px;flex-shrink:0;background:#fff;border-left:1px solid #e5e7eb;display:flex;flex-direction:column}
.sc-sb-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #e5e7eb}
.sc-sb-head h3{font-size:.95rem;font-weight:700;color:#1e293b;margin:0}
.sc-sb-close{display:none;background:none;border:none;color:#64748b;cursor:pointer;font-size:1.2rem;padding:6px;border-radius:50%}
.sc-sb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;color:#94a3b8;gap:12px}
.sc-sb-empty p{font-size:.85rem}
.sc-sb-list{flex:1;overflow-y:auto}
.sc-sb-item{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f8fafc}
.sc-sb-item:hover{background:#f8fafc}
.sc-sb-item.active{background:#eff6ff;border-right:3px solid #1150c9}
.sc-sb-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:700;color:#fff;flex-shrink:0}
.sc-sb-info{flex:1;min-width:0}
.sc-sb-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.sc-sb-name{font-size:.88rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-sb-time{font-size:.65rem;color:#94a3b8;flex-shrink:0}
.sc-sb-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sc-sb-preview{font-size:.78rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.sc-sb-badge{min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#ef4444;color:#fff;font-size:.65rem;font-weight:700;display:grid;place-items:center;flex-shrink:0}

.sc-main{flex:1;display:flex;flex-direction:column;min-width:0;background:#e5ddd5;background-image:url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9c4bc' fill-opacity='0.12'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}

.sc-chat-head{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#008069;color:#fff;flex-shrink:0}
.sc-back-btn{display:none;background:none;border:none;color:#fff;cursor:pointer;padding:8px;border-radius:50%}
.sc-ch-info{flex:1;min-width:0}
.sc-ch-info h2{font-size:.95rem;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-ch-device{font-size:.68rem;color:rgba(255,255,255,.7)}

.sc-messages{flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:2px;-webkit-overflow-scrolling:touch}
.sc-messages::-webkit-scrollbar{width:3px}
.sc-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:3px}
.sc-loading{display:flex;align-items:center;justify-content:center;flex:1}
.sc-spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#0d9488;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.sc-empty{display:flex;align-items:center;justify-content:center;flex:1;color:#667781;font-size:.88rem}
.sc-date{display:flex;justify-content:center;padding:6px 0}
.sc-date span{font-size:.65rem;font-weight:600;color:#5e5e5e;background:#d9fdd3;padding:4px 12px;border-radius:8px;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.sc-row{display:flex;align-items:flex-end;gap:4px;margin-bottom:2px}
.sc-row.own{justify-content:flex-end}
.sc-avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:.55rem;font-weight:700;color:#fff;flex-shrink:0}
.sc-bubble{max-width:65%;padding:6px 10px 4px;border-radius:8px;background:#fff;border-top-right-radius:0;position:relative;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.sc-bubble.own{background:#d9fdd3;color:#111b21;border-radius:8px;border-top-left-radius:0;border-top-right-radius:8px}
.sc-text{margin:0;font-size:.85rem;line-height:1.45;word-break:break-word;white-space:pre-wrap}
.sc-meta{display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:1px}
.sc-time{font-size:.6rem;color:#667781}
.sc-check{display:flex;align-items:center;color:#667781}
.sc-check.read{color:#53bdeb}

.sc-input{display:flex;align-items:center;gap:6px;padding:8px;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));background:#f0f2f5;flex-shrink:0}
.sc-input-box{flex:1;padding:10px 16px;border:none;border-radius:24px;font-size:.88rem;font-family:inherit;color:#1e293b;outline:none;background:#fff}
.sc-input-box::placeholder{color:#9ca3af}
.sc-send-btn{width:42px;height:42px;border:none;border-radius:50%;background:#00a884;color:#fff;cursor:pointer;display:grid;place-items:center;transition:all .15s;flex-shrink:0}
.sc-send-btn:hover:not(:disabled){background:#06cf9c}
.sc-send-btn:disabled{opacity:.4;cursor:not-allowed}

.sc-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:#94a3b8;text-align:center;padding:24px}
.sc-placeholder h3{font-size:1.1rem;font-weight:700;color:#475569;margin:0}
.sc-placeholder p{font-size:.88rem}

@media(max-width:768px){
  .sc-layout{flex-direction:column}
  .sc-sidebar{width:100%;height:100%;position:absolute;top:0;left:0;right:0;z-index:20;transform:translateX(0);transition:transform .25s}
  .sc-sidebar:not(.open){display:none}
  .sc-sb-close{display:flex}
  .sc-main{width:100%}
  .sc-back-btn{display:grid}
  .sc-chat-head{display:flex}
}
</style>
