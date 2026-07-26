<template>
  <div class="tb">
    <!-- ============ NAV ============ -->
    <header class="tb-nav">
      <div class="tb-nav-inner">
        <router-link to="/" class="tb-logo">
          <img src="/logo.jpg" alt="مدار" class="tb-logo-img" />
          <span class="tb-logo-text">مدار</span>
        </router-link>

        <button class="tb-hamburger" @click="menuOpen = !menuOpen" aria-label="القائمة">
          <svg v-if="!menuOpen" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <transition name="tb-menu-fade">
        <div v-if="menuOpen" class="tb-mobile-menu" @click.self="menuOpen = false">
          <router-link to="/about" class="tb-mm-link" @click="menuOpen = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            من نحن
          </router-link>
          <router-link to="/contact" class="tb-mm-link" @click="menuOpen = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            تواصل معنا
          </router-link>
          <div class="tb-mm-divider"></div>
          <router-link to="/login" class="tb-mm-link tb-mm-login" @click="menuOpen = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            دخول نظام مدار
          </router-link>
        </div>
      </transition>
    </header>

    <!-- ============ SLIDER / PROMO BANNER ============ -->
    <section v-if="slides.length" class="tb-slider-section">
      <div class="tb-slider" @mouseenter="pauseSlider" @mouseleave="resumeSlider" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <div class="tb-slider-track">
          <div v-for="(slide, idx) in slides" :key="slide.id" :class="['tb-slider-slide', idx === sliderIndex && 'tb-active']">
            <a v-if="slide.link_url" :href="slide.link_url" :target="slide.link_target || '_self'" class="tb-slider-link"><img :src="slide.image_url" :alt="slide.title" /></a>
            <img v-else :src="slide.image_url" :alt="slide.title" />
          </div>
        </div>
        <div v-if="slides.length > 1" class="tb-slider-dots">
          <button v-for="(_, idx) in slides" :key="idx" :class="['tb-slider-dot', idx === sliderIndex && 'active']" @click.stop="sliderIndex = idx"></button>
        </div>
      </div>
    </section>

    <!-- ============ SEARCH BAR ============ -->
    <section class="tb-search-section">
      <div class="tb-search-bar">
        <button class="tb-filter-btn" :class="{ active: filterOpen || hasActiveFilters }" @click="filterOpen = !filterOpen">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M7 12h10M10 19h4" /></svg>
          بحث دقيق
        </button>
        <div class="tb-search-input-wrap">
          <input v-model="searchQuery" type="text" placeholder="أبحث عن .." class="tb-search-input" />
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
      </div>

      <transition name="tb-panel-fade">
        <div v-if="filterOpen" class="tb-filter-panel">
          <select v-model="selectedGovernorate" class="tb-fp-select">
            <option value="">المحافظة</option>
            <option v-for="g in governorates" :key="g" :value="g">{{ g }}</option>
          </select>
          <select v-model="selectedArea" class="tb-fp-select">
            <option value="">المنطقة</option>
            <option v-for="a in areas" :key="a" :value="a">{{ a }}</option>
          </select>
          <select v-model="specialty" class="tb-fp-select">
            <option value="">التخصص</option>
            <option v-for="s in specialties" :key="s" :value="s">{{ s }}</option>
          </select>
          <button v-if="hasActiveFilters" class="tb-fp-reset" @click="resetAll">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            مسح
          </button>
        </div>
      </transition>
    </section>

    <!-- ============ 24H SECTION ============ -->
    <section v-if="openNow24h.length" class="tb-section">
      <div class="tb-sec-header"><h2>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2" style="margin-left:4px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        أطباء وعيادات 24 ساعة
      </h2></div>
      <div class="tb-24h-scroll">
        <router-link v-for="doc in openNow24h" :key="doc.clinicId" :to="'/doctor/' + doc.clinicId" class="tb-24h-card">
          <div class="tb-24h-avatar" :style="{ background: getSpecialtyColor(doc.specialty) }">
            <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
            <span v-else>{{ initials(doc.doctor_name) }}</span>
            <span class="tb-24h-dot"></span>
          </div>
          <span class="tb-24h-name">{{ doc.doctor_name || 'طبيب' }}</span>
          <span class="tb-24h-spec">{{ doc.specialty || 'عام' }}</span>
        </router-link>
      </div>
    </section>

    <!-- ============ CATEGORY TABS ============ -->
    <section class="tb-categories">
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'doctors' }" @click="setCategory('doctors')">
        الأطباء
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'pharmacy' }" @click="setCategory('pharmacy')">
        الصيدليات
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'hospital' }" @click="setCategory('hospital')">
        المستشفيات
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'lab' }" @click="setCategory('lab')">
        المختبرات
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'physio' }" @click="setCategory('physio')">
        العلاج الطبيعي
      </button>
    </section>

    <!-- ============ FEATURED DOCTORS (avatar row) ============ -->
    <section v-if="featuredDoctors.length && activeCategory === 'doctors' && !hasActiveFilters && !searchQuery" class="tb-section">
      <div class="tb-avatar-scroll">
        <router-link v-for="doc in featuredDoctors" :key="doc.clinicId" :to="'/doctor/' + doc.clinicId" class="tb-avatar-item">
          <div class="tb-avatar-circle" :style="{ background: getSpecialtyColor(doc.specialty) }">
            <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
            <span v-else>{{ initials(doc.doctor_name) }}</span>
          </div>
          <span class="tb-avatar-name">{{ doc.doctor_name || 'طبيب' }}</span>
          <span class="tb-avatar-spec" :style="{ color: getSpecialtyColor(doc.specialty) }">{{ doc.specialty || 'عام' }}</span>
        </router-link>
      </div>
    </section>

    <!-- ============ MAIN LIST ============ -->
    <section class="tb-section tb-main-section">
      <div class="tb-sec-header" v-if="!loading"><h2>{{ categoryLabel }}</h2></div>

      <div v-if="loading" class="tb-list">
        <div v-for="n in 5" :key="n" class="tb-card-skeleton">
          <div class="tb-skel-avatar-col">
            <div class="tb-skeleton-pulse" style="width:52px;height:52px;border-radius:50%"></div>
          </div>
          <div class="tb-skel-body">
            <div class="tb-skeleton-pulse" style="width:60%;height:14px"></div>
            <div class="tb-skeleton-pulse" style="width:35%;height:11px"></div>
            <div class="tb-skeleton-pulse" style="width:45%;height:11px"></div>
          </div>
          <div class="tb-skeleton-pulse" style="width:18px;height:18px;border-radius:50%"></div>
        </div>
      </div>

      <div v-else-if="filtered.length === 0" class="tb-empty">
        <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#cbd5e1" stroke-width="1.2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" stroke-linecap="round" /></svg>
        <h3>لا يوجد نتائج</h3>
        <p>جرّب تغيير البحث أو الفلتر</p>
        <button class="tb-empty-reset" @click="resetAll">مسح البحث</button>
      </div>

      <div v-else class="tb-list">
        <div v-for="(doc, idx) in visibleDoctors" :key="doc.id" class="tb-card" :class="{ 'tb-card-listing': doc.is_directory_listing }" :style="{ animationDelay: (idx * 0.04) + 's' }" @click="openDoctor(doc)">
          <button v-if="!doc.is_directory_listing" class="tb-card-fav" :class="{ active: isFavorite(doc.clinicId) }" @click.stop="toggleFavorite(doc.clinicId)">
            <svg viewBox="0 0 24 24" width="20" height="20" :fill="isFavorite(doc.clinicId) ? '#ef4444' : 'none'" :stroke="isFavorite(doc.clinicId) ? '#ef4444' : '#cbd5e1'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>

          <div class="tb-card-center">
            <div class="tb-card-top">
              <h3 class="tb-card-name">
                <template v-if="!doc.facility_type || doc.facility_type === 'doctor'">د. {{ doc.doctor_name || 'طبيب' }}</template>
                <template v-else>{{ doc.doctor_name }}</template>
                <svg v-if="doc.verified" class="tb-card-verified" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0d9488" stroke="#fff" stroke-width="1.5" /><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </h3>
              <span v-if="doc.is_24h" class="tb-card-badge-24h">24 ساعة</span>
              <span v-else-if="doc.is_directory_listing" class="tb-card-badge-listing">غير مشترك</span>
              <span v-else class="tb-card-dot" :class="isAvailableNow(doc) ? 'avail' : 'closed'" :title="isAvailableNow(doc) ? 'متاح الآن' : 'مغلق حالياً'"></span>
            </div>
            <span class="tb-card-spec" :style="{ color: getSpecialtyColor(doc.specialty) }">{{ doc.specialty || (doc.facility_type === 'pharmacy' ? 'صيدلية' : doc.facility_type === 'hospital' ? 'مستشفى' : doc.facility_type === 'lab' ? 'مختبر' : doc.facility_type === 'physio' ? 'علاج طبيعي' : 'طبيب عام') }}</span>
            <div class="tb-card-bottom">
              <span v-if="doc.governorate || doc.area" class="tb-card-location">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {{ doc.governorate || '' }}{{ doc.governorate && doc.area ? ' - ' : '' }}{{ doc.area || '' }}
              </span>
            </div>
          </div>

          <div class="tb-card-avatar" :style="{ background: getSpecialtyColor(doc.specialty) }">
            <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
            <span v-else>{{ initials(doc.doctor_name) }}</span>
          </div>
        </div>
      </div>

      <div v-if="!loading && filtered.length > visibleCount" class="tb-load-more">
        <button class="tb-load-more-btn" @click="loadMore">حمّل المزيد</button>
      </div>
    </section>

    <div class="tb-bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue'
import { doctorProfilesRepo, directoryListingsRepo } from '@/services/clinic'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'

const loading = ref(true)
const doctors = shallowRef([])
const directoryDocs = shallowRef([])
const selectedGovernorate = ref('')
const specialty = ref('')
const selectedArea = ref('')
const searchQuery = ref('')
const menuOpen = ref(false)
const filterOpen = ref(false)
const activeCategory = ref('doctors') // 'doctors' | 'pharmacy' | 'hospital' | 'lab' | 'physio'
const favorites = ref(JSON.parse(localStorage.getItem('madar_favorites') || '[]'))
const visibleCount = ref(20)
const slides = shallowRef([])
const sliderIndex = ref(0)
const sliderPaused = ref(false)
let sliderTimer = null
let touchStartX = 0
let unsubDoctors = null
let unsubSliders = null
let unsubDirectory = null

const governorates = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']

const categoryLabels = { doctors: 'أطباء مدار', pharmacy: 'الصيدليات', hospital: 'المستشفيات', lab: 'المختبرات', physio: 'العلاج الطبيعي' }
const categoryLabel = computed(() => categoryLabels[activeCategory.value] || 'أطباء مدار')

const specialtyColors = { 'باطنية': '#4f46e5', 'قلب': '#e11d48', 'أمراض قلب': '#e11d48', 'عظام': '#059669', 'جراحة': '#d97706', 'جراح عام': '#d97706', 'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'توليد': '#db2777', 'عيون': '#0891b2', 'أسنان': '#0d9488', 'طب أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9', 'عصبية': '#8b5cf6', 'عام': '#475569', 'طب عام': '#475569', 'صيدلية': '#d69e1f' }
const defaultColors = ['#0d9488', '#14b8a6', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#f97316']

function getSpecialtyColor(spec) {
  if (!spec) return '#475569'
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(specialtyColors)) { if (lower.includes(key.toLowerCase())) return val }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultColors[Math.abs(h) % defaultColors.length]
}

function setCategory(cat) {
  activeCategory.value = cat
  visibleCount.value = 20
}

// base list restricted to the current category
const allDoctors = computed(() => {
  const subscribed = doctors.value.map(d => ({ ...d, _source: 'subscribed' }))
  const listings = directoryDocs.value.map(d => ({ ...d, _source: 'listing' }))
  return [...subscribed, ...listings]
})

const categoryList = computed(() => {
  return allDoctors.value.filter(d => {
    const ft = d.facility_type
    if (activeCategory.value === 'pharmacy') return !!d.is_pharmacy || ft === 'pharmacy'
    if (activeCategory.value === 'lab') return !!d.is_lab || ft === 'lab'
    if (activeCategory.value === 'hospital') return !!d.is_hospital || ft === 'hospital'
    if (activeCategory.value === 'physio') return !!d.is_physio || ft === 'physio'
    return !d.is_lab && !d.is_hospital && !d.is_pharmacy && !d.is_physio && ft !== 'pharmacy' && ft !== 'lab' && ft !== 'hospital' && ft !== 'physio'
  })
})

const specialties = computed(() => { const set = new Set(); categoryList.value.forEach(d => { if (d.specialty) set.add(d.specialty) }); return [...set].sort((a, b) => a.localeCompare(b, 'ar')) })
const areas = computed(() => {
  const set = new Set()
  const base = selectedGovernorate.value
    ? categoryList.value.filter(d => (d.governorate || '') === selectedGovernorate.value)
    : categoryList.value
  base.forEach(d => { if (d.area) set.add(d.area) })
  return [...set].sort((a, b) => a.localeCompare(b, 'ar'))
})
const featuredDoctors = computed(() => categoryList.value.filter(d => d.rating_count > 0 && d.rating_avg > 0).sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0) || (b.rating_count || 0) - (a.rating_count || 0)).slice(0, 12))
const openNow24h = computed(() => {
  return allDoctors.value.filter(d => {
    if (d.is_24h) return true
    if (d.weekly_schedule && d.weekly_schedule.length) {
      return d.weekly_schedule.every(day => {
        if (!day.enabled) return true
        return day.from === '00:00' && day.to === '23:59'
      })
    }
    return false
  }).slice(0, 12)
})

const hasActiveFilters = computed(() => !!(selectedGovernorate.value || selectedArea.value || specialty.value))

const filtered = computed(() => {
  let list = categoryList.value
  if (specialty.value) list = list.filter(d => d.specialty === specialty.value)
  if (selectedArea.value) list = list.filter(d => d.area === selectedArea.value)
  if (selectedGovernorate.value) list = list.filter(d => (d.governorate || d.area || '').includes(selectedGovernorate.value))
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(d => (d.doctor_name || '').toLowerCase().includes(q) || (d.specialty || '').toLowerCase().includes(q))
  }
  return list
})
const visibleDoctors = computed(() => filtered.value.slice(0, visibleCount.value))

const reviews = computed(() => reviewData.value.slice(0, 20))
const reviewLoop = computed(() => { const r = reviews.value; return [...r, ...r] })

function isAvailableNow(doc) {
  try {
    const now = new Date()
    const ct = now.getHours() * 60 + now.getMinutes()
    const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    if (doc.weekly_schedule && doc.weekly_schedule.length) {
      const today = doc.weekly_schedule.find(d => d.name === arabicDays[now.getDay()])
      if (today && today.enabled && today.from && today.to) {
        const [fh, fm] = today.from.split(':').map(Number); const [th, tm] = today.to.split(':').map(Number)
        return ct >= (fh * 60 + fm) && ct <= (th * 60 + tm)
      }
    }
    if (doc.clinic_open_time && doc.clinic_close_time) {
      const [oh, om] = doc.clinic_open_time.split(':').map(Number); const [ch, cm] = doc.clinic_close_time.split(':').map(Number)
      return ct >= (oh * 60 + om) && ct <= (ch * 60 + cm)
    }
    return false
  } catch { return false }
}

function initials(name) { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() }
function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '' } }
function isFavorite(id) { return favorites.value.includes(id) }
function toggleFavorite(id) { const i = favorites.value.indexOf(id); if (i > -1) favorites.value.splice(i, 1); else favorites.value.push(id); localStorage.setItem('madar_favorites', JSON.stringify(favorites.value)) }
function loadMore() { visibleCount.value += 20 }
function resetAll() { selectedGovernorate.value = ''; specialty.value = ''; selectedArea.value = ''; searchQuery.value = ''; filterOpen.value = false }

watch(selectedGovernorate, () => { if (selectedArea.value && !areas.value.includes(selectedArea.value)) selectedArea.value = '' })

function openDoctor(doc) {
  if (doc.is_directory_listing) {
    window.location.href = '/listing/' + doc.id
  } else {
    window.location.href = '/doctor/' + doc.clinicId
  }
}
function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) { const dx = e.changedTouches[0].clientX - touchStartX; if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide() } }
function pauseSlider() { sliderPaused.value = true }
function resumeSlider() { sliderPaused.value = false }
function nextSlide() { if (slides.value.length <= 1) return; sliderIndex.value = (sliderIndex.value + 1) % slides.value.length }
function prevSlide() { if (slides.value.length <= 1) return; sliderIndex.value = (sliderIndex.value - 1 + slides.value.length) % slides.value.length }
function startSlider() { if (sliderTimer) clearInterval(sliderTimer); if (slides.value.length <= 1) return; sliderTimer = setInterval(() => { if (!sliderPaused.value) nextSlide() }, 5000) }

onMounted(async () => {
  const cached = sessionStorage.getItem('madar_doctors_cache')
  const cacheTime = sessionStorage.getItem('madar_doctors_cache_time')
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 10 * 60 * 1000) {
    doctors.value = JSON.parse(cached)
    loading.value = false
  }

  unsubDoctors = onSnapshot(collection(db, 'doctor_profiles'), (snap) => {
    const list = []
    snap.forEach(d => { const data = d.data(); if (data.is_public !== false) list.push({ id: d.id, ...data }) })
    doctors.value = list
    sessionStorage.setItem('madar_doctors_cache', JSON.stringify(list))
    sessionStorage.setItem('madar_doctors_cache_time', String(Date.now()))
    loading.value = false
  }, () => { loading.value = false })

  unsubDirectory = onSnapshot(collection(db, 'directory_listings'), (snap) => {
    const list = []
    snap.forEach(d => {
      const data = d.data()
      if (data.enabled !== false) list.push({ id: d.id, ...data, is_directory_listing: true, is_subscribed: false })
    })
    directoryDocs.value = list
  }, () => {})

  unsubSliders = onSnapshot(collection(db, 'site_sliders'), (snap) => {
    const now = new Date().toISOString().split('T')[0]
    const loaded = []
    snap.forEach(d => {
      const data = d.data()
      if (data.enabled === false || (data.start_date && data.start_date > now) || (data.end_date && data.end_date < now)) return
      loaded.push({ id: d.id, ...data })
    })
    loaded.sort((a, b) => (a.order || 0) - (b.order || 0))
    slides.value = loaded
    startSlider()
  }, () => {})

  const sample = allDoctors.value.filter(d => !d.is_lab && !d.is_hospital && !d.is_pharmacy && !d.is_directory_listing).slice(0, 20)
  const revs = []
  for (const d of sample) {
    try {
      const { reviewsRepo } = await import('@/services/clinic')
      const r = await reviewsRepo.listByClinic(d.clinicId)
      r.forEach(x => { x._doctorName = d.doctor_name })
      revs.push(...r)
    } catch {}
  }
  revs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  reviewData.value = revs
})

onUnmounted(() => {
  if (sliderTimer) clearInterval(sliderTimer)
  if (unsubDoctors) unsubDoctors()
  if (unsubSliders) unsubSliders()
  if (unsubDirectory) unsubDirectory()
})
</script>

<style scoped>
.tb{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#0f172a;background:#f4f7fa;min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.tb *,.tb *::before,.tb *::after{margin:0;padding:0;box-sizing:border-box}
.tb button{font-family:inherit}

/* ============ NAV ============ */
.tb-nav{position:sticky;top:0;z-index:200;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 12px rgba(15,118,110,0.25)}
.tb-nav-inner{direction:ltr;max-width:1100px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between}
.tb-logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:#fff}
.tb-logo-img{width:34px;height:34px;border-radius:10px;object-fit:cover;flex-shrink:0}
.tb-logo-text{font-weight:800;font-size:1.3rem;color:#fff;letter-spacing:0.2px}
.tb-hamburger{background:rgba(255,255,255,0.14);border:none;border-radius:10px;width:38px;height:38px;cursor:pointer;color:#fff;display:grid;place-items:center;flex-shrink:0;transition:background .2s}
.tb-hamburger:active{background:rgba(255,255,255,0.28)}
.tb-mobile-menu{position:fixed;top:56px;left:0;right:0;background:rgba(255,255,255,0.99);backdrop-filter:blur(16px);border-bottom:1px solid #e2e8f0;padding:8px 16px;box-shadow:0 12px 40px rgba(0,0,0,0.12);z-index:199;direction:rtl}
.tb-mm-link{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;text-decoration:none;color:#334155;font:600 0.9rem 'Segoe UI',sans-serif;transition:all 0.15s}
.tb-mm-link:active{background:#f1f5f9;color:#0d9488}
.tb-mm-login{color:#0d9488;border:1.5px solid #0d9488;margin-top:6px}
.tb-mm-divider{height:1px;background:#e2e8f0;margin:6px 0}
.tb-menu-fade-enter-active,.tb-menu-fade-leave-active{transition:all 0.2s ease}
.tb-menu-fade-enter-from,.tb-menu-fade-leave-to{opacity:0;transform:translateY(-10px)}

/* ============ SLIDER ============ */
.tb-slider-section{max-width:1100px;margin:0 auto;padding:12px 12px 0}
.tb-slider{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,0.12)}
.tb-slider-track{position:relative;width:100%;aspect-ratio:16/9;max-height:320px}
.tb-slider-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.6s ease;pointer-events:none}
.tb-slider-slide.tb-active{opacity:1;pointer-events:auto}
.tb-slider-slide img{width:100%;height:100%;object-fit:cover;display:block}
.tb-slider-link{display:block;position:relative;height:100%}
.tb-slide-overlay{position:absolute;bottom:0;left:0;right:0;padding:24px 20px;background:linear-gradient(transparent,rgba(0,0,0,0.55));color:#fff}
.tb-slide-title{font:800 1.1rem/1.3 'Segoe UI',sans-serif;margin-bottom:2px}
.tb-slide-desc{font-size:0.82rem;opacity:0.9}
.tb-slider-btn{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:10px;border:none;background:rgba(0,0,0,0.32);backdrop-filter:blur(8px);display:grid;place-items:center;cursor:pointer;z-index:5;transition:background 0.2s}
.tb-slider-btn:hover{background:rgba(0,0,0,0.48)}
.tb-slider-prev{right:10px}
.tb-slider-next{left:10px}
.tb-slider-dots{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:5}
.tb-slider-dot{width:7px;height:7px;border-radius:50%;border:none;background:rgba(255,255,255,0.4);cursor:pointer;padding:6px;transition:all 0.3s}
.tb-slider-dot.active{background:#fff;width:20px;border-radius:3px}

/* ============ SEARCH ============ */
.tb-search-section{max-width:1100px;margin:0 auto;padding:12px 12px 0}
.tb-search-bar{display:flex;align-items:stretch;gap:8px;background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;padding:6px;box-shadow:0 2px 10px rgba(0,0,0,0.04)}
.tb-filter-btn{display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:10px;border:1.5px solid #d1e8e5;background:#f0faf9;color:#0d9488;font-weight:700;font-size:0.82rem;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .2s}
.tb-filter-btn.active{background:#0d9488;color:#fff;border-color:#0d9488}
.tb-search-input-wrap{flex:1;display:flex;flex-direction:row-reverse;align-items:center;gap:8px;background:#f8fafc;border-radius:10px;padding:0 14px;min-width:0}
.tb-search-input{flex:1;border:none;background:none;outline:none;font:600 0.85rem 'Segoe UI',sans-serif;color:#0f172a;direction:rtl;padding:12px 0;min-width:0}
.tb-search-input::placeholder{color:#94a3b8;font-weight:500}

.tb-filter-panel{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;padding:10px;box-shadow:0 2px 10px rgba(0,0,0,0.04)}
.tb-fp-select{flex:1;min-width:110px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 10px;font:600 0.78rem 'Segoe UI',sans-serif;color:#1e293b;direction:rtl;cursor:pointer;outline:none}
.tb-fp-select:focus{border-color:#0d9488}
.tb-fp-reset{display:inline-flex;align-items:center;gap:3px;padding:9px 14px;border-radius:10px;border:1px solid #fca5a5;background:#fef2f2;color:#ef4444;font:600 0.75rem 'Segoe UI',sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0}
.tb-panel-fade-enter-active,.tb-panel-fade-leave-active{transition:all .2s ease}
.tb-panel-fade-enter-from,.tb-panel-fade-leave-to{opacity:0;transform:translateY(-6px)}

/* ============ CATEGORIES ============ */
.tb-categories{max-width:1100px;margin:0 auto;padding:10px 12px 0;display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tb-categories::-webkit-scrollbar{display:none}
.tb-cat-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 14px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;color:#334155;font:700 0.8rem 'Segoe UI',sans-serif;cursor:pointer;transition:all .2s;min-height:46px;white-space:nowrap;flex-shrink:0}
.tb-cat-btn.active{background:#0d9488;border-color:#0d9488;color:#fff;box-shadow:0 4px 14px rgba(13,148,136,0.25)}

/* ============ SECTIONS ============ */
.tb-section{max-width:1100px;margin:0 auto;padding:14px 12px 0}
.tb-sec-header{text-align:right;margin-bottom:8px}
.tb-sec-header h2{font:800 0.95rem/1.2 'Segoe UI',sans-serif;color:#0f172a}

.tb-avatar-scroll{display:flex;gap:14px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}
.tb-avatar-scroll::-webkit-scrollbar{display:none}
.tb-avatar-item{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:76px;max-width:76px;text-decoration:none;color:inherit;text-align:center;flex-shrink:0}
.tb-avatar-circle{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1rem;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.12);border:2.5px solid #fff;outline:1px solid #e2e8f0}
.tb-avatar-circle img{width:100%;height:100%;object-fit:cover}
.tb-avatar-name{font:700 0.72rem/1.2 'Segoe UI',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.tb-avatar-spec{font-size:0.64rem;font-weight:700}

.tb-rev-track-outer{overflow:hidden;width:100%}
.tb-rev-track{display:flex;gap:10px;width:max-content;animation:tbRevMarquee 28s linear infinite}
.tb-rev-track.paused{animation-play-state:paused}
@keyframes tbRevMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.tb-rev-card{min-width:190px;max-width:210px;padding:12px 14px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;border-right:3px solid #0d9488;flex-shrink:0}
.tb-rev-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.tb-rev-avatar{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;display:grid;place-items:center;font-weight:800;font-size:0.7rem;flex-shrink:0}
.tb-rev-meta{display:flex;flex-direction:column}
.tb-rev-name{font-weight:700;font-size:0.72rem;color:#0f172a}
.tb-rev-stars{display:flex;gap:1px}
.tb-rev-comment{font-size:0.72rem;color:#475569;line-height:1.5;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tb-rev-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f1f5f9;padding-top:6px}
.tb-rev-doctor{font-size:0.65rem;font-weight:700;color:#0d9488}
.tb-rev-date{font-size:0.66rem;color:#94a3b8}

/* ============ 24H SECTION ============ */
.tb-24h-scroll{display:flex;gap:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}
.tb-24h-scroll::-webkit-scrollbar{display:none}
.tb-24h-card{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:80px;max-width:80px;text-decoration:none;color:inherit;text-align:center;flex-shrink:0}
.tb-24h-avatar{width:60px;height:60px;border-radius:16px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:0.9rem;overflow:hidden;position:relative;box-shadow:0 3px 12px rgba(0,0,0,0.1)}
.tb-24h-avatar img{width:100%;height:100%;object-fit:cover}
.tb-24h-dot{position:absolute;bottom:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 0 6px rgba(34,197,94,0.4)}
.tb-24h-name{font:700 0.7rem/1.2 'Segoe UI',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.tb-24h-spec{font-size:0.6rem;font-weight:600;color:#22c55e}

/* ============ LIST / SKELETON / EMPTY ============ */
.tb-list{display:flex;flex-direction:column;gap:8px}
.tb-main-section{padding-bottom:16px}

.tb-card-skeleton{background:#fff;border-radius:14px;border:1px solid #e2e8f0;display:flex;align-items:center;gap:10px;padding:12px}
.tb-skel-avatar-col{flex-shrink:0}
.tb-skel-body{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
.tb-skeleton-pulse{background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:skeleton 1.5s ease-in-out infinite;border-radius:4px}
@keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}

.tb-empty{text-align:center;padding:48px 20px;background:#fff;border-radius:16px;border:1px solid #e2e8f0}
.tb-empty h3{font-size:1rem;font-weight:800;color:#475569;margin:14px 0 4px}
.tb-empty p{color:#64748b;margin-bottom:16px;font-size:0.85rem}
.tb-empty-reset{padding:10px 24px;border-radius:10px;border:none;background:#0d9488;color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer}

.tb-card{background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,0.04);display:flex;align-items:center;gap:10px;padding:10px 12px;transition:all 0.2s ease;animation:cardIn 0.35s ease both;cursor:pointer}
@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.tb-card:hover{box-shadow:0 6px 18px rgba(0,0,0,0.08);border-color:#0d9488}
.tb-card:active{transform:scale(0.985)}

.tb-card-fav{background:none;border:none;padding:2px;cursor:pointer;transition:transform 0.15s;display:grid;place-items:center;flex-shrink:0}
.tb-card-fav:active{transform:scale(1.25)}
.tb-card-fav.active{animation:favPop 0.3s ease}
@keyframes favPop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}

.tb-card-center{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.tb-card-top{display:flex;align-items:center;gap:6px;min-width:0}
.tb-card-name{font:700 0.85rem/1.2 'Segoe UI',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;display:flex;align-items:center;gap:4px}
.tb-card-verified{width:16px;height:16px;flex-shrink:0}
.tb-card-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.tb-card-dot.avail{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.15)}
.tb-card-dot.closed{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,0.12)}
.tb-card-spec{font-size:0.72rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-card-bottom{display:flex;align-items:center;gap:10px;margin-top:1px}
.tb-card-location{display:flex;align-items:center;gap:3px;font-size:0.66rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-card-rating{display:flex;align-items:center;gap:2px;font-size:0.7rem;font-weight:700;color:#d97706;flex-shrink:0}

.tb-card-avatar{width:54px;height:54px;border-radius:50%;overflow:hidden;display:grid;place-items:center;color:#fff;font-weight:800;font-size:0.9rem;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.tb-card-avatar img{width:100%;height:100%;object-fit:cover;background:#fff}

.tb-card-listing{border-right:3px solid #d69e1f}
.tb-card-badge-listing{font-size:0.6rem;font-weight:800;background:linear-gradient(135deg,#d69e1f,#b45309);color:#fff;padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0}
.tb-card-badge-24h{font-size:0.6rem;font-weight:800;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0}

.tb-load-more{text-align:center;padding:22px 0}
.tb-load-more-btn{padding:12px 40px;border-radius:12px;border:2px solid #0d9488;background:#fff;color:#0d9488;font-weight:800;font-size:0.88rem;cursor:pointer;transition:all 0.25s}
.tb-load-more-btn:hover{background:#0d9488;color:#fff;box-shadow:0 4px 16px rgba(13,148,136,0.2)}
.tb-load-more-btn:active{transform:scale(0.97)}
.tb-bottom-spacer{height:80px}

/* ============ RESPONSIVE ============ */
@media(min-width:769px){
  .tb-mobile-menu{display:none!important}
  .tb-nav-inner{padding:0 24px}
  .tb-slider-section{padding:16px 24px 0}
  .tb-search-section{padding:16px 24px 0}
  .tb-categories{padding:12px 24px 0}
  .tb-section{padding:18px 24px 0}
  .tb-card{padding:12px 16px}
  .tb-card-avatar{width:58px;height:58px}
  .tb-card-name{font-size:0.9rem}
}

@media(min-width:1024px){
  .tb-list{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
}

@media(max-width:480px){
  .tb-nav-inner{height:52px;padding:0 14px}
  .tb-logo-text{font-size:1.15rem}
  .tb-slider-section{padding:10px 10px 0}
  .tb-slider-track{max-height:190px}
  .tb-search-section{padding:10px 10px 0}
  .tb-filter-btn{padding:0 12px;font-size:0.76rem}
  .tb-search-input{font-size:0.8rem;padding:10px 0}
  .tb-categories{padding:8px 10px 0}
  .tb-cat-btn{font-size:0.76rem;padding:11px 8px;min-height:42px}
  .tb-section{padding:10px 10px 0}
  .tb-avatar-circle{width:54px;height:54px}
  .tb-avatar-item{min-width:68px;max-width:68px}
  .tb-rev-card{min-width:170px;max-width:190px;padding:9px 11px}
  .tb-card{padding:9px 10px;gap:8px}
  .tb-card-avatar{width:48px;height:48px}
  .tb-card-name{font-size:0.8rem}
}

@media(min-width:1200px){
  .tb-slider-track{max-height:380px}
}
</style>