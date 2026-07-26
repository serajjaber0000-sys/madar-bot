<template>
  <div class="lp">
    <nav class="lp-nav">
      <div class="lp-nav-inner">
        <router-link to="/directory" class="lp-back" aria-label="العودة">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l7-7-7-7"/></svg>
        </router-link>
        <span class="lp-nav-title">{{ facilityLabel }}</span>
      </div>
    </nav>

    <!-- LOADING -->
    <div v-if="loading" class="lp-loading">
      <div class="lp-skel"></div>
      <div class="lp-skel" style="width:60%;height:14px"></div>
      <div class="lp-skel" style="width:40%;height:12px"></div>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!profile" class="lp-notfound">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#cbd5e1" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/></svg>
      <h2>السجل غير موجود</h2>
      <p>الرابط غير صالح أو تم حذف هذا التسجيل</p>
      <router-link to="/directory" class="lp-notfound-btn">العودة للدليل</router-link>
    </div>

    <!-- PROFILE -->
    <template v-else>

      <!-- ======= HERO ======= -->
      <section class="lp-hero" :style="{ '--c': accentColor }">
        <div class="lp-hero-bg">
          <div class="lp-orb lp-orb-1"></div>
          <div class="lp-orb lp-orb-2"></div>
          <div class="lp-orb lp-orb-3"></div>
        </div>

        <div class="lp-hero-content">
          <!-- Type Badge -->
          <div class="lp-type-badge">
            <span class="lp-type-icon">{{ typeIcon }}</span>
            {{ facilityLabel }}
          </div>

          <!-- Photo + Name -->
          <div class="lp-hero-main">
            <div class="lp-photo" :style="{ background: profile.photoUrl ? 'none' : accentColor }">
              <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="" loading="lazy" />
              <span v-else class="lp-photo-text">{{ initials }}</span>
            </div>
            <div class="lp-hero-info">
              <h1 class="lp-name">{{ heroPrefix }}{{ profile.doctor_name }}</h1>
              <span class="lp-spec" :style="{ color: accentColor }">{{ profile.specialty || defaultSpec }}</span>
              <div class="lp-location">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ locationText }}
              </div>
            </div>
          </div>

          <!-- Status Bar -->
          <div class="lp-status-bar">
            <div v-if="profile.is_24h" class="lp-status-item lp-status-open">
              <span class="lp-status-dot"></span>
              مفتوح 24 ساعة
            </div>
            <div v-else-if="profile.clinic_open_time" class="lp-status-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ profile.clinic_open_time }} — {{ profile.clinic_close_time }}
            </div>
            <div class="lp-status-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ profile.view_count || 0 }} مشاهدة
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="lp-actions">
            <a v-if="profile.phone" :href="'tel:' + profile.phone" class="lp-btn lp-btn-call">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              اتصال
            </a>
            <a v-if="whatsappNumber" :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="lp-btn lp-btn-wa">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              واتساب
            </a>
          </div>
        </div>
      </section>

      <!-- ======= INFO CARDS ======= -->
      <div class="lp-body">

        <!-- Bio -->
        <div v-if="profile.doctor_bio" class="lp-card">
          <div class="lp-card-header">
            <div class="lp-card-icon" style="background:rgba(13,148,136,0.1);color:#0d9488">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3>{{ bioTitle }}</h3>
          </div>
          <p class="lp-card-text">{{ profile.doctor_bio }}</p>
        </div>

        <!-- Contact -->
        <div v-if="profile.phone || profile.whatsapp || profile.phone2" class="lp-card">
          <div class="lp-card-header">
            <div class="lp-card-icon" style="background:rgba(16,185,129,0.1);color:#10b981">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3>أرقام التواصل</h3>
          </div>
          <div class="lp-contact-list">
            <a v-if="profile.phone" :href="'tel:' + profile.phone" class="lp-contact-row">
              <div class="lp-contact-icon lp-ci-phone">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <span class="lp-contact-label">الهاتف</span>
                <span class="lp-contact-val" dir="ltr">{{ profile.phone }}</span>
              </div>
            </a>
            <a v-if="profile.phone2" :href="'tel:' + profile.phone2" class="lp-contact-row">
              <div class="lp-contact-icon lp-ci-phone2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <span class="lp-contact-label">الهاتف 2</span>
                <span class="lp-contact-val" dir="ltr">{{ profile.phone2 }}</span>
              </div>
            </a>
            <a v-if="profile.whatsapp" :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="lp-contact-row">
              <div class="lp-contact-icon lp-ci-wa">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <span class="lp-contact-label">الواتساب</span>
                <span class="lp-contact-val" dir="ltr">{{ profile.whatsapp }}</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Address + Map -->
        <div v-if="profile.address || profile.map_url" class="lp-card">
          <div class="lp-card-header">
            <div class="lp-card-icon" style="background:rgba(239,68,68,0.1);color:#ef4444">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>الموقع</h3>
          </div>
          <div v-if="profile.address" class="lp-address-text">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ profile.address }}
          </div>
          <a v-if="profile.map_url" :href="profile.map_url" target="_blank" rel="noopener" class="lp-map-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            فتح على خرائط جوجل
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:auto"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>

        <!-- Working Hours -->
        <div v-if="profile.is_24h || profile.clinic_open_time || profile.clinic_close_time" class="lp-card">
          <div class="lp-card-header">
            <div class="lp-card-icon" style="background:rgba(34,197,94,0.1);color:#16a34a">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>مواعيد العمل</h3>
          </div>
          <div v-if="profile.is_24h" class="lp-open-24h">
            <span class="lp-open-dot"></span>
            <span>مفتوح 24 ساعة — طوال أيام الأسبوع</span>
          </div>
          <div v-else class="lp-hours-row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ profile.clinic_open_time }} — {{ profile.clinic_close_time }}</span>
          </div>
        </div>

        <!-- Website -->
        <div v-if="profile.website" class="lp-card">
          <div class="lp-card-header">
            <div class="lp-card-icon" style="background:rgba(99,102,241,0.1);color:#6366f1">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h3>الموقع الإلكتروني</h3>
          </div>
          <a :href="profile.website.startsWith('http') ? profile.website : 'https://' + profile.website" target="_blank" rel="noopener" class="lp-website-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {{ cleanUrl(profile.website) }}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:auto"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>

        <!-- CTA -->
        <div class="lp-cta">
          <div class="lp-cta-bg">
            <div class="lp-cta-orb"></div>
          </div>
          <div class="lp-cta-content">
            <div class="lp-cta-icon-wrap">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </div>
            <h3>أنت صاحب {{ facilityLabel }} وتريد الانضمام؟</h3>
            <p>سجّل الآن واستفد من الحجز الإلكتروني وإدارة المرضى</p>
            <a href="https://t.me/Madar_system" target="_blank" class="lp-cta-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#0d9488"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              سجّل عبر تليجرام
            </a>
          </div>
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

const typeColors = {
  doctor: { bg: '#1150c9', light: '#eef2ff' },
  pharmacy: { bg: '#d69e1f', light: '#fef9c3' },
  hospital: { bg: '#ef4444', light: '#fee2e2' },
  lab: { bg: '#8b5cf6', light: '#ede9fe' },
  physio: { bg: '#0d9488', light: '#ccfbf1' }
}

const typeIcons = { doctor: '🩺', pharmacy: '💊', hospital: '🏥', lab: '🔬', physio: '🦴' }
const typeLabels = { doctor: 'طبيب', pharmacy: 'صيدلية', hospital: 'مستشفى', lab: 'مختبر', physio: 'علاج طبيعي' }
const defaultSpecs = { doctor: 'طبيب عام', pharmacy: 'صيدلية عامة', hospital: 'مستشفى', lab: 'مختبر طبي', physio: 'علاج طبيعي' }

const ft = computed(() => profile.value?.facility_type || 'doctor')
const typeIcon = computed(() => typeIcons[ft.value] || '🩺')
const facilityLabel = computed(() => typeLabels[ft.value] || 'طبيب')
const defaultSpec = computed(() => defaultSpecs[ft.value] || 'طبيب عام')

const accentColor = computed(() => {
  if (ft.value === 'pharmacy') return '#d69e1f'
  if (ft.value === 'hospital') return '#ef4444'
  if (ft.value === 'lab') return '#8b5cf6'
  if (ft.value === 'physio') return '#0d9488'
  const spec = profile.value?.specialty || ''
  const colors = { 'باطنية': '#4f46e5', 'قلب': '#e11d48', 'عظام': '#059669', 'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'عيون': '#0891b2', 'أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9', 'عصبية': '#8b5cf6', 'عام': '#475569', 'طب عام': '#475569' }
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(colors)) { if (lower.includes(key.toLowerCase())) return val }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return ['#1150c9', '#0d9488', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444'][Math.abs(h) % 6]
})

const initials = computed(() => {
  const name = profile.value?.doctor_name || ''
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
})

const whatsappNumber = computed(() => {
  const num = profile.value?.whatsapp || profile.value?.phone || ''
  return num.replace(/[^0-9]/g, '')
})

const heroPrefix = computed(() => ft.value === 'doctor' ? 'د. ' : '')

const locationText = computed(() => {
  const g = profile.value?.governorate || ''
  const a = profile.value?.area || ''
  if (g && a) return `${g} — ${a}`
  return g || a || ''
})

const bioTitle = computed(() => {
  const titles = { doctor: 'نبذة عن الطبيب', pharmacy: 'عن الصيدلية', hospital: 'عن المستشفى', lab: 'عن المختبر', physio: 'عن المركز' }
  return titles[ft.value] || 'نبذة'
})

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

onMounted(() => {
  if (!listingId.value) { loading.value = false; return }
  unsub = onSnapshot(doc(db, 'directory_listings', listingId.value), (snap) => {
    if (snap.exists()) { profile.value = { id: snap.id, ...snap.data() } } else { profile.value = null }
    loading.value = false
  }, () => { loading.value = false })
})

onUnmounted(() => { if (unsub) unsub() })
</script>

<style scoped>
.lp{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#0f172a;background:#f1f5f9;min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased}
.lp *,.lp *::before,.lp *::after{margin:0;padding:0;box-sizing:border-box}

/* NAV */
.lp-nav{position:sticky;top:0;z-index:200;background:linear-gradient(120deg,#0d9488,#0f766e);box-shadow:0 2px 12px rgba(15,118,110,0.25)}
.lp-nav-inner{max-width:600px;margin:0 auto;padding:0 16px;height:52px;display:flex;align-items:center;gap:12px}
.lp-back{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.14);color:#fff;text-decoration:none;transition:background .2s;flex-shrink:0}
.lp-back:active{background:rgba(255,255,255,0.28)}
.lp-nav-title{font:700 0.85rem 'Segoe UI',sans-serif;color:rgba(255,255,255,0.9)}

/* LOADING */
.lp-loading{max-width:600px;margin:0 auto;padding:40px 16px;display:flex;flex-direction:column;gap:12px;align-items:center}
.lp-skel{width:80px;height:80px;border-radius:16px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:skel 1.5s ease-in-out infinite}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* NOT FOUND */
.lp-notfound{text-align:center;padding:80px 24px}
.lp-notfound h2{font-size:1.2rem;font-weight:800;color:#475569;margin:16px 0 6px}
.lp-notfound p{color:#64748b;margin-bottom:20px;font-size:0.85rem}
.lp-notfound-btn{display:inline-block;padding:12px 28px;border-radius:12px;background:#0d9488;color:#fff;text-decoration:none;font-weight:700;font-size:0.9rem}

/* HERO */
.lp-hero{position:relative;overflow:hidden;padding:0}
.lp-hero-bg{position:absolute;inset:0;background:linear-gradient(160deg,var(--c) 0%,color-mix(in srgb,var(--c) 60%,#000) 100%);z-index:0}
.lp-orb{position:absolute;border-radius:50%;background:rgba(255,255,255,0.08);filter:blur(60px)}
.lp-orb-1{width:250px;height:250px;top:-80px;right:-60px}
.lp-orb-2{width:180px;height:180px;bottom:-50px;left:-40px}
.lp-orb-3{width:120px;height:120px;top:40%;left:60%;background:rgba(255,255,255,0.05)}

.lp-hero-content{position:relative;z-index:1;max-width:600px;margin:0 auto;padding:24px 16px 20px}

/* Type Badge */
.lp-type-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:#fff;font:700 0.72rem 'Segoe UI',sans-serif;padding:6px 14px;border-radius:20px;margin-bottom:16px}
.lp-type-icon{font-size:0.85rem}

/* Hero Main */
.lp-hero-main{display:flex;gap:16px;align-items:flex-start}
.lp-photo{width:84px;height:84px;border-radius:20px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.4rem;overflow:hidden;flex-shrink:0;box-shadow:0 8px 28px rgba(0,0,0,0.25);border:3px solid rgba(255,255,255,0.2)}
.lp-photo img{width:100%;height:100%;object-fit:cover}
.lp-hero-info{flex:1;min-width:0}
.lp-name{font:800 1.25rem/1.3 'Segoe UI',sans-serif;color:#fff;margin:0 0 3px}
.lp-spec{font:700 0.78rem/1 'Segoe UI',sans-serif;display:block;margin-bottom:6px}
.lp-location{display:flex;align-items:center;gap:4px;font-size:0.72rem;color:rgba(255,255,255,0.75);font-weight:500}

/* Status Bar */
.lp-status-bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1)}
.lp-status-item{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.1);border-radius:8px;padding:5px 10px;font:600 0.68rem 'Segoe UI',sans-serif;color:rgba(255,255,255,0.85)}
.lp-status-open{background:rgba(34,197,94,0.2);color:#86efac}
.lp-status-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.5);animation:dotPulse 1.5s ease-in-out infinite}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.5}}

/* Actions */
.lp-actions{display:flex;gap:8px;margin-top:16px}
.lp-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:12px;font:700 0.82rem 'Segoe UI',sans-serif;cursor:pointer;text-decoration:none;transition:all .2s;flex:1;border:none}
.lp-btn-call{background:rgba(255,255,255,0.15);color:#fff;border:1.5px solid rgba(255,255,255,0.2);backdrop-filter:blur(4px)}
.lp-btn-call:active{background:rgba(255,255,255,0.25)}
.lp-btn-wa{background:#25d366;color:#fff;box-shadow:0 4px 16px rgba(37,211,102,0.3)}
.lp-btn-wa:active{background:#1fb855}

/* BODY */
.lp-body{max-width:600px;margin:0 auto;padding:16px 12px 32px}

/* Cards */
.lp-card{background:#fff;border-radius:16px;border:1px solid #e8ecf1;padding:16px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,0.03)}
.lp-card-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.lp-card-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.lp-card-header h3{font:800 0.88rem/1.2 'Segoe UI',sans-serif;color:#0f172a}
.lp-card-text{font-size:0.82rem;color:#475569;line-height:1.8}

/* Contact List */
.lp-contact-list{display:flex;flex-direction:column;gap:8px}
.lp-contact-row{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1.5px solid #f1f5f9;text-decoration:none;color:inherit;transition:all .2s}
.lp-contact-row:active{border-color:#0d9488;background:#f0fdf9}
.lp-contact-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.lp-ci-phone{background:linear-gradient(135deg,#0d9488,#14b8a6)}
.lp-ci-phone2{background:linear-gradient(135deg,#6366f1,#818cf8)}
.lp-ci-wa{background:linear-gradient(135deg,#25d366,#22c55e)}
.lp-contact-label{font-size:0.68rem;color:#94a3b8;display:block;margin-bottom:2px}
.lp-contact-val{font:700 0.88rem/1 'Segoe UI',sans-serif;color:#0f172a;display:block}

/* Address */
.lp-address-text{display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;color:#334155;line-height:1.7;margin-bottom:10px;padding:10px 12px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}
.lp-map-btn{display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;text-decoration:none;color:#0d9488;font:700 0.82rem 'Segoe UI',sans-serif;transition:all .2s}
.lp-map-btn:active{border-color:#0d9488;background:#f0fdf9}

/* Hours */
.lp-open-24h{display:flex;align-items:center;gap:8px;padding:12px 14px;background:linear-gradient(135deg,#064e3b,#059669);border-radius:12px;color:#fff;font:700 0.85rem 'Segoe UI',sans-serif}
.lp-open-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.5);animation:dotPulse 1.5s ease-in-out infinite;flex-shrink:0}
.lp-hours-row{display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#334155;font-weight:600;padding:10px 12px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}

/* Website */
.lp-website-btn{display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;text-decoration:none;color:#6366f1;font:700 0.82rem 'Segoe UI',sans-serif;transition:all .2s;direction:ltr;text-align:left}
.lp-website-btn:active{border-color:#6366f1;background:#f5f3ff}

/* CTA */
.lp-cta{position:relative;border-radius:20px;overflow:hidden;margin-top:20px}
.lp-cta-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0d9488,#0f766e)}
.lp-cta-orb{position:absolute;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.08);filter:blur(50px);top:-40px;right:-30px}
.lp-cta-content{position:relative;z-index:1;padding:28px 20px;text-align:center}
.lp-cta-icon-wrap{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);display:inline-grid;place-items:center;margin-bottom:12px}
.lp-cta-content h3{font:800 0.95rem/1.3 'Segoe UI',sans-serif;color:#fff;margin-bottom:6px}
.lp-cta-content p{font-size:0.78rem;color:rgba(255,255,255,0.75);margin-bottom:16px;line-height:1.6}
.lp-cta-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border-radius:12px;background:#fff;color:#0d9488;font:800 0.88rem 'Segoe UI',sans-serif;text-decoration:none;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.lp-cta-btn:active{transform:scale(0.97)}

@media(min-width:769px){
  .lp-hero-content{padding:32px 24px 28px}
  .lp-body{padding:20px 24px 40px}
}
</style>
