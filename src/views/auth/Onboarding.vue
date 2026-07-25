<template>
  <div class="onboarding">
    <button v-if="slide < 3" @click="skip" class="skip-btn">تخطي</button>

    <div class="slide-content">
      <div class="medical-bg">
        <!-- Stethoscope -->
        <div class="med-float med-1">
          <svg viewBox="0 0 120 140" fill="none" stroke="rgba(17,80,201,0.15)" stroke-width="2" stroke-linecap="round">
            <path d="M30 20 C30 20 30 80 60 95 C90 80 90 20 90 20"/>
            <circle cx="60" cy="110" r="15" stroke-width="3"/>
            <circle cx="60" cy="110" r="5" fill="rgba(17,80,201,0.1)"/>
            <circle cx="25" cy="15" r="8"/>
            <circle cx="95" cy="15" r="8"/>
          </svg>
        </div>
        <!-- Heartbeat line -->
        <div class="med-float med-2">
          <svg viewBox="0 0 200 60" fill="none" stroke="rgba(17,80,201,0.18)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M0 30 H50 L60 10 L75 50 L90 20 L100 35 L110 30 H200"/>
          </svg>
        </div>
        <!-- Syringe -->
        <div class="med-float med-3">
          <svg viewBox="0 0 40 100" fill="none" stroke="rgba(17,80,201,0.12)" stroke-width="2">
            <rect x="10" y="10" width="20" height="65" rx="3"/>
            <line x1="20" y1="75" x2="20" y2="95"/>
            <line x1="15" y1="90" x2="25" y2="90"/>
            <rect x="14" y="20" width="12" height="3" rx="1" fill="rgba(17,80,201,0.08)"/>
            <rect x="14" y="28" width="12" height="3" rx="1" fill="rgba(17,80,201,0.08)"/>
            <line x1="10" y1="15" x2="6" y2="15"/>
            <line x1="30" y1="15" x2="34" y2="15"/>
          </svg>
        </div>
        <!-- Tooth -->
        <div class="med-float med-4">
          <svg viewBox="0 0 60 70" fill="none" stroke="rgba(13,148,136,0.15)" stroke-width="2">
            <path d="M15 10 C15 5 20 2 25 5 C30 8 30 8 35 5 C40 2 45 5 45 10 C48 20 50 40 42 60 C38 65 35 68 30 65 C28 63 28 63 25 65 C20 68 17 65 13 60 C5 40 7 20 15 10 Z"/>
          </svg>
        </div>
        <!-- Pill -->
        <div class="med-float med-5">
          <svg viewBox="0 0 50 80" fill="none" stroke="rgba(13,148,136,0.12)" stroke-width="2">
            <rect x="5" y="5" width="40" height="70" rx="20"/>
            <line x1="5" y1="40" x2="45" y2="40"/>
          </svg>
        </div>
        <!-- Heart -->
        <div class="med-float med-6">
          <svg viewBox="0 0 60 55" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.12)" stroke-width="2">
            <path d="M30 50 C10 35 0 20 10 10 C20 0 30 8 30 15 C30 8 40 0 50 10 C60 20 50 35 30 50 Z"/>
          </svg>
        </div>
      </div>

      <!-- Slide 1: Stethoscope -->
      <div v-if="slide === 0" class="slide" key="0">
        <div class="illustration">
          <svg viewBox="0 0 200 220" class="hero-svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#1150c9"/>
                <stop offset="100%" stop-color="#0d9488"/>
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="85" fill="none" stroke="url(#g1)" stroke-width="3" stroke-dasharray="8 6" class="spin-slow"/>
            <circle cx="100" cy="100" r="65" fill="rgba(17,80,201,0.06)"/>
            <g transform="translate(60,45) scale(1.2)">
              <path d="M20 15 C20 15 20 70 50 85 C80 70 80 15 80 15" fill="none" stroke="#1150c9" stroke-width="4" stroke-linecap="round"/>
              <circle cx="50" cy="105" r="14" fill="none" stroke="#1150c9" stroke-width="4"/>
              <circle cx="50" cy="105" r="5" fill="#1150c9" opacity="0.3"/>
              <circle cx="16" cy="10" r="8" fill="#1150c9"/>
              <circle cx="84" cy="10" r="8" fill="#1150c9"/>
              <path d="M16 10 L16 30 C16 30 16 55 20 65" fill="none" stroke="#1150c9" stroke-width="3" stroke-linecap="round" class="pulse-path"/>
            </g>
          </svg>
        </div>
        <h2 class="slide-title">مرحباً بك في مدار</h2>
        <p class="slide-desc">نظام ذكي لإدارة عيادتك بكل سلاسة</p>
      </div>

      <!-- Slide 2: Blood Pressure Monitor -->
      <div v-if="slide === 1" class="slide" key="1">
        <div class="illustration">
          <svg viewBox="0 0 200 200" class="hero-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(13,148,136,0.3)" stroke-width="3" stroke-dasharray="8 6" class="spin-slow"/>
            <rect x="55" y="20" width="90" height="130" rx="14" fill="rgba(13,148,136,0.06)" stroke="#0d9488" stroke-width="3"/>
            <rect x="65" y="35" width="70" height="55" rx="8" fill="rgba(13,148,136,0.1)"/>
            <text x="100" y="68" text-anchor="middle" font-size="22" font-weight="700" fill="#0d9488" class="bp-text">120/80</text>
            <circle cx="100" cy="115" r="14" fill="none" stroke="#0d9488" stroke-width="2.5"/>
            <path d="M93 115 L98 115 L100 108 L102 122 L104 112 L107 115" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="100" cy="140" r="4" fill="#0d9488" opacity="0.4"/>
          </svg>
        </div>
        <h2 class="slide-title">تابع مرضانا</h2>
        <p class="slide-desc">إدارة سجلات المرضى والمواعيد في مكان واحد</p>
      </div>

      <!-- Slide 3: Calendar -->
      <div v-if="slide === 2" class="slide" key="2">
        <div class="illustration">
          <svg viewBox="0 0 200 200" class="hero-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(17,80,201,0.3)" stroke-width="3" stroke-dasharray="8 6" class="spin-slow"/>
            <rect x="40" y="35" width="120" height="120" rx="14" fill="rgba(17,80,201,0.05)" stroke="#1150c9" stroke-width="3"/>
            <rect x="40" y="35" width="120" height="35" rx="14" fill="#1150c9"/>
            <rect x="40" y="56" width="120" height="14" fill="#1150c9"/>
            <circle cx="65" cy="48" r="4" fill="white"/>
            <circle cx="135" cy="48" r="4" fill="white"/>
            <line x1="68" y1="30" x2="68" y2="42" stroke="#1150c9" stroke-width="4" stroke-linecap="round"/>
            <line x1="132" y1="30" x2="132" y2="42" stroke="#1150c9" stroke-width="4" stroke-linecap="round"/>
            <g v-for="(d, i) in [75,95,115,135]" :key="'w'+i">
              <rect :x="d-6" y="82" width="12" height="10" rx="2" :fill="i===1?'#1150c9':'rgba(17,80,201,0.15)'"/>
            </g>
            <g v-for="(d, i) in [55,75,95,115,135]" :key="'w2'+i">
              <rect :x="d-6" y="98" width="12" height="10" rx="2" :fill="i===2?'#0d9488':'rgba(17,80,201,0.1)'"/>
            </g>
            <g v-for="(d, i) in [55,75,95,115,135]" :key="'w3'+i">
              <rect :x="d-6" y="114" width="12" height="10" rx="2" :fill="i===0?'#d69e1f':'rgba(17,80,201,0.1)'"/>
            </g>
            <g v-for="(d, i) in [55,75,95,115,135]" :key="'w4'+i">
              <rect :x="d-6" y="130" width="12" height="10" rx="2" :fill="i===3?'#1150c9':'rgba(17,80,201,0.08)'"/>
            </g>
          </svg>
        </div>
        <h2 class="slide-title">إدارة المواعيد</h2>
        <p class="slide-desc">تقويم ذكي يتذكر مواعيدك ومواعيد مرضاك</p>
      </div>

      <!-- Slide 4: Security -->
      <div v-if="slide === 3" class="slide" key="3">
        <div class="illustration">
          <svg viewBox="0 0 200 220" class="hero-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(13,148,136,0.3)" stroke-width="3" stroke-dasharray="8 6" class="spin-slow"/>
            <path d="M100 25 L155 55 L155 110 C155 150 100 185 100 185 C100 185 45 150 45 110 L45 55 Z" fill="rgba(13,148,136,0.06)" stroke="#0d9488" stroke-width="3" stroke-linejoin="round"/>
            <path d="M78 108 L95 125 L128 85" fill="none" stroke="#0d9488" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="check-draw"/>
            <circle cx="100" cy="55" r="6" fill="#0d9488" opacity="0.3"/>
          </svg>
        </div>
        <h2 class="slide-title">آمن ومحمي</h2>
        <p class="slide-desc">بيانات مرضاك في أمان تام مع تشفير متقدم</p>
        <button @click="goLogin" class="nav-btn primary">ابدأ الآن</button>
      </div>
    </div>

    <div class="pagination">
      <div v-for="i in 4" :key="i" class="dot" :class="{ active: slide === i - 1 }"/>
    </div>

    <button v-if="slide < 3" @click="next" class="nav-btn primary">التالي</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const slide = ref(0)

function next() {
  if (slide.value < 3) {
    slide.value++
  } else {
    goLogin()
  }
}

function skip() {
  goLogin()
}

function goLogin() {
  localStorage.setItem('madar_onboarding_seen', '1')
  router.push('/login')
}
</script>

<style scoped>
.onboarding {
  min-height: 100dvh;
  background: #0a1628;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 32px;
  position: relative;
  overflow-y: auto;
  font-family: 'Noto Sans Arabic', sans-serif;
}

.skip-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  font-family: 'Noto Sans Arabic', sans-serif;
}
.skip-btn:hover {
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
}

.medical-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.med-float {
  position: absolute;
}
.med-1 {
  width: 120px;
  top: 8%;
  right: 5%;
  animation: floatY 7s ease-in-out infinite;
}
.med-2 {
  width: 200px;
  bottom: 25%;
  left: -3%;
  animation: floatX 9s ease-in-out infinite;
}
.med-3 {
  width: 40px;
  top: 55%;
  right: 10%;
  animation: floatY 6s ease-in-out infinite 1s;
}
.med-4 {
  width: 60px;
  top: 15%;
  left: 8%;
  animation: floatY 8s ease-in-out infinite 2s;
}
.med-5 {
  width: 50px;
  bottom: 15%;
  right: 15%;
  animation: floatY 7s ease-in-out infinite 0.5s;
}
.med-6 {
  width: 60px;
  top: 40%;
  left: 5%;
  animation: floatY 6s ease-in-out infinite 1.5s;
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
}
@keyframes floatX {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(15px); }
}

.slide-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.slide {
  text-align: center;
  width: 100%;
  max-width: 360px;
  animation: fadeUp 0.4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.illustration {
  width: 220px;
  height: 220px;
  margin: 0 auto 28px;
  position: relative;
}

.hero-svg {
  width: 100%;
  height: 100%;
  animation: fadeUp 0.5s ease;
}

.spin-slow {
  animation: spin 20s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pulse-path {
  animation: pulseDash 2s ease-in-out infinite;
}

@keyframes pulseDash {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.bp-text {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.check-draw {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: drawCheck 1s ease 0.5s forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

.slide-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
}

.slide-desc {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  margin: 0 0 24px;
  line-height: 1.6;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  transition: all 0.3s;
}

.dot.active {
  width: 28px;
  border-radius: 4px;
  background: #1150c9;
}

.nav-btn {
  width: 100%;
  max-width: 320px;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Sans Arabic', sans-serif;
}

.nav-btn.primary {
  background: linear-gradient(135deg, #1150c9, #0d9488);
  color: #fff;
}
.nav-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(17,80,201,0.3);
}

@media (max-width: 480px) {
  .illustration {
    width: 180px;
    height: 180px;
  }
  .slide-title { font-size: 22px; }
  .slide-desc { font-size: 14px; }
  .med-1 { width: 80px; }
  .med-2 { width: 140px; }
  .med-3 { width: 30px; }
  .med-4 { width: 45px; }
  .med-5 { width: 38px; }
  .med-6 { width: 45px; }
}
</style>
