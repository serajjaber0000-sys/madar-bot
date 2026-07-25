<template>
  <AppLayout>
    <div class="chat-page">
      <div class="chat-layout">

        <!-- SIDEBAR: only doctor + secretary -->
        <aside class="chat-sidebar" :class="{ open: sidebarOpen }">
          <div class="sb-head">
            <h3>الطاقم</h3>
            <button class="sb-close" @click="sidebarOpen = false">✕</button>
          </div>
          <div class="sb-list">
            <div v-for="s in filteredStaff" :key="s.id" class="sb-item" :class="{ online: s.isOnline }">
              <div class="sb-avatar" :style="{ background: colorOf(s.fullName) }">{{ initials(s.fullName) }}</div>
              <div class="sb-dot" :class="{ on: s.isOnline }"></div>
              <div class="sb-info">
                <span class="sb-name">{{ s.fullName }}</span>
                <span class="sb-role">{{ roleLabel(s.role) }}</span>
              </div>
            </div>
            <div v-if="filteredStaff.length === 0 && !loading" class="sb-empty">لا يوجد أعضاء</div>
          </div>
        </aside>

        <!-- MAIN CHAT -->
        <main class="chat-main">
          <!-- Header -->
          <div class="cm-head">
            <button class="cm-menu-btn" @click="sidebarOpen = !sidebarOpen">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div class="cm-head-info">
              <h2>المحادثة العامة</h2>
              <p>{{ onlineCount }} متصل</p>
            </div>
          </div>

          <!-- Messages -->
          <div class="cm-messages" ref="msgBox">
            <div v-if="loading" class="cm-loading"><div class="cm-spinner"></div></div>

            <div v-else-if="allMessages.length === 0" class="cm-empty">
              <div class="cm-empty-icon">💬</div>
              <h3>ابدأ المحادثة</h3>
              <p>أرسل رسالة أو صورة للطاقم</p>
            </div>

            <template v-for="(g, gi) in groups" :key="gi">
              <div class="cm-date"><span>{{ g.label }}</span></div>
              <div v-for="m in g.items" :key="m.id" class="cm-row" :class="{ own: m.senderId === uid }">
                <div v-if="m.senderId !== uid" class="cm-avatar" :style="{ background: colorOf(m.senderName) }">{{ initials(m.senderName) }}</div>
                <div class="cm-bubble" :class="{ own: m.senderId === uid }">
                  <button v-if="m.senderId === uid" class="cm-delete-btn" @click="deleteMessage(m, $event)" title="حذف">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <span v-if="m.senderId !== uid" class="cm-sender" :style="{ color: colorOf(m.senderName) }">{{ m.senderName }}</span>

                  <!-- Voice message -->
                  <div v-if="m.type === 'voice'" class="cm-voice">
                    <button class="cm-play" @click="toggleVoice(m)">
                      <svg v-if="playingId !== m.id" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    </button>
                    <div class="cm-voice-track" @click="seekVoice(m, $event)">
                      <div class="cm-voice-progress" :style="{ width: (playingId === m.id ? voiceProgress : 0) + '%' }"></div>
                      <div class="cm-voice-bars">
                        <span v-for="i in 24" :key="i" :style="{ height: voiceBarHeight(i, m.id) + 'px' }"></span>
                      </div>
                    </div>
                    <span class="cm-dur">{{ playingId === m.id ? formatTime(voiceCurrentTime) : (m.duration || '0:00') }}</span>
                  </div>

                  <!-- Image message -->
                  <div v-else-if="m.type === 'image'" class="cm-image">
                    <img :src="m.imageUrl" :alt="m.text || 'صورة'" loading="lazy" @click="previewImage = m.imageUrl" />
                    <p v-if="m.text" class="cm-text cm-image-caption">{{ m.text }}</p>
                  </div>

                  <!-- Sticker -->
                  <div v-else-if="m.type === 'sticker'" class="cm-sticker">
                    <span class="cm-sticker-emoji">{{ m.text }}</span>
                  </div>

                  <!-- Text message -->
                  <p v-else class="cm-text">{{ m.text }}</p>

                  <div class="cm-meta">
                    <span class="cm-time">{{ timeStr(m.timestamp) }}</span>
                    <span v-if="m.senderId === uid" class="cm-check" :class="{ read: m.read }">
                      <svg v-if="!m.read" width="16" height="12" viewBox="0 0 16 12"><path d="M1 6l3.5 3.5L11 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      <svg v-else width="16" height="12" viewBox="0 0 16 12"><path d="M1 6l3.5 3.5L11 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 6l3.5 3.5L15 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Forward -->
          <div v-if="fwdMsg" class="cm-fwd">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3"/></svg>
            <span>إعادة من {{ fwdMsg.senderName }}</span>
            <button @click="fwdMsg = null">✕</button>
          </div>

          <!-- Sticker panel -->
          <div v-if="showStickers" class="cm-sticker-panel">
            <div class="sp-tabs">
              <button v-for="tab in stickerTabs" :key="tab.name" :class="{ active: activeStickerTab === tab.name }" @click="activeStickerTab = tab.name">{{ tab.label }}</button>
            </div>
            <div class="sp-grid">
              <button v-for="s in currentStickers" :key="s" class="sp-item" @click="sendSticker(s)">{{ s }}</button>
            </div>
          </div>

          <!-- Image preview -->
          <div v-if="imagePreview" class="cm-image-preview">
            <div class="cip-box">
              <img :src="imagePreview" />
              <input v-model="imageCaption" class="cip-caption" placeholder="أضف تعليق..." @keydown.enter="sendImage" />
              <div class="cip-actions">
                <button class="btn btn-ghost" @click="cancelImage">إلغاء</button>
                <button class="btn btn-primary" @click="sendImage" :disabled="uploadingImage">
                  {{ uploadingImage ? 'جاري الرفع...' : 'إرسال' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Input bar -->
          <div class="cm-input">
            <button class="inp-btn" @click="showStickers = !showStickers; showEmoji = false" :class="{ active: showStickers }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>

            <label class="inp-btn" title="إرسال صورة">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <input type="file" accept="image/*" @change="pickImage" hidden />
            </label>

            <button class="inp-btn mic" :class="{ rec: recording }"
                    @mousedown="startRec" @mouseup="stopRec" @mouseleave="stopRec"
                    @touchstart.prevent="startRec" @touchend.prevent="stopRec">
              <svg v-if="!recording" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              <span v-if="recording" class="rec-dot"></span>
            </button>

            <input ref="inputBox" v-model="newMsg" class="cm-input-box"
                   placeholder="اكتب رسالة..."
                   @keydown.enter="send" />

            <div v-if="showEmoji" class="cm-emoji-pop">
              <button v-for="e in emojis" :key="e" @click="addEmoji(e)">{{ e }}</button>
            </div>
            <button class="inp-btn" @click="showEmoji = !showEmoji; showStickers = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>

            <button class="inp-btn send" @click="send" :disabled="!newMsg.trim() && !fwdMsg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </main>
      </div>

      <!-- Image lightbox -->
      <div v-if="previewImage" class="cm-lightbox" @click.self="previewImage = null">
        <button class="lb-close" @click="previewImage = null">✕</button>
        <img :src="previewImage" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import {
  collection, query, where, addDoc, doc, deleteDoc,
  onSnapshot, setDoc, limit, updateDoc
} from 'firebase/firestore'
import { uploadToImgBB } from '@/composables/useImgBB'

const authStore = useAuthStore()
const uid = computed(() => authStore.uid)
const cid = computed(() => authStore.clinicId)

const allMessages = ref([])
const staffList = ref([])
const loading = ref(true)
const newMsg = ref('')
const msgBox = ref(null)
const inputBox = ref(null)
const showEmoji = ref(false)
const showStickers = ref(false)
const fwdMsg = ref(null)
const recording = ref(false)
const sidebarOpen = ref(false)
const previewImage = ref(null)

const imagePreview = ref(null)
const imageFile = ref(null)
const imageCaption = ref('')
const uploadingImage = ref(false)

const playingId = ref(null)
const voiceProgress = ref(0)
const voiceCurrentTime = ref(0)
let voiceAudio = null
let voiceInterval = null

let unsubMsgs = null
let unsubStaff = null
let unsubPresence = null
let recorder = null
let audioChunks = []

const emojis = ['😊','👍','❤️','🎉','😄','🙏','✅','👋','💪','🔥','⭐','👏','😂','💯','🤔','😎','🤦','🫡']

const stickerTabs = [
  { name: 'general', label: 'عام' },
  { name: 'medical', label: 'طبي' },
  { name: 'reactions', label: 'ردود' }
]
const stickerSets = {
  general: ['🏥','💊','🩺','🩻','🩹','💉','🧬','🔬','📋','🧪','🫀','🧠','🦷','👁️','🫁','🦴','🩺','🌡️','🩻','⚕️'],
  medical: ['👨‍⚕️','👩‍⚕️','🧑‍⚕️','🚑','🛏️','🩸','🧫','🏥','🫀','🫁','🧬','💉','🩹','💊','🩺','🔬','🌡️','🩻','🧪','⚕️'],
  reactions: ['👍','👎','❤️','🔥','💯','👏','🙏','😂','😮','😢','🤔','✅','❌','💪','🫡','👀','😮‍💨','🫠','🤝','🎂']
}
const activeStickerTab = ref('general')
const currentStickers = computed(() => stickerSets[activeStickerTab.value] || stickerSets.general)

const colors = ['#1150c9','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4','#f97316']
function colorOf(name) {
  if (!name) return colors[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}
function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
function roleLabel(role) {
  const map = { owner: 'مالك العيادة', doctor: 'طبيب', secretary: 'سكرتير' }
  return map[role] || role || ''
}
function timeStr(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
}
function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
function addEmoji(e) { newMsg.value += e; showEmoji.value = false }

const filteredStaff = computed(() => {
  return staffList.value.filter(s => s.role === 'doctor' || s.role === 'secretary')
})
const onlineCount = computed(() => filteredStaff.value.filter(s => s.isOnline).length)

const groups = computed(() => {
  const result = []
  let curDate = ''
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  allMessages.value.forEach(m => {
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

function voiceBarHeight(i, id) {
  if (playingId.value === id) {
    return Math.random() * 16 + 4
  }
  return Math.sin(i * 0.5) * 8 + 8
}

async function scroll() {
  await nextTick()
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

async function send() {
  let text = newMsg.value.trim()
  if (fwdMsg.value) {
    const orig = fwdMsg.value.type === 'voice' ? '[رسالة صوتية]' : fwdMsg.value.text
    text = `↪ من ${fwdMsg.value.senderName}: ${orig}`
    if (newMsg.value.trim()) text += `\n${newMsg.value.trim()}`
    fwdMsg.value = null
  }
  if (!text) return
  newMsg.value = ''
  showEmoji.value = false
  try {
    await addDoc(collection(db, 'messages'), {
      clinicId: cid.value,
      senderId: uid.value,
      senderName: authStore.fullName,
      text,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: false
    })
    await scroll()
  } catch (err) {
    newMsg.value = text
  }
}

function sendSticker(emoji) {
  showStickers.value = false
  addDoc(collection(db, 'messages'), {
    clinicId: cid.value,
    senderId: uid.value,
    senderName: authStore.fullName,
    text: emoji,
    type: 'sticker',
    timestamp: new Date().toISOString(),
    read: false
  }).then(() => scroll())
}

function pickImage(e) {
  const file = e.target.files[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  imageCaption.value = ''
  e.target.value = ''
}

function cancelImage() {
  imagePreview.value = null
  imageFile.value = null
  imageCaption.value = ''
}

async function sendImage() {
  if (!imageFile.value || uploadingImage.value) return
  uploadingImage.value = true
  try {
    const url = await uploadToImgBB(imageFile.value)
    await addDoc(collection(db, 'messages'), {
      clinicId: cid.value,
      senderId: uid.value,
      senderName: authStore.fullName,
      text: imageCaption.value || '',
      imageUrl: url,
      type: 'image',
      timestamp: new Date().toISOString(),
      read: false
    })
    cancelImage()
    await scroll()
  } catch (err) {
    console.error('Image upload failed:', err)
  } finally {
    uploadingImage.value = false
  }
}

async function deleteMessage(msg, event) {
  event.stopPropagation()
  try {
    await deleteDoc(doc(db, 'messages', msg.id))
    allMessages.value = allMessages.value.filter(m => m.id !== msg.id)
  } catch (e) { }
}

function toggleVoice(m) {
  if (playingId.value === m.id) {
    stopVoice()
    return
  }
  stopVoice()
  if (!m.text) return
  voiceAudio = new Audio(`data:audio/webm;base64,${m.text}`)
  playingId.value = m.id
  voiceProgress.value = 0
  voiceCurrentTime.value = 0
  voiceAudio.play().catch(() => {})
  voiceAudio.ontimeupdate = () => {
    if (voiceAudio) {
      voiceCurrentTime.value = voiceAudio.currentTime
      voiceProgress.value = (voiceAudio.currentTime / voiceAudio.duration) * 100 || 0
    }
  }
  voiceAudio.onended = () => { stopVoice() }
  voiceAudio.onerror = () => { stopVoice() }
}

function stopVoice() {
  if (voiceAudio) {
    voiceAudio.pause()
    voiceAudio = null
  }
  playingId.value = null
  voiceProgress.value = 0
  voiceCurrentTime.value = 0
}

function seekVoice(m, e) {
  if (!voiceAudio || playingId.value !== m.id) return
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  voiceAudio.currentTime = pct * voiceAudio.duration
}

async function startRec() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    recorder = new MediaRecorder(stream)
    audioChunks = []
    recorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data) }
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onload = async () => {
        const b64 = reader.result.split(',')[1]
        const secs = Math.round(blob.size / 4000)
        const dur = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
        try {
          await addDoc(collection(db, 'messages'), {
            clinicId: cid.value,
            senderId: uid.value,
            senderName: authStore.fullName,
            text: b64,
            type: 'voice',
            duration: dur,
            timestamp: new Date().toISOString(),
            read: false
          })
          await scroll()
        } catch (err) { }
      }
      reader.readAsDataURL(blob)
    }
    recorder.start()
    recording.value = true
  } catch (err) { }
}

function stopRec() {
  if (recorder && recorder.state === 'recording') { recorder.stop(); recording.value = false }
}

function setOnline() {
  if (!cid.value || !uid.value) return
  setDoc(doc(db, 'presence', `${cid.value}_${uid.value}`), {
    clinicId: cid.value,
    userId: uid.value,
    fullName: authStore.fullName,
    online: true,
    lastSeen: new Date().toISOString()
  }).catch(() => {})
}

function setOffline() {
  if (!cid.value || !uid.value) return
  setDoc(doc(db, 'presence', `${cid.value}_${uid.value}`), {
    online: false,
    lastSeen: new Date().toISOString()
  }, { merge: true }).catch(() => {})
}

onMounted(async () => {
  if (!cid.value) { loading.value = false; return }

  unsubMsgs = onSnapshot(
    query(collection(db, 'messages'), where('clinicId', '==', cid.value), limit(500)),
    snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      allMessages.value = msgs
      loading.value = false
      scroll()
      markVisibleAsRead(msgs)
    },
    err => { loading.value = false }
  )

  unsubStaff = onSnapshot(
    query(collection(db, 'users'), where('clinicId', '==', cid.value)),
    snap => {
      staffList.value = snap.docs.map(d => ({ id: d.id, ...d.data(), isOnline: false }))
    },
    err => { }
  )

  unsubPresence = onSnapshot(
    query(collection(db, 'presence'), where('clinicId', '==', cid.value)),
    snap => {
      const onlineIds = new Set()
      snap.docs.forEach(d => {
        const p = d.data()
        if (p.online) onlineIds.add(p.userId)
      })
      staffList.value = staffList.value.map(s => ({ ...s, isOnline: onlineIds.has(s.id) }))
    },
    err => { }
  )

  setOnline()
  window.addEventListener('beforeunload', setOffline)
})

function markVisibleAsRead(msgs) {
  const myUnread = msgs.filter(m => m.senderId !== uid.value && !m.read)
  myUnread.forEach(m => {
    updateDoc(doc(db, 'messages', m.id), { read: true }).catch(() => {})
  })
}

onUnmounted(() => {
  if (unsubMsgs) unsubMsgs()
  if (unsubStaff) unsubStaff()
  if (unsubPresence) unsubPresence()
  setOffline()
  window.removeEventListener('beforeunload', setOffline)
  if (recorder && recorder.state === 'recording') recorder.stop()
  stopVoice()
})
</script>

<style scoped>
.chat-page { height: 100vh; overflow: hidden; }
.chat-layout { display: flex; height: calc(100vh - 48px); margin: 24px; border-radius: 20px; overflow: hidden; background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 4px 24px rgba(0,0,0,0.06); position: relative; }

/* ===== Sidebar ===== */
.chat-sidebar { width: 260px; flex-shrink: 0; background: #fafafa; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.sb-head { display: flex; justify-content: space-between; align-items: center; padding: 18px; border-bottom: 1px solid #e5e7eb; }
.sb-head h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
.sb-close { display: none; }
.sb-list { flex: 1; overflow-y: auto; padding: 8px; }
.sb-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; margin-bottom: 2px; transition: background 0.2s; position: relative; }
.sb-item:hover { background: rgba(17,80,201,0.05); }
.sb-item:not(.online) { opacity: 0.5; }
.sb-avatar { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; font-size: 0.72rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.sb-dot { position: absolute; bottom: 12px; left: 38px; width: 10px; height: 10px; border-radius: 50%; background: #d1d5db; border: 2px solid #fafafa; z-index: 1; }
.sb-dot.on { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
.sb-info { flex: 1; min-width: 0; }
.sb-name { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-role { display: block; font-size: 0.7rem; color: #64748b; }
.sb-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 0.85rem; }

/* ===== Main ===== */
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
.cm-head { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #e5e7eb; background: #fff; }
.cm-menu-btn { display: none; background: none; border: none; color: #64748b; cursor: pointer; padding: 6px; border-radius: 8px; }
.cm-menu-btn:hover { background: #f3f4f6; }
.cm-head-info h2 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.cm-head-info p { font-size: 0.75rem; color: #10b981; margin: 2px 0 0; font-weight: 600; }

/* Mobile overrides for cm-head are in the @media block below */

/* ===== Messages ===== */
.cm-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 2px; background: #f0f2f5; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.cm-messages::-webkit-scrollbar { width: 4px; }
.cm-messages::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.cm-loading { display: flex; align-items: center; justify-content: center; flex: 1; }
.cm-spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #1150c9; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.cm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 8px; color: #94a3b8; }
.cm-empty-icon { font-size: 3rem; margin-bottom: 8px; }
.cm-empty h3 { font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 0; }
.cm-date { display: flex; justify-content: center; padding: 8px 0; }
.cm-date span { font-size: 0.7rem; font-weight: 600; color: #6b7280; background: #e2e8f0; padding: 4px 14px; border-radius: 999px; }
.cm-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 3px; }
.cm-row.own { justify-content: flex-end; }
.cm-avatar { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; font-size: 0.6rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.cm-bubble { max-width: 65%; padding: 8px 12px; border-radius: 12px; background: #fff; border-bottom-right-radius: 4px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.cm-bubble.own { background: #dcf8c6; color: #1e293b; border-radius: 12px; border-bottom-left-radius: 4px; border-bottom-right-radius: 12px; }
.cm-sender { display: block; font-size: 0.7rem; font-weight: 700; margin-bottom: 2px; }
.cm-text { margin: 0; font-size: 0.88rem; line-height: 1.5; word-break: break-word; white-space: pre-wrap; }
.cm-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 2px; }
.cm-time { font-size: 0.62rem; color: #6b7280; }
.cm-check { display: flex; align-items: center; color: #6b7280; }
.cm-check.read { color: #53bdeb; }

.cm-delete-btn { position: absolute; top: 6px; left: 6px; width: 24px; height: 24px; border: none; border-radius: 6px; background: rgba(0,0,0,0.35); color: #fff; cursor: pointer; display: grid; place-items: center; opacity: 0; transition: opacity 0.2s; z-index: 2; }
.cm-row.own .cm-bubble:hover .cm-delete-btn { opacity: 1; }
.cm-delete-btn:hover { background: #ef4444; }

/* ===== Voice ===== */
.cm-voice { display: flex; align-items: center; gap: 10px; padding: 2px 0; min-width: 200px; }
.cm-play { width: 36px; height: 36px; border: none; border-radius: 50%; background: rgba(17,80,201,0.1); color: #1150c9; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; transition: background 0.2s; }
.cm-play:hover { background: rgba(17,80,201,0.2); }
.cm-bubble.own .cm-play { background: rgba(0,0,0,0.08); color: #075e54; }
.cm-voice-track { flex: 1; height: 32px; background: rgba(0,0,0,0.04); border-radius: 16px; position: relative; overflow: hidden; cursor: pointer; }
.cm-voice-progress { position: absolute; top: 0; left: 0; height: 100%; background: rgba(17,80,201,0.12); border-radius: 16px; transition: width 0.1s; }
.cm-bubble.own .cm-voice-progress { background: rgba(0,77,64,0.1); }
.cm-voice-bars { position: absolute; top: 50%; left: 12px; right: 12px; transform: translateY(-50%); display: flex; align-items: center; gap: 2px; height: 22px; }
.cm-voice-bars span { width: 2.5px; border-radius: 2px; background: #1150c9; opacity: 0.45; flex-shrink: 0; }
.cm-bubble.own .cm-voice-bars span { background: #075e54; opacity: 0.4; }
.cm-dur { font-size: 0.68rem; color: #6b7280; flex-shrink: 0; min-width: 32px; }

/* ===== Image ===== */
.cm-image img { max-width: 260px; max-height: 300px; border-radius: 8px; cursor: pointer; display: block; }
.cm-image-caption { margin-top: 6px; font-size: 0.85rem; }

/* ===== Sticker ===== */
.cm-sticker { padding: 0; background: none !important; box-shadow: none !important; }
.cm-sticker-emoji { font-size: 3.5rem; line-height: 1; }

/* ===== Sticker Panel ===== */
.cm-sticker-panel { border-top: 1px solid #e5e7eb; background: #fff; max-height: 220px; }
.sp-tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
.sp-tabs button { flex: 1; padding: 10px; border: none; background: none; font-size: 0.8rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s; }
.sp-tabs button.active { color: #1150c9; border-bottom: 2px solid #1150c9; }
.sp-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; padding: 12px; overflow-y: auto; max-height: 170px; }
.sp-item { width: 100%; aspect-ratio: 1; border: none; background: none; font-size: 1.5rem; cursor: pointer; border-radius: 8px; display: grid; place-items: center; transition: background 0.15s; }
.sp-item:hover { background: #f3f4f6; }

/* ===== Image Preview ===== */
.cm-image-preview { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 20; }
.cip-box { background: #fff; border-radius: 16px; padding: 16px; max-width: 360px; width: 90%; display: flex; flex-direction: column; gap: 12px; }
.cip-box img { width: 100%; max-height: 300px; object-fit: contain; border-radius: 10px; }
.cip-caption { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; outline: none; }
.cip-caption:focus { border-color: #1150c9; }
.cip-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* ===== Lightbox ===== */
.cm-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 100; }
.cm-lightbox img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 4px; }
.lb-close { position: absolute; top: 16px; left: 16px; width: 40px; height: 40px; border: none; border-radius: 50%; background: rgba(255,255,255,0.15); color: #fff; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; }

/* ===== Forward ===== */
.cm-fwd { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: #f0f0ff; border-top: 1px solid #e5e7eb; font-size: 0.82rem; color: #1150c9; }
.cm-fwd button { margin-right: auto; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; padding: 4px 8px; border-radius: 6px; }
.cm-fwd button:hover { background: rgba(239,68,68,0.1); }

/* ===== Input ===== */
.cm-input { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-top: 1px solid #e5e7eb; background: #f0f2f5; position: relative; }
.inp-btn { width: 40px; height: 40px; border: none; border-radius: 50%; cursor: pointer; display: grid; place-items: center; transition: all 0.15s; flex-shrink: 0; background: #fff; color: #54656f; }
.inp-btn:hover { background: #e9edef; }
.inp-btn.active { background: #1150c9; color: #fff; }
.inp-btn.mic.rec { background: #ef4444; color: #fff; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
.rec-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: blink 1s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.inp-btn.send { background: #00a884; color: #fff; }
.inp-btn.send:hover:not(:disabled) { background: #06cf9c; }
.inp-btn.send:disabled { opacity: 0.4; cursor: not-allowed; }
.cm-input-box { flex: 1; padding: 10px 16px; border: none; border-radius: 24px; font-size: 0.88rem; color: #1e293b; outline: none; background: #fff; }
.cm-input-box::placeholder { color: #9ca3af; }
.cm-emoji-pop { position: absolute; bottom: 62px; right: 14px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 10px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 10; }
.cm-emoji-pop button { width: 34px; height: 34px; border: none; border-radius: 8px; background: none; cursor: pointer; font-size: 1.15rem; display: grid; place-items: center; }
.cm-emoji-pop button:hover { background: #f3f4f6; }

/* ===== Mobile — WhatsApp style ===== */
@media (max-width: 768px) {
  /* Full screen, no margins */
  .chat-page { height: 100dvh; height: 100vh; overflow: hidden; }
  .chat-layout {
    margin: 0; padding: 0;
    height: 100dvh; height: 100vh;
    border-radius: 0; border: none; box-shadow: none;
    display: flex; flex-direction: column;
    background: #e5ddd5;
    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9c4bc' fill-opacity='0.12'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* Sidebar: slides from right */
  .chat-sidebar {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 280px; z-index: 100;
    transform: translateX(100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    background: #fff;
  }
  .chat-sidebar.open { transform: translateX(0); }
  .sb-close { display: flex; background: none; border: none; color: #54656f; font-size: 1.2rem; cursor: pointer; padding: 6px; border-radius: 50%; }
  .sb-close:hover { background: #f5f6f6; }

  /* Header — WhatsApp green bar */
  .cm-head {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px 8px 12px;
    background: #008069; /* WhatsApp teal */
    color: #fff;
    flex-shrink: 0;
    min-height: 52px;
  }
  .cm-menu-btn { display: grid; background: none; border: none; color: #fff; cursor: pointer; padding: 8px; border-radius: 50%; }
  .cm-menu-btn:hover { background: rgba(255,255,255,0.1); }
  .cm-head-info { flex: 1; min-width: 0; }
  .cm-head-info h2 { font-size: 0.95rem; font-weight: 600; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cm-head-info p { font-size: 0.72rem; color: rgba(255,255,255,0.8); margin: 1px 0 0; }

  /* Main: flex column, fills remaining */
  .chat-main {
    flex: 1; display: flex; flex-direction: column;
    min-height: 0; overflow: hidden;
  }

  /* Messages area: scrollable, fills middle */
  .cm-messages {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 8px 8px 4px;
    display: flex; flex-direction: column; gap: 2px;
    background: #e5ddd5;
    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9c4bc' fill-opacity='0.12'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    -webkit-overflow-scrolling: touch;
    padding-bottom: env(safe-area-inset-bottom, 4px);
  }
  .cm-messages::-webkit-scrollbar { width: 3px; }
  .cm-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }

  /* Date pill */
  .cm-date { padding: 6px 0; }
  .cm-date span { font-size: 0.65rem; color: #5e5e5e; background: #d9fdd3; padding: 4px 12px; border-radius: 8px; box-shadow: 0 1px 1px rgba(0,0,0,0.08); }

  /* Message row */
  .cm-row { gap: 4px; margin-bottom: 2px; }

  /* Avatar */
  .cm-avatar { width: 28px; height: 28px; border-radius: 50%; font-size: 0.55rem; }

  /* Bubble — WhatsApp style */
  .cm-bubble {
    max-width: 88%; padding: 6px 10px 4px;
    border-radius: 8px; background: #fff;
    border-top-right-radius: 0;
    position: relative; box-shadow: 0 1px 1px rgba(0,0,0,0.08);
  }
  .cm-bubble.own {
    background: #d9fdd3; color: #111b21;
    border-radius: 8px; border-top-left-radius: 0; border-top-right-radius: 8px;
  }
  .cm-sender { font-size: 0.68rem; font-weight: 700; margin-bottom: 2px; }
  .cm-text { font-size: 0.82rem; line-height: 1.45; }
  .cm-meta { margin-top: 1px; }
  .cm-time { font-size: 0.6rem; color: #667781; }
  .cm-check { color: #667781; }
  .cm-check.read { color: #53bdeb; }

  /* Delete button — always visible on mobile */
  .cm-delete-btn { opacity: 0.7; top: 4px; left: 4px; width: 22px; height: 22px; }
  .cm-row.own .cm-bubble:hover .cm-delete-btn { opacity: 1; }

  /* Voice message */
  .cm-voice { gap: 8px; min-width: 180px; }
  .cm-play { width: 34px; height: 34px; }
  .cm-voice-track { height: 30px; }
  .cm-voice-bars span { width: 2px; }
  .cm-dur { font-size: 0.65rem; }

  /* Image */
  .cm-image img { max-width: 220px; max-height: 280px; border-radius: 6px; }

  /* Sticker */
  .cm-sticker-emoji { font-size: 3rem; }

  /* Empty state */
  .cm-empty { background: transparent; }
  .cm-empty-icon { font-size: 2.5rem; }
  .cm-empty h3 { font-size: 0.95rem; color: #3b4a54; }
  .cm-empty p { font-size: 0.8rem; color: #667781; }

  /* Loading */
  .cm-spinner { width: 28px; height: 28px; border-width: 2px; }

  /* Sticker panel — WhatsApp style */
  .cm-sticker-panel {
    flex-shrink: 0; max-height: 220px;
    background: #fff; border-top: 1px solid #e9edef;
    position: relative; z-index: 4;
  }
  .sp-tabs { border-bottom: 1px solid #e9edef; }
  .sp-tabs button { font-size: 0.75rem; padding: 10px 8px; color: #667781; }
  .sp-tabs button.active { color: #008069; border-bottom-color: #008069; }
  .sp-grid { grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 8px; max-height: 180px; }
  .sp-item { font-size: 1.4rem; border-radius: 6px; }

  /* Input bar — WhatsApp style, FIXED at bottom */
  .cm-input {
    flex-shrink: 0;
    display: flex; align-items: center; gap: 4px;
    padding: 6px 4px;
    padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
    background: #f0f2f5;
    border-top: none;
    position: relative; z-index: 5;
  }
  .inp-btn { width: 38px; height: 38px; border-radius: 50%; }
  .inp-btn.send { background: #00a884; width: 40px; height: 40px; }
  .inp-btn.mic { background: #fff; color: #54656f; }
  .cm-input-box { padding: 9px 12px; font-size: 0.85rem; border-radius: 24px; background: #fff; }

  /* Emoji popup */
  .cm-emoji-pop { right: 6px; bottom: 50px; grid-template-columns: repeat(6, 1fr); padding: 8px; border-radius: 12px; }
  .cm-emoji-pop button { width: 32px; height: 32px; font-size: 1.05rem; }

  /* Forward bar */
  .cm-fwd { padding: 8px 12px; background: #f0f0ff; font-size: 0.78rem; }

  /* Image preview */
  .cm-image-preview { z-index: 20; }
  .cip-box { border-radius: 12px; }

  /* Lightbox */
  .cm-lightbox { z-index: 100; }
}
</style>
