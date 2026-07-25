<template>
  <div class="dp">
    <!-- Navigation -->
    <nav class="dp-nav">
      <div class="dp-nav-inner">
        <router-link to="/directory" class="dp-back-btn" aria-label="العودة">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l7-7-7-7"/>
          </svg>
        </router-link>
      </div>
    </nav>

    <!-- Loading State -->
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
      <h2>الطبيب غير موجود</h2>
      <p>الرابط غير صالح أو لم يفعّل الطبيب ملفه العام</p>
      <router-link to="/directory" class="dp-nf-btn">العودة لدليل الأطباء</router-link>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Hero Section -->
      <section class="dp-hero" :style="{ '--accent': accentColor }">
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
                <span class="dp-hero-spec" :style="{ color: accentColor }">{{ profile.specialty || 'طبيب عام' }}</span>
                <h1 class="dp-hero-name">
                  د. {{ profile.doctor_name || 'طبيب' }}
                  <span v-if="profile.verified" class="dp-verified-badge" title="حساب موثّق — مدار">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#0d9488"/>
                      <path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="dp-verified-text">موثّق</span>
                  </span>
                </h1>
                <div class="dp-hero-meta">
                  <span v-if="profile.area || profile.governorate" class="dp-meta-item">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ profile.governorate || '' }}{{ profile.governorate && profile.area ? ' - ' : '' }}{{ profile.area || '' }}
                  </span>
                </div>
                <div class="dp-hero-rating" v-if="profile.rating_count > 0">
                  <span class="dp-stars-static">
                    <svg v-for="s in 5" :key="s" viewBox="0 0 24 24" width="16" height="16"
                         :fill="s <= Math.round(profile.rating_avg) ? '#f59e0b' : 'none'"
                         :stroke="s <= Math.round(profile.rating_avg) ? '#f59e0b' : 'rgba(255,255,255,0.4)'" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </span>
                  <span class="dp-rating-num">{{ profile.rating_avg }}</span>
                  <span class="dp-rating-count">{{ profile.rating_count }} تقييم</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="dp-hero-actions">
              <button class="dp-action-btn dp-action-book" @click="showBooking = true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>احجز موعد</span>
              </button>
              <a v-if="whatsappNumber" :href="'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('مرحباً، أريد الحجز عند د. ' + (profile.doctor_name || ''))"
                 target="_blank" rel="noopener" class="dp-action-btn dp-action-wa">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>واتساب</span>
              </a>
              <a v-if="profile?.phone1" :href="'tel:' + profile.phone1" class="dp-action-btn dp-action-call">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>اتصال</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Photo Gallery -->
      <section v-if="allPhotos.length" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">معرض الصور</h2>
          <div class="dp-gallery-scroll" role="list" aria-label="معرض الصور">
            <div v-for="(photo, idx) in allPhotos" :key="idx" class="dp-gallery-item" @click="openLightbox(idx)" role="listitem">
              <img :src="photo" :alt="'صورة العيادة ' + (idx + 1)" loading="lazy" />
              <div class="dp-gallery-overlay">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <Transition name="dp-lb">
        <div v-if="lightboxOpen" class="dp-lightbox" @click.self="lightboxOpen = false" role="dialog" aria-label="معرض الصور">
          <button class="dp-lb-close" @click="lightboxOpen = false" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button v-if="lightboxIndex > 0" class="dp-lb-nav dp-lb-prev" @click.stop="lightboxIndex--" aria-label="السابق">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2.5">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <img :src="allPhotos[lightboxIndex]" class="dp-lb-img" @click.stop alt="صورة العيادة" />
          <button v-if="lightboxIndex < allPhotos.length - 1" class="dp-lb-nav dp-lb-next" @click.stop="lightboxIndex++" aria-label="التالي">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2.5">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="dp-lb-counter">{{ lightboxIndex + 1 }} / {{ allPhotos.length }}</div>
        </div>
      </Transition>

      <!-- Video -->
      <section v-if="profile.video_url && videoEmbedUrl" class="dp-media-section">
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
          <button :class="['dp-tab', activeTab === 'about' && 'active']" @click="activeTab = 'about'" role="tab" aria-selected="activeTab === 'about'">النبذة</button>
          <button :class="['dp-tab', activeTab === 'schedule' && 'active']" @click="activeTab = 'schedule'" role="tab" aria-selected="activeTab === 'schedule'">الجدول</button>
          <button :class="['dp-tab', activeTab === 'reviews' && 'active']" @click="activeTab = 'reviews'" role="tab" aria-selected="activeTab === 'reviews'">
            التقييمات ({{ reviews.length }})
          </button>
        </div>
      </div>

      <!-- About Tab -->
      <div v-show="activeTab === 'about'" class="dp-content" role="tabpanel">
        <div class="dp-content-inner">
          <!-- Bio -->
          <div class="dp-card dp-card-highlight dp-card-full">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#e6f5f3;color:#0d9488">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>نبذة مهنية</h3>
            </div>
            <p class="dp-card-body-text">{{ profile.doctor_bio || 'لم يُضف بعد.' }}</p>
          </div>

          <!-- Certifications -->
          <div class="dp-card" v-if="profile.certifications && profile.certifications.length">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#fef3c7;color:#d69e1f">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>الشهادات والمؤهلات</h3>
            </div>
            <ul class="dp-cert-list">
              <li v-for="(cert, i) in profile.certifications" :key="i">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#059669" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ cert }}
              </li>
            </ul>
          </div>

          <!-- Languages -->
          <div class="dp-card" v-if="profile.languages && profile.languages.length">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#ede9fe;color:#8b5cf6">
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
          <div class="dp-card" v-if="profile.conditions_treated && profile.conditions_treated.length">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#fef2f2;color:#e11d48">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>الأمراض والحالات المُعالجة</h3>
            </div>
            <div class="dp-conditions-grid">
              <span v-for="(cond, i) in profile.conditions_treated" :key="i" class="dp-condition-tag">{{ cond }}</span>
            </div>
          </div>

          <!-- Clinic Info -->
          <div class="dp-card dp-card-full">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#e6f5f3;color:#0d9488">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3>معلومات العيادة</h3>
            </div>
            <div class="dp-info-grid">
              <div class="dp-info-item" v-if="profile.clinic_name">
                <span class="dp-info-label">اسم العيادة</span>
                <span class="dp-info-val">{{ profile.clinic_name }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.clinic_address">
                <span class="dp-info-label">العنوان</span>
                <span class="dp-info-val">{{ profile.clinic_address }}</span>
              </div>
              <div class="dp-info-item" v-if="profile.phone1">
                <span class="dp-info-label">الهاتف</span>
                <span class="dp-info-val"><a :href="'tel:' + profile.phone1">{{ profile.phone1 }}</a></span>
              </div>
              <div class="dp-info-item" v-if="profile.phone2">
                <span class="dp-info-label">هاتف ثانٍ</span>
                <span class="dp-info-val"><a :href="'tel:' + profile.phone2">{{ profile.phone2 }}</a></span>
              </div>
              <div class="dp-info-item" v-if="profile.area">
                <span class="dp-info-label">المنطقة</span>
                <span class="dp-info-val">{{ profile.area }}</span>
              </div>
            </div>
          </div>

          <!-- Insurance & Payment -->
          <div class="dp-card dp-card-full" v-if="(profile.insurance_companies && profile.insurance_companies.length) || (profile.payment_methods && profile.payment_methods.length)">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#fef3c7;color:#d69e1f">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
          <div class="dp-card" v-if="profile.consultation_fee || profile.review_fee">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#fef3c7;color:#d69e1f">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                  <line x1="12" y1="6" x2="12" y2="8"/>
                  <line x1="12" y1="16" x2="12" y2="18"/>
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
          <div class="dp-card" v-if="profile.offers && profile.offers.length">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#fef2f2;color:#e11d48">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <h3>العروض والخدمات الخاصة</h3>
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
          <div class="dp-card dp-card-full" v-if="profile.weekly_schedule && profile.weekly_schedule.length">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#e6f5f3;color:#0d9488">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
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
                    <span class="dp-schedule-slots-count">{{ generateTimeSlots(day.from, day.to).length }} موعد</span>
                  </template>
                  <span v-else class="dp-schedule-off-badge">إجازة</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="profile.clinic_open_time" class="dp-card dp-card-full">
            <div class="dp-card-header">
              <div class="dp-card-icon" style="background:#e6f5f3;color:#0d9488">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>ساعات العمل</h3>
            </div>
            <p class="dp-schedule-fallback">{{ to12h(profile.clinic_open_time) }} — {{ to12h(profile.clinic_close_time || '') }}</p>
          </div>
          <div v-else class="dp-empty-state">
            <p>لم تُحدّد أوقات الدوام بعد</p>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-show="activeTab === 'reviews'" class="dp-content" role="tabpanel">
        <div class="dp-content-inner">
          <!-- Review Summary -->
          <div class="dp-review-summary dp-card-full" v-if="reviews.length">
            <div class="dp-summary-left">
              <div class="dp-summary-big">{{ profile.rating_avg || '0.0' }}</div>
              <div class="dp-summary-stars">
                <svg v-for="s in 5" :key="s" viewBox="0 0 24 24" width="20" height="20"
                     :fill="s <= Math.round(profile.rating_avg || 0) ? '#f59e0b' : 'none'"
                     :stroke="s <= Math.round(profile.rating_avg || 0) ? '#f59e0b' : '#d1d5db'" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="dp-summary-count">{{ reviews.length }} تقييم</div>
            </div>
            <div class="dp-summary-bars">
              <div v-for="star in 5" :key="star" class="dp-bar-row">
                <span class="dp-bar-label">{{ star }}</span>
                <div class="dp-bar-track">
                  <div class="dp-bar-fill" :style="{ width: getStarPercentage(star) + '%' }"></div>
                </div>
                <span class="dp-bar-pct">{{ getStarPercentage(star) }}%</span>
              </div>
            </div>
          </div>

          <!-- Reviews Carousel -->
          <div class="dp-reviews-carousel dp-card-full">
            <div v-if="currentReview" style="background:#fff; border-radius:14px; padding:16px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <div class="dp-review-avatar" :style="{ background: getAvatarColor(currentReview.patient_name) }">
                  {{ (currentReview.patient_name || 'م')[0] }}
                </div>
                <div>
                  <span class="dp-review-name">{{ currentReview.patient_name || 'مجهول' }}</span>
                  <div class="dp-review-stars" style="margin-top:2px">
                    <svg v-for="s in 5" :key="s" viewBox="0 0 24 24" width="14" height="14"
                         :fill="s <= (currentReview.rating || 0) ? '#f59e0b' : 'none'"
                         :stroke="s <= (currentReview.rating || 0) ? '#f59e0b' : '#d1d5db'" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <p v-if="currentReview.comment" style="font-size:0.88rem; color:#334155; line-height:1.7; margin:0;">{{ currentReview.comment }}</p>
              <p v-else style="font-size:0.88rem; color:#94a3b8; font-style:italic; margin:0;">بدون تعليق</p>
            </div>
            <p v-else style="text-align:center; color:#94a3b8; padding:20px 0; margin:0; font-size:0.88rem;">لا توجد تقييمات بعد</p>
            <div v-if="reviews.length > 1" class="dp-carousel-dots">
              <button v-for="(_, idx) in reviews" :key="idx"
                      :class="['dp-carousel-dot', idx === reviewCarouselIndex && 'active']"
                      @click.stop="reviewCarouselIndex = idx"></button>
            </div>
          </div>

          <!-- Review Form -->
          <div class="dp-card dp-review-form dp-card-full">
            <h3>شارك تجربتك</h3>
            <div v-if="!hasReviewedBefore" class="dp-stars-input">
              <button v-for="s in 5" :key="s" @click="newReview.rating = s"
                      :class="['dp-star-btn', newReview.rating >= s && 'active']" aria-label="تقييم {{ s }} نجوم">
                <svg viewBox="0 0 24 24" width="32" height="32"
                     :fill="newReview.rating >= s ? '#f59e0b' : 'none'"
                     :stroke="newReview.rating >= s ? '#f59e0b' : '#d1d5db'" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </div>
            <div v-else class="dp-returning-note">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d9488" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>لقد قيّمت هذا الطبيب مسبقاً. يمكنك إضافة تعليق إضافي فقط.</span>
            </div>
            <input v-model="newReview.patient_name" type="text" placeholder="اسمك (اختياري)" class="dp-input" />
            <textarea v-model="newReview.comment" :placeholder="hasReviewedBefore ? 'أضف تعليقاً إضافياً...' : 'اكتب رأيك...'" class="dp-textarea" rows="3"></textarea>
            <button class="dp-submit-btn" @click="submitReview" :disabled="reviewSubmitting || !newReview.comment.trim()">
              {{ reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم' }}
            </button>
          </div>

          <div v-if="reviews.length === 0" class="dp-empty-state">
            <p>لا توجد تقييمات حتى الآن</p>
          </div>
        </div>
      </div>

      <!-- Map -->
      <section v-if="profile.map_url" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">الموقع على الخريطة</h2>
          <div class="dp-card dp-map-card dp-card-full">
            <a :href="profile.map_url" target="_blank" rel="noopener" class="dp-map-dir-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              عرض المسار على خرائط جوجل
            </a>
            <iframe v-if="mapEmbedUrl" :src="mapEmbedUrl" class="dp-map-embed" allowfullscreen loading="lazy"></iframe>
          </div>
        </div>
      </section>

      <!-- Similar Doctors -->
      <section v-if="similarDoctors.length" class="dp-media-section">
        <div class="dp-section-inner">
          <h2 class="dp-section-title">أطباء مشابهون</h2>
          <div class="dp-similar-scroll">
            <router-link v-for="doc in similarDoctors" :key="doc.clinicId" :to="'/doctor/' + doc.clinicId" class="dp-similar-card">
              <div class="dp-similar-avatar" :style="{ background: doc.photoUrl ? 'none' : getSpecialtyColor(doc.specialty) }">
                <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
                <span v-else>{{ (doc.doctor_name || '').split(' ').map(n => n[0]).join('').substring(0, 2) }}</span>
              </div>
              <div class="dp-similar-info">
                <h4>د. {{ doc.doctor_name }}</h4>
                <span class="dp-similar-spec">{{ doc.specialty || 'طبيب عام' }}</span>
                <div class="dp-similar-meta">
                  <span v-if="doc.rating_avg" class="dp-similar-rating">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ doc.rating_avg }}
                  </span>
                  <span v-if="doc.area" class="dp-similar-area">{{ doc.area }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Booking Modal -->
      <Transition name="dp-modal">
        <div v-if="showBooking" class="dp-overlay" @click.self="showBooking = false" role="dialog" aria-label="حجز موعد">
          <div class="dp-sheet" @click.stop>
            <div v-if="bookingSuccess" class="dp-sheet-success">
              <div class="dp-success-check">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#059669" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>تم الحجز بنجاح!</h3>
              <p v-if="bookingPosition > 1" style="color:#0d9488;font-weight:700;font-size:.95rem;margin-top:4px">
                أنت رقم {{ bookingPosition }} في قائمة الانتظار — {{ bookingPosition - 1 }} مريض قبلك
              </p>
              <p v-else-if="bookingPosition === 1" style="color:#059669;font-weight:700;font-size:.95rem;margin-top:4px">
                أنت التالي في قائمة الانتظار
              </p>
              <p>بانتظار موافقة العيادة — سيتواصل معك فريق العيادة لتأكيد الموعد</p>
              <div class="dp-success-details">
                <div class="dp-success-row"><span>المريض:</span><strong>{{ lastBooking.name }}</strong></div>
                <div class="dp-success-row"><span>الهاتف:</span><strong>{{ lastBooking.phone }}</strong></div>
                <div class="dp-success-row" v-if="booking.selectedDate"><span>التاريخ:</span><strong>{{ booking.selectedDate }}</strong></div>
                <div class="dp-success-row" v-if="booking.selectedTime"><span>الوقت:</span><strong>{{ to12h(booking.selectedTime) }}</strong></div>
              </div>
              <button class="dp-done-btn" @click="showBooking = false; bookingSuccess = false">تم</button>
            </div>
            <template v-else>
              <div class="dp-sheet-head">
                <div>
                  <h3>حجز موعد</h3>
                  <p>مع {{ profile?.doctor_name ? 'د. ' + profile.doctor_name : 'الطبيب' }}</p>
                </div>
                <button class="dp-sheet-close" @click="showBooking = false" aria-label="إغلاق">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="dp-sheet-body">
                <div class="dp-form-group" v-if="availableDates.length">
                  <label>اختر التاريخ</label>
                  <div class="dp-date-chips">
                    <button v-for="d in availableDates" :key="d.iso"
                            :class="['dp-date-chip', booking.selectedDate === d.iso && 'active']"
                            @click="booking.selectedDate = d.iso; booking.selectedTime = ''">
                      <span class="dp-date-chip-day">{{ d.dayName }}</span>
                      <span class="dp-date-chip-num">{{ d.dayNum }}</span>
                      <span class="dp-date-chip-month">{{ d.monthName }}</span>
                    </button>
                  </div>
                </div>
                <div class="dp-form-group" v-if="booking.selectedDate && availableTimeSlots.length">
                  <label>اختر الوقت</label>
                  <div class="dp-time-chips">
                    <button v-for="t in availableTimeSlots" :key="t"
                            :class="['dp-time-chip', booking.selectedTime === t && 'active']"
                            @click="booking.selectedTime = t">
                      {{ to12hShort(t) }}
                    </button>
                  </div>
                </div>
                <div class="dp-form-group">
                  <label>الاسم الكامل *</label>
                  <input v-model="booking.patient_name" type="text" placeholder="الاسم كما في الهوية" class="dp-input" />
                </div>
                <div class="dp-form-row">
                  <div class="dp-form-group">
                    <label>العمر</label>
                    <input v-model.number="booking.age" type="number" placeholder="العمر" class="dp-input" />
                  </div>
                  <div class="dp-form-group">
                    <label>الجنس</label>
                    <select v-model="booking.gender" class="dp-input">
                      <option value="">اختر</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
                <div class="dp-form-group">
                  <label>رقم الهاتف *</label>
                  <input v-model="booking.phone" type="tel" placeholder="07XXXXXXXXX" class="dp-input" dir="ltr" maxlength="11" />
                </div>
                <div class="dp-form-group">
                  <label>سبب الزيارة</label>
                  <textarea v-model="booking.reason" placeholder="اكتب المشكلة باختصار..." class="dp-textarea" rows="2"></textarea>
                </div>
                <div v-if="bookingError" class="dp-alert">{{ bookingError }}</div>
                <button class="dp-book-submit" @click="submitBooking" :disabled="bookingSubmitting">
                  {{ bookingSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </Transition>

      <!-- Sticky Bottom Bar -->
      <div class="dp-bottom-bar">
        <router-link to="/directory" class="dp-bottom-btn dp-bottom-home">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>الرئيسية</span>
        </router-link>
        <router-link to="/favorites" class="dp-bottom-btn dp-bottom-fav">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>المفضلة</span>
        </router-link>
        <router-link to="/bookings" class="dp-bottom-btn dp-bottom-book">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>حجوزاتي</span>
        </router-link>
        <router-link to="/about" class="dp-bottom-btn dp-bottom-about">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
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
          <span>مدار — دليل الأطباء</span>
        </div>
        <div class="dp-footer-copy">&copy; {{ new Date().getFullYear() }} مدار. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { collection, query, where, getDocs, onSnapshot, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { doctorProfilesRepo, reviewsRepo, appointmentsRepo } from '@/services/clinic'
import { to12h, to12hShort } from '@/utils/time'

const route = useRoute()
const clinicId = computed(() => route.params.clinicId)

// State
const loading = ref(true)
const profile = ref(null)
const reviews = ref([])
const similarDoctors = ref([])
const activeTab = ref('about')
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const newReview = ref({ patient_name: '', comment: '', rating: 5 })
const reviewSubmitting = ref(false)
const hasReviewedBefore = ref(false)
const showBooking = ref(false)
const booking = ref({ patient_name: '', age: null, gender: '', phone: '', reason: '', selectedDate: '', selectedTime: '' })
const bookingSubmitting = ref(false)
const bookingError = ref('')
const bookingSuccess = ref(false)
const lastBooking = ref({ name: '', phone: '' })
const bookingPosition = ref(0)

// Review carousel
const reviewCarouselIndex = ref(0)
const currentReview = computed(() => reviews.value[reviewCarouselIndex.value] || null)
let reviewCarouselTimer = null
function startReviewCarousel() {
  if (reviewCarouselTimer) clearInterval(reviewCarouselTimer)
  if (reviews.value.length <= 1) return
  reviewCarouselTimer = setInterval(() => {
    reviewCarouselIndex.value = (reviewCarouselIndex.value + 1) % reviews.value.length
  }, 4000)
}
// Constants
const specialtyColors = {
  'باطنية': '#4f46e5', 'قلب': '#e11d48', 'عظام': '#059669', 'جراحة': '#d97706',
  'أطفال': '#0284c7', 'جلدية': '#7c3aed', 'نساء': '#db2777', 'عيون': '#0891b2',
  'أسنان': '#0d9488', 'أنف وأذن': '#6366f1', 'مسالك بولية': '#0ea5e9',
  'عصبية': '#8b5cf6', 'طب عام': '#475569', 'عام': '#475569', 'طب باطني': '#4f46e5',
  'تجميل': '#ec4899', 'علاج طبيعي': '#059669', 'غدد': '#f97316',
  'روماتيزم': '#14b8a6', 'صدر': '#0891b2'
}
const defaultColors = ['#0d9488', '#14b8a6', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#f97316']

// Utilities
function getDeviceFingerprint() {
  const raw = (typeof navigator !== 'undefined' ? navigator.userAgent : '') +
              (typeof screen !== 'undefined' ? screen.width + 'x' + screen.height : '')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return 'fp_' + Math.abs(hash).toString(36)
}

function getSpecialtyColor(spec) {
  if (!spec) return '#475569'
  for (const [key, val] of Object.entries(specialtyColors)) {
    if (spec.toLowerCase().includes(key.toLowerCase())) return val
  }
  let h = 0
  for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultColors[Math.abs(h) % defaultColors.length]
}

function getAvatarColor(name) {
  if (!name) return '#0d9488'
  const colors = ['#0d9488', '#14b8a6', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
}

function generateTimeSlots(from, to) {
  if (!from || !to) return []
  const slots = []
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  let start = fh * 60 + fm
  const end = th * 60 + tm
  while (start < end) {
    const h = Math.floor(start / 60)
    const m = start % 60
    slots.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'))
    start += 30
  }
  return slots
}

function openLightbox(idx) {
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

function getStarPercentage(star) {
  if (!reviews.value.length) return 0
  return Math.round((reviews.value.filter(r => Math.round(r.rating) === star).length / reviews.value.length) * 100)
}

// Computed
const accentColor = computed(() => getSpecialtyColor(profile.value?.specialty || ''))
const initials = computed(() => (profile.value?.doctor_name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?')
const whatsappNumber = computed(() => {
  let num = (profile.value?.whatsapp || profile.value?.phone1 || '').replace(/[^0-9]/g, '')
  if (num.startsWith('0') && num.length >= 11) num = '964' + num.substring(1)
  else if (num.length === 10 && num.startsWith('7')) num = '964' + num
  else if (!num.startsWith('964') && num.length > 0) num = '964' + num
  return num
})
const allPhotos = computed(() => [...new Set([...(profile.value?.clinic_photos || []), ...(profile.value?.gallery_images || [])].filter(Boolean))])

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
  return url
})

const availableDates = computed(() => {
  const schedule = profile.value?.weekly_schedule || []
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const dayMap = { 'الأحد': 0, 'الإثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6 }
  const dates = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const sched = schedule.find(s => dayMap[s.name] === d.getDay())
    if (sched?.enabled) {
      const p = n => String(n).padStart(2, '0')
      dates.push({
        iso: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        monthName: monthNames[d.getMonth()],
        from: sched.from,
        to: sched.to
      })
    }
  }
  return dates
})

const availableTimeSlots = computed(() => {
  if (!booking.value.selectedDate) return []
  const d = availableDates.value.find(x => x.iso === booking.value.selectedDate)
  return d ? generateTimeSlots(d.from, d.to) : []
})

// Methods
async function submitReview() {
  if (!newReview.value.comment.trim()) return
  reviewSubmitting.value = true
  try {
    const fp = getDeviceFingerprint()
    const existingSnap = await getDocs(query(collection(db, 'reviews'), where('clinicId', '==', clinicId.value), where('device_fingerprint', '==', fp)))
    if (!existingSnap.empty) {
      await reviewsRepo.add(clinicId.value, {
        patient_name: newReview.value.patient_name || existingSnap.docs[0].data().patient_name || 'مجهول',
        comment: newReview.value.comment,
        rating: existingSnap.docs[0].data().rating
      })
    } else {
      await reviewsRepo.add(clinicId.value, { ...newReview.value, device_fingerprint: fp })
    }
    reviews.value = await reviewsRepo.listByClinic(clinicId.value)
    profile.value = await doctorProfilesRepo.getByClinic(clinicId.value)
    newReview.value = { patient_name: '', comment: '', rating: 5 }
  } catch (error) {
    console.error('Review submission error:', error)
  }
  reviewSubmitting.value = false
}

async function submitBooking() {
  bookingError.value = ''
  const b = booking.value
  if (!b.patient_name?.trim()) {
    bookingError.value = 'الاسم مطلوب'
    return
  }
  if (!b.phone?.trim() || b.phone.trim().length < 10) {
    bookingError.value = 'رقم الهاتف غير صحيح'
    return
  }
  bookingSubmitting.value = true
  try {
    let deviceId = localStorage.getItem('madar_device_id')
    if (!deviceId) {
      deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
      localStorage.setItem('madar_device_id', deviceId)
    }
    await appointmentsRepo.add(clinicId.value, {
      patient_name: b.patient_name.trim(),
      full_name: b.patient_name.trim(),
      phone: b.phone.trim(),
      age: b.age || null,
      gender: b.gender || '',
      reason: b.reason || '',
      status: 'pending',
      is_new_patient: true,
      appointment_date: b.selectedDate || undefined,
      start_time: b.selectedTime || undefined,
      doctor_name: profile.value?.doctor_name || '',
      specialty: profile.value?.specialty || '',
      location: (profile.value?.governorate || '') + (profile.value?.governorate && profile.value?.area ? ' - ' : '') + (profile.value?.area || ''),
      device_id: deviceId,
      created_at: new Date().toISOString()
    })

    // Send notifications
    try {
      await addDoc(collection(db, 'notifications'), {
        clinicId: clinicId.value,
        type: 'booking_request',
        patient_name: b.patient_name.trim(),
        phone: b.phone.trim(),
        doctor_name: profile.value?.doctor_name || '',
        specialty: profile.value?.specialty || '',
        appointment_date: b.selectedDate || '',
        start_time: b.selectedTime || '',
        reason: b.reason || '',
        status: 'pending',
        device_id: deviceId,
        read: false,
        created_at: new Date().toISOString()
      })
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: deviceId,
        type: 'booking_sent',
        message: 'تم إرسال طلب حجزك عند د. ' + (profile.value?.doctor_name || '') +
                 (b.selectedDate ? ' — ' + b.selectedDate : '') +
                 (b.selectedTime ? ' الساعة ' + to12h(b.selectedTime) : '') +
                 ' — بانتظار موافقة الطبيب',
        doctor_name: profile.value?.doctor_name || '',
        specialty: profile.value?.specialty || '',
        clinicId: clinicId.value,
        appointment_date: b.selectedDate || '',
        start_time: b.selectedTime || '',
        status: 'pending',
        read: false,
        created_at: new Date().toISOString()
      })
    } catch (e) {
      console.error('Notification error:', e)
    }

    // Get queue position
    if (b.selectedDate) {
      try {
        const dateSnap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId.value), where('appointment_date', '==', b.selectedDate)))
        let position = 0
        dateSnap.forEach(d => {
          const dd = d.data()
          if (dd.status !== 'cancelled' && dd.status !== 'rejected') position++
        })
        bookingPosition.value = position
      } catch (e) {
        bookingPosition.value = 0
      }
    } else {
      bookingPosition.value = 0
    }

    lastBooking.value = { name: b.patient_name.trim(), phone: b.phone.trim() }
    bookingSuccess.value = true
    booking.value = { patient_name: '', age: null, gender: '', phone: '', reason: '', selectedDate: '', selectedTime: '' }
  } catch (error) {
    console.error('Booking error:', error)
    bookingError.value = 'حدث خطأ. حاول مرة أخرى.'
  }
  bookingSubmitting.value = false
}

// Data loading
async function loadSimilarDoctors() {
  if (!profile.value?.specialty) return
  try {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('specialty', '==', profile.value.specialty), where('is_public', '==', true)))
    similarDoctors.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.clinicId !== clinicId.value).slice(0, 10)
  } catch (error) {
    console.error('Similar doctors error:', error)
    similarDoctors.value = []
  }
}

async function loadReviews() {
  try {
    reviews.value = await reviewsRepo.listByClinic(clinicId.value)
    const fp = getDeviceFingerprint()
    const existingSnap = await getDocs(query(collection(db, 'reviews'), where('clinicId', '==', clinicId.value), where('device_fingerprint', '==', fp)))
    hasReviewedBefore.value = !existingSnap.empty
  } catch (error) {
    console.error('Reviews load error:', error)
  }
}

let unsubProfile = null
let viewCounted = false

async function loadProfile() {
  viewCounted = false
  window.scrollTo(0, 0)
  if (unsubProfile) {
    unsubProfile()
    unsubProfile = null
  }

  try {
    const q = query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId.value))
    unsubProfile = onSnapshot(q, async (snap) => {
      if (!snap.empty) {
        profile.value = { id: snap.docs[0].id, ...snap.docs[0].data() }
        if (!viewCounted) {
          viewCounted = true
          doctorProfilesRepo.incrementView(clinicId.value).catch(e => console.error('incrementView error:', e))
        }
        loadReviews()
        loadSimilarDoctors()
      } else {
        profile.value = null
      }
      loading.value = false
    }, (error) => {
      console.error('Profile load error:', error)
      loading.value = false
    })
  } catch (error) {
    console.error('Profile load error:', error)
    profile.value = null
    loading.value = false
  }
}

// Watchers
watch(reviews, (list) => {
  if (reviewCarouselIndex.value >= list.length) {
    reviewCarouselIndex.value = 0
  }
  startReviewCarousel()
})

watch(clinicId, () => {
  loadProfile()
})

// Lifecycle
onMounted(() => {
  loadProfile()
})

onUnmounted(() => {
  if (unsubProfile) unsubProfile()
  if (reviewCarouselTimer) clearInterval(reviewCarouselTimer)
})
</script>

<style scoped>
/* ===== RESET & BASE ===== */
.dp {
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  direction: rtl;
  color: #1e293b;
  background: #f4f7fa;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  padding-bottom: 80px;
  -webkit-font-smoothing: antialiased;
  -webkit-overflow-scrolling: touch;
}
.dp *,.dp *::before,.dp *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.dp button { font-family: inherit; }

/* ===== NAVIGATION ===== */
.dp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(120deg, #0d9488, #0f766e);
  box-shadow: 0 2px 12px rgba(15, 118, 110, 0.25);
}
.dp-nav-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dp-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  text-decoration: none;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  position: relative;
  z-index: 2;
}
.dp-back-btn:hover { background: rgba(255, 255, 255, 0.3); }
.dp-back-btn:active { background: rgba(255, 255, 255, 0.35); transform: scale(0.95); }
.dp-nav-title {
  flex: 1;
  text-align: center;
  font: 800 0.95rem 'Segoe UI', sans-serif;
  color: #fff;
}
.dp-nav-spacer { width: 44px; flex-shrink: 0; }
.dp-nav-spacer { width: 68px; flex-shrink: 0; }

/* ===== SKELETON ===== */
.dp-skeleton-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
.dp-skeleton-hero { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }
.dp-sk {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: dpShimmer 1.5s ease-in-out infinite;
  border-radius: 12px;
}
.sk-circle { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; }
.dp-sk-lines { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.sk-line-w60 { height: 18px; width: 60%; }
.sk-line-w40 { height: 14px; width: 40%; }
.sk-line-w80 { height: 14px; width: 80%; }
.dp-skeleton-cards { display: flex; flex-direction: column; gap: 16px; }
.sk-card { height: 100px; width: 100%; }
@keyframes dpShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* ===== NOT FOUND ===== */
.dp-notfound { text-align: center; padding: 100px 20px; }
.dp-notfound h2 { font-size: 1.3rem; font-weight: 800; color: #475569; margin: 20px 0 8px; }
.dp-notfound p { color: #94a3b8; margin-bottom: 24px; font-size: 0.9rem; }
.dp-nf-btn {
  display: inline-block; padding: 14px 32px; border-radius: 14px;
  background: #0d9488; color: #fff; text-decoration: none; font-weight: 700;
  font-size: 0.9rem; min-height: 48px;
}

/* ===== HERO ===== */
.dp-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #0d9488 0%, #0f766e 55%, #115e59 100%);
  padding: 32px 20px 28px;
}
.dp-hero-bg { position: absolute; inset: 0; pointer-events: none; }
.dp-hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.28; will-change: transform; }
.dp-hero-orb--1 { width: 300px; height: 300px; background: var(--accent, #0d9488); top: -80px; right: -50px; animation: orbF1 8s ease-in-out infinite; }
.dp-hero-orb--2 { width: 220px; height: 220px; background: #0d9488; bottom: -60px; left: -40px; animation: orbF2 10s ease-in-out infinite; }
.dp-hero-orb--3 { width: 160px; height: 160px; background: #d69e1f; top: 30%; left: 50%; opacity: 0.14; animation: orbF3 12s ease-in-out infinite; }
@keyframes orbF1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, 15px); } }
@keyframes orbF2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(15px, -20px); } }
@keyframes orbF3 { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 0); } }
.dp-hero-inner { position: relative; max-width: 1000px; margin: 0 auto; }
.dp-hero-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}
.dp-hero-top { display: flex; gap: 18px; margin-bottom: 18px; }
.dp-avatar {
  width: 80px; height: 80px; border-radius: 20px; display: grid; place-items: center;
  color: #fff; font-weight: 900; font-size: 1.3rem; flex-shrink: 0; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 2.5px solid rgba(255,255,255,0.5);
}
.dp-avatar img { width: 100%; height: 100%; object-fit: contain; background: #f1f5f9; }
.dp-avatar-initials { text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
.dp-hero-info { flex: 1; min-width: 0; }
.dp-hero-spec { display: block; font-size: 0.78rem; font-weight: 800; margin-bottom: 4px; background: rgba(255,255,255,0.9); display: inline-block; padding: 2px 10px; border-radius: 8px; }
.dp-hero-name {
  font-size: 1.4rem; font-weight: 900; color: #fff; margin-bottom: 6px; margin-top: 8px;
  line-height: 1.3; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.dp-verified-badge { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; vertical-align: middle; }
.dp-verified-text { font-size: 0.72rem; font-weight: 800; color: #bfe3ff; }
.dp-hero-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 6px; }
.dp-meta-item { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; color: rgba(255, 255, 255, 0.75); font-weight: 600; }
.dp-hero-rating { display: flex; align-items: center; gap: 6px; }
.dp-stars-static { display: flex; gap: 1px; }
.dp-rating-num { font-size: 1rem; font-weight: 800; color: #fbbf24; }
.dp-rating-count { font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); }

/* ===== HERO ACTIONS ===== */
.dp-hero-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.dp-action-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 18px;
  border-radius: 12px; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer;
  font-family: inherit; transition: all 0.2s; min-height: 46px; -webkit-tap-highlight-color: transparent;
  text-decoration: none; white-space: nowrap;
}
.dp-action-btn:active { transform: scale(0.96); }
.dp-action-book {
  background: linear-gradient(135deg, #059669, #047857); color: #fff;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.35); padding: 0 24px; min-height: 50px; font-size: 0.9rem;
}
.dp-action-wa { background: #25d366; color: #fff; }
.dp-action-wa:hover { background: #1da851; }
.dp-action-call { background: #0d9488; color: #fff; }
.dp-action-call:hover { background: #0e42a8; }

/* ===== SECTION CONTAINER ===== */
.dp-section-inner { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.dp-media-section { padding: 20px 0 0; }
.dp-section-title { font-size: 1rem; font-weight: 800; color: #1e293b; margin-bottom: 10px; }

/* ===== GALLERY ===== */
.dp-gallery-scroll {
  display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; padding-bottom: 4px; scrollbar-width: none;
}
.dp-gallery-scroll::-webkit-scrollbar { display: none; }
.dp-gallery-item {
  flex: 0 0 200px; height: 140px; border-radius: 14px; overflow: hidden; position: relative;
  cursor: pointer; scroll-snap-align: start; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); transition: transform 0.25s;
}
.dp-gallery-item:hover { transform: scale(1.02); }
.dp-gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.dp-gallery-item:hover img { transform: scale(1.05); }
.dp-gallery-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.3); display: grid; place-items: center; opacity: 0; transition: opacity 0.2s; }
.dp-gallery-item:hover .dp-gallery-overlay { opacity: 1; }

/* ===== LIGHTBOX ===== */
.dp-lightbox { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.92); z-index: 300; display: grid; place-items: center; backdrop-filter: blur(8px); }
.dp-lb-close {
  position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,0.15); border: none; cursor: pointer;
  z-index: 2; padding: 12px; min-width: 44px; min-height: 44px; display: grid; place-items: center; border-radius: 50%;
}
.dp-lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.1); border: none;
  border-radius: 50%; width: 48px; height: 48px; display: grid; place-items: center; cursor: pointer;
  transition: background 0.2s; z-index: 2;
}
.dp-lb-nav:hover { background: rgba(255, 255, 255, 0.2); }
.dp-lb-prev { right: 20px; }
.dp-lb-next { left: 20px; }
.dp-lb-img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 8px; }
.dp-lb-counter {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 0.9rem;
  font-weight: 600; background: rgba(0, 0, 0, 0.4); padding: 6px 16px; border-radius: 20px;
}
.dp-lb-enter-active, .dp-lb-leave-active { transition: opacity 0.2s; }
.dp-lb-enter-from, .dp-lb-leave-to { opacity: 0; }

/* ===== VIDEO ===== */
.dp-video-card { border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
.dp-video-embed { width: 100%; aspect-ratio: 16/9; border: none; display: block; }

/* ===== TABS ===== */
.dp-tabs-wrap {
  background: #fff; border-bottom: 1px solid #e5e7eb; overflow-x: auto; -webkit-overflow-scrolling: touch;
  position: sticky; top: 56px; z-index: 90; scrollbar-width: none;
}
.dp-tabs-wrap::-webkit-scrollbar { display: none; }
.dp-tabs { max-width: 1000px; margin: 0 auto; display: flex; padding: 0 20px; min-height: 48px; }
.dp-tab {
  display: flex; align-items: center; gap: 6px; padding: 14px 16px; background: none; border: none;
  border-bottom: 2px solid transparent; margin-bottom: -1px; font-size: 0.85rem; font-weight: 700;
  color: #94a3b8; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap;
  min-height: 48px; -webkit-tap-highlight-color: transparent;
}
.dp-tab.active { color: #0d9488; border-bottom-color: #0d9488; }
.dp-tab:active { opacity: 0.7; }

/* ===== CONTENT ===== */
.dp-content { max-width: 1000px; margin: 0 auto; padding: 24px 20px; }
.dp-content-inner { display: flex; flex-direction: column; gap: 16px; }

/* ===== CARDS ===== */
.dp-card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); border: 1px solid rgba(0, 0, 0, 0.04); }
.dp-card-highlight { border-right: 4px solid #0d9488; }
.dp-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.dp-card-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.dp-card-header h3 { font-size: 1rem; font-weight: 800; color: #1e293b; }
.dp-card-body-text { font-size: 0.88rem; color: #475569; line-height: 1.8; }

/* ===== CERTIFICATIONS ===== */
.dp-cert-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.dp-cert-list li { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #374151; font-weight: 600; }

/* ===== LANGUAGES ===== */
.dp-lang-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.dp-lang-chip { padding: 6px 16px; background: #ede9fe; color: #7c3aed; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }

/* ===== CONDITIONS ===== */
.dp-conditions-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.dp-condition-tag { padding: 6px 14px; background: #fef2f2; color: #be123c; border-radius: 10px; font-size: 0.78rem; font-weight: 700; }

/* ===== INFO GRID ===== */
.dp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dp-info-item { padding: 14px; background: #f8fafc; border-radius: 12px; }
.dp-info-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px; }
.dp-info-val { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.dp-info-val a { color: #0d9488; text-decoration: none; }

/* ===== INSURANCE ===== */
.dp-ins-section { margin-bottom: 14px; }
.dp-ins-section:last-child { margin-bottom: 0; }
.dp-ins-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.dp-ins-chip { padding: 5px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 8px; font-size: 0.78rem; font-weight: 700; }
.dp-pm-chip { padding: 5px 12px; background: #f0fdf4; color: #059669; border-radius: 8px; font-size: 0.78rem; font-weight: 700; }

/* ===== PRICING ===== */
.dp-pricing-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.dp-price-box { flex: 1; min-width: 140px; background: #f8fafc; border-radius: 14px; padding: 18px; text-align: center; }
.dp-price-label { display: block; font-size: 0.78rem; color: #94a3b8; font-weight: 600; margin-bottom: 8px; }
.dp-price-amount { font-size: 1.3rem; font-weight: 900; color: #d69e1f; }
.dp-price-amount small { font-size: 0.8rem; font-weight: 600; }

/* ===== SCHEDULE ===== */
.dp-schedule-table { display: flex; flex-direction: column; gap: 4px; }
.dp-schedule-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-radius: 10px; transition: background 0.2s; }
.dp-schedule-row--active { background: #f0fdf4; }
.dp-schedule-day { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: #64748b; }
.dp-schedule-row--active .dp-schedule-day { color: #059669; }
.dp-schedule-dot { width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; flex-shrink: 0; }
.dp-dot-green { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.dp-schedule-status { display: flex; align-items: center; gap: 8px; }
.dp-schedule-time-badge { font-size: 0.8rem; font-weight: 700; color: #059669; background: #dcfce7; padding: 4px 12px; border-radius: 8px; }
.dp-schedule-slots-count { font-size: 0.72rem; color: #059669; font-weight: 600; }
.dp-schedule-off-badge { font-size: 0.8rem; color: #94a3b8; font-style: italic; }
.dp-schedule-fallback { font-size: 0.9rem; color: #374151; padding: 8px 0; }

/* ===== REVIEWS ===== */
.dp-review-summary {
  background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04); display: flex; gap: 32px; align-items: center; flex-wrap: wrap;
}
.dp-summary-left { text-align: center; min-width: 120px; }
.dp-summary-big { font-size: 3rem; font-weight: 900; color: #1e293b; line-height: 1; }
.dp-summary-stars { display: flex; gap: 2px; justify-content: center; margin: 8px 0; }
.dp-summary-count { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
.dp-summary-bars { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 6px; }
.dp-bar-row { display: flex; align-items: center; gap: 8px; }
.dp-bar-label { font-size: 0.8rem; font-weight: 700; color: #64748b; width: 16px; text-align: center; }
.dp-bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.dp-bar-fill { height: 100%; background: #f59e0b; border-radius: 4px; transition: width 0.4s ease; }
.dp-bar-pct { font-size: 0.72rem; color: #94a3b8; font-weight: 600; width: 36px; text-align: left; }

.dp-review-form { margin-bottom: 0; }
.dp-review-form h3 { font-size: 1rem; font-weight: 800; margin-bottom: 14px; }
.dp-stars-input { display: flex; gap: 4px; margin-bottom: 14px; }
.dp-star-btn {
  background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.15s;
  min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.dp-star-btn:active { transform: scale(1.2); }
.dp-input, .dp-textarea {
  width: 100%; padding: 14px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem;
  font-family: inherit; color: #1e293b; background: #f8fafc; transition: all 0.2s; direction: rtl; -webkit-appearance: none;
}
.dp-input:focus, .dp-textarea:focus {
  outline: none; border-color: #0d9488; background: #fff; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}
.dp-textarea { resize: vertical; min-height: 80px; }
.dp-submit-btn {
  margin-top: 10px; padding: 14px 28px; border-radius: 12px; border: none; background: #0d9488; color: #fff;
  font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; min-height: 48px;
}
.dp-submit-btn:active { transform: scale(0.98); }
.dp-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.dp-returning-note {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #e6f5f3; border-radius: 10px;
  font-size: 0.82rem; color: #0d9488; font-weight: 600; margin-bottom: 14px;
}

.dp-empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; background: #fff; border-radius: 20px; border: 1px dashed #e5e7eb; }
.dp-empty-state p { font-size: 0.88rem; }

.dp-reviews-list { display: flex; flex-direction: column; gap: 12px; }
.dp-review-item { background: #fff; border-radius: 16px; padding: 18px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); border: 1px solid rgba(0, 0, 0, 0.04); }
.dp-review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.dp-review-avatar { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 0.8rem; flex-shrink: 0; }
.dp-review-meta { flex: 1; min-width: 0; }
.dp-review-name { font-size: 0.85rem; font-weight: 700; display: block; }
.dp-review-date { font-size: 0.7rem; color: #94a3b8; }
.dp-review-stars { display: flex; gap: 1px; flex-shrink: 0; }
.dp-review-text { font-size: 0.85rem; color: #475569; line-height: 1.6; }
.dp-review-reply { background: #f0fdf4; border-radius: 12px; padding: 14px; margin-top: 10px; border-right: 3px solid #059669; }
.dp-reply-label { font-size: 0.75rem; font-weight: 700; color: #059669; display: block; margin-bottom: 4px; }
.dp-review-reply p { font-size: 0.82rem; color: #374151; line-height: 1.5; }

/* ===== REVIEWS CAROUSEL ===== */
.dp-reviews-carousel { border-radius: 14px; background: #e6f5f3; border: 1.5px solid #bfe6e1; padding: 16px; overflow: hidden; }
.dp-carousel-dots { display: flex; justify-content: center; gap: 5px; margin-top: 12px; }
.dp-carousel-dot { width: 7px; height: 7px; border-radius: 50%; border: none; background: #94d5cd; cursor: pointer; padding: 6px; transition: all 0.3s; }
.dp-carousel-dot.active { background: #0d9488; width: 20px; border-radius: 3px; }

/* ===== MAP ===== */
.dp-map-dir-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: #e6f5f3; border-radius: 12px;
  text-decoration: none; color: #0d9488; font-weight: 700; font-size: 0.88rem; transition: background 0.2s; margin-bottom: 12px;
}
.dp-map-dir-btn:active { background: #d1ede8; }
.dp-map-embed { width: 100%; height: 280px; border: none; border-radius: 12px; }

/* ===== SIMILAR DOCTORS ===== */
.dp-similar-scroll {
  display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  padding-bottom: 4px; scrollbar-width: none;
}
.dp-similar-scroll::-webkit-scrollbar { display: none; }
.dp-similar-card {
  flex: 0 0 240px; background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04); display: flex; gap: 12px; text-decoration: none; scroll-snap-align: start;
  transition: transform 0.2s, box-shadow 0.2s;
}
.dp-similar-card:active { transform: scale(0.97); }
.dp-similar-avatar { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; color: #fff; font-weight: 900; font-size: 0.9rem; flex-shrink: 0; overflow: hidden; }
.dp-similar-avatar img { width: 100%; height: 100%; object-fit: contain; background: #f1f5f9; }
.dp-similar-info { flex: 1; min-width: 0; }
.dp-similar-info h4 { font-size: 0.85rem; font-weight: 800; color: #1e293b; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-similar-spec { font-size: 0.72rem; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px; }
.dp-similar-meta { display: flex; align-items: center; gap: 8px; }
.dp-similar-rating { display: flex; align-items: center; gap: 3px; font-size: 0.75rem; font-weight: 700; color: #d97706; }
.dp-similar-area { font-size: 0.7rem; color: #94a3b8; }

/* ===== BOOKING MODAL ===== */
.dp-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
.dp-sheet { background: #fff; border-radius: 24px 24px 0 0; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.dp-sheet-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px 24px 0; }
.dp-sheet-head h3 { font-size: 1.1rem; font-weight: 800; }
.dp-sheet-head p { font-size: 0.82rem; color: #94a3b8; margin-top: 2px; }
.dp-sheet-close { background: #f1f5f9; border: none; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: background 0.2s; flex-shrink: 0; }
.dp-sheet-close:active { background: #e2e8f0; }
.dp-sheet-body { padding: 20px 24px 32px; }
.dp-form-group { margin-bottom: 14px; }
.dp-form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px; }
.dp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dp-alert { padding: 12px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; margin-bottom: 12px; background: #fef2f2; color: #dc2626; }

.dp-date-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.dp-date-chips::-webkit-scrollbar { display: none; }
.dp-date-chip {
  flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; padding: 10px 14px; border: 2px solid #e5e7eb;
  border-radius: 12px; background: #fff; cursor: pointer; transition: all 0.2s; min-width: 72px; font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.dp-date-chip.active { border-color: #0d9488; background: #e6f5f3; }
.dp-date-chip:active { transform: scale(0.96); }
.dp-date-chip-day { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
.dp-date-chip-num { font-size: 1.2rem; font-weight: 900; color: #1e293b; line-height: 1.2; }
.dp-date-chip-month { font-size: 0.68rem; color: #94a3b8; }

.dp-time-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dp-time-chip {
  padding: 8px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 0.82rem;
  font-weight: 700; color: #475569; font-family: inherit; transition: all 0.2s; -webkit-tap-highlight-color: transparent;
}
.dp-time-chip.active { border-color: #0d9488; background: #0d9488; color: #fff; }
.dp-time-chip:active { transform: scale(0.96); }

.dp-book-submit {
  width: 100%; padding: 16px; border-radius: 14px; border: none; background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff; font-weight: 800; font-size: 0.95rem; cursor: pointer; font-family: inherit; transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3); min-height: 52px;
}
.dp-book-submit:active { transform: scale(0.98); }
.dp-book-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.dp-sheet-success { padding: 40px 24px 32px; text-align: center; }
.dp-success-check { margin-bottom: 16px; animation: popIn 0.4s ease; }
@keyframes popIn { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
.dp-sheet-success h3 { font-size: 1.3rem; font-weight: 900; color: #059669; margin-bottom: 6px; }
.dp-sheet-success > p { color: #64748b; font-size: 0.88rem; margin-bottom: 20px; }
.dp-success-details { background: #f8fafc; border-radius: 14px; padding: 16px; margin-bottom: 24px; text-align: right; }
.dp-success-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; }
.dp-success-row:last-child { border-bottom: none; }
.dp-success-row span { color: #94a3b8; }
.dp-success-row strong { color: #1e293b; }
.dp-done-btn { padding: 14px 48px; border-radius: 12px; border: none; background: #059669; color: #fff; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit; min-height: 48px; }
.dp-done-btn:active { transform: scale(0.98); }

.dp-modal-enter-active { transition: opacity 0.25s; }
.dp-modal-leave-active { transition: opacity 0.2s; }
.dp-modal-enter-from, .dp-modal-leave-to { opacity: 0; }

/* ===== BOTTOM BAR ===== */
.dp-bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex; gap: 0; padding: 6px 8px; padding-bottom: max(6px, env(safe-area-inset-bottom));
}
.dp-bottom-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  padding: 8px 4px; border-radius: 10px; font-size: 0.65rem; font-weight: 700; text-decoration: none; border: none;
  cursor: pointer; font-family: inherit; transition: all 0.2s; min-height: 48px; -webkit-tap-highlight-color: transparent; color: #94a3b8;
}
.dp-bottom-btn:active { transform: scale(0.96); }
.dp-bottom-home.router-link-active { color: #0d9488; }
.dp-bottom-fav.router-link-active { color: #ef4444; }
.dp-bottom-book {
  color: #fff; background: linear-gradient(135deg, #059669, #047857); border-radius: 14px;
  box-shadow: 0 2px 12px rgba(5, 150, 105, 0.3); min-height: 44px; padding: 8px 12px; text-decoration: none;
}
.dp-bottom-book span { color: #fff; }
.dp-bottom-about.router-link-active { color: #0d9488; }

/* ===== FOOTER ===== */
.dp-footer { border-top: 1px solid #e5e7eb; padding: 24px 20px; background: #0f172a; margin-top: 32px; }
.dp-footer-inner { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.dp-footer-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; color: #94a3b8; }
.dp-footer-logo { width: 24px; height: 24px; border-radius: 6px; object-fit: cover; }
.dp-footer-copy { font-size: 0.72rem; color: #475569; }

/* ===== RESPONSIVE ===== */
@media (min-width: 1024px) {
  .dp-content-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
  .dp-card-full { grid-column: 1 / -1; }
  .dp-reviews-list { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
}

@media (max-width: 480px) {
  .dp-nav-inner { padding: 0 12px; height: 52px; }
  .dp-back-btn { width: 40px; height: 40px; }
  .dp-nav-spacer { width: 40px; }
  .dp-tabs-wrap { top: 52px; }
  .dp-hero { padding: 24px 16px 20px; }
  .dp-hero-card { padding: 18px; }
  .dp-hero-top { gap: 14px; }
  .dp-avatar { width: 64px; height: 64px; border-radius: 16px; font-size: 1.1rem; }
  .dp-hero-name { font-size: 1.2rem; }
  .dp-hero-spec { font-size: 0.7rem; }
  .dp-hero-actions { gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .dp-hero-actions::-webkit-scrollbar { display: none; }
  .dp-action-btn { padding: 0 12px; font-size: 0.75rem; min-height: 44px; flex-shrink: 0; }
  .dp-action-book { padding: 0 16px; min-height: 44px; font-size: 0.8rem; }
  .dp-tabs { padding: 0 16px; }
  .dp-tab { font-size: 0.78rem; padding: 12px 12px; }
  .dp-content { padding: 20px 16px; }
  .dp-info-grid { grid-template-columns: 1fr; }
  .dp-card { padding: 18px; }
  .dp-form-row { grid-template-columns: 1fr; }
  .dp-sheet { border-radius: 20px 20px 0 0; max-height: 95vh; }
  .dp-sheet-head { padding: 20px 20px 0; }
  .dp-sheet-body { padding: 16px 20px 28px; }
  .dp-sheet-success { padding: 32px 20px 28px; }
  .dp-footer-inner { flex-direction: column; text-align: center; gap: 8px; }
  .dp-review-summary { flex-direction: column; text-align: center; }
  .dp-bottom-btn { font-size: 0.6rem; padding: 6px 2px; }
  .dp-bottom-book { padding: 6px 10px; }
  .dp-gallery-item { flex: 0 0 150px; height: 110px; }
  .dp-similar-card { flex: 0 0 200px; padding: 12px; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .dp-hero { padding: 28px 20px 24px; }
  .dp-hero-card { padding: 22px; }
  .dp-avatar { width: 72px; height: 72px; }
  .dp-content { padding: 24px 20px; }
  .dp-gallery-item { flex: 0 0 180px; height: 120px; }
}

/* Touch device optimizations */
@media (hover: none) {
  .dp-gallery-item:hover { transform: none; }
  .dp-gallery-item:hover img { transform: none; }
  .dp-gallery-overlay { opacity: 0 !important; }
  .dp-similar-card:hover { transform: none; }
  .dp-action-btn:hover { transform: none; }
}
</style>