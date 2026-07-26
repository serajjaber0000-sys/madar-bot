<template>
  <div v-if="showSplash" class="sw" :class="{ 'sw-fade': fading }">
    <div class="sw-bg">
      <div class="sw-orb sw-orb-1"></div>
      <div class="sw-orb sw-orb-2"></div>
      <div class="sw-orb sw-orb-3"></div>
      <div class="sw-orb sw-orb-4"></div>
    </div>

    <div class="sw-content">
      <div class="sw-logo-wrap" :class="{ show: true }">
        <img src="/logo.jpg" alt="مدار" class="sw-logo" />
        <div class="sw-logo-glow"></div>
        <div class="sw-logo-ring"></div>
      </div>

      <h1 class="sw-title">مدار</h1>
      <p class="sw-subtitle">دليل الأطباء والعيادات الطبية الأول في العراق</p>

      <div class="sw-features">
        <div v-for="(feat, i) in features" :key="i" class="sw-feat" :class="{ show: featIndex >= i }">
          <div class="sw-feat-icon"><span v-html="feat.icon"></span></div>
          <div class="sw-feat-text">
            <strong>{{ feat.title }}</strong>
            <span>{{ feat.desc }}</span>
          </div>
        </div>
      </div>

      <div class="sw-progress-wrap">
        <div class="sw-progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="sw-loading-text">{{ loadingText }}</p>
    </div>

    <div class="sw-bottom">
      <div class="sw-bottom-dots">
        <span class="sw-dot"></span>
        <span class="sw-dot"></span>
        <span class="sw-dot"></span>
      </div>
      <p class="sw-bottom-text">جاري تحميل البيانات...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { doctorProfilesRepo } from '@/services/clinic'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const router = useRouter()
const showSplash = ref(false)
const progress = ref(0)
const fading = ref(false)
const featIndex = ref(-1)
const loadingText = ref('جاري التجهيز...')

const features = [
  { title: 'ابحث عن طبيبك', desc: 'دليل شامل بأكثر من ١٠٠٠ طبيب وعيادة', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' },
  { title: 'احجز موعدك', desc: 'حجز مباشر وسريع بدون انتظار', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' },
  { title: 'إدارة عيادتك', desc: 'نظام متكامل للمرضى والمواعيد والمحاسبة', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { title: 'المختبرات والمستشفيات', desc: 'ابحث عن أقرب مختبر أو مستشفى', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M12 3v7M5 21h14M7 10l2 7h6l2-7"/></svg>' }
]

const loadingTexts = [
  { at: 800, text: 'جاري تحميل الأطباء...' },
  { at: 1800, text: 'جاري تحميل العيادات...' },
  { at: 3000, text: 'جاري تحميل البيانات...' },
  { at: 4200, text: 'جاري تجهيز الدليل...' },
  { at: 5500, text: 'جاري التحميل...' },
  { at: 6200, text: 'جاهز!' }
]

let progressTimer = null

async function preloadData() {
  const loadDoctors = doctorProfilesRepo.listPublic().then(doctors => {
    sessionStorage.setItem('madar_doctors_cache', JSON.stringify(doctors))
    sessionStorage.setItem('madar_doctors_cache_time', String(Date.now()))
  }).catch(() => {})

  const loadSliders = (async () => {
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
  })()

  const loadSettings = getDoc(doc(db, 'site_sliders_settings', 'global')).then(snap => {
    if (snap.exists()) {
      sessionStorage.setItem('madar_slider_settings', JSON.stringify(snap.data()))
    }
  }).catch(() => {})

  await Promise.allSettled([loadDoctors, loadSliders, loadSettings])
}

onMounted(() => {
  if (sessionStorage.getItem('madar_splash_shown')) {
    router.replace('/')
    return
  }

  showSplash.value = true
  sessionStorage.setItem('madar_splash_shown', '1')

  preloadData()

  const totalDuration = 7000
  let elapsed = 0

  progressTimer = setInterval(() => {
    elapsed += 50
    progress.value = Math.min((elapsed / totalDuration) * 100, 100)

    if (elapsed >= 500 && featIndex.value < 0) featIndex.value = 0
    if (elapsed >= 1500 && featIndex.value < 1) featIndex.value = 1
    if (elapsed >= 2800 && featIndex.value < 2) featIndex.value = 2
    if (elapsed >= 4000 && featIndex.value < 3) featIndex.value = 3

    for (const t of loadingTexts) {
      if (elapsed >= t.at) loadingText.value = t.text
    }

    if (progress.value >= 100) {
      clearInterval(progressTimer)
      setTimeout(() => {
        fading.value = true
        setTimeout(() => router.replace('/'), 400)
      }, 300)
    }
  }, 50)
})

onUnmounted(() => { if (progressTimer) clearInterval(progressTimer) })
</script>

<style scoped>
.sw{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#064e3b 0%,#0d9488 35%,#0f766e 70%,#14b8a6 100%);z-index:9999;overflow:hidden;transition:opacity .5s ease,transform .5s ease}
.sw-fade{opacity:0;transform:scale(1.06)}

/* BG ORBS */
.sw-bg{position:absolute;inset:0;pointer-events:none}
.sw-orb{position:absolute;border-radius:50%;filter:blur(80px)}
.sw-orb-1{width:400px;height:400px;background:rgba(20,184,166,0.2);top:-120px;right:-80px;animation:orbA 7s ease-in-out infinite}
.sw-orb-2{width:350px;height:350px;background:rgba(6,78,59,0.25);bottom:-80px;left:-60px;animation:orbB 9s ease-in-out infinite}
.sw-orb-3{width:200px;height:200px;background:rgba(214,158,31,0.1);top:35%;left:55%;animation:orbC 8s ease-in-out infinite}
.sw-orb-4{width:250px;height:250px;background:rgba(13,148,136,0.15);top:60%;right:20%;animation:orbA 10s ease-in-out infinite reverse}
@keyframes orbA{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,40px)}}
@keyframes orbB{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-30px)}}
@keyframes orbC{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,-30px)}}

/* CONTENT */
.sw-content{position:relative;text-align:center;z-index:2;animation:fadeUp .7s ease-out both;padding:0 24px;max-width:360px}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

/* LOGO */
.sw-logo-wrap{position:relative;width:100px;height:100px;margin:0 auto 20px;opacity:0;transform:scale(0.7);transition:all .6s cubic-bezier(0.34,1.56,0.64,1)}
.sw-logo-wrap.show{opacity:1;transform:scale(1)}
.sw-logo{width:100px;height:100px;border-radius:28px;object-fit:cover;position:relative;z-index:2;box-shadow:0 10px 50px rgba(0,0,0,0.3);animation:logoFloat 3s ease-in-out infinite}
.sw-logo-glow{position:absolute;inset:-12px;border-radius:36px;background:radial-gradient(circle,rgba(13,148,136,0.35),transparent 70%);animation:glowPulse 2.5s ease-in-out infinite}
.sw-logo-ring{position:absolute;inset:-18px;border-radius:40px;border:2px solid rgba(255,255,255,0.1);animation:ringPulse 3s ease-in-out infinite}
@keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes ringPulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.05)}}

/* TEXT */
.sw-title{font:900 2.4rem/1 'Segoe UI',sans-serif;color:#fff;margin:0 0 8px;letter-spacing:-1px;text-shadow:0 2px 24px rgba(0,0,0,0.2)}
.sw-subtitle{font:500 0.88rem/1.4 'Segoe UI',sans-serif;color:rgba(255,255,255,0.6);margin:0 0 28px}

/* FEATURES */
.sw-features{display:flex;flex-direction:column;gap:10px;margin:0 auto 28px;max-width:320px}
.sw-feat{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(8px);opacity:0;transform:translateY(16px);transition:all .45s cubic-bezier(0.34,1.56,0.64,1)}
.sw-feat.show{opacity:1;transform:translateY(0)}
.sw-feat-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05));display:grid;place-items:center;color:#fff;flex-shrink:0}
.sw-feat-text{display:flex;flex-direction:column;gap:1px;text-align:right}
.sw-feat-text strong{font:700 0.82rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.95)}
.sw-feat-text span{font:500 0.7rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.5);line-height:1.3}

/* PROGRESS */
.sw-progress-wrap{width:min(280px,80vw);height:4px;background:rgba(255,255,255,0.1);border-radius:4px;margin:0 auto 12px;overflow:hidden}
.sw-progress-bar{height:100%;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.8) 100%);border-radius:4px;transition:width .05s linear;box-shadow:0 0 12px rgba(255,255,255,0.4)}
.sw-loading-text{font:600 0.78rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.45);margin:0;min-height:1.2em;transition:all .3s}

/* BOTTOM */
.sw-bottom{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);text-align:center;z-index:2}
.sw-bottom-dots{display:flex;justify-content:center;gap:6px;margin-bottom:8px}
.sw-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);animation:dotBounce 1.4s ease-in-out infinite}
.sw-dot:nth-child(2){animation-delay:0.2s}
.sw-dot:nth-child(3){animation-delay:0.4s}
@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1.2);opacity:1}}
.sw-bottom-text{font:500 0.7rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.3);margin:0}

@media(max-width:480px){
  .sw-title{font-size:2rem}
  .sw-subtitle{font-size:.82rem}
  .sw-logo-wrap,.sw-logo{width:84px;height:84px}
  .sw-logo{border-radius:24px}
  .sw-features{max-width:280px}
  .sw-feat{padding:10px 12px}
  .sw-feat-icon{width:36px;height:36px}
  .sw-feat-text strong{font-size:.78rem}
  .sw-feat-text span{font-size:.68rem}
}
</style>
