<template>
  <div class="lp">
    <!-- NAVBAR -->
    <nav class="lp-nav">
      <div class="lp-nav-inner">
        <router-link to="/" class="lp-logo">
          <img src="/logo.jpg" alt="مدار" class="lp-logo-img" />
          <span class="lp-logo-text">مدار</span>
        </router-link>
        <div class="lp-nav-links">
          <router-link to="/about" class="lp-nav-link">من نحن</router-link>
          <router-link to="/contact" class="lp-nav-link">تواصل معنا</router-link>
          <router-link to="/bmi" class="lp-nav-link">حاسبة الوزن</router-link>
          <router-link to="/login" class="lp-nav-link lp-nav-login">دخول النظام</router-link>
        </div>
        <div class="lp-nav-right">
          <a href="https://wa.me/9647807202286" target="_blank" class="lp-wa-btn" title="واتساب">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <button class="lp-hamburger" @click="mobileOpen = !mobileOpen" :aria-label="mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'"
            <svg v-if="!mobileOpen" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <transition name="lp-menu">
        <div v-if="mobileOpen" class="lp-mobile-menu">
          <router-link to="/directory" class="lp-mm-link" @click="mobileOpen = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            دليل الأطباء
          </router-link>
          <router-link to="/about" class="lp-mm-link" @click="mobileOpen = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            من نحن
          </router-link>
          <router-link to="/contact" class="lp-mm-link" @click="mobileOpen = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            تواصل معنا
          </router-link>
          <router-link to="/bmi" class="lp-mm-link" @click="mobileOpen = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h5"/></svg>
            حاسبة الوزن المثالي
          </router-link>
          <div class="lp-mm-divider"></div>
          <router-link to="/login" class="lp-mm-link lp-mm-login" @click="mobileOpen = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            دخول النظام
          </router-link>
        </div>
      </transition>
    </nav>

    <!-- HERO -->
    <section class="lp-hero">
      <div class="lp-hero-shapes">
        <div class="lp-shape lp-shape-1"></div>
        <div class="lp-shape lp-shape-2"></div>
        <div class="lp-shape lp-shape-3"></div>
      </div>
      <div class="lp-hero-inner">
        <div class="lp-hero-chip">المنصة الطبية الأولى في العراق</div>
        <h1 class="lp-hero-title">
          ابحث عن
          <span class="lp-hero-hl">طبيبك</span>
          بسهولة وثقة
        </h1>
        <p class="lp-hero-desc">
          دليل شامل يضم آلاف الأطباء والعيادات والمختبرات في جميع المحافظات العراقية.
          اقرأ التقييمات، تواصل مباشرة، واحجز موعدك في ثوانٍ
        </p>
        <div class="lp-hero-actions">
          <router-link to="/directory" class="lp-btn lp-btn-primary-lg">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
            ابدأ البحث الآن
          </router-link>
        </div>
        <div class="lp-hero-stats">
          <div class="lp-hstat"><span class="lp-hstat-num">500+</span><span class="lp-hstat-label">طبيب مسجل</span></div>
          <div class="lp-hstat-sep"></div>
          <div class="lp-hstat"><span class="lp-hstat-num">30+</span><span class="lp-hstat-label">تخصص طبي</span></div>
          <div class="lp-hstat-sep"></div>
          <div class="lp-hstat"><span class="lp-hstat-num">1000+</span><span class="lp-hstat-label">تقييم مريض</span></div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="lp-features">
      <div class="lp-container">
        <div class="lp-section-badge">ما نقدمه</div>
        <h2 class="lp-section-title">كل ما تحتاجه في <span class="lp-text-gradient">مكان واحد</span></h2>
        <p class="lp-section-desc">من البحث حتى الحجز، نوفر لك تجربة متكاملة للعثور على الطبيب المناسب</p>
        <div class="lp-feat-grid">
          <div class="lp-feat-card">
            <div class="lp-feat-icon lp-fi-blue">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
            </div>
            <h3>بحث ذكي وسريع</h3>
            <p>ابحث بالاسم أو التخصص أو العنوان. نتائج فورية تصل إليك في لحظات</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon lp-fi-teal">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h3>تقييمات موثوقة</h3>
            <p>تقييمات حقيقية من مرضى حقيقيين. اعرف تقييم الطبيب قبل ما تزوره</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon lp-fi-gold">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/><path d="M15.05 2a9 9 0 0 1 0 17.9" stroke-linecap="round"/></svg>
            </div>
            <h3>تواصل مباشر</h3>
            <p>اتصل أو راسل عبر واتساب مباشرة. بدون حجوزات معقدة أو وسطاء</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon lp-fi-purple">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>بحث بالمنطقة</h3>
            <p>حدد محافظتك وابحث حسب المنطقة. أقرب طبيب إليك في متناول يدك</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="lp-how">
      <div class="lp-container">
        <div class="lp-section-badge">كيف يعمل</div>
        <h2 class="lp-section-title">ثلاث خطوات <span class="lp-text-gradient">بسيطة</span></h2>
        <p class="lp-section-desc">من البحث إلى الحجز في ثوانٍ معدودة</p>
        <div class="lp-steps">
          <div class="lp-step">
            <div class="lp-step-num">01</div>
            <div class="lp-step-visual">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#0d9488" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><path d="M8 11h6" stroke-linecap="round"/></svg>
            </div>
            <h3>ابحث عن طبيبك</h3>
            <p>اكتب اسم الطبيب أو التخصص أو اختر منطقتك</p>
          </div>
          <div class="lp-step-arrow">
            <svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"><path d="M4 12h40M34 6l6 6-6 6"/></svg>
          </div>
          <div class="lp-step">
            <div class="lp-step-num">02</div>
            <div class="lp-step-visual">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#0d9488" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h3>اطلع على التقييم</h3>
            <p>اقرأ تقييمات المرضى وشوف الملف الشخصي والمواعيد</p>
          </div>
          <div class="lp-step-arrow">
            <svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"><path d="M4 12h40M34 6l6 6-6 6"/></svg>
          </div>
          <div class="lp-step">
            <div class="lp-step-num">03</div>
            <div class="lp-step-visual">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#d69e1f" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3"/><polyline points="16 17 21 12 16 7"/></svg>
            </div>
            <h3>احجز موعدك</h3>
            <p>تواصل مباشرة مع الطبيب واحجز موعدك بدون وسطاء</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TOP DOCTORS -->
    <section v-if="topDoctors.length" class="lp-topdocs">
      <div class="lp-container">
        <div class="lp-section-badge">أفضل الأطباء</div>
        <h2 class="lp-section-title">أعلى الأطباء <span class="lp-text-gradient">تقييماً</span></h2>
        <p class="lp-section-desc">نماذج من الأطباء المميزين في دليل مدار</p>
        <div class="lp-docs-grid">
          <router-link v-for="doc in topDoctors" :key="doc.clinicId" :to="'/doctor/' + doc.clinicId" class="lp-doc-card">
            <div class="lp-doc-rank">{{ topDoctors.indexOf(doc) + 1 }}</div>
            <div class="lp-doc-avatar" :style="{ background: getSpecialtyColor(doc.specialty) }">
              <img v-if="doc.photoUrl" :src="doc.photoUrl" alt="" loading="lazy" />
              <span v-else>{{ initials(doc.doctor_name) }}</span>
            </div>
            <h3>د. {{ doc.doctor_name }}</h3>
            <p class="lp-doc-spec" :style="{ color: getSpecialtyColor(doc.specialty) }">{{ doc.specialty || 'طبيب عام' }}</p>
            <div class="lp-doc-meta">
              <span class="lp-doc-rating">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ doc.rating_avg }}
              </span>
              <span class="lp-doc-reviews">({{ doc.rating_count }} تقييم)</span>
            </div>
            <span v-if="doc.area" class="lp-doc-area">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ doc.area }}
            </span>
          </router-link>
        </div>
        <div class="lp-topdocs-cta">
          <router-link to="/directory" class="lp-btn lp-btn-primary">
            عرض جميع الأطباء
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="lp-cta">
      <div class="lp-container">
        <div class="lp-cta-box">
          <div class="lp-cta-shapes">
            <div class="lp-cta-shape lp-cta-shape-1"></div>
            <div class="lp-cta-shape lp-cta-shape-2"></div>
          </div>
          <div class="lp-cta-inner">
            <h2>ابدأ البحث عن طبيبك الآن</h2>
            <p>آلاف الأطباء في جميع أنحاء العراق بانتظارك. ابحث مجاناً واحجز موعدك مباشرة</p>
            <router-link to="/directory" class="lp-btn lp-btn-white">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
              دخول الدليل
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="lp-footer">
      <div class="lp-container">
        <div class="lp-footer-grid">
          <div class="lp-footer-brand">
            <div class="lp-footer-logo-wrap">
              <img src="/logo.jpg" alt="مدار" class="lp-footer-logo" />
              <span class="lp-footer-name">مدار</span>
            </div>
            <p class="lp-footer-desc">دليل الأطباء والعيادات الطبية الأول في العراق. نربط المرضى بالأطباء بسهولة وأمان</p>
            <div class="lp-footer-social">
              <a href="https://wa.me/9647807202286" target="_blank" class="lp-fsocial" title="واتساب">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://t.me/Madar_System" target="_blank" class="lp-fsocial" title="تيليجرام">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            </div>
          </div>
          <div class="lp-footer-col">
            <h4>روابط سريعة</h4>
            <router-link to="/directory">دليل الأطباء</router-link>
            <router-link to="/about">من نحن</router-link>
            <router-link to="/contact">تواصل معنا</router-link>
            <router-link to="/bmi">حاسبة الوزن</router-link>
            <router-link to="/login">دخول النظام</router-link>
          </div>
          <div class="lp-footer-col">
            <h4>التخصصات</h4>
            <span>طب عام</span>
            <span>أمراض قلب</span>
            <span>طب أسنان</span>
            <span>أطفال</span>
            <span>جلدية</span>
          </div>
        </div>
        <div class="lp-footer-bottom">
          <span>&copy; {{ new Date().getFullYear() }} مدار — جميع الحقوق محفوظة</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doctorProfilesRepo } from '@/services/clinic'

const mobileOpen = ref(false)
const topDoctors = ref([])

const specialtyColors = {
  'باطنية': '#4f46e5', 'internal': '#4f46e5',
  'قلب': '#e11d48', 'cardiology': '#e11d48', 'أمراض قلب': '#e11d48',
  'عظام': '#059669', 'orthopedics': '#059669',
  'جراحة': '#d97706', 'surgery': '#d97706', 'جراح عام': '#d97706',
  'أطفال': '#0284c7', 'pediatrics': '#0284c7',
  'جلدية': '#7c3aed', 'dermatology': '#7c3aed',
  'نساء': '#db2777', 'obstetrics': '#db2777', 'توليد': '#db2777',
  'عيون': '#0891b2', 'ophthalmology': '#0891b2',
  'أسنان': '#0d9488', 'dentistry': '#0d9488', 'طب أسنان': '#0d9488',
  'أنف وأذن': '#6366f1', 'ENT': '#6366f1',
  'مسالك بولية': '#0ea5e9', 'urology': '#0ea5e9',
  'عصبية': '#8b5cf6', 'neurology': '#8b5cf6',
  'طب عام': '#475569', 'عام': '#475569', 'general': '#475569'
}
const defaultColors = ['#0d9488', '#0d9488', '#d69e1f', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#f97316', '#10b981', '#6366f1']

function getSpecialtyColor(spec) {
  if (!spec) return '#475569'
  const lower = spec.toLowerCase().trim()
  for (const [key, val] of Object.entries(specialtyColors)) {
    if (lower.includes(key.toLowerCase())) return val
  }
  let h = 0
  for (let i = 0; i < spec.length; i++) h = spec.charCodeAt(i) + ((h << 5) - h)
  return defaultColors[Math.abs(h) % defaultColors.length]
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

onMounted(async () => {
  try {
    const all = await doctorProfilesRepo.listPublic()
    topDoctors.value = all
      .filter(d => !d.is_lab && !d.is_hospital && d.rating_count > 0 && d.rating_avg > 0)
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0) || (b.rating_count || 0) - (a.rating_count || 0))
      .slice(0, 6)
  } catch { topDoctors.value = [] }
})
</script>

<style scoped>
.lp { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #0f172a; background: #f8fafc; min-height: 100vh; -webkit-font-smoothing: antialiased; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
* { margin: 0; padding: 0; box-sizing: border-box; }
.lp-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

/* NAV */
.lp-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(226,232,240,0.6); }
.lp-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
.lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.lp-logo-img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
.lp-logo-text { font-weight: 900; font-size: 1.3rem; background: linear-gradient(135deg, #0d9488, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp-nav-links { display: flex; gap: 4px; }
.lp-nav-link { padding: 8px 18px; border-radius: 10px; text-decoration: none; color: #64748b; font: 600 0.85rem 'Segoe UI', sans-serif; transition: all 0.2s; }
.lp-nav-link:hover { color: #0d9488; background: #f1f5f9; }
.lp-nav-login { border: 1.5px solid #0d9488; color: #0d9488; font-weight: 700; }
.lp-nav-login:hover { background: #eff6ff; }
.lp-nav-right { display: flex; align-items: center; gap: 10px; }
.lp-wa-btn { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; text-decoration: none; background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; transition: all 0.2s; }
.lp-wa-btn:hover { background: #dcfce7; }
.lp-hamburger { display: none; background: none; border: 1.5px solid #e2e8f0; border-radius: 10px; width: 44px; height: 44px; cursor: pointer; color: #475569; align-items: center; justify-content: center; transition: all 0.2s; }
.lp-hamburger:hover { background: #f1f5f9; border-color: #cbd5e1; }
.lp-mobile-menu { display: none; background: #fff; border-top: 1px solid #e2e8f0; padding: 12px 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
.lp-mm-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; text-decoration: none; color: #334155; font: 600 0.9rem 'Segoe UI', sans-serif; transition: all 0.2s; }
.lp-mm-link:hover { background: #f1f5f9; color: #0d9488; }
.lp-mm-login { color: #0d9488; border: 1.5px solid #0d9488; margin-top: 4px; }
.lp-mm-login:hover { background: #eff6ff; }
.lp-mm-divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
.lp-menu-enter-active, .lp-menu-leave-active { transition: all 0.25s ease; }
.lp-menu-enter-from, .lp-menu-leave-to { opacity: 0; transform: translateY(-8px); }

/* HERO */
.lp-hero { position: relative; padding: 80px 24px 64px; background: linear-gradient(145deg, #0c1d4a 0%, #0d9488 40%, #0d9488 100%); color: #fff; overflow: hidden; }
.lp-hero-shapes { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.lp-shape { position: absolute; border-radius: 50%; }
.lp-shape-1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%); top: -100px; right: -100px; }
.lp-shape-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(13,148,136,0.15), transparent 70%); bottom: -80px; left: -50px; }
.lp-shape-3 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); }
.lp-hero-inner { position: relative; text-align: center; max-width: 720px; margin: 0 auto; }
.lp-hero-chip { display: inline-block; padding: 8px 20px; border-radius: 24px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); font-size: 0.82rem; font-weight: 600; margin-bottom: 24px; backdrop-filter: blur(4px); letter-spacing: 0.02em; }
.lp-hero-title { font: 900 2.8rem/1.15 'Segoe UI', sans-serif; margin: 0 0 20px; }
.lp-hero-hl { color: #fef3c7; position: relative; }
.lp-hero-desc { font-size: 1.05rem; opacity: 0.85; max-width: 560px; margin: 0 auto 36px; line-height: 1.75; }
.lp-hero-actions { margin-bottom: 48px; }
.lp-hero-stats { display: flex; justify-content: center; gap: 36px; }
.lp-hstat { text-align: center; }
.lp-hstat-num { display: block; font: 900 1.8rem 'Segoe UI', sans-serif; }
.lp-hstat-label { font-size: 0.78rem; opacity: 0.65; }
.lp-hstat-sep { width: 1px; height: 32px; background: rgba(255,255,255,0.15); align-self: center; }

/* BUTTONS */
.lp-btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 32px; border-radius: 14px; font: 700 0.95rem 'Segoe UI', sans-serif; text-decoration: none; transition: all 0.3s; cursor: pointer; border: none; font-family: inherit; white-space: nowrap; }
.lp-btn-primary-lg { background: #fff; color: #0d9488; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 16px 36px; font-size: 1rem; border-radius: 16px; }
.lp-btn-primary-lg:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.lp-btn-primary { background: #0d9488; color: #fff; box-shadow: 0 4px 16px rgba(17,80,201,0.25); }
.lp-btn-primary:hover { background: #0e42a8; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(17,80,201,0.35); }
.lp-btn-white { background: #fff; color: #0d9488; box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
.lp-btn-white:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.18); }

/* SECTIONS */
.lp-section-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; background: linear-gradient(135deg, #eff6ff, #f0fdfa); color: #0d9488; font: 700 0.78rem 'Segoe UI', sans-serif; border: 1px solid #dbeafe; margin-bottom: 16px; }
.lp-section-title { font: 900 1.8rem/1.25 'Segoe UI', sans-serif; color: #0f172a; margin: 0 0 10px; }
.lp-text-gradient { background: linear-gradient(135deg, #0d9488, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp-section-desc { font-size: 0.95rem; color: #64748b; max-width: 520px; margin: 0 auto 40px; line-height: 1.6; }

/* FEATURES */
.lp-features { padding: 72px 0; text-align: center; }
.lp-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.lp-feat-card { background: #fff; border-radius: 20px; padding: 36px 24px; border: 1px solid #e2e8f0; transition: all 0.3s; position: relative; overflow: hidden; }
.lp-feat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #0d9488, #0d9488); transform: scaleX(0); transition: transform 0.3s; }
.lp-feat-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
.lp-feat-card:hover::after { transform: scaleX(1); }
.lp-feat-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.lp-fi-blue { background: linear-gradient(135deg, #0d9488, #3b82f6); }
.lp-fi-teal { background: linear-gradient(135deg, #0d9488, #14b8a6); }
.lp-fi-gold { background: linear-gradient(135deg, #d69e1f, #f59e0b); }
.lp-fi-purple { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.lp-feat-card h3 { font: 800 1.05rem/1.3 'Segoe UI', sans-serif; color: #0f172a; margin: 0 0 10px; }
.lp-feat-card p { font-size: 0.88rem; color: #64748b; line-height: 1.65; margin: 0; }

/* HOW IT WORKS */
.lp-how { padding: 72px 0; text-align: center; background: #fff; }
.lp-steps { display: flex; align-items: center; justify-content: center; gap: 16px; max-width: 960px; margin: 0 auto; }
.lp-step { flex: 1; max-width: 260px; padding: 32px 20px; border-radius: 20px; background: #f8fafc; border: 1px solid #e2e8f0; transition: all 0.3s; }
.lp-step:hover { background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-4px); }
.lp-step-num { font: 900 0.75rem 'Segoe UI', sans-serif; color: #0d9488; background: #eff6ff; display: inline-block; padding: 4px 12px; border-radius: 8px; margin-bottom: 16px; letter-spacing: 0.05em; }
.lp-step-visual { width: 72px; height: 72px; border-radius: 20px; background: #fff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.lp-step h3 { font: 800 1.05rem/1.2 'Segoe UI', sans-serif; color: #0f172a; margin: 0 0 8px; }
.lp-step p { font-size: 0.85rem; color: #64748b; line-height: 1.5; }
.lp-step-arrow { flex-shrink: 0; display: flex; align-items: center; }

/* TOP DOCTORS */
.lp-topdocs { padding: 72px 0; text-align: center; }
.lp-docs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 36px; }
.lp-doc-card { position: relative; background: #fff; border-radius: 18px; padding: 28px 20px; text-decoration: none; color: inherit; border: 1px solid #e2e8f0; text-align: center; transition: all 0.3s; overflow: hidden; }
.lp-doc-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0d9488, #0d9488); opacity: 0; transition: opacity 0.3s; }
.lp-doc-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); border-color: transparent; }
.lp-doc-card:hover::before { opacity: 1; }
.lp-doc-rank { position: absolute; top: 14px; left: 14px; width: 28px; height: 28px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font: 800 0.75rem 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; }
.lp-doc-avatar { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 1.1rem; overflow: hidden; margin: 0 auto 14px; }
.lp-doc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lp-doc-card h3 { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.lp-doc-spec { font-size: 0.82rem; font-weight: 700; margin: 0 0 8px; }
.lp-doc-meta { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px; }
.lp-doc-rating { display: flex; align-items: center; gap: 4px; font: 700 0.85rem 'Segoe UI', sans-serif; color: #0f172a; }
.lp-doc-reviews { font-size: 0.72rem; color: #94a3b8; }
.lp-doc-area { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #0d9488; font-weight: 600; margin-top: 4px; }
.lp-topdocs-cta { text-align: center; }

/* CTA */
.lp-cta { padding: 0 0 72px; }
.lp-cta-box { position: relative; background: linear-gradient(145deg, #0c1d4a, #0d9488, #0d9488); border-radius: 24px; padding: 64px 32px; text-align: center; color: #fff; overflow: hidden; }
.lp-cta-shapes { position: absolute; inset: 0; pointer-events: none; }
.lp-cta-shape { position: absolute; border-radius: 50%; }
.lp-cta-shape-1 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%); top: -80px; left: -60px; }
.lp-cta-shape-2 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%); bottom: -50px; right: -30px; }
.lp-cta-inner { position: relative; }
.lp-cta-inner h2 { font: 900 1.8rem/1.2 'Segoe UI', sans-serif; margin: 0 0 12px; }
.lp-cta-inner p { font-size: 0.95rem; opacity: 0.8; margin: 0 0 28px; }

/* FOOTER */
.lp-footer { background: #0f172a; color: #94a3b8; }
.lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; padding: 48px 0 32px; }
.lp-footer-brand { max-width: 320px; }
.lp-footer-logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.lp-footer-logo { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
.lp-footer-name { font: 900 1.2rem 'Segoe UI', sans-serif; color: #fff; }
.lp-footer-desc { font-size: 0.88rem; line-height: 1.65; margin-bottom: 16px; }
.lp-footer-social { display: flex; gap: 10px; }
.lp-fsocial { width: 38px; height: 38px; border-radius: 10px; background: #1e293b; color: #94a3b8; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.2s; }
.lp-fsocial:hover { background: #334155; color: #fff; }
.lp-footer-col { display: flex; flex-direction: column; gap: 10px; }
.lp-footer-col h4 { font: 700 0.88rem 'Segoe UI', sans-serif; color: #e2e8f0; margin-bottom: 4px; }
.lp-footer-col a, .lp-footer-col span { color: #94a3b8; text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
.lp-footer-col a:hover { color: #fff; }
.lp-footer-bottom { border-top: 1px solid #1e293b; padding: 20px 0; text-align: center; font-size: 0.78rem; color: #475569; }

/* MOBILE */
@media (max-width: 480px) {
  .lp-nav-inner { padding: 0 16px; height: 56px; }
  .lp-nav-links { display: none; }
  .lp-hamburger { display: flex; }
  .lp-mobile-menu { display: block; }
  .lp-hero { padding: 48px 16px 40px; }
  .lp-hero-title { font-size: 1.8rem; }
  .lp-hero-desc { font-size: 0.9rem; }
  .lp-hero-stats { gap: 16px; }
  .lp-hstat-num { font-size: 1.4rem; }
  .lp-hstat-label { font-size: 0.7rem; }
  .lp-container { padding: 0 16px; }
  .lp-section-title { font-size: 1.4rem; }
  .lp-features { padding: 48px 0; }
  .lp-feat-grid { grid-template-columns: 1fr; gap: 14px; }
  .lp-feat-card { padding: 28px 20px; }
  .lp-how { padding: 48px 0; }
  .lp-steps { flex-direction: column; gap: 14px; }
  .lp-step-arrow { transform: rotate(90deg); }
  .lp-step { max-width: 100%; width: 100%; }
  .lp-topdocs { padding: 48px 0; }
  .lp-docs-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .lp-doc-card { padding: 20px 14px; }
  .lp-doc-avatar { width: 52px; height: 52px; border-radius: 14px; }
  .lp-doc-card h3 { font-size: 0.88rem; }
  .lp-cta { padding: 0 0 48px; }
  .lp-cta-box { padding: 40px 20px; border-radius: 20px; }
  .lp-cta-inner h2 { font-size: 1.3rem; }
  .lp-footer-grid { grid-template-columns: 1fr; gap: 28px; padding: 32px 0 24px; }
}
@media (min-width: 481px) and (max-width: 768px) {
  .lp-hamburger { display: flex; }
  .lp-nav-links { display: none; }
  .lp-mobile-menu { display: block; }
  .lp-hero-title { font-size: 2.2rem; }
  .lp-feat-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-docs-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 769px) {
  .lp-mobile-menu { display: none !important; }
}
</style>
