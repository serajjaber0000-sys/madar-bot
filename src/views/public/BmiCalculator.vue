<template>
  <div class="app-page">
    <nav class="app-bar">
      <button class="app-bar-back" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h1 class="app-bar-title">حاسبة الوزن</h1>
      <div class="app-bar-spacer"></div>
    </nav>

    <div class="app-scroll">
      <section class="bmi-hero">
        <div class="bmi-hero-orbs"><div class="bmi-orb o1"></div><div class="bmi-orb o2"></div></div>
        <div class="bmi-hero-inner">
          <div class="bmi-hero-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            حاسبة صحية
          </div>
          <h1>حاسبة <span class="bmi-hero-hl">الوزن المثالي</span></h1>
          <p>احسب مؤشر كتلة جسمك واكتشف وزنك المثالي</p>
        </div>
      </section>

      <section class="bmi-body">
        <div class="bmi-card">
          <div class="bmi-gender-row">
            <button :class="['bmi-gender', gender === 'male' && 'active']" @click="gender = 'male'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.4 5.4M19 5h-5M19 5v5"/></svg>
              ذكر
            </button>
            <button :class="['bmi-gender', gender === 'female' && 'active']" @click="gender = 'female'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
              أنثى
            </button>
          </div>

          <div class="bmi-field">
            <label>الطول (سم)</label>
            <div class="bmi-input-wrap">
              <input :value="height" @input="height = $event.target.value === '' ? '' : Number($event.target.value)" type="tel" inputmode="decimal" placeholder="170" class="bmi-input" dir="ltr" />
              <span class="bmi-unit">سم</span>
            </div>
          </div>

          <div class="bmi-field">
            <label>الوزن (كغ)</label>
            <div class="bmi-input-wrap">
              <input :value="weight" @input="weight = $event.target.value === '' ? '' : Number($event.target.value)" type="tel" inputmode="decimal" placeholder="70" class="bmi-input" dir="ltr" />
              <span class="bmi-unit">كغ</span>
            </div>
          </div>

          <div class="bmi-field" v-if="gender === 'male'">
            <label>العمر</label>
            <div class="bmi-input-wrap">
              <input :value="age" @input="age = $event.target.value === '' ? '' : Number($event.target.value)" type="tel" inputmode="numeric" placeholder="30" class="bmi-input" dir="ltr" />
              <span class="bmi-unit">سنة</span>
            </div>
          </div>

          <button class="bmi-calc-btn" @click="calculate">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg>
            احسب BMI
          </button>
        </div>

        <div v-if="result" ref="resultCard">
          <div class="bmi-result-card">
            <div class="bmi-result-header">
              <div class="bmi-result-circle" :style="{ background: result.color + '18', borderColor: result.color }">
                <span class="bmi-result-num" :style="{ color: result.color }">{{ bmiValue }}</span>
              </div>
              <div>
                <div class="bmi-result-label">مؤشر كتلة الجسم</div>
                <div class="bmi-result-status" :style="{ color: result.color }">{{ result.label }}</div>
              </div>
            </div>
            <div class="bmi-bar-wrap">
              <div class="bmi-bar">
                <div class="bmi-bar-seg" style="background:#3b82f6"></div>
                <div class="bmi-bar-seg" style="background:#10b981"></div>
                <div class="bmi-bar-seg" style="background:#f59e0b"></div>
                <div class="bmi-bar-seg" style="background:#ef4444"></div>
              </div>
              <div class="bmi-bar-marker" :style="{ left: markerPos + '%' }"></div>
            </div>
            <div class="bmi-bar-labels">
              <span>نحيف</span><span>طبيعي</span><span>وزن زائد</span><span>سمنة</span>
            </div>
          </div>

          <div class="bmi-result-card">
            <div class="bmi-result-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              الوزن المثالي
            </div>
            <div class="bmi-ideal-list">
              <div class="bmi-ideal-row">
                <span>الوزن المثالي لطولك</span>
                <strong>{{ idealWeight }} كغ</strong>
              </div>
              <div class="bmi-ideal-row">
                <span>نطاق الوزن الصحي</span>
                <strong>{{ weightRange[0] }} — {{ weightRange[1] }} كغ</strong>
              </div>
              <div class="bmi-ideal-row" v-if="gender === 'male'">
                <span>الوزن المثالي (Devine)</span>
                <strong>{{ devineWeight }} كغ</strong>
              </div>
            </div>
            <p class="bmi-disclaimer">* نتائج تقريبية. استشر طبيبك للحصول على نصيحة دقيقة.</p>
          </div>

          <div class="bmi-result-card">
            <div class="bmi-result-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              دليل سريع
            </div>
            <div class="bmi-table">
              <div class="bmi-tbl-row hdr"><span>الفئة</span><span>BMI</span></div>
              <div class="bmi-tbl-row"><span>نحيف</span><span>&lt; 18.5</span></div>
              <div class="bmi-tbl-row ok"><span>طبيعي</span><span>18.5 — 24.9</span></div>
              <div class="bmi-tbl-row"><span>وزن زائد</span><span>25 — 29.9</span></div>
              <div class="bmi-tbl-row"><span>سمنة درجة أولى</span><span>30 — 34.9</span></div>
              <div class="bmi-tbl-row"><span>سمنة درجة ثانية</span><span>35 — 39.9</span></div>
              <div class="bmi-tbl-row"><span>سمنة مفرطة</span><span>&ge; 40</span></div>
            </div>
          </div>
        </div>

        <div class="about-app-badge">
          <img src="/logo.jpg" alt="مدار" class="badge-logo" />
          <span>© {{ new Date().getFullYear() }} مدار</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const gender = ref('male')
const height = ref('')
const weight = ref('')
const age = ref('')
const result = ref(null)
const bmiValue = ref(0)
const resultCard = ref(null)

const markerPos = computed(() => {
  const bmi = Number(bmiValue.value)
  if (bmi < 18.5) return Math.max(0, (bmi / 18.5) * 20)
  if (bmi < 25) return 20 + ((bmi - 18.5) / 6.5) * 30
  if (bmi < 30) return 50 + ((bmi - 25) / 5) * 25
  return Math.min(100, 75 + ((bmi - 30) / 10) * 25)
})

const idealWeight = computed(() => {
  const h = Number(height.value)
  if (!h) return 0
  const hm = h / 100
  const bmi = gender.value === 'male' ? 22 : 21
  return Math.round(hm * hm * bmi)
})

const weightRange = computed(() => {
  const h = Number(height.value)
  if (!h) return [0, 0]
  const hm = h / 100
  return [Math.round(hm * hm * 18.5), Math.round(hm * hm * 24.9)]
})

const devineWeight = computed(() => {
  const h = Number(height.value)
  if (!h || !gender.value) return 0
  const hInches = h / 2.54
  const base = gender.value === 'male' ? 50 : 45.5
  return Math.round(base + 2.3 * (hInches - 60) * 10) / 10
})

function calculate() {
  const h = Number(height.value)
  const w = Number(weight.value)
  if (!h || !w) return
  const hm = h / 100
  const bmi = w / (hm * hm)
  bmiValue.value = bmi.toFixed(1)
  let label, color
  if (bmi < 18.5) { label = 'نحيف'; color = '#3b82f6' }
  else if (bmi < 25) { label = 'وزن طبيعي'; color = '#10b981' }
  else if (bmi < 30) { label = 'وزن زائد'; color = '#f59e0b' }
  else if (bmi < 35) { label = 'سمنة درجة أولى'; color = '#f97316' }
  else if (bmi < 40) { label = 'سمنة درجة ثانية'; color = '#ef4444' }
  else { label = 'سمنة مفرطة'; color = '#dc2626' }
  result.value = { label, color }
  nextTick(() => {
    if (resultCard.value) {
      resultCard.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
</script>

<style scoped>
.app-page{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#1e293b;background:#f0f2f5;height:100dvh;height:-webkit-fill-available;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
*{margin:0;padding:0;box-sizing:border-box}

.app-bar{display:flex;align-items:center;padding:0 8px;height:56px;background:rgba(255,255,255,.92);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.06);flex-shrink:0;z-index:10}
.app-bar-back{width:44px;height:44px;border:none;background:none;border-radius:12px;display:grid;place-items:center;color:#475569;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent}
.app-bar-back:active{background:#f1f5f9}
.app-bar-title{flex:1;text-align:center;font-size:1rem;font-weight:800;color:#1e293b}
.app-bar-spacer{width:44px}

.app-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom,0)}

.bmi-hero{position:relative;overflow:hidden;background:linear-gradient(160deg,#0f172a 0%,#1e293b 100%);padding:40px 20px 36px;text-align:center}
.bmi-hero-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.bmi-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.25}.bmi-orb.o1{width:260px;height:260px;background:#10b981;top:-80px;right:-60px}.bmi-orb.o2{width:220px;height:220px;background:#0d9488;bottom:-60px;left:-50px}
.bmi-hero-inner{position:relative;max-width:600px;margin:0 auto}
.bmi-hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:5px 14px;border-radius:20px;font-size:.72rem;font-weight:600;color:#94a3b8;margin-bottom:14px}
.bmi-hero h1{font-size:1.7rem;font-weight:900;color:#fff;margin-bottom:8px}
.bmi-hero-hl{background:linear-gradient(135deg,#34d399,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.bmi-hero p{font-size:.88rem;color:#94a3b8}

.bmi-body{padding:20px 16px;padding-bottom:calc(20px + env(safe-area-inset-bottom,0))}

.bmi-card{background:linear-gradient(145deg,#ffffff 0%,#f8faff 100%);border-radius:20px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(17,80,201,.06);border:1px solid rgba(17,80,201,.08);margin-bottom:14px}
.bmi-gender-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.bmi-gender{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:14px;border:2px solid #e5e7eb;background:#f8fafc;font-size:.88rem;font-weight:700;color:#64748b;cursor:pointer;font-family:inherit;transition:all .2s;min-height:50px;-webkit-tap-highlight-color:transparent}
.bmi-gender:active{transform:scale(.97)}
.bmi-gender.active{border-color:#0d9488;background:#eff6ff;color:#0d9488}
.bmi-field{margin-bottom:14px}
.bmi-field label{display:block;font-size:.8rem;font-weight:700;color:#475569;margin-bottom:6px}
.bmi-input-wrap{display:flex;align-items:center;gap:10px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:14px;padding:4px 16px 4px 4px;transition:all .2s}
.bmi-input-wrap:focus-within{border-color:#0d9488;background:#fff;box-shadow:0 0 0 3px rgba(17,80,201,.1)}
.bmi-input{flex:1;border:none;outline:none;font-size:1.1rem;font-weight:700;color:#1e293b;background:transparent;font-family:inherit;text-align:center;padding:12px 8px;direction:ltr;-webkit-appearance:none;appearance:none;-moz-appearance:textfield}
.bmi-input::-webkit-inner-spin-button,.bmi-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.bmi-unit{font-size:.82rem;font-weight:700;color:#94a3b8;padding:8px 12px;background:#e5e7eb;border-radius:10px}
.bmi-calc-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 4px 16px rgba(16,185,129,.3);min-height:50px;-webkit-tap-highlight-color:transparent;margin-top:6px}
.bmi-calc-btn:active{transform:scale(.98)}

.bmi-result-card{background:linear-gradient(145deg,#ffffff 0%,#f8faff 100%);border-radius:20px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(17,80,201,.06);border:1px solid rgba(17,80,201,.08);margin-bottom:14px}
.bmi-result-title{display:flex;align-items:center;gap:8px;font-size:.95rem;font-weight:800;margin-bottom:14px}
.bmi-result-header{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.bmi-result-circle{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;border:2px solid;flex-shrink:0}
.bmi-result-num{font-size:1.5rem;font-weight:900;line-height:1}
.bmi-result-label{font-size:.78rem;color:#94a3b8;font-weight:600}
.bmi-result-status{font-size:.95rem;font-weight:800}
.bmi-bar-wrap{position:relative;margin-bottom:6px}
.bmi-bar{display:flex;height:8px;border-radius:8px;overflow:hidden;gap:2px}
.bmi-bar-seg{flex:1}
.bmi-bar-marker{position:absolute;top:-5px;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #1e293b;box-shadow:0 2px 8px rgba(0,0,0,.2);transform:translateX(-50%);transition:left .5s ease}
.bmi-bar-labels{display:flex;justify-content:space-between;font-size:.72rem;color:#94a3b8;font-weight:600}

.bmi-ideal-list{display:flex;flex-direction:column;gap:8px}
.bmi-ideal-row{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#f0fdf4;border-radius:12px}
.bmi-ideal-row span{font-size:.82rem;color:#475569;font-weight:600}
.bmi-ideal-row strong{font-size:.92rem;font-weight:900;color:#059669}
.bmi-disclaimer{font-size:.72rem;color:#94a3b8;margin-top:12px;line-height:1.6}

.bmi-table{border-radius:12px;overflow:hidden;border:1px solid #f1f5f9}
.bmi-tbl-row{display:flex;justify-content:space-between;padding:11px 14px;font-size:.82rem;border-bottom:1px solid #f8fafc}
.bmi-tbl-row:last-child{border-bottom:none}
.bmi-tbl-row.hdr{background:#f8fafc;font-weight:700;color:#64748b;font-size:.75rem}
.bmi-tbl-row.ok{background:#f0fdf4;font-weight:700;color:#059669}

.about-app-badge{display:flex;align-items:center;justify-content:center;gap:10px;padding:24px 0 0;color:#94a3b8;font-size:.75rem;font-weight:600}
.badge-logo{width:36px;height:36px;border-radius:10px;object-fit:cover}

@media(max-width:480px){
  .bmi-hero{padding:28px 16px 24px}
  .bmi-hero h1{font-size:1.35rem}
  .bmi-hero p{font-size:.82rem}
  .bmi-card{padding:18px;border-radius:16px}
  .bmi-gender{padding:12px;font-size:.82rem;min-height:44px}
  .bmi-input{font-size:1rem}
  .bmi-result-card{padding:18px;border-radius:16px}
  .bmi-ideal-row{flex-wrap:wrap;gap:4px}
  .bmi-ideal-row span{font-size:.78rem}
  .bmi-ideal-row strong{font-size:.85rem}
  .bmi-bar-labels{font-size:.68rem}
  .bmi-disclaimer{font-size:.7rem}
  .bmi-hero-badge{font-size:.68rem;padding:4px 12px}
  .bmi-result-label{font-size:.72rem}
  .bmi-tbl-row{padding:9px 12px;font-size:.78rem}
}
</style>
