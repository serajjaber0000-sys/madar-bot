<template>
  <div class="fb-page">
    <nav class="fb-nav">
      <router-link to="/directory" class="fb-nav-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </router-link>
      <h1 class="fb-nav-title">المفضلة</h1>
      <div class="fb-nav-spacer"></div>
    </nav>

    <div class="fb-content">
      <div v-if="favDoctors.length === 0" class="fb-empty">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#cbd5e1" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h3>لم تضف أي طبيب للمفضلة بعد</h3>
        <p>تصفح الأطباء وأضف المفضلين لديك</p>
        <router-link to="/directory" class="fb-empty-link">تصفح الأطباء</router-link>
      </div>

      <div v-else class="fb-cards">
        <router-link v-for="doc in favDoctors" :key="doc.clinicId" :to="'/doctor/' + doc.clinicId" class="fb-card">
          <div class="fb-card-avatar" :style="{ background: getSpecialtyColor(doc.specialty) }">
            <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
            <span v-else>{{ (doc.doctor_name || '?').split(' ').map(n=>n[0]).join('').substring(0,2) }}</span>
          </div>
          <div class="fb-card-info">
            <h3>د. {{ doc.doctor_name || 'طبيب' }}</h3>
            <span class="fb-card-spec">{{ doc.specialty || 'عام' }}</span>
            <span v-if="doc.area" class="fb-card-area">{{ doc.area }}</span>
          </div>
          <div class="fb-card-right">
            <div v-if="doc.rating_avg" class="fb-card-rating">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {{ doc.rating_avg }}
            </div>
            <button class="fb-card-remove" @click.prevent="removeFav(doc.clinicId)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const favoriteIds = ref(JSON.parse(localStorage.getItem('madar_favorites') || '[]'))
const allDoctors = ref([])

const favDoctors = computed(() => {
  return allDoctors.value.filter(d => favoriteIds.value.includes(d.clinicId))
})

const specialtyColors = { 'باطنية':'#4f46e5','قلب':'#e11d48','أمراض قلب':'#e11d48','عظام':'#059669','جراحة':'#d97706','جراح عام':'#d97706','أطفال':'#0284c7','جلدية':'#7c3aed','نساء':'#db2777','توليد':'#db2777','عيون':'#0891b2','أسنان':'#0d9488','طب أسنان':'#0d9488','أنف وأذن':'#6366f1','مسالك بولية':'#0ea5e9','عصبية':'#8b5cf6','عام':'#475569','طب عام':'#475569','صيدلية':'#d69e1f' }
const defaultColors = ['#0d9488','#14b8a6','#d69e1f','#8b5cf6','#ec4899','#ef4444']

function getSpecialtyColor(spec) {
  if (!spec) return '#475569'
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(specialtyColors)) { if (lower.includes(key.toLowerCase())) return val }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultColors[Math.abs(h) % defaultColors.length]
}

function removeFav(clinicId) {
  favoriteIds.value = favoriteIds.value.filter(id => id !== clinicId)
  localStorage.setItem('madar_favorites', JSON.stringify(favoriteIds.value))
  allDoctors.value = allDoctors.value.filter(d => d.clinicId !== clinicId)
}

import { onMounted } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'

let unsubDoctors = null

onMounted(() => {
  if (favoriteIds.value.length > 0) {
    const cached = sessionStorage.getItem('madar_doctors_cache')
    if (cached) { try { allDoctors.value = JSON.parse(cached) } catch {} }
  }
  unsubDoctors = onSnapshot(collection(db, 'doctor_profiles'), (snap) => {
    const list = []
    snap.forEach(d => { const data = d.data(); if (data.is_public !== false) list.push({ id: d.id, ...data }) })
    allDoctors.value = list
    sessionStorage.setItem('madar_doctors_cache', JSON.stringify(list))
  }, () => {})
})
</script>

<style scoped>
.fb-page{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#1e293b;background:#f0f2f5;min-height:100vh;min-height:100dvh;padding-bottom:80px;-webkit-font-smoothing:antialiased}
*{margin:0;padding:0;box-sizing:border-box}
.fb-nav{position:sticky;top:0;z-index:100;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 12px rgba(15,118,110,.25);display:flex;align-items:center;padding:0 12px;height:56px}
.fb-nav-back{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff;text-decoration:none;transition:background .15s}
.fb-nav-back:active{background:rgba(255,255,255,.2)}
.fb-nav-title{flex:1;text-align:center;font:800 .95rem 'Segoe UI',sans-serif;color:#fff}
.fb-nav-spacer{width:40px}

.fb-content{padding:16px}
.fb-empty{text-align:center;padding:60px 20px;color:#94a3b8}
.fb-empty h3{font-size:1.05rem;font-weight:800;color:#475569;margin:16px 0 4px}
.fb-empty p{font-size:.88rem;margin-bottom:20px}
.fb-empty-link{display:inline-block;padding:12px 28px;border-radius:12px;background:#0d9488;color:#fff;text-decoration:none;font:700 .88rem 'Segoe UI',sans-serif}

.fb-cards{display:flex;flex-direction:column;gap:10px}
.fb-card{display:flex;align-items:center;gap:12px;padding:14px;background:#fff;border-radius:14px;border:1px solid #e5e7eb;text-decoration:none;color:inherit;transition:transform .15s;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.fb-card:active{transform:scale(.98)}
.fb-card-avatar{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:.9rem;flex-shrink:0;overflow:hidden}
.fb-card-avatar img{width:100%;height:100%;object-fit:cover}
.fb-card-info{flex:1;min-width:0}
.fb-card-info h3{font:800 .88rem 'Segoe UI',sans-serif;color:#1e293b;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fb-card-spec{font-size:.75rem;color:#64748b;font-weight:600;display:block}
.fb-card-area{font-size:.7rem;color:#94a3b8;display:block}
.fb-card-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.fb-card-rating{display:flex;align-items:center;gap:3px;font-size:.78rem;font-weight:700;color:#d97706}
.fb-card-remove{width:44px;height:44px;border-radius:10px;border:none;background:#fef2f2;color:#ef4444;display:grid;place-items:center;cursor:pointer;transition:background .15s}
.fb-card-remove:active{background:#fee2e2}
@media(max-width:480px){.fb-content{padding:12px}.fb-card{padding:12px}}
</style>
