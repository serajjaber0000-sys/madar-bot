<template>
  <div class="sw-root">
  <!-- ============ SPLASH ============ -->
  <div v-if="splashVisible" class="sp" :class="{ 'sp-exit': splashFading }" @click="skipSplash">
    <canvas ref="spCanvas" class="sp-canvas"></canvas>
    <div class="sp-overlay"></div>

    <div class="sp-content">
      <!-- Logo -->
      <div class="sp-logo-box">
        <div class="sp-logo-rings">
          <div class="sp-ring sp-ring-1"></div>
          <div class="sp-ring sp-ring-2"></div>
        </div>
        <img src="/logo.jpg" alt="مدار" class="sp-logo" />
      </div>

      <!-- Brand name -->
      <div class="sp-brand">
        <span class="sp-ch">مدار</span>
      </div>

      <!-- Divider line -->
      <div class="sp-divider" :class="{ show: showEl >= 0 }"></div>

      <!-- Tagline -->
      <p class="sp-tagline" :class="{ show: showEl >= 1 }">دليل الأطباء والعيادات الأول في العراق</p>

      <!-- Features: appear one by one -->
      <div class="sp-feats">
        <div v-for="(f, i) in spFeats" :key="i" class="sp-feat" :class="{ show: showEl >= i + 2 }">
          <div class="sp-feat-dot" :style="{ background: f.color }"></div>
          <span class="sp-feat-text">{{ f.text }}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="sp-stats" :class="{ show: showEl >= 6 }">
        <div class="sp-stat">
          <span class="sp-stat-val">+١٠٠٠</span>
          <span class="sp-stat-lbl">طبيب</span>
        </div>
        <div class="sp-stat-sep"></div>
        <div class="sp-stat">
          <span class="sp-stat-val">+٥٠٠</span>
          <span class="sp-stat-lbl">عيادة</span>
        </div>
        <div class="sp-stat-sep"></div>
        <div class="sp-stat">
          <span class="sp-stat-val">مجاني</span>
          <span class="sp-stat-lbl">للمرضى</span>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="sp-bar"><div class="sp-bar-fill" :style="{ width: splashProgress + '%' }"></div></div>

    <!-- Dots -->
    <div class="sp-dots">
      <span v-for="i in 7" :key="i" class="sp-dot" :class="{ on: showEl >= i - 1 }"></span>
    </div>

    <div class="sp-skip">اضغط للتخطي</div>
  </div>

  <!-- ============ MAIN CONTENT ============ -->
  <div class="tb">
    <!-- ============ NAV ============ -->
    <header class="tb-nav">
      <div class="tb-nav-inner">
        <router-link to="/" class="tb-logo">
          <img src="/logo.jpg" alt="مدار" class="tb-logo-img" />
          <span class="tb-logo-text">مدار</span>
        </router-link>

        <a href="https://www.instagram.com/medar.health?igsh=MTI5Y2ZwMTZuYmJpNw==" target="_blank" rel="noopener" class="tb-nav-ig" aria-label="انستغرام">
          <span class="tb-nav-ig-dots">
            <span class="tb-nav-ig-dot"></span>
            <span class="tb-nav-ig-dot"></span>
            <span class="tb-nav-ig-dot"></span>
          </span>
          <span class="tb-nav-ig-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="#fff" stroke-width="1.8"/>
              <circle cx="12" cy="12" r="5" stroke="#fff" stroke-width="1.8"/>
              <circle cx="18" cy="6" r="1.2" fill="#fff"/>
            </svg>
          </span>
          <span class="tb-nav-ig-text">تابعونا</span>
          <span class="tb-nav-ig-arrow">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </span>
        </a>

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
          <input :value="debouncedSearch" @input="onSearchInput" type="text" placeholder="أبحث عن .." class="tb-search-input" />
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
      <div class="tb-24h-header">
        <div class="tb-24h-header-right">
          <div class="tb-24h-header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h2 class="tb-24h-title">متاح الآن 24 ساعة</h2>
            <p class="tb-24h-sub">{{ openNow24h.length }} مرفق مفتوح حالياً</p>
          </div>
        </div>
        <span class="tb-24h-live-badge">
          <span class="tb-24h-live-dot"></span>
          مباشر
        </span>
      </div>
      <div class="tb-24h-scroll">
        <div v-for="doc in openNow24h" :key="doc.id || doc.clinicId" class="tb-24h-card" @click="openDoctor(doc)">
          <div class="tb-24h-avatar-wrap">
            <div class="tb-24h-avatar" :style="{ background: getSpecialtyColor(doc.specialty) }">
              <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
              <span v-else>{{ initials(doc.doctor_name) }}</span>
            </div>
            <span class="tb-24h-type-icon">{{ getTypeIcon24h(doc) }}</span>
            <span class="tb-24h-dot"></span>
          </div>
          <span class="tb-24h-name">{{ doc.doctor_name || 'مرفق' }}</span>
          <span class="tb-24h-type-label">{{ getTypeLabel24h(doc) }}</span>
        </div>
      </div>
    </section>

    <!-- ============ CATEGORY TABS ============ -->
    <section class="tb-categories">
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'doctors' }" @click="setCategory('doctors')">
        الأطباء
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'specialized' }" @click="setCategory('specialized')">
        عيادات تخصصية
      </button>
      <button class="tb-cat-btn" :class="{ active: activeCategory === 'laser' }" @click="setCategory('laser')">
        ليزر وتجميل
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
        <div v-for="(doc, idx) in visibleDoctors" :key="doc.id" class="tb-card" :class="{ 'tb-card-listing': doc.is_directory_listing, 'tb-card-facility': doc.facility_type && doc.facility_type !== 'doctor' }" :style="{ animationDelay: (idx * 0.04) + 's' }" @click="openDoctor(doc)">
          <button v-if="!doc.is_directory_listing" class="tb-card-fav" :class="{ active: isFavorite(doc.clinicId) }" @click.stop="toggleFavorite(doc.clinicId)">
            <svg viewBox="0 0 24 24" width="20" height="20" :fill="isFavorite(doc.clinicId) ? '#ef4444' : 'none'" :stroke="isFavorite(doc.clinicId) ? '#ef4444' : '#cbd5e1'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>

          <div class="tb-card-center">
            <div class="tb-card-top">
              <h3 class="tb-card-name">
                <template v-if="doc.facility_type === 'pharmacy'">
                  <span class="tb-card-type-emoji">💊</span> {{ doc.doctor_name || 'صيدلية' }}
                </template>
                <template v-else-if="doc.facility_type === 'hospital'">
                  <span class="tb-card-type-emoji">🏥</span> {{ doc.doctor_name || 'مستشفى' }}
                </template>
                <template v-else-if="doc.facility_type === 'lab'">
                  <span class="tb-card-type-emoji">🔬</span> {{ doc.doctor_name || 'مختبر' }}
                </template>
                <template v-else-if="doc.facility_type === 'physio'">
                  <span class="tb-card-type-emoji">🦴</span> {{ doc.doctor_name || 'علاج طبيعي' }}
                </template>
                <template v-else-if="doc.facility_type === 'laser'">
                  <span class="tb-card-type-emoji">✨</span> {{ doc.doctor_name || 'ليزر وتجميل' }}
                </template>
                <template v-else-if="doc.facility_type === 'specialized'">
                  <span class="tb-card-type-emoji">🏛️</span> {{ doc.doctor_name || 'عيادة تخصصية' }}
                </template>
                <template v-else>د. {{ doc.doctor_name || 'طبيب' }}</template>
                <svg v-if="doc.verified" class="tb-card-verified" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0d9488" stroke="#fff" stroke-width="1.5" /><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </h3>
              <span v-if="doc.is_24h" class="tb-card-badge-24h">24 ساعة</span>
              <span v-else-if="doc.is_directory_listing" class="tb-card-badge-listing">دليل</span>
              <span v-else class="tb-card-dot" :class="isAvailableNow(doc) ? 'avail' : 'closed'" :title="isAvailableNow(doc) ? 'متاح الآن' : 'مغلق حالياً'"></span>
            </div>
            <span class="tb-card-spec" :style="{ color: getFacilityColor(doc) }">{{ doc.specialty || (doc.facility_type === 'pharmacy' ? 'صيدلية' : doc.facility_type === 'hospital' ? 'مستشفى' : doc.facility_type === 'lab' ? 'مختبر' : doc.facility_type === 'physio' ? 'علاج طبيعي' : doc.facility_type === 'laser' ? 'ليزر وتجميل' : doc.facility_type === 'specialized' ? 'عيادة تخصصية' : 'طبيب عام') }}</span>
            <div class="tb-card-bottom">
              <span v-if="doc.governorate || doc.area" class="tb-card-location">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {{ doc.governorate || '' }}{{ doc.governorate && doc.area ? ' - ' : '' }}{{ doc.area || '' }}
              </span>
            </div>
          </div>

          <div class="tb-card-avatar" :style="{ background: getFacilityColor(doc) }">
            <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
            <span v-else-if="doc.facility_type === 'pharmacy'" style="font-size:1.5rem">💊</span>
            <span v-else-if="doc.facility_type === 'hospital'" style="font-size:1.5rem">🏥</span>
            <span v-else-if="doc.facility_type === 'lab'" style="font-size:1.5rem">🔬</span>
            <span v-else-if="doc.facility_type === 'physio'" style="font-size:1.5rem">🦴</span>
            <span v-else-if="doc.facility_type === 'laser'" style="font-size:1.5rem">✨</span>
            <span v-else-if="doc.facility_type === 'specialized'" style="font-size:1.5rem">🏛️</span>
            <span v-else>{{ initials(doc.doctor_name) }}</span>
          </div>
        </div>
      </div>

      <div v-if="!loading && filtered.length > visibleCount" class="tb-load-more">
        <button class="tb-load-more-btn" @click="loadMore">حمّل المزيد</button>
      </div>
    </section>

    <div class="tb-bottom-spacer"></div>

    <!-- ============ FOOTER ============ -->
    <footer class="tb-footer">
      <div class="tb-footer-inner">
        <div class="tb-footer-brand">
          <img src="/logo.jpg" alt="مدار" class="tb-footer-logo" />
          <span class="tb-footer-name">مدار</span>
        </div>
        <p class="tb-footer-copy">&copy; {{ new Date().getFullYear() }} مدار — دليل الأطباء والعيادات الطبية في العراق</p>
      </div>
    </footer>
  </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { doctorProfilesRepo, directoryListingsRepo } from '@/services/clinic'
import { collection, getDocs, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

const router = useRouter()

const splashVisible = ref(!sessionStorage.getItem('madar_splash_shown'))
const splashFading = ref(false)
const splashProgress = ref(0)
const showEl = ref(-1)
const spCanvas = ref(null)
let splashTimer = null
let spAnim = null
let spResize = null

const spFeats = [
  { text: 'ابحث عن طبيبك بسهولة', color: '#14b8a6' },
  { text: 'احجز موعدك في ثوانٍ', color: '#1f6feb' },
  { text: 'تابع حجوزاتك لحظة بلحظة', color: '#a78bfa' },
  { text: 'تواصل مع العيادة مباشرة', color: '#f59e0b' },
]

function skipSplash() { if (!splashFading.value) endSplash() }

function endSplash() {
  splashFading.value = true
  if (splashTimer) { clearInterval(splashTimer); splashTimer = null }
  if (spAnim) { cancelAnimationFrame(spAnim); spAnim = null }
  if (spResize) { window.removeEventListener('resize', spResize); spResize = null }
  setTimeout(() => { splashVisible.value = false }, 600)
}

function startSplash() {
  splashVisible.value = true
  showEl.value = -1
  splashProgress.value = 0
  nextTick(() => initSplashCanvas())

  const milestones = [
    { t: 500, el: 0 },
    { t: 1400, el: 1 },
    { t: 2200, el: 2 },
    { t: 3000, el: 3 },
    { t: 3700, el: 4 },
    { t: 4500, el: 5 },
    { t: 5200, el: 6 },
  ]

  const total = 7000
  let elapsed = 0
  splashTimer = setInterval(() => {
    elapsed += 40
    splashProgress.value = Math.min((elapsed / total) * 100, 100)
    for (const m of milestones) {
      if (elapsed >= m.t && showEl.value < m.el) showEl.value = m.el
    }
    if (elapsed >= total) {
      clearInterval(splashTimer)
      splashTimer = null
      endSplash()
    }
  }, 40)
}

function initSplashCanvas() {
  const canvas = spCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let W = 0, H = 0, stopped = false

  function resize() {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  spResize = resize
  window.addEventListener('resize', resize)

  const dots = []
  const n = Math.min(Math.floor((W * H) / 10000), 50)
  for (let i = 0; i < n; i++) {
    const blue = Math.random() > 0.4
    dots.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.3 + 0.08,
      c: blue ? '20,184,166' : '17,80,201',
    })
  }

  let tick = 0
  function loop() {
    if (stopped) return
    tick++
    ctx.clearRect(0, 0, W, H)
    for (const d of dots) {
      d.x += d.vx
      d.y += d.vy
      if (d.x < -5) d.x = W + 5
      if (d.x > W + 5) d.x = -5
      if (d.y < -5) d.y = H + 5
      if (d.y > H + 5) d.y = -5
      const g = 0.7 + Math.sin(tick * 0.015 + d.x * 0.005) * 0.3
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r * g, 0, 6.283)
      ctx.fillStyle = `rgba(${d.c},${d.a * g})`
      ctx.fill()
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x
        const dy = dots[i].y - dots[j].y
        const dd = dx * dx + dy * dy
        if (dd < 12000) {
          ctx.beginPath()
          ctx.moveTo(dots[i].x, dots[i].y)
          ctx.lineTo(dots[j].x, dots[j].y)
          ctx.strokeStyle = `rgba(148,163,184,${0.035 * (1 - dd / 12000)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
    spAnim = requestAnimationFrame(loop)
  }
  loop()
}

const loading = ref(true)
const directoryDocs = shallowRef([])
const subscribedDocs = shallowRef([])
const selectedGovernorate = ref('')
const specialty = ref('')
const selectedArea = ref('')
const searchQuery = ref('')
const debouncedSearch = ref('')
let searchTimer = null
const menuOpen = ref(false)
const filterOpen = ref(false)
const activeCategory = ref('doctors')
const favorites = ref(JSON.parse(localStorage.getItem('madar_favorites') || '[]'))
const visibleCount = ref(20)
const slides = shallowRef([])
const sliderIndex = ref(0)
const sliderPaused = ref(false)
const reviewData = ref([])
let sliderTimer = null
let touchStartX = 0

const governorates = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']

const categoryLabels = { doctors: 'أطباء مدار', specialized: 'عيادات تخصصية', laser: 'ليزر وتجميل', pharmacy: 'الصيدليات', hospital: 'المستشفيات', lab: 'المختبرات', physio: 'العلاج الطبيعي' }
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
  const listings = directoryDocs.value.map(d => ({ ...d, _source: 'listing' }))
  const subscribed = subscribedDocs.value.map(d => ({ ...d, _source: 'subscribed' }))
  const seen = new Set(subscribed.map(d => d.id))
  const merged = [...subscribed]
  for (const d of listings) { if (!seen.has(d.id)) merged.push(d) }
  return merged
})

const categoryList = computed(() => {
  return allDoctors.value.filter(d => {
    const ft = d.facility_type
    if (activeCategory.value === 'specialized') return !!d.is_specialized || ft === 'specialized'
    if (activeCategory.value === 'laser') return !!d.is_laser || ft === 'laser'
    if (activeCategory.value === 'pharmacy') return !!d.is_pharmacy || ft === 'pharmacy'
    if (activeCategory.value === 'lab') return !!d.is_lab || ft === 'lab'
    if (activeCategory.value === 'hospital') return !!d.is_hospital || ft === 'hospital'
    if (activeCategory.value === 'physio') return !!d.is_physio || ft === 'physio'
    return !d.is_lab && !d.is_hospital && !d.is_pharmacy && !d.is_physio && !d.is_laser && !d.is_specialized && ft !== 'pharmacy' && ft !== 'lab' && ft !== 'hospital' && ft !== 'physio' && ft !== 'laser' && ft !== 'specialized'
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
      const enabledDays = d.weekly_schedule.filter(day => day.enabled)
      if (enabledDays.length === 0) return false
      return enabledDays.every(day => day.from === '00:00' && day.to === '23:59')
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
  if (debouncedSearch.value.trim()) {
    const q = debouncedSearch.value.trim().toLowerCase()
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
function onSearchInput(e) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { debouncedSearch.value = e.target.value }, 300)
}

function resetAll() { selectedGovernorate.value = ''; specialty.value = ''; selectedArea.value = ''; searchQuery.value = ''; debouncedSearch.value = ''; filterOpen.value = false }

watch(selectedGovernorate, () => { if (selectedArea.value && !areas.value.includes(selectedArea.value)) selectedArea.value = '' })

function openDoctor(doc) {
  if (doc._source === 'subscribed' && doc.clinicId) {
    router.push('/doctor/' + doc.clinicId)
  } else {
    router.push('/listing/' + doc.id)
  }
}

function getTypeIcon24h(doc) {
  const ft = doc.facility_type
  if (ft === 'pharmacy') return '💊'
  if (ft === 'hospital') return '🏥'
  if (ft === 'lab') return '🔬'
  if (ft === 'physio') return '🦴'
  if (ft === 'laser') return '✨'
  if (ft === 'specialized') return '🏛️'
  return '🩺'
}

function getTypeLabel24h(doc) {
  const ft = doc.facility_type
  if (ft === 'pharmacy') return 'صيدلية'
  if (ft === 'hospital') return 'مستشفى'
  if (ft === 'lab') return 'مختبر'
  if (ft === 'physio') return 'علاج طبيعي'
  if (ft === 'laser') return 'ليزر وتجميل'
  if (ft === 'specialized') return 'عيادة تخصصية'
  return doc.specialty || 'طبيب'
}

function getFacilityColor(doc) {
  const ft = doc.facility_type
  if (ft === 'pharmacy') return '#d69e1f'
  if (ft === 'hospital') return '#e11d48'
  if (ft === 'lab') return '#0891b2'
  if (ft === 'physio') return '#7c3aed'
  if (ft === 'laser') return '#ec4899'
  if (ft === 'specialized') return '#0d9488'
  return getSpecialtyColor(doc.specialty)
}

function getFacilityBg(doc) {
  const ft = doc.facility_type
  if (ft === 'pharmacy') return 'linear-gradient(135deg,#fef3c7,#fde68a)'
  if (ft === 'hospital') return 'linear-gradient(135deg,#ffe4e6,#fecdd3)'
  if (ft === 'lab') return 'linear-gradient(135deg,#cffafe,#a5f3fc)'
  if (ft === 'physio') return 'linear-gradient(135deg,#ede9fe,#ddd6fe)'
  if (ft === 'laser') return 'linear-gradient(135deg,#fce7f3,#fbcfe8)'
  if (ft === 'specialized') return 'linear-gradient(135deg,#ccfbf1,#a7f3d0)'
  return ''
}
function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) { const dx = e.changedTouches[0].clientX - touchStartX; if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide() } }
function pauseSlider() { sliderPaused.value = true }
function resumeSlider() { sliderPaused.value = false }
function nextSlide() { if (slides.value.length <= 1) return; sliderIndex.value = (sliderIndex.value + 1) % slides.value.length }
function prevSlide() { if (slides.value.length <= 1) return; sliderIndex.value = (sliderIndex.value - 1 + slides.value.length) % slides.value.length }
function startSlider() { if (sliderTimer) clearInterval(sliderTimer); if (slides.value.length <= 1) return; sliderTimer = setInterval(() => { if (!sliderPaused.value) nextSlide() }, 5000) }

function getDeviceId() {
  let id = localStorage.getItem('madar_device_id')
  if (!id) { id = 'd_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36); localStorage.setItem('madar_device_id', id) }
  return id
}

async function trackVisit() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const visitKey = 'madar_visits'
    const raw = localStorage.getItem(visitKey)
    const data = raw ? JSON.parse(raw) : { total: 0, today: 0, todayDate: '' }
    if (data.todayDate !== today) { data.today = 1; data.todayDate = today } else { data.today++ }
    data.total++
    localStorage.setItem(visitKey, JSON.stringify(data))
  } catch {}
}

onMounted(async () => {
  if (!sessionStorage.getItem('madar_splash_shown')) {
    sessionStorage.setItem('madar_splash_shown', '1')
    startSplash()
  }

  trackVisit()

  const cached = sessionStorage.getItem('madar_doctors_cache')
  const cacheTime = sessionStorage.getItem('madar_doctors_cache_time')
  const cachedSub = sessionStorage.getItem('madar_subscribed_cache')
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 10 * 60 * 1000) {
    directoryDocs.value = JSON.parse(cached)
    if (cachedSub) subscribedDocs.value = JSON.parse(cachedSub)
    loading.value = false
  }

  const loadDirectory = getDocs(collection(db, 'directory_listings')).then(snap => {
    console.log('[Madar] directory_listings snapshot: size=' + snap.size)
    const list = []
    snap.forEach(d => {
      const data = d.data()
      console.log('[Madar] listing:', d.id, 'enabled:', data.enabled, 'name:', data.doctor_name || data.facility_type)
      if (data.enabled !== false) list.push({ id: d.id, ...data, is_directory_listing: true, is_subscribed: false })
    })
    directoryDocs.value = list
    sessionStorage.setItem('madar_doctors_cache', JSON.stringify(list))
    sessionStorage.setItem('madar_doctors_cache_time', String(Date.now()))
    if (loading.value) loading.value = false
  }).catch(e => { console.error('[Madar] directory_listings error:', e); if (loading.value) loading.value = false })

  const loadProfiles = getDocs(collection(db, 'doctor_profiles')).then(snap => {
    const list = []
    snap.forEach(d => {
      const data = d.data()
      if (data.is_public !== false) list.push({ id: d.id, ...data, is_directory_listing: false, is_subscribed: true })
    })
    subscribedDocs.value = list
    sessionStorage.setItem('madar_subscribed_cache', JSON.stringify(list))
    if (loading.value) loading.value = false
  }).catch(() => { if (loading.value) loading.value = false })

  const loadSliders = getDocs(collection(db, 'site_sliders')).then(snap => {
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
  }).catch(() => {})

  await Promise.allSettled([loadDirectory, loadProfiles, loadSliders])
  loading.value = false
})

onUnmounted(() => {
  if (sliderTimer) clearInterval(sliderTimer)
  if (splashTimer) clearInterval(splashTimer)
  if (spAnim) cancelAnimationFrame(spAnim)
  if (spResize) window.removeEventListener('resize', spResize)
})
</script>

<style scoped>
.tb{font-family:inherit;direction:rtl;color:#0f172a;background:#f4f7fa;min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.sw-root{min-height:100vh;min-height:100dvh}
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
.tb-mm-link{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;text-decoration:none;color:#334155;font:600 0.9rem 'Tajawal',sans-serif;transition:all 0.15s}
.tb-mm-link:active{background:#f1f5f9;color:#0d9488}
.tb-mm-login{color:#0d9488;border:1.5px solid #0d9488;margin-top:6px}
.tb-mm-divider{height:1px;background:#e2e8f0;margin:6px 0}
.tb-menu-fade-enter-active,.tb-menu-fade-leave-active{transition:all 0.2s ease}
.tb-menu-fade-enter-from,.tb-menu-fade-leave-to{opacity:0;transform:translateY(-10px)}

/* ============ SLIDER ============ */
.tb-slider-section{max-width:1100px;margin:0 auto;padding:12px 12px 0}
.tb-slider{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,0.12)}
.tb-slider-track{position:relative;width:100%;aspect-ratio:16/9;max-height:380px;background:#f0fdfa;border-radius:18px}
.tb-slider-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.6s ease;pointer-events:none;display:flex;align-items:center;justify-content:center;will-change:opacity}
.tb-slider-slide.tb-active{opacity:1;pointer-events:auto}
.tb-slider-slide img{max-width:100%;max-height:100%;object-fit:contain;display:block;border-radius:18px}
.tb-slider-link{display:block;position:relative;height:100%;display:flex;align-items:center;justify-content:center}
.tb-slide-overlay{position:absolute;bottom:0;left:0;right:0;padding:24px 20px;background:linear-gradient(transparent,rgba(0,0,0,0.55));color:#fff}
.tb-slide-title{font:800 1.1rem/1.3 'Tajawal',sans-serif;margin-bottom:2px}
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
.tb-search-input{flex:1;border:none;background:none;outline:none;font:600 0.85rem 'Tajawal',sans-serif;color:#0f172a;direction:rtl;padding:12px 0;min-width:0}
.tb-search-input::placeholder{color:#94a3b8;font-weight:500}

.tb-filter-panel{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;background:#fff;border-radius:14px;border:1.5px solid #e2e8f0;padding:10px;box-shadow:0 2px 10px rgba(0,0,0,0.04)}
.tb-fp-select{flex:1;min-width:110px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 10px;font:600 0.78rem 'Tajawal',sans-serif;color:#1e293b;direction:rtl;cursor:pointer;outline:none}
.tb-fp-select:focus{border-color:#0d9488}
.tb-fp-reset{display:inline-flex;align-items:center;gap:3px;padding:9px 14px;border-radius:10px;border:1px solid #fca5a5;background:#fef2f2;color:#ef4444;font:600 0.75rem 'Tajawal',sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0}
.tb-panel-fade-enter-active,.tb-panel-fade-leave-active{transition:all .2s ease}
.tb-panel-fade-enter-from,.tb-panel-fade-leave-to{opacity:0;transform:translateY(-6px)}

/* ============ CATEGORIES ============ */
.tb-categories{max-width:1100px;margin:0 auto;padding:10px 12px 0;display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tb-categories::-webkit-scrollbar{display:none}
.tb-cat-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 14px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;color:#334155;font:700 0.8rem 'Tajawal',sans-serif;cursor:pointer;transition:all .2s;min-height:46px;white-space:nowrap;flex-shrink:0}
.tb-cat-btn.active{background:#0d9488;border-color:#0d9488;color:#fff;box-shadow:0 4px 14px rgba(13,148,136,0.25)}

/* ============ SECTIONS ============ */
.tb-section{max-width:1100px;margin:0 auto;padding:14px 12px 0}
.tb-sec-header{text-align:right;margin-bottom:8px}
.tb-sec-header h2{font:800 0.95rem/1.2 'Tajawal',sans-serif;color:#0f172a}

.tb-avatar-scroll{display:flex;gap:14px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}
.tb-avatar-scroll::-webkit-scrollbar{display:none}
.tb-avatar-item{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:76px;max-width:76px;text-decoration:none;color:inherit;text-align:center;flex-shrink:0}
.tb-avatar-circle{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1rem;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.12);border:2.5px solid #fff;outline:1px solid #e2e8f0}
.tb-avatar-circle img{width:100%;height:100%;object-fit:cover}
.tb-avatar-name{font:700 0.72rem/1.2 'Tajawal',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
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
.tb-24h-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;background:linear-gradient(135deg,#064e3b 0%,#0d9488 50%,#14b8a6 100%);border-radius:16px;padding:14px 16px;box-shadow:0 4px 20px rgba(13,148,136,0.25)}
.tb-24h-header-right{display:flex;align-items:center;gap:10px}
.tb-24h-header-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);display:grid;place-items:center;flex-shrink:0}
.tb-24h-title{font:800 1rem/1.2 'Tajawal',sans-serif;color:#fff;margin:0}
.tb-24h-sub{font:500 0.72rem/1.2 'Tajawal',sans-serif;color:rgba(255,255,255,0.65);margin:2px 0 0}
.tb-24h-live-badge{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);border-radius:20px;padding:5px 12px;font:700 0.7rem 'Tajawal',sans-serif;color:#fff;flex-shrink:0}
.tb-24h-live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6);animation:livePulse 1.5s ease-in-out infinite}
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}

.tb-24h-scroll{display:flex;gap:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px}
.tb-24h-scroll::-webkit-scrollbar{display:none}
.tb-24h-card{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:88px;max-width:88px;text-decoration:none;color:inherit;text-align:center;flex-shrink:0;background:#fff;border-radius:14px;padding:12px 6px 10px;border:1.5px solid #e2e8f0;cursor:pointer;transition:all .2s}
.tb-24h-card:active{transform:scale(0.95);box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.tb-24h-avatar-wrap{position:relative;width:54px;height:54px}
.tb-24h-avatar{width:54px;height:54px;border-radius:14px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:0.85rem;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.12)}
.tb-24h-avatar img{width:100%;height:100%;object-fit:cover}
.tb-24h-type-icon{position:absolute;top:-4px;left:-4px;width:22px;height:22px;border-radius:7px;background:#fff;display:grid;place-items:center;font-size:0.7rem;box-shadow:0 2px 6px rgba(0,0,0,0.12);border:1.5px solid #f0fdfa}
.tb-24h-dot{position:absolute;bottom:0;right:0;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2.5px solid #fff;box-shadow:0 0 6px rgba(34,197,94,0.4)}
.tb-24h-name{font:700 0.7rem/1.2 'Tajawal',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.tb-24h-type-label{font:600 0.58rem/1 'Tajawal',sans-serif;color:#0d9488;background:#f0fdfa;border-radius:6px;padding:2px 6px}

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

.tb-card{background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,0.04);display:flex;align-items:center;gap:10px;padding:10px 12px;transition:all 0.2s ease;animation:cardIn 0.35s ease both;cursor:pointer;contain:layout style paint;will-change:transform}
@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.tb-card:hover{box-shadow:0 6px 18px rgba(0,0,0,0.08);border-color:#0d9488}
.tb-card:active{transform:scale(0.985)}

.tb-card-fav{background:none;border:none;padding:2px;cursor:pointer;transition:transform 0.15s;display:grid;place-items:center;flex-shrink:0}
.tb-card-fav:active{transform:scale(1.25)}
.tb-card-fav.active{animation:favPop 0.3s ease}
@keyframes favPop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}

.tb-card-center{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.tb-card-top{display:flex;align-items:center;gap:6px;min-width:0}
.tb-card-name{font:700 0.85rem/1.2 'Tajawal',sans-serif;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;display:flex;align-items:center;gap:4px}
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

.tb-card-facility{border-right:3px solid transparent}
.tb-card-facility:nth-child(n){border-right-color:#0d9488}
.tb-card-type-emoji{font-size:0.9rem;flex-shrink:0}

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
  .tb-slider-track{max-height:220px;border-radius:14px}
  .tb-slider{border-radius:14px}
  .tb-slider-slide img{border-radius:14px}
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
  .tb-slider-track{max-height:420px}
}

.tb-nav-ig{position:relative;display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06));border:1px solid rgba(255,255,255,0.18);text-decoration:none;color:#fff;flex-shrink:0;overflow:hidden;transition:all 0.3s}
.tb-nav-ig:hover{background:linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.12));transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.tb-nav-ig:active{transform:scale(0.97)}
.tb-nav-ig-dots{position:absolute;top:4px;left:6px;display:flex;gap:3px;opacity:0.5}
.tb-nav-ig-dot{width:3px;height:3px;border-radius:50%;background:#fff;animation:navIgDot 1.5s ease-in-out infinite}
.tb-nav-ig-dot:nth-child(2){animation-delay:0.3s}
.tb-nav-ig-dot:nth-child(3){animation-delay:0.6s}
@keyframes navIgDot{0%,100%{opacity:0.3;transform:scale(0.7)}50%{opacity:1;transform:scale(1.3)}}
.tb-nav-ig-icon{flex-shrink:0;width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,0.15);display:grid;place-items:center;animation:navIgPulse 2.5s ease-in-out infinite}
@keyframes navIgPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0.15)}50%{transform:scale(1.08);box-shadow:0 0 12px 3px rgba(255,255,255,0.08)}}
.tb-nav-ig-text{font:700 0.7rem/1 'Tajawal',sans-serif;white-space:nowrap}
.tb-nav-ig-arrow{flex-shrink:0;transition:transform 0.25s}
.tb-nav-ig:hover .tb-nav-ig-arrow{transform:translate(-2px,2px)}

/* ============ FOOTER ============ */
.tb-footer{margin-top:20px;border-top:1px solid #e2e8f0;background:#f8fafc}
.tb-footer-inner{max-width:1100px;margin:0 auto;padding:20px 16px;display:flex;align-items:center;justify-content:space-between;direction:rtl}
.tb-footer-brand{display:flex;align-items:center;gap:8px}
.tb-footer-logo{width:28px;height:28px;border-radius:8px;object-fit:cover}
.tb-footer-name{font:800 1rem/1 'Segoe UI',sans-serif;color:#0d9488}
.tb-footer-copy{font:500 0.75rem/1 'Tajawal',sans-serif;color:#94a3b8;margin:0}

@media(max-width:480px){
  .tb-nav-ig-text{display:none}
  .tb-nav-ig{padding:6px 8px}
  .tb-footer-inner{flex-direction:column;gap:8px;text-align:center}
}

/* ============ SPLASH ============ */
.sp{position:fixed;inset:0;z-index:9999;background:#0F1117;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;transition:opacity .6s cubic-bezier(.4,0,.2,1),transform .6s cubic-bezier(.4,0,.2,1)}
.sp-exit{opacity:0;transform:scale(1.05);pointer-events:none}
.sp-canvas{position:absolute;inset:0;z-index:0}
.sp-overlay{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 50% 40%,rgba(20,184,166,0.08) 0%,transparent 60%);pointer-events:none}

/* Content */
.sp-content{position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 24px}

/* Logo */
.sp-logo-box{position:relative;width:120px;height:120px;margin-bottom:20px}
.sp-logo{width:120px;height:120px;border-radius:32px;object-fit:cover;position:relative;z-index:2;box-shadow:0 0 60px rgba(20,184,166,0.25),0 0 30px rgba(17,80,201,0.15),0 20px 50px rgba(0,0,0,0.5);animation:spLogoIn .8s cubic-bezier(.16,1,.3,1) both}
.sp-logo-rings{position:absolute;inset:0;z-index:1}
.sp-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(20,184,166,0.12);top:50%;left:50%;transform:translate(-50%,-50%)}
.sp-ring-1{width:150px;height:150px;animation:spRing 4s ease-in-out infinite}
.sp-ring-2{width:190px;height:190px;border-color:rgba(17,80,201,0.08);animation:spRing 4s ease-in-out infinite .8s}
@keyframes spLogoIn{from{opacity:0;transform:scale(0.3) translateY(20px);filter:blur(8px)}to{opacity:1;transform:scale(1) translateY(0);filter:blur(0)}}
@keyframes spRing{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.3}50%{transform:translate(-50%,-50%) scale(1.1);opacity:.7}}

/* Brand name */
.sp-brand{margin-bottom:16px}
.sp-ch{font-size:3.2rem;font-weight:900;color:#fff;letter-spacing:-2px;display:inline-block;animation:spCh .6s cubic-bezier(.16,1,.3,1) .2s both}
@keyframes spCh{from{opacity:0;filter:blur(8px);transform:translateY(12px)}to{opacity:1;filter:blur(0);transform:translateY(0)}}

/* Divider */
.sp-divider{width:0;height:2px;background:linear-gradient(90deg,transparent,#14b8a6,transparent);margin-bottom:14px;transition:width .8s cubic-bezier(.16,1,.3,1)}
.sp-divider.show{width:100px}

/* Tagline */
.sp-tagline{font-size:clamp(.9rem,2.8vw,1.2rem);font-weight:600;color:rgba(255,255,255,0.45);margin:0 0 28px;opacity:0;transform:translateY(12px);transition:all .5s cubic-bezier(.16,1,.3,1)}
.sp-tagline.show{opacity:1;transform:translateY(0)}

/* Features */
.sp-feats{display:flex;flex-direction:column;gap:12px;margin-bottom:28px;width:100%;max-width:320px}
.sp-feat{display:flex;align-items:center;gap:12px;opacity:0;transform:translateX(30px);transition:all .45s cubic-bezier(.16,1,.3,1)}
.sp-feat.show{opacity:1;transform:translateX(0)}
.sp-feat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;box-shadow:0 0 10px currentColor}
.sp-feat-text{font-size:.88rem;font-weight:700;color:rgba(255,255,255,0.85);white-space:nowrap}

/* Stats */
.sp-stats{display:flex;align-items:center;gap:20px;opacity:0;transform:translateY(12px);transition:all .5s cubic-bezier(.16,1,.3,1)}
.sp-stats.show{opacity:1;transform:translateY(0)}
.sp-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
.sp-stat-val{font-size:1.1rem;font-weight:900;background:linear-gradient(135deg,#14b8a6,#1f6feb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sp-stat-lbl{font-size:.65rem;font-weight:600;color:rgba(255,255,255,0.3)}
.sp-stat-sep{width:1px;height:24px;background:rgba(255,255,255,0.08)}

/* Progress bar */
.sp-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.04);z-index:10}
.sp-bar-fill{height:100%;background:linear-gradient(90deg,#14b8a6,#1f6feb);transition:width .04s linear;box-shadow:0 0 10px rgba(20,184,166,0.4)}

/* Dots */
.sp-dots{position:absolute;bottom:44px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10}
.sp-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.1);transition:all .3s ease}
.sp-dot.on{background:#14b8a6;box-shadow:0 0 6px rgba(20,184,166,0.5);transform:scale(1.3)}

/* Skip */
.sp-skip{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:.68rem;font-weight:600;color:rgba(255,255,255,0.12);z-index:10;white-space:nowrap}

/* Mobile */
@media(max-width:480px){
  .sp-logo{width:96px;height:96px;border-radius:26px}
  .sp-logo-box{width:96px;height:96px}
  .sp-ring-1{width:125px;height:125px}
  .sp-ring-2{width:155px;height:155px}
  .sp-ch{font-size:2.6rem}
  .sp-feats{max-width:280px}
  .sp-stat-val{font-size:1rem}
}
</style>