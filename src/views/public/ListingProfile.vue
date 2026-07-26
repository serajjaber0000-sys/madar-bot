<template>
  <div class="dp" :style="{ '--accent': accentColor, '--accent-light': accentLight, '--accent-dark': accentDark }">
    <!-- Navigation -->
    <nav class="dp-nav">
      <div class="dp-nav-inner">
        <button class="dp-back-btn" @click="goBack" aria-label="العودة">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l7-7-7-7"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="dp-skeleton-wrap">
      <div class="dp-skeleton-hero">
        <div class="dp-sk sk-circle"></div>
        <div class="dp-sk-lines">
          <div class="dp-sk sk-line-w60"></div>
          <div class="dp-sk sk-line-w40"></div>
          <div class="dp-sk sk-line-w80"></div>
        </div>
      </div>
      <div class="dp-skeleton-cards">
        <div class="dp-sk sk-card"></div>
        <div class="dp-sk sk-card"></div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!profile" class="dp-notfound">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#cbd5e1" stroke-width="1">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/>
      </svg>
      <h2>{{ facilityLabel }} غير موجود</h2>
      <p>الرابط غير صالح أو تم حذف هذا التسجيل</p>
      <router-link to="/" class="dp-nf-btn">العودة للدليل</router-link>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Hero Section -->
      <section class="dp-hero">
        <div class="dp-hero-bg">
          <div class="dp-hero-orb dp-hero-orb--1"></div>
          <div class="dp-hero-orb dp-hero-orb--2"></div>
          <div class="dp-hero-orb dp-hero-orb--3"></div>
        </div>
        <div class="dp-hero-inner">
          <div class="dp-hero-card">
            <div class="dp-hero-top">
              <div class="dp-avatar" :style="{ background: profile.photoUrl ? 'none' : accentColor }">
                <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="" loading="lazy" />
                <span v-else class="dp-avatar-initials">{{ initials }}</span>
              </div>
              <div class="dp-hero-info">
                <span class="dp-hero-spec" :style="{ color: accentColor }">{{ profile.specialty || defaultSpec }}</span>
                <h1 class="dp-hero-name">{{ heroPrefix }}{{ profile.doctor_name || facilityLabel }}</h1>
                <div class="dp-hero-meta">
                  <span v-if="locationText" class="dp-meta-item">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ locationText }}
                  </span>
                </div>
                <div class="dp-hero-status-row">
                  <span v-if="profile.is_24h" class="dp-status-badge dp-status-open">
                    <span class="dp-status-dot"></span>
                    مفتوح 24 ساعة
                  </span>
                  <span v-else-if="profile.clinic_open_time" class="dp-status-badge">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ to12h(profile.clinic_open_time) }} — {{ to12h(profile.clinic_close_time || '') }}
                  </span>
                  <span class="dp-view-count">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ profile.view_count || 0 }} مشاهدة
                  </span>
                </div>
              </div>
            </div>
            <!-- Actions -->
            <div class="dp-hero-actions">
              <a v-if="profile.phone" :href="'tel:' + profile.phone" class="dp-action-btn dp-action-call">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>اتصال</span>
              </a>
              <a v-if="whatsappNumber" :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="dp-action-btn dp-action-wa">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>واتساب</span>
              </a>
              <a v-if="profile.phone2" :href="'tel:' + profile.phone2" class="dp-action-btn dp-action-call2">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>هاتف 2</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Photo Gallery -->
      <section v-if="allPhotos.length" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">معرض الصور</h2>
          <div class="dp-gallery-scroll" role="list">
            <div v-for="(photo, idx) in allPhotos" :key="idx" class="dp-gallery-item" @click="openLightbox(idx)" role="listitem">
              <img :src="photo" :alt="'صورة ' + (idx + 1)" loading="lazy" />
              <div class="dp-gallery-overlay">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <Transition name="dp-lb">
        <div v-if="lightboxOpen" class="dp-lightbox" @click.self="lightboxOpen = false" role="dialog">
          <button class="dp-lb-close" @click="lightboxOpen = false" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button v-if="lightboxIndex > 0" class="dp-lb-nav dp-lb-prev" @click.stop="lightboxIndex--">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <img :src="allPhotos[lightboxIndex]" class="dp-lb-img" @click.stop alt="صورة" />
          <button v-if="lightboxIndex < allPhotos.length - 1" class="dp-lb-nav dp-lb-next" @click.stop="lightboxIndex++">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2.5"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="dp-lb-counter">{{ lightboxIndex + 1 }} / {{ allPhotos.length }}</div>
        </div>
      </Transition>

      <!-- Video -->
      <section v-if="videoEmbedUrl" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">فيديو تعريفي</h2>
          <div class="dp-video-card">
            <iframe :src="videoEmbedUrl" class="dp-video-embed" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="dp-tabs-wrap">
        <div class="dp-tabs" role="tablist">
          <button :class="['dp-tab', activeTab === 'about' && 'active']" @click="activeTab = 'about'" role="tab">النبذة</button>
          <button :class="['dp-tab', activeTab === 'schedule' && 'active']" @click="activeTab = 'schedule'" role="tab">المواعيد</button>
          <button :class="['dp-tab', activeTab === 'contact' && 'active']" @click="activeTab = 'contact'" role="tab">التواصل</button>
        </div>
      </div>

      <!-- About Tab -->
      <div v-show="activeTab === 'about'" class="dp-content" role="tabpanel">
        <div class="dp-content-inner">
          <!-- Bio -->
            <div class="dp-card dp-card-highlight dp-card-full">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>{{ bioTitle }}</h3>
            </div>
            <p class="dp-card-body-text">{{ profile.doctor_bio || 'لم تُضف نبذة بعد.' }}</p>
          </div>

          <!-- Certifications -->
          <div class="dp-card dp-card-full" v-if="profile.certifications && profile.certifications.length">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>الشهادات والاعتمادات</h3>
            </div>
            <ul class="dp-cert-list">
              <li v-for="(cert, i) in profile.certifications" :key="i">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ cert }}
              </li>
            </ul>
          </div>

          <!-- Languages -->
          <div class="dp-card dp-card-full" v-if="profile.languages && profile.languages.length">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3>اللغات</h3>
            </div>
            <div class="dp-lang-chips">
              <span v-for="(lang, i) in profile.languages" :key="i" class="dp-lang-chip">{{ lang }}</span>
            </div>
          </div>

          <!-- Conditions -->
          <div class="dp-card dp-card-full" v-if="profile.conditions_treated && profile.conditions_treated.length">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>{{ conditionsTitle }}</h3>
            </div>
            <div class="dp-conditions-grid">
              <span v-for="(cond, i) in profile.conditions_treated" :key="i" class="dp-condition-tag">{{ cond }}</span>
            </div>
          </div>

          <!-- Clinic Info -->
          <div class="dp-card dp-card-full">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3>{{ infoTitle }}</h3>
            </div>
            <div class="dp-info-grid">
              <div class="dp-info-item" v-if="profile.doctor_name">
                <span class="dp-info-label">{{ ft === 'doctor' ? 'اسم الطبيب' : 'الاسم' }}</span>
                <span class="dp-info-val">{{ (ft === 'doctor' ? 'د. ' : '') + profile.doctor_name }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.specialty">
                <span class="dp-info-label">التخصص</span>
                <span class="dp-info-val">{{ profile.specialty }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.governorate">
                <span class="dp-info-label">المحافظة</span>
                <span class="dp-info-val">{{ profile.governorate }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.area">
                <span class="dp-info-label">المنطقة</span>
                <span class="dp-info-val">{{ profile.area }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.address">
                <span class="dp-info-label">العنوان</span>
                <span class="dp-info-val">{{ profile.address }}</span>
              </div>
            </div>
          </div>

          <!-- Insurance & Payment -->
          <div class="dp-card dp-card-full" v-if="(profile.insurance_companies && profile.insurance_companies.length) || (profile.payment_methods && profile.payment_methods.length)">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>التأمين وطرق الدفع</h3>
            </div>
            <div v-if="profile.insurance_companies && profile.insurance_companies.length" class="dp-ins-section">
              <span class="dp-info-label">شركات التأمين المقبولة</span>
              <div class="dp-ins-chips">
                <span v-for="(ins, i) in profile.insurance_companies" :key="i" class="dp-ins-chip">{{ ins }}</span>
              </div>
            </div>
            <div v-if="profile.payment_methods && profile.payment_methods.length" class="dp-ins-section">
              <span class="dp-info-label">طرق الدفع</span>
              <div class="dp-ins-chips">
                <span v-for="(pm, i) in profile.payment_methods" :key="i" class="dp-pm-chip">{{ pm }}</span>
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="dp-card dp-card-full" v-if="profile.consultation_fee || profile.review_fee">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                  <line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/>
                </svg>
              </div>
              <h3>الرسوم</h3>
            </div>
            <div class="dp-pricing-grid">
              <div v-if="profile.consultation_fee" class="dp-price-box">
                <span class="dp-price-label">سعر الكشفية</span>
                <span class="dp-price-amount">{{ profile.consultation_fee.toLocaleString() }} <small>د.ع</small></span>
              </div>
              <div v-if="profile.review_fee" class="dp-price-box">
                <span class="dp-price-label">المراجعة</span>
                <span class="dp-price-amount">{{ profile.review_fee.toLocaleString() }} <small>د.ع</small></span>
              </div>
            </div>
          </div>

          <!-- Offers -->
          <div class="dp-card dp-card-full" v-if="profile.offers && profile.offers.length">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <h3>العروض والخدمات</h3>
            </div>
            <ul class="dp-cert-list">
              <li v-for="(offer, i) in profile.offers" :key="i">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#e11d48" stroke-width="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {{ offer }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div v-show="activeTab === 'schedule'" class="dp-content" role="tabpanel">
        <div class="dp-content-inner">
          <div class="dp-card dp-card-full" v-if="profile.is_24h">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>ساعات العمل</h3>
            </div>
            <div class="dp-open-24h-card">
              <span class="dp-open-dot"></span>
              <span>مفتوح 24 ساعة — طوال أيام الأسبوع</span>
            </div>
          </div>
          <div class="dp-card dp-card-full" v-else-if="profile.weekly_schedule && profile.weekly_schedule.length">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>جدول الدوام الأسبوعي</h3>
            </div>
            <div class="dp-schedule-table">
              <div v-for="day in profile.weekly_schedule" :key="day.name" :class="['dp-schedule-row', day.enabled && 'dp-schedule-row--active']">
                <div class="dp-schedule-day">
                  <span class="dp-schedule-dot" :class="{ 'dp-dot-green': day.enabled }"></span>
                  {{ day.name }}
                </div>
                <div class="dp-schedule-status">
                  <template v-if="day.enabled">
                    <span class="dp-schedule-time-badge">{{ to12h(day.from) }} — {{ to12h(day.to) }}</span>
                  </template>
                  <span v-else class="dp-schedule-off-badge">إجازة</span>
                </div>
              </div>
            </div>
          </div>
          <div class="dp-card dp-card-full" v-else-if="profile.clinic_open_time">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>ساعات العمل</h3>
            </div>
            <p class="dp-schedule-fallback">{{ to12h(profile.clinic_open_time) }} — {{ to12h(profile.clinic_close_time || '') }}</p>
          </div>
          <div v-else class="dp-empty-state">
            <p>لم تُحدّد مواعيد العمل بعد</p>
          </div>
        </div>
      </div>

      <!-- Contact Tab -->
      <div v-show="activeTab === 'contact'" class="dp-content" role="tabpanel">
        <div class="dp-content-inner">
          <div class="dp-card dp-card-full" v-if="profile.phone || profile.phone2">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>أرقام التواصل</h3>
            </div>
            <div class="dp-info-grid">
              <div class="dp-info-item" v-if="profile.phone">
                <span class="dp-info-label">الهاتف</span>
                <span class="dp-info-val"><a :href="'tel:' + profile.phone" dir="ltr">{{ profile.phone }}</a></span>
              </div>
              <div class="dp-info-item" v-if="profile.phone2">
                <span class="dp-info-label">هاتف ثانٍ</span>
                <span class="dp-info-val"><a :href="'tel:' + profile.phone2" dir="ltr">{{ profile.phone2 }}</a></span>
              </div>
            </div>
          </div>
          <div class="dp-card dp-card-full" v-if="whatsappNumber">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#dcfce7;color:#25d366">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#25d366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3>الواتساب</h3>
            </div>
            <a :href="'https://wa.me/' + whatsappNumber" target="_blank" rel="noopener" class="dp-wa-link-card">
              <span>التواصل عبر الواتساب</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#25d366" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          </div>

          <!-- Address + Map -->
          <div class="dp-card dp-card-full" v-if="profile.address || profile.map_url">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>الموقع</h3>
            </div>
            <div v-if="profile.address" class="dp-address-text">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ profile.address }}
            </div>
            <a v-if="profile.map_url" :href="profile.map_url" target="_blank" rel="noopener" class="dp-map-dir-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              عرض المسار على خرائط جوجل
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:auto"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          </div>

          <!-- Website -->
          <div class="dp-card dp-card-full" v-if="profile.website">
            <div class="dp-card-header">
              <div class="dp-card-icon dp-card-icon--accent">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3>الموقع الإلكتروني</h3>
            </div>
            <a :href="profile.website.startsWith('http') ? profile.website : 'https://' + profile.website" target="_blank" rel="noopener" class="dp-website-link">
              {{ cleanUrl(profile.website) }}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:auto"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Map Embed -->
      <section v-if="mapEmbedUrl" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">الموقع على الخريطة</h2>
          <div class="dp-card dp-map-card dp-card-full">
            <iframe :src="mapEmbedUrl" class="dp-map-embed" allowfullscreen loading="lazy"></iframe>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="dp-media-section">
        <div class="dp-section-inner">
          <div class="dp-cta-card">
            <div class="dp-cta-bg"></div>
            <div class="dp-cta-inner">
              <div class="dp-cta-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <h3>أنت صاحب {{ facilityLabel }} وتريد الانضمام؟</h3>
              <p>سجّل الآن واستفد من الحجز الإلكتروني وإدارة المرضى</p>
              <a href="https://t.me/Madar_system" target="_blank" class="dp-cta-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" :fill="accentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                سجّل عبر تليجرام
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Bar -->
      <div class="dp-bottom-bar">
        <router-link to="/" class="dp-bottom-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>الرئيسية</span>
        </router-link>
        <router-link to="/favorites" class="dp-bottom-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>المفضلة</span>
        </router-link>
        <router-link to="/bookings" class="dp-bottom-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>حجوزاتي</span>
        </router-link>
        <router-link to="/about" class="dp-bottom-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>من نحن</span>
        </router-link>
      </div>
    </template>

    <!-- Footer -->
    <footer class="dp-footer">
      <div class="dp-footer-inner">
        <div class="dp-footer-brand">
          <img src="/logo.jpg" alt="مدار" class="dp-footer-logo" />
          <span>مدار — دليل {{ facilityLabelPlural }}</span>
        </div>
        <div class="dp-footer-copy">&copy; {{ new Date().getFullYear() }} مدار. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, collection, query, where, onSnapshot, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { to12h } from '@/utils/time'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const profile = ref(null)
const activeTab = ref('about')
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
let unsub = null
let viewCounted = false

const listingId = computed(() => route.params.listingId)

const typeColors = {
  doctor: { main: '#1150c9', light: '#eff4ff', dark: '#0b3d91', bg: '#1150c9' },
  pharmacy: { main: '#d69e1f', light: '#fef9e7', dark: '#92400e', bg: '#d69e1f' },
  hospital: { main: '#dc2626', light: '#fef2f2', dark: '#991b1b', bg: '#dc2626' },
  lab: { main: '#7c3aed', light: '#ede9fe', dark: '#5b21b6', bg: '#7c3aed' },
  physio: { main: '#0d9488', light: '#ccfbf1', dark: '#065f46', bg: '#0d9488' }
}
const typeLabels = { doctor: 'طبيب', pharmacy: 'صيدلية', hospital: 'مستشفى', lab: 'مختبر', physio: 'علاج طبيعي' }
const typeLabelsPlural = { doctor: 'الأطباء', pharmacy: 'الصيدليات', hospital: 'المستشفيات', lab: 'المختبرات', physio: 'مراكز العلاج الطبيعي' }
const defaultSpecs = { doctor: 'طبيب عام', pharmacy: 'صيدلية عامة', hospital: 'مستشفى', lab: 'مختبر طبي', physio: 'علاج طبيعي' }

const ft = computed(() => profile.value?.facility_type || 'doctor')
const facilityLabel = computed(() => typeLabels[ft.value] || 'طبيب')
const facilityLabelPlural = computed(() => typeLabelsPlural[ft.value] || 'الأطباء')
const defaultSpec = computed(() => defaultSpecs[ft.value] || 'طبيب عام')

const accentColor = computed(() => {
  if (typeColors[ft.value]) return typeColors[ft.value].main
  const spec = profile.value?.specialty || ''
  const colors = { 'باطنية': '#4f46e5', 'قلب': '#e11d48', 'عظام': '#059669', 'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'عيون': '#0891b2', 'أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9', 'عصبية': '#8b5cf6', 'عام': '#475569', 'طب عام': '#475569' }
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(colors)) { if (lower.includes(key.toLowerCase())) return val }
  let h = 0; for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return ['#1150c9', '#0d9488', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444'][Math.abs(h) % 6]
})
const accentLight = computed(() => typeColors[ft.value]?.light || '#f0f9ff')
const accentDark = computed(() => typeColors[ft.value]?.dark || '#0b3d91')

const initials = computed(() => {
  const name = profile.value?.doctor_name || ''
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
})

const whatsappNumber = computed(() => {
  let num = (profile.value?.whatsapp || profile.value?.phone || '').replace(/[^0-9]/g, '')
  if (num.startsWith('0') && num.length >= 11) num = '964' + num.substring(1)
  else if (num.length === 10 && num.startsWith('7')) num = '964' + num
  else if (!num.startsWith('964') && num.length > 0) num = '964' + num
  return num
})

const heroPrefix = computed(() => ft.value === 'doctor' ? 'د. ' : '')

const locationText = computed(() => {
  const g = profile.value?.governorate || ''
  const a = profile.value?.area || ''
  if (g && a) return g + ' — ' + a
  return g || a || ''
})

const bioTitle = computed(() => {
  const titles = { doctor: 'نبذة مهنية', pharmacy: 'عن الصيدلية', hospital: 'عن المستشفى', lab: 'عن المختبر', physio: 'عن المركز' }
  return titles[ft.value] || 'نبذة'
})

const infoTitle = computed(() => {
  const titles = { doctor: 'معلومات العيادة', pharmacy: 'معلومات الصيدلية', hospital: 'معلومات المستشفى', lab: 'معلومات المختبر', physio: 'معلومات المركز' }
  return titles[ft.value] || 'معلومات'
})

const conditionsTitle = computed(() => {
  return ft.value === 'hospital' ? 'الأقسام والخدمات' : ft.value === 'pharmacy' ? 'الخدمات المتوفرة' : 'الأمراض والحالات المُعالجة'
})

const allPhotos = computed(() => {
  return [...new Set([...(profile.value?.clinic_photos || []), ...(profile.value?.gallery_images || [])].filter(Boolean))]
})

const mapEmbedUrl = computed(() => {
  const url = profile.value?.map_url
  if (!url) return ''
  if (url.includes('google.com/maps') || url.includes('goo.gl/maps')) {
    const q = url.match(/[?&]q=([^&]+)/)
    return q ? 'https://maps.google.com/maps?q=' + encodeURIComponent(decodeURIComponent(q[1])) + '&output=embed' : url + '&output=embed'
  }
  return 'https://maps.google.com/maps?q=' + encodeURIComponent(url) + '&output=embed'
})

const videoEmbedUrl = computed(() => {
  const url = profile.value?.video_url
  if (!url) return ''
  let m
  if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/))) {
    return 'https://www.youtube.com/embed/' + m[1]
  }
  if ((m = url.match(/vimeo\.com\/(\d+)/))) {
    return 'https://player.vimeo.com/video/' + m[1]
  }
  if (url.startsWith('http') && !url.toLowerCase().includes('javascript:') && !url.toLowerCase().includes('data:')) return url
  return ''
})

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function openLightbox(idx) {
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

function goBack() {
  if (window.history.length > 1) { router.back() } else { router.push('/') }
}

function incrementView() {
  if (!listingId.value || viewCounted) return
  viewCounted = true
  updateDoc(doc(db, 'directory_listings', listingId.value), { view_count: increment(1) }).catch(() => {})
}

onMounted(() => {
  if (!listingId.value) { loading.value = false; return }
  unsub = onSnapshot(doc(db, 'directory_listings', listingId.value), (snap) => {
    if (snap.exists()) {
      profile.value = { id: snap.id, ...snap.data() }
      incrementView()
    } else {
      const q2 = query(collection(db, 'doctor_profiles'), where('clinicId', '==', listingId.value))
      onSnapshot(q2, (snap2) => {
        if (!snap2.empty) {
          profile.value = { id: snap2.docs[0].id, ...snap2.docs[0].data() }
          incrementView()
        } else {
          profile.value = null
        }
        loading.value = false
      }, () => { loading.value = false })
      return
    }
    loading.value = false
  }, (error) => {
    console.error('Listing load error:', error)
    loading.value = false
  })
})

onUnmounted(() => { if (unsub) unsub() })
</script>

<style scoped>
.dp{font-family:inherit;direction:rtl;color:#1e293b;background:#f4f7fa;min-height:100vh;min-height:100dvh;overflow-x:hidden;padding-bottom:80px;-webkit-font-smoothing:antialiased;-webkit-overflow-scrolling:touch;--accent:#1150c9;--accent-light:#eff4ff;--accent-dark:#0b3d91}
.dp *,.dp *::before,.dp *::after{margin:0;padding:0;box-sizing:border-box}
.dp button{font-family:inherit}

/* NAV */
.dp-nav{position:sticky;top:0;z-index:200;background:linear-gradient(120deg,var(--accent),var(--accent-dark));box-shadow:0 2px 12px color-mix(in srgb,var(--accent) 40%,transparent)}
.dp-nav-inner{max-width:600px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;justify-content:center}
.dp-back-btn{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.2);color:#fff;border:1.5px solid rgba(255,255,255,0.25);cursor:pointer;transition:all .2s;flex-shrink:0;backdrop-filter:blur(8px)}
.dp-back-btn:hover{background:rgba(255,255,255,0.3)}
.dp-back-btn:active{background:rgba(255,255,255,0.35);transform:scale(0.95)}
.dp-nav-title{display:none}

/* SKELETON */
.dp-skeleton-wrap{max-width:600px;margin:0 auto;padding:24px 16px}
.dp-skeleton-hero{display:flex;gap:16px;align-items:center;margin-bottom:24px}
.dp-sk{border-radius:12px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:skel 1.5s ease-in-out infinite}
.sk-circle{width:80px;height:80px;border-radius:20px;flex-shrink:0}
.dp-sk-lines{display:flex;flex-direction:column;gap:8px;flex:1}
.sk-line-w60{width:60%;height:16px}
.sk-line-w40{width:40%;height:12px}
.sk-line-w80{width:80%;height:10px}
.dp-skeleton-cards{display:flex;flex-direction:column;gap:12px}
.sk-card{width:100%;height:80px;border-radius:14px}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* NOT FOUND */
.dp-notfound{text-align:center;padding:80px 24px}
.dp-notfound h2{font-size:1.2rem;font-weight:800;color:#475569;margin:16px 0 6px}
.dp-notfound p{color:#64748b;margin-bottom:20px;font-size:0.85rem}
.dp-nf-btn{display:inline-block;padding:12px 28px;border-radius:12px;background:#0d9488;color:#fff;text-decoration:none;font-weight:700;font-size:0.9rem}

/* HERO */
.dp-hero{position:relative;overflow:hidden;padding:0}
.dp-hero-bg{position:absolute;inset:0;background:linear-gradient(160deg,var(--accent) 0%,color-mix(in srgb,var(--accent) 60%,#000) 100%);z-index:0}
.dp-hero-orb{position:absolute;border-radius:50%;background:rgba(255,255,255,0.08);filter:blur(60px)}
.dp-hero-orb--1{width:250px;height:250px;top:-80px;right:-60px}
.dp-hero-orb--2{width:180px;height:180px;bottom:-50px;left:-40px}
.dp-hero-orb--3{width:120px;height:120px;top:40%;left:60%;background:rgba(255,255,255,0.05)}
.dp-hero-inner{position:relative;z-index:1;max-width:600px;margin:0 auto;padding:24px 16px 20px}
.dp-hero-card{background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:20px}
.dp-hero-top{display:flex;gap:16px;align-items:flex-start}
.dp-avatar{width:80px;height:80px;border-radius:20px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.3rem;overflow:hidden;flex-shrink:0;box-shadow:0 8px 28px rgba(0,0,0,0.2);border:3px solid rgba(255,255,255,0.2)}
.dp-avatar img{width:100%;height:100%;object-fit:cover}
.dp-hero-info{flex:1;min-width:0}
.dp-hero-spec{font:700 0.78rem/1 'Tajawal',sans-serif;display:block;margin-bottom:4px}
.dp-hero-name{font:800 1.15rem/1.3 'Tajawal',sans-serif;color:#fff;margin:0 0 4px;word-wrap:break-word}
.dp-hero-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
.dp-meta-item{display:flex;align-items:center;gap:4px;font-size:0.72rem;color:rgba(255,255,255,0.75);font-weight:500}
.dp-hero-status-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:4px}
.dp-status-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.1);border-radius:8px;padding:4px 10px;font:600 0.68rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.85)}
.dp-status-open{background:rgba(34,197,94,0.2);color:#86efac}
.dp-status-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.5);animation:dotPulse 1.5s ease-in-out infinite}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.5}}
.dp-view-count{display:flex;align-items:center;gap:4px;font:600 0.68rem 'Tajawal',sans-serif;color:rgba(255,255,255,0.6)}
.dp-hero-actions{display:flex;gap:8px;margin-top:16px}
.dp-action-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:12px;font:700 0.82rem 'Tajawal',sans-serif;cursor:pointer;text-decoration:none;transition:all .2s;flex:1;border:none}
.dp-action-call{background:rgba(255,255,255,0.15);color:#fff;border:1.5px solid rgba(255,255,255,0.2);backdrop-filter:blur(4px)}
.dp-action-call:active{background:rgba(255,255,255,0.25)}
.dp-action-call2{background:rgba(255,255,255,0.15);color:#fff;border:1.5px solid rgba(255,255,255,0.2)}
.dp-action-call2:active{background:rgba(255,255,255,0.25)}
.dp-action-wa{background:#25d366;color:#fff;box-shadow:0 4px 16px rgba(37,211,102,0.3)}
.dp-action-wa:active{background:#1fb855}

/* MEDIA SECTION */
.dp-media-section{max-width:600px;margin:0 auto;padding:0 12px}
.dp-section-inner{padding:12px 0}
.dp-section-title{font:800 0.95rem/1.3 'Tajawal',sans-serif;color:#0f172a;margin-bottom:12px;padding-right:4px}
.dp-gallery-scroll{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.dp-gallery-scroll::-webkit-scrollbar{display:none}
.dp-gallery-item{position:relative;min-width:160px;height:120px;border-radius:14px;overflow:hidden;flex-shrink:0;scroll-snap-align:start;cursor:pointer}
.dp-gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.dp-gallery-item:active img{transform:scale(1.05)}
.dp-gallery-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.3);display:grid;place-items:center;opacity:0;transition:opacity .2s}
.dp-gallery-item:active .dp-gallery-overlay{opacity:1}

/* LIGHTBOX */
.dp-lightbox{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.95);display:grid;place-items:center}
.dp-lb-close{position:absolute;top:16px;left:16px;background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:48px;height:48px;display:grid;place-items:center;cursor:pointer;z-index:2}
.dp-lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:48px;height:48px;display:grid;place-items:center;cursor:pointer;z-index:2}
.dp-lb-prev{right:16px}
.dp-lb-next{left:16px}
.dp-lb-img{max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px}
.dp-lb-counter{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font:600 0.85rem 'Tajawal',sans-serif}
.dp-lb-enter-active,.dp-lb-leave-active{transition:opacity .2s}
.dp-lb-enter-from,.dp-lb-leave-to{opacity:0}

/* VIDEO */
.dp-video-card{border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08)}
.dp-video-embed{width:100%;height:220px;border:none}

/* TABS */
.dp-tabs-wrap{position:sticky;top:52px;z-index:100;background:#fff;border-bottom:1px solid #e8ecf1}
.dp-tabs{max-width:600px;margin:0 auto;display:flex;padding:0 16px;gap:0}
.dp-tab{flex:1;padding:14px 8px;font:700 0.82rem 'Tajawal',sans-serif;color:#94a3b8;background:none;border:none;border-bottom:3px solid transparent;cursor:pointer;transition:all .2s;text-align:center}
.dp-tab.active{color:var(--accent);border-bottom-color:var(--accent)}

/* CONTENT */
.dp-content{max-width:600px;margin:0 auto;padding:0 12px}
.dp-content-inner{padding:16px 0 24px;display:flex;flex-direction:column;gap:12px}

/* CARDS */
.dp-card{background:#fff;border-radius:16px;border:1px solid #e8ecf1;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,0.03)}
.dp-card-full{width:100%}
.dp-card-highlight{border-color:color-mix(in srgb,var(--accent) 30%,#e8ecf1);background:linear-gradient(135deg,var(--accent-light) 0%,#fff 100%)}
.dp-card-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.dp-card-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex-shrink:0}
.dp-card-icon--accent{background:var(--accent-light);color:var(--accent)}
.dp-card-header h3{font:800 0.88rem/1.2 'Tajawal',sans-serif;color:#0f172a}
.dp-card-body-text{font-size:0.84rem;color:#475569;line-height:1.85}

/* CERT LIST */
.dp-cert-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.dp-cert-list li{display:flex;align-items:center;gap:8px;font-size:0.84rem;color:#334155;line-height:1.5}
.dp-cert-list li svg{flex-shrink:0}

/* LANGS */
.dp-lang-chips{display:flex;flex-wrap:wrap;gap:8px}
.dp-lang-chip{padding:6px 14px;border-radius:20px;background:#f1f5f9;font:600 0.78rem 'Tajawal',sans-serif;color:#475569}

/* CONDITIONS */
.dp-conditions-grid{display:flex;flex-wrap:wrap;gap:8px}
.dp-condition-tag{padding:6px 14px;border-radius:20px;background:var(--accent-light);color:var(--accent);font:600 0.78rem 'Tajawal',sans-serif}

/* INFO GRID */
.dp-info-grid{display:flex;flex-direction:column;gap:10px}
.dp-info-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}
.dp-info-label{font-size:0.72rem;color:#94a3b8;font-weight:600}
.dp-info-val{font:700 0.85rem/1.2 'Tajawal',sans-serif;color:#0f172a;text-align:left}
.dp-info-val a{color:var(--accent);text-decoration:none}

/* INSURANCE */
.dp-ins-section{margin-top:10px}
.dp-ins-section .dp-info-label{margin-bottom:8px;display:block}
.dp-ins-chips{display:flex;flex-wrap:wrap;gap:8px}
.dp-ins-chip{padding:6px 14px;border-radius:20px;background:#fef3c7;color:#92400e;font:600 0.78rem 'Tajawal',sans-serif}
.dp-pm-chip{padding:6px 14px;border-radius:20px;background:#e0f2fe;color:#075985;font:600 0.78rem 'Tajawal',sans-serif}

/* PRICING */
.dp-pricing-grid{display:flex;gap:12px}
.dp-price-box{flex:1;text-align:center;padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #f1f5f9}
.dp-price-label{display:block;font-size:0.7rem;color:#94a3b8;margin-bottom:4px;font-weight:600}
.dp-price-amount{font:800 1.1rem 'Tajawal',sans-serif;color:#0f172a}
.dp-price-amount small{font-size:0.7rem;color:#64748b}

/* SCHEDULE */
.dp-schedule-table{display:flex;flex-direction:column;gap:4px}
.dp-schedule-row{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid #f1f5f9}
.dp-schedule-row--active{border-color:color-mix(in srgb,var(--accent) 30%,transparent);background:var(--accent-light)}
.dp-schedule-day{display:flex;align-items:center;gap:8px;font:600 0.82rem 'Tajawal',sans-serif;color:#334155}
.dp-schedule-dot{width:8px;height:8px;border-radius:50%;background:#cbd5e1;flex-shrink:0}
.dp-dot-green{background:#22c55e}
.dp-schedule-status{display:flex;align-items:center;gap:8px}
.dp-schedule-time-badge{font:700 0.75rem 'Tajawal',sans-serif;color:var(--accent);background:var(--accent-light);padding:4px 10px;border-radius:8px}
.dp-schedule-off-badge{font:700 0.75rem 'Tajawal',sans-serif;color:#ef4444;background:#fef2f2;padding:4px 10px;border-radius:8px}
.dp-schedule-fallback{font-size:0.88rem;color:#334155;font-weight:600;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}

/* OPEN 24H */
.dp-open-24h-card{display:flex;align-items:center;gap:8px;padding:14px;background:linear-gradient(135deg,#064e3b,#059669);border-radius:12px;color:#fff;font:700 0.88rem 'Tajawal',sans-serif}
.dp-open-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.5);animation:dotPulse 1.5s ease-in-out infinite;flex-shrink:0}

/* EMPTY */
.dp-empty-state{text-align:center;padding:40px 16px;color:#94a3b8;font-size:0.88rem}

/* WHATSAPP LINK */
.dp-wa-link-card{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:12px;border:1.5px solid #dcfce7;text-decoration:none;color:#166534;font:700 0.88rem 'Tajawal',sans-serif;transition:all .2s}
.dp-wa-link-card:active{border-color:#25d366;background:#f0fdf4}

/* ADDRESS */
.dp-address-text{display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;color:#334155;line-height:1.7;margin-bottom:10px;padding:10px 12px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}
.dp-map-dir-btn{display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;text-decoration:none;color:var(--accent);font:700 0.82rem 'Tajawal',sans-serif;transition:all .2s}
.dp-map-dir-btn:active{border-color:var(--accent);background:var(--accent-light)}

/* WEBSITE */
.dp-website-link{display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;text-decoration:none;color:#6366f1;font:700 0.82rem 'Tajawal',sans-serif;transition:all .2s;direction:ltr;text-align:left}
.dp-website-link:active{border-color:#6366f1;background:#f5f3ff}

/* MAP */
.dp-map-card{overflow:hidden;padding:0}
.dp-map-embed{width:100%;height:240px;border:none;border-radius:0 0 14px 14px}

/* CTA */
.dp-cta-card{position:relative;border-radius:20px;overflow:hidden}
.dp-cta-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--accent),var(--accent-dark))}
.dp-cta-inner{position:relative;z-index:1;padding:28px 20px;text-align:center}
.dp-cta-icon-wrap{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);display:inline-grid;place-items:center;margin-bottom:12px}
.dp-cta-inner h3{font:800 0.92rem/1.3 'Tajawal',sans-serif;color:#fff;margin-bottom:6px}
.dp-cta-inner p{font-size:0.78rem;color:rgba(255,255,255,0.75);margin-bottom:16px;line-height:1.6}
.dp-cta-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border-radius:12px;background:#fff;color:var(--accent);font:800 0.88rem 'Tajawal',sans-serif;text-decoration:none;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.dp-cta-btn:active{transform:scale(0.97)}

/* BOTTOM BAR */
.dp-bottom-bar{position:fixed;bottom:0;left:0;right:0;z-index:200;background:#fff;border-top:1px solid #e8ecf1;box-shadow:0 -2px 12px rgba(0,0,0,0.04);display:flex;justify-content:space-around;padding:6px 0 env(safe-area-inset-bottom,8px);max-width:600px;margin:0 auto}
.dp-bottom-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px;text-decoration:none;color:#94a3b8;font:600 0.62rem 'Tajawal',sans-serif;transition:color .2s;border-radius:10px;min-width:64px}
.dp-bottom-btn.router-link-exact-active{color:var(--accent)}

/* FOOTER */
.dp-footer{border-top:1px solid #e8ecf1;background:#fff;margin-top:20px;padding-bottom:80px}
.dp-footer-inner{max-width:600px;margin:0 auto;padding:20px 16px;text-align:center}
.dp-footer-brand{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px}
.dp-footer-logo{width:24px;height:24px;border-radius:6px;object-fit:cover}
.dp-footer-brand span{font:700 0.82rem 'Tajawal',sans-serif;color:#475569}
.dp-footer-copy{font-size:0.7rem;color:#94a3b8}

@media(min-width:769px){
  .dp-hero-inner{padding:32px 24px 28px}
  .dp-content{padding:0 24px}
}
</style>
