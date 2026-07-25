<template>
  <div v-if="showSplash" class="sw" :class="{ 'sw-fade': fading }">
    <div class="sw-bg">
      <div class="sw-orb sw-orb-1"></div>
      <div class="sw-orb sw-orb-2"></div>
      <div class="sw-orb sw-orb-3"></div>
    </div>

    <div class="sw-content">
      <div class="sw-logo-wrap">
        <img src="/logo.jpg" alt="مدار" class="sw-logo" />
        <div class="sw-logo-glow"></div>
      </div>

      <h1 class="sw-title">مدار</h1>
      <p class="sw-subtitle">دليل الأطباء والعيادات الطبية الأول في العراق</p>

      <div class="sw-services">
        <div v-for="(svc, i) in services" :key="i" class="sw-svc" :class="{ show: serviceIndex >= i }">
          <div class="sw-svc-icon"><span v-html="svc.icon"></span></div>
          <span class="sw-svc-text">{{ svc.label }}</span>
        </div>
      </div>

      <div class="sw-progress-wrap">
        <div class="sw-progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="sw-loading-text">{{ loadingText }}</p>
    </div>

    <div class="sw-bottom">
      <svg class="sw-heartbeat" viewBox="0 0 200 40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
        <path d="M0 20 H60 L70 8 L80 32 L90 12 L100 28 L110 20 H200" stroke-dasharray="400" stroke-dashoffset="400">
          <animate attributeName="stroke-dashoffset" from="400" to="0" dur="2.5s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { doctorProfilesRepo, reviewsRepo } from '@/services/clinic'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const router = useRouter()
const showSplash = ref(false)
const progress = ref(0)
const fading = ref(false)
const serviceIndex = ref(-1)
const loadingText = ref('جاري تحميل البيانات...')

const services = [
  { label: 'البحث عن الأطباء', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' },
  { label: 'حجز المواعيد', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' },
  { label: 'دليل العيادات', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { label: 'المختبرات والمستشفيات', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M12 3v7M5 21h14M7 10l2 7h6l2-7"/></svg>' }
]

let progressTimer = null

async function preloadData() {
  try {
    const doctors = await doctorProfilesRepo.listPublic()
    sessionStorage.setItem('madar_doctors_cache', JSON.stringify(doctors))
    sessionStorage.setItem('madar_doctors_cache_time', String(Date.now()))
  } catch {}

  try {
    const now = new Date().toISOString().split('T')[0]
    const snap = await getDocs(collection(db, 'site_sliders'))
    const loaded = []
    snap.forEach(d => {
      const data = d.data()
      if (data.enabled === false) return
      if (data.start_date && data.start_date > now) return
      if (data.end_date && data.end_date < now) return
      loaded.push({ id: d.id, ...data })
    })
    loaded.sort((a, b) => (a.order || 0) - (b.order || 0))
    sessionStorage.setItem('madar_sliders_cache', JSON.stringify(loaded))
  } catch {}

  try {
    const snap = await getDoc(doc(db, 'site_sliders_settings', 'global'))
    if (snap.exists()) {
      sessionStorage.setItem('madar_slider_settings', JSON.stringify(snap.data()))
    }
  } catch {}
}

onMounted(() => {
  if (sessionStorage.getItem('madar_splash_shown')) {
    router.replace('/directory')
    return
  }

  showSplash.value = true
  sessionStorage.setItem('madar_splash_shown', '1')

  preloadData()

  const totalDuration = 5000
  const step = 100 / (totalDuration / 50)
  let elapsed = 0

  progressTimer = setInterval(() => {
    elapsed += 50
    progress.value = Math.min((elapsed / totalDuration) * 100, 100)

    if (elapsed >= 1000 && serviceIndex.value < 0) { serviceIndex.value = 0; loadingText.value = 'جاري تحميل الأطباء...' }
    if (elapsed >= 2000 && serviceIndex.value < 1) { serviceIndex.value = 1; loadingText.value = 'جاري تحميل العيادات...' }
    if (elapsed >= 3000 && serviceIndex.value < 2) { serviceIndex.value = 2; loadingText.value = 'جاري تحميل البيانات...' }
    if (elapsed >= 4000 && serviceIndex.value < 3) { serviceIndex.value = 3; loadingText.value = 'جاري التحميل...' }

    if (progress.value >= 100) {
      clearInterval(progressTimer)
      loadingText.value = 'جاهز!'
      setTimeout(() => {
        fading.value = true
        setTimeout(() => router.replace('/directory'), 400)
      }, 200)
    }
  }, 50)
})

onUnmounted(() => { if (progressTimer) clearInterval(progressTimer) })
</script>

<style scoped>
.sw{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#064e3b 0%,#0d9488 40%,#14b8a6 100%);z-index:9999;overflow:hidden;transition:opacity .4s ease,transform .4s ease}
.sw-fade{opacity:0;transform:scale(1.05)}
.sw-bg{position:absolute;inset:0;pointer-events:none}
.sw-orb{position:absolute;border-radius:50%;filter:blur(80px)}
.sw-orb-1{width:400px;height:400px;background:rgba(13,148,136,0.25);top:-100px;right:-80px;animation:orbFloat1 6s ease-in-out infinite}
.sw-orb-2{width:300px;height:300px;background:rgba(13,148,136,0.2);bottom:-60px;left:-40px;animation:orbFloat2 8s ease-in-out infinite}
.sw-orb-3{width:200px;height:200px;background:rgba(214,158,31,0.12);top:40%;left:50%;animation:orbFloat3 7s ease-in-out infinite}
@keyframes orbFloat1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,40px)}}
@keyframes orbFloat2{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-30px)}}
@keyframes orbFloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,-30px)}}
.sw-content{position:relative;text-align:center;z-index:2;animation:fadeUp .6s ease-out both;padding:0 24px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.sw-logo-wrap{position:relative;width:90px;height:90px;margin:0 auto 16px}
.sw-logo{width:90px;height:90px;border-radius:24px;object-fit:cover;position:relative;z-index:2;box-shadow:0 8px 40px rgba(13,148,136,0.4);animation:logoPulse 2s ease-in-out infinite}
.sw-logo-glow{position:absolute;inset:-8px;border-radius:28px;background:radial-gradient(circle,rgba(13,148,136,0.3),transparent 70%);animation:glowPulse 2s ease-in-out infinite}
@keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes glowPulse{0%,100%{opacity:.6}50%{opacity:1}}
.sw-title{font:900 2.2rem/1 'Segoe UI',sans-serif;color:#fff;margin:0 0 6px;letter-spacing:-1px;text-shadow:0 2px 20px rgba(13,148,136,0.5)}
.sw-subtitle{font:500 0.88rem/1.4 'Segoe UI',sans-serif;color:rgba(255,255,255,0.5);margin:0 0 24px}
.sw-services{display:flex;flex-direction:column;gap:8px;max-width:260px;margin:0 auto 24px}
.sw-svc{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);opacity:0;transform:translateX(-16px);transition:all .35s ease;backdrop-filter:blur(4px)}
.sw-svc.show{opacity:1;transform:translateX(0)}
.sw-svc-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,rgba(13,148,136,0.3),rgba(20,184,166,0.3));display:grid;place-items:center;color:#fff;flex-shrink:0}
.sw-svc-text{font:600 0.8rem 'Segoe UI',sans-serif;color:rgba(255,255,255,0.8)}
.sw-progress-wrap{width:min(220px,70vw);height:3px;background:rgba(255,255,255,0.1);border-radius:3px;margin:0 auto 10px;overflow:hidden}
.sw-progress-bar{height:100%;background:linear-gradient(90deg,#0d9488,#14b8a6,#22c55e);border-radius:3px;transition:width .05s linear}
.sw-loading-text{font:500 0.75rem 'Segoe UI',sans-serif;color:rgba(255,255,255,0.35);margin:0}
.sw-bottom{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);width:180px;z-index:2}
.sw-heartbeat{width:100%;height:36px}

@media(max-width:480px){
  .sw-title{font-size:1.8rem}
  .sw-subtitle{font-size:.82rem}
  .sw-logo-wrap,.sw-logo{width:76px;height:76px}
  .sw-logo{border-radius:20px}
  .sw-services{max-width:240px}
  .sw-svc{padding:7px 10px}
  .sw-svc-icon{width:28px;height:28px}
  .sw-svc-text{font-size:.75rem}
}
</style>
