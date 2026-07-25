<template>
  <div class="dp">
    <nav class="dp-nav">
      <div class="dp-nav-inner">
        <router-link to="/directory" class="dp-back-btn" aria-label="العودة">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l7-7-7-7"/>
          </svg>
        </router-link>
      </div>
    </nav>

    <div v-if="loading" class="dp-skeleton-wrap">
      <div class="dp-skeleton-hero">
        <div class="dp-sk sk-circle"></div>
        <div class="dp-sk-lines">
          <div class="dp-sk sk-line-w60"></div>
          <div class="dp-sk sk-line-w40"></div>
          <div class="dp-sk sk-line-w80"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!profile" class="dp-notfound">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#cbd5e1" stroke-width="1">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/>
      </svg>
      <h2>الطبيب غير موجود</h2>
      <p>الرابط غير صالح أو تم حذف هذا التسجيل</p>
      <router-link to="/directory" class="dp-nf-btn">العودة لدليل الأطباء</router-link>
    </div>

    <template v-else>
      <section class="lp-hero" :style="{ '--accent': accentColor }">
        <div class="lp-hero-bg">
          <div class="lp-hero-orb lp-hero-orb--1"></div>
          <div class="lp-hero-orb lp-hero-orb--2"></div>
        </div>
        <div class="lp-hero-inner">
          <div class="lp-hero-card">
            <div class="lp-hero-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              طبيب غير مشترك في مدار
            </div>
            <div class="lp-hero-top">
              <div class="lp-avatar" :style="{ background: profile.photoUrl ? 'none' : accentColor }">
                <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="" loading="lazy" />
                <span v-else class="lp-avatar-initials">{{ initials }}</span>
              </div>
              <div class="lp-hero-info">
                <span class="lp-hero-spec" :style="{ color: accentColor }">{{ profile.specialty || 'طبيب عام' }}</span>
                <h1 class="lp-hero-name">
                  د. {{ profile.doctor_name || 'طبيب' }}
                  <span v-if="profile.verified" class="lp-verified-badge">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#0d9488"/>
                      <path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </h1>
                <div class="lp-hero-meta">
                  <span v-if="profile.area || profile.governorate" class="lp-meta-item">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ profile.governorate || '' }}{{ profile.governorate && profile.area ? ' - ' : '' }}{{ profile.area || '' }}
                  </span>
                </div>
                <div class="lp-hero-rating" v-if="profile.rating_count > 0">
                  <span class="lp-stars-static">
                    <svg v-for="s in 5" :key="s" viewBox="0 0 24 24" width="15" height="15" :fill="s <= Math.round(profile.rating_avg) ? '#f59e0b' : 'none'" :stroke="s <= Math.round(profile.rating_avg) ? '#f59e0b' : 'rgba(255,255,255,0.4)'" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </span>
                  <span class="lp-rating-num">{{ profile.rating_avg }}</span>
                  <span class="lp-rating-count">{{ profile.rating_count }} تقييم</span>
                </div>
              </div>
            </div>

            <div class="lp-hero-actions">
              <a v-if="whatsappNumber" :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="lp-action-btn lp-action-wa">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>واتساب</span>
              </a>
              <a v-if="profile.phone" :href="'tel:' + profile.phone" class="lp-action-btn lp-action-call">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>اتصال</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="lp-body">
        <div class="lp-section" v-if="profile.doctor_bio">
          <h3 class="lp-section-title">نبذة عن الطبيب</h3>
          <p class="lp-bio-text">{{ profile.doctor_bio }}</p>
        </div>

        <div class="lp-section" v-if="profile.address">
          <h3 class="lp-section-title">العنوان</h3>
          <div class="lp-info-row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d9488" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{{ profile.address }}</span>
          </div>
        </div>

        <div class="lp-section" v-if="profile.phone || profile.whatsapp">
          <h3 class="lp-section-title">التواصل</h3>
          <div class="lp-contact-grid">
            <a v-if="profile.phone" :href="'tel:' + profile.phone" class="lp-contact-card">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0d9488" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <div><span class="lp-contact-label">الهاتف</span><span class="lp-contact-value">{{ profile.phone }}</span></div>
            </a>
            <a v-if="profile.whatsapp" :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="lp-contact-card">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div><span class="lp-contact-label">واتساب</span><span class="lp-contact-value">{{ profile.whatsapp }}</span></div>
            </a>
          </div>
        </div>

        <div class="lp-section" v-if="profile.clinic_open_time || profile.clinic_close_time">
          <h3 class="lp-section-title">مواعيد العمل</h3>
          <div class="lp-schedule-row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ profile.clinic_open_time }} — {{ profile.clinic_close_time }}</span>
          </div>
        </div>

        <div class="lp-subscribe-cta">
          <div class="lp-cta-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </div>
          <h3>أنت طبيب وتريد الانضمام؟</h3>
          <p>سجّل عيادتك الآن واستفد من الحجز الإلكتروني وإدارة المرضى</p>
          <a href="https://t.me/Madar_system" target="_blank" class="lp-cta-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#0d9488" style="margin-left:6px"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            سجّل الآن عبر تليجرام
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'

const route = useRoute()
const loading = ref(true)
const profile = ref(null)
let unsub = null

const listingId = computed(() => route.params.listingId)

const specialtyColors = { 'باطنية': '#4f46e5', 'قلب': '#e11d48', 'عظام': '#059669', 'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'عيون': '#0891b2', 'أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9', 'عصبية': '#8b5cf6', 'عام': '#475569', 'طب عام': '#475569', 'صيدلية': '#d69e1f' }
const defaultColors = ['#0d9488', '#14b8a6', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444']

const accentColor = computed(() => {
  const spec = profile.value?.specialty || ''
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(specialtyColors)) { if (lower.includes(key.toLowerCase())) return val }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultColors[Math.abs(h) % defaultColors.length]
})

const initials = computed(() => {
  const name = profile.value?.doctor_name || ''
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
})

const whatsappNumber = computed(() => {
  const num = profile.value?.whatsapp || profile.value?.phone || ''
  return num.replace(/[^0-9]/g, '')
})

onMounted(() => {
  if (!listingId.value) { loading.value = false; return }
  unsub = onSnapshot(doc(db, 'directory_listings', listingId.value), (snap) => {
    if (snap.exists()) {
      profile.value = { id: snap.id, ...snap.data() }
    } else {
      profile.value = null
    }
    loading.value = false
  }, () => { loading.value = false })
})

onUnmounted(() => { if (unsub) unsub() })
</script>

<style scoped>
.dp{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#0f172a;background:#f4f7fa;min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased}
.dp *,.dp *::before,.dp *::after{margin:0;padding:0;box-sizing:border-box}
.dp button,.dp a{font-family:inherit}

.dp-nav{position:sticky;top:0;z-index:200;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 12px rgba(15,118,110,0.25)}
.dp-nav-inner{max-width:600px;margin:0 auto;padding:0 16px;height:52px;display:flex;align-items:center}
.dp-back-btn{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,0.14);color:#fff;text-decoration:none;transition:background .2s}
.dp-back-btn:active{background:rgba(255,255,255,0.28)}

.dp-skeleton-wrap{max-width:600px;margin:0 auto;padding:24px 16px}
.dp-skeleton-hero{display:flex;gap:16px;align-items:center;margin-bottom:20px}
.dp-sk{background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:skel 1.5s ease-in-out infinite;border-radius:8px}
.sk-circle{width:80px;height:80px;border-radius:50%;flex-shrink:0}
.dp-sk-lines{flex:1;display:flex;flex-direction:column;gap:8px}
.sk-line-w60{width:60%;height:16px}
.sk-line-w40{width:40%;height:12px}
.sk-line-w80{width:80%;height:10px}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

.dp-notfound{text-align:center;padding:80px 24px}
.dp-notfound h2{font-size:1.2rem;font-weight:800;color:#475569;margin:16px 0 6px}
.dp-notfound p{color:#64748b;margin-bottom:20px}
.dp-nf-btn{display:inline-block;padding:12px 28px;border-radius:12px;background:#0d9488;color:#fff;text-decoration:none;font-weight:700}

.lp-hero{position:relative;overflow:hidden;padding:28px 16px 20px;background:linear-gradient(135deg,var(--accent),color-mix(in srgb, var(--accent) 70%, #000))}
.lp-hero-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.lp-hero-orb{position:absolute;border-radius:50%;opacity:0.15}
.lp-hero-orb--1{width:200px;height:200px;background:#fff;top:-60px;right:-40px}
.lp-hero-orb--2{width:140px;height:140px;background:#fff;bottom:-40px;left:-30px}
.lp-hero-inner{position:relative;max-width:600px;margin:0 auto}
.lp-hero-card{position:relative;background:rgba(255,255,255,0.12);backdrop-filter:blur(12px);border-radius:20px;padding:20px;border:1px solid rgba(255,255,255,0.18)}
.lp-hero-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(214,158,31,0.25);border:1px solid rgba(214,158,31,0.4);color:#fef3c7;font-size:0.7rem;font-weight:700;padding:5px 12px;border-radius:8px;margin-bottom:14px}
.lp-hero-top{display:flex;gap:16px;align-items:flex-start}
.lp-avatar{width:80px;height:80px;border-radius:20px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.4rem;overflow:hidden;flex-shrink:0;box-shadow:0 6px 20px rgba(0,0,0,0.2);border:3px solid rgba(255,255,255,0.25)}
.lp-avatar img{width:100%;height:100%;object-fit:cover}
.lp-hero-info{flex:1;min-width:0}
.lp-hero-spec{font-size:0.75rem;font-weight:700;opacity:0.9}
.lp-hero-name{font:800 1.2rem/1.3 'Segoe UI',sans-serif;color:#fff;margin:2px 0 6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.lp-verified-badge{flex-shrink:0}
.lp-hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:6px}
.lp-meta-item{display:flex;align-items:center;gap:4px;font-size:0.75rem;color:rgba(255,255,255,0.85)}
.lp-hero-rating{display:flex;align-items:center;gap:5px;margin-top:4px}
.lp-stars-static{display:flex;gap:1px}
.lp-rating-num{font-weight:800;font-size:0.85rem;color:#fbbf24}
.lp-rating-count{font-size:0.7rem;color:rgba(255,255,255,0.7)}

.lp-hero-actions{display:flex;gap:8px;margin-top:16px}
.lp-action-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 16px;border-radius:12px;font-weight:700;font-size:0.82rem;cursor:pointer;text-decoration:none;transition:all 0.2s;flex:1;border:none}
.lp-action-wa{background:#25d366;color:#fff}
.lp-action-wa:active{background:#1fb855}
.lp-action-call{background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.25)}
.lp-action-call:active{background:rgba(255,255,255,0.3)}

.lp-body{max-width:600px;margin:0 auto;padding:16px}
.lp-section{background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:16px;margin-bottom:12px}
.lp-section-title{font:800 0.85rem/1.2 'Segoe UI',sans-serif;color:#0f172a;margin-bottom:10px}
.lp-bio-text{font-size:0.82rem;color:#475569;line-height:1.7}
.lp-info-row{display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#334155}
.lp-schedule-row{display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#334155;font-weight:600}
.lp-contact-grid{display:flex;flex-direction:column;gap:8px}
.lp-contact-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;text-decoration:none;color:inherit;transition:all 0.2s}
.lp-contact-card:active{border-color:#0d9488;background:#f0fdf9}
.lp-contact-label{font-size:0.7rem;color:#94a3b8;display:block}
.lp-contact-value{font-size:0.85rem;font-weight:700;color:#0f172a;display:block}

.lp-subscribe-cta{background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:20px;padding:28px 20px;text-align:center;margin-top:16px}
.lp-cta-icon{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.18);display:inline-grid;place-items:center;margin-bottom:12px}
.lp-subscribe-cta h3{font:800 1rem/1.3 'Segoe UI',sans-serif;color:#fff;margin-bottom:6px}
.lp-subscribe-cta p{font-size:0.8rem;color:rgba(255,255,255,0.8);margin-bottom:16px;line-height:1.6}
.lp-cta-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 32px;border-radius:12px;background:#fff;color:#0d9488;font-weight:800;font-size:0.88rem;text-decoration:none;transition:all 0.2s}
.lp-cta-btn:active{transform:scale(0.97)}

@media(min-width:769px){
  .lp-hero{padding:36px 24px 28px}
  .lp-hero-card{padding:28px}
  .lp-body{padding:20px 24px}
}
</style>
