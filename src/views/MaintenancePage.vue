<template>
  <div class="maintenance-page">
    <div class="maintenance-card">
      <div class="icon-wrap">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h1>الموقع قيد الصيانة</h1>
      <p class="message">{{ message }}</p>
      <div class="pulse-dot"></div>
      <p class="auto-msg">سيتم التحقق تلقائياً كل 30 ثانية</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const router = useRouter()
const message = ref('يرجى المحاولة لاحقاً')
let interval = null

async function checkMaintenance() {
  try {
    const snap = await getDoc(doc(db, 'platform_settings', 'maintenance'))
    if (snap.exists()) {
      const data = snap.data()
      if (!data.enabled) {
        router.replace('/login')
        return
      }
      if (data.message) message.value = data.message
    } else {
      router.replace('/login')
    }
  } catch {
    // Firestore read failed, stay on page
  }
}

onMounted(() => {
  checkMaintenance()
  interval = setInterval(checkMaintenance, 30000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
  direction: rtl;
  padding: 24px;
}

.maintenance-card {
  text-align: center;
  max-width: 440px;
  width: 100%;
}

.icon-wrap {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(13, 148, 136, 0.1);
  border: 2px solid rgba(13, 148, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  color: #14b8a6;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13,148,136,0.3); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(13,148,136,0); }
}

h1 {
  font: 800 2rem/1.2 'Cairo', sans-serif;
  color: #f1f5f9;
  margin: 0 0 16px;
}

.message {
  font: 400 1.1rem/1.6 'Tajawal', sans-serif;
  color: #94a3b8;
  margin: 0 0 40px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #14b8a6;
  margin: 0 auto 20px;
  animation: dotBlink 1.5s ease-in-out infinite;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.auto-msg {
  font: 400 0.8rem/1 'Tajawal', sans-serif;
  color: #475569;
  margin: 0;
}

@media (max-width: 480px) {
  h1 { font-size: 1.5rem; }
  .message { font-size: 1rem; }
  .icon-wrap { width: 96px; height: 96px; }
  .icon-wrap svg { width: 48px; height: 48px; }
}
</style>
