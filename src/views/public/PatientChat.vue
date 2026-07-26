<template>
  <div class="pc-page">
    <nav class="pc-nav">
      <button class="pc-nav-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="pc-nav-info">
        <h1 class="pc-nav-title">محادثة العيادة</h1>
        <span v-if="connected" class="pc-nav-status online">متصل</span>
        <span v-else class="pc-nav-status">غير متصل</span>
      </div>
    </nav>

    <div v-if="!patientName" class="pc-name-step">
      <div class="pc-name-card">
        <div class="pc-name-icon">👤</div>
        <h3>ما اسمك؟</h3>
        <p>أدخل اسمك حتى يظهر للسكرتير</p>
        <input v-model="nameInput" class="pc-name-input" placeholder="الاسم الكامل" @keydown.enter="saveName" autofocus />
        <button class="pc-name-btn" @click="saveName" :disabled="!nameInput.trim()">ابدأ المحادثة</button>
      </div>
    </div>

    <template v-else>
      <div class="pc-messages" ref="msgBox">
        <div v-if="loading" class="pc-loading"><div class="pc-spinner"></div></div>

        <div v-else-if="messages.length === 0" class="pc-empty">
          <div class="pc-empty-icon">💬</div>
          <h3>مرحباً {{ patientName }}</h3>
          <p>أرسل رسالة إلى السكرتير للاستفسار أو تأكيد موعدك</p>
        </div>

        <template v-for="(g, gi) in groups" :key="gi">
          <div class="pc-date"><span>{{ g.label }}</span></div>
          <div v-for="m in g.items" :key="m.id" class="pc-row" :class="{ own: m.sender === 'patient' }">
            <div v-if="m.sender === 'staff'" class="pc-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="pc-bubble" :class="{ own: m.sender === 'patient' }">
              <p class="pc-text">{{ m.text }}</p>
              <div class="pc-meta">
                <span class="pc-time">{{ formatTime(m.timestamp) }}</span>
                <span v-if="m.sender === 'patient'" class="pc-check" :class="{ read: m.read }">
                  <svg v-if="!m.read" width="16" height="11" viewBox="0 0 16 11"><path d="M1 5.5l3.5 3.5L11 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <svg v-else width="16" height="11" viewBox="0 0 16 11"><path d="M1 5.5l3.5 3.5L11 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5.5l3.5 3.5L15 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="pc-input">
        <input ref="inputBox" v-model="newMsg" class="pc-input-box"
               placeholder="اكتب رسالتك..."
               @keydown.enter="send" />
        <button class="pc-send-btn" @click="send" :disabled="!newMsg.trim()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '@/firebase/config'
import {
  collection, query, where, addDoc, doc, setDoc, onSnapshot,
  updateDoc, increment
} from 'firebase/firestore'

const router = useRouter()
const route = useRoute()

const clinicId = computed(() => route.query.clinicId || '')
const patientName = ref(localStorage.getItem('madar_patient_name') || '')
const nameInput = ref('')
const messages = ref([])
const loading = ref(true)
const newMsg = ref('')
const msgBox = ref(null)
const inputBox = ref(null)
const connected = ref(false)

let unsubMsgs = null
let unsubRoom = null

function getDeviceId() {
  let id = localStorage.getItem('madar_device_id')
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('madar_device_id', id)
  }
  return id
}

function getRoomId() {
  return `${clinicId.value}_${getDeviceId()}`
}

function saveName() {
  const name = nameInput.value.trim()
  if (!name) return
  patientName.value = name
  localStorage.setItem('madar_patient_name', name)
  nextTick(() => {
    if (inputBox.value) inputBox.value.focus()
  })
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
}

async function scroll() {
  await nextTick()
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

const groups = computed(() => {
  const result = []
  let curDate = ''
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  messages.value.forEach(m => {
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

async function send() {
  const text = newMsg.value.trim()
  if (!text || !patientName.value) return
  newMsg.value = ''

  const deviceId = getDeviceId()
  const roomId = getRoomId()

  try {
    await setDoc(doc(db, 'patient_chat_rooms', roomId), {
      clinicId: clinicId.value,
      device_id: deviceId,
      patient_name: patientName.value,
      staff_online: false,
      last_msg: text,
      last_msg_time: new Date().toISOString(),
      last_sender: 'patient',
      unread_count: increment(1),
      created_at: new Date().toISOString()
    }, { merge: true })

    await addDoc(collection(db, 'patient_chat_messages'), {
      roomId,
      clinicId: clinicId.value,
      device_id: deviceId,
      sender: 'patient',
      sender_name: patientName.value,
      text,
      timestamp: new Date().toISOString(),
      read: false
    })
    await scroll()
  } catch (err) {
    newMsg.value = text
    console.error('Send failed:', err)
  }
}

async function markAsRead() {
  const unread = messages.value.filter(m => m.sender === 'staff' && !m.read)
  for (const m of unread) {
    try { await updateDoc(doc(db, 'patient_chat_messages', m.id), { read: true }) } catch {}
  }
  if (unread.length > 0) {
    try { await setDoc(doc(db, 'patient_chat_rooms', getRoomId()), { unread_from_staff: 0 }, { merge: true }) } catch {}
  }
}

onMounted(() => {
  if (!clinicId.value) { loading.value = false; return }

  if (!patientName.value) { loading.value = false; return }

  const deviceId = getDeviceId()
  const roomId = getRoomId()

  const q = query(
    collection(db, 'patient_chat_messages'),
    where('roomId', '==', roomId)
  )

  unsubMsgs = onSnapshot(q, (snap) => {
    messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))
    loading.value = false
    scroll()
    markAsRead()
  }, (err) => { console.error('Chat listen error:', err); loading.value = false })

  const roomRef = doc(db, 'patient_chat_rooms', roomId)
  unsubRoom = onSnapshot(roomRef, (snap) => {
    connected.value = snap.exists() && snap.data().staff_online === true
  }, () => {})

  setTimeout(() => { if (inputBox.value) inputBox.value.focus() }, 300)
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/bookings')
}

onUnmounted(() => {
  if (unsubMsgs) unsubMsgs()
  if (unsubRoom) unsubRoom()
})
</script>

<style scoped>
.pc-page{font-family:inherit;display:flex;flex-direction:column;height:100vh;height:100dvh;background:#e5ddd5;background-image:url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9c4bc' fill-opacity='0.12'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");overflow:hidden}

.pc-nav{display:flex;align-items:center;gap:12px;padding:10px 14px;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 8px rgba(15,118,110,.3);flex-shrink:0;z-index:10}
.pc-nav-back{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:#fff;background:none;border:none;cursor:pointer;transition:background .15s}
.pc-nav-back:active{background:rgba(255,255,255,.2)}
.pc-nav-info{flex:1;min-width:0}
.pc-nav-title{font:700 .95rem 'Tajawal',sans-serif;color:#fff;margin:0}
.pc-nav-status{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7)}
.pc-nav-status.online{color:#a7f3d0}

.pc-name-step{flex:1;display:flex;align-items:center;justify-content:center;padding:20px}
.pc-name-card{background:#fff;border-radius:20px;padding:36px 28px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.1);width:100%;max-width:340px}
.pc-name-icon{font-size:3rem;margin-bottom:12px}
.pc-name-card h3{font-size:1.15rem;font-weight:800;color:#1e293b;margin:0 0 6px}
.pc-name-card p{font-size:.82rem;color:#64748b;margin:0 0 20px}
.pc-name-input{width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:.92rem;font-family:inherit;color:#1e293b;outline:none;box-sizing:border-box;transition:border-color .2s}
.pc-name-input:focus{border-color:#0d9488}
.pc-name-input::placeholder{color:#94a3b8}
.pc-name-btn{width:100%;padding:12px;margin-top:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-size:.92rem;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s}
.pc-name-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,148,136,.3)}
.pc-name-btn:disabled{opacity:.5;cursor:not-allowed}

.pc-messages{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 10px;display:flex;flex-direction:column;gap:2px;-webkit-overflow-scrolling:touch}
.pc-messages::-webkit-scrollbar{width:3px}
.pc-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:3px}

.pc-loading{display:flex;align-items:center;justify-content:center;flex:1}
.pc-spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#0d9488;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.pc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;gap:8px;color:#94a3b8;padding:20px}
.pc-empty-icon{font-size:3rem;margin-bottom:8px}
.pc-empty h3{font-size:1.05rem;font-weight:700;color:#3b4a54;margin:0}
.pc-empty p{font-size:.85rem;color:#667781}

.pc-date{display:flex;justify-content:center;padding:6px 0}
.pc-date span{font-size:.65rem;font-weight:600;color:#5e5e5e;background:#d9fdd3;padding:4px 12px;border-radius:8px;box-shadow:0 1px 1px rgba(0,0,0,.08)}

.pc-row{display:flex;align-items:flex-end;gap:4px;margin-bottom:2px}
.pc-row.own{justify-content:flex-end}

.pc-avatar{width:28px;height:28px;border-radius:50%;background:#0d9488;display:grid;place-items:center;flex-shrink:0}

.pc-bubble{max-width:82%;padding:6px 10px 4px;border-radius:8px;background:#fff;border-top-right-radius:0;position:relative;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.pc-bubble.own{background:#d9fdd3;color:#111b21;border-radius:8px;border-top-left-radius:0;border-top-right-radius:8px}

.pc-text{margin:0;font-size:.85rem;line-height:1.45;word-break:break-word;white-space:pre-wrap}
.pc-meta{display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:1px}
.pc-time{font-size:.6rem;color:#667781}
.pc-check{display:flex;align-items:center;color:#667781}
.pc-check.read{color:#53bdeb}

.pc-input{display:flex;align-items:center;gap:6px;padding:8px 8px;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));background:#f0f2f5;flex-shrink:0}
.pc-input-box{flex:1;padding:10px 16px;border:none;border-radius:24px;font-size:.88rem;font-family:inherit;color:#1e293b;outline:none;background:#fff}
.pc-input-box::placeholder{color:#9ca3af}
.pc-send-btn{width:42px;height:42px;border:none;border-radius:50%;background:#00a884;color:#fff;cursor:pointer;display:grid;place-items:center;transition:all .15s;flex-shrink:0}
.pc-send-btn:hover:not(:disabled){background:#06cf9c}
.pc-send-btn:disabled{opacity:.4;cursor:not-allowed}

@media(min-width:769px){
  .pc-page{max-width:600px;margin:0 auto;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb}
}
</style>
