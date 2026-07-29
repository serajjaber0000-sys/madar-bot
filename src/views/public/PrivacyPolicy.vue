<template>
  <div class="pp">
    <nav class="pp-nav">
      <div class="pp-nav-inner">
        <button class="pp-back" @click="$router.push('/')" aria-label="العودة">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l7-7-7-7"/></svg>
        </button>
        <span class="pp-nav-title">سياسة الخصوصية</span>
        <div style="width:44px"></div>
      </div>
    </nav>

    <main class="pp-main">
      <div class="pp-container">
        <!-- Header -->
        <div class="pp-header">
          <div class="pp-header-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1>سياسة الخصوصية</h1>
          <p class="pp-subtitle">تطبيق مدار — منصة إدارة العيادات الطبية</p>
          <div class="pp-meta">
            <span>آخر تحديث: يوليو 2026</span>
            <span class="pp-meta-dot"></span>
            <span>الفعالة من: يوليو 2026</span>
          </div>
        </div>

        <!-- Intro -->
        <section class="pp-section pp-section--intro">
          <p>مرحباً بك في تطبيق <strong>مدار</strong> ("نحن" أو "التطبيق"). نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام تطبيقنا.</p>
        </section>

        <!-- 1 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">1</span>
            <h2>جمع المعلومات</h2>
          </div>
          <p>نجمع الأنواع التالية من المعلومات عند استخدامك للتطبيق:</p>

          <h3>أ) معلومات الأطباء و أصحاب العيادات</h3>
          <ul>
            <li>الاسم الكامل والتخصص الطبي</li>
            <li>رقم الهاتف وعنوان العيادة</li>
            <li>المحافظة والمنطقة</li>
            <li>ساعات العمل والأيام المتاحة</li>
            <li>الصور الشخصية وصور العيادة</li>
            <li>معلومات الحساب (البريد الإلكتروني وكلمة المرور)</li>
            <li>بيانات الاشتراك والباقة</li>
          </ul>

          <h3>ب) معلومات المرضى</h3>
          <ul>
            <li>الاسم ورقم الهاتف</li>
            <li>السجل الطبي (التشخيصات والأدوية والتحاليل)</li>
            <li>المواعيد والحجوزات</li>
            <li>سجل الفواتير والمدفوعات</li>
            <li>الرسائل في نظام المحادثة</li>
          </ul>

          <h3>ج) معلومات الاستخدام</h3>
          <ul>
            <li>عنوان IP ونوع الجهاز ونظام التشغيل</li>
            <li>صفحات التطبيق التي تزورها ومدة الاستخدام</li>
            <li>بيانات الموقع الجغرافي (بإذنك فقط)</li>
          </ul>
        </section>

        <!-- 2 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">2</span>
            <h2>استخدام المعلومات</h2>
          </div>
          <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
          <ul>
            <li>توفير خدمات إدارة العيادات والمواعيد والمرضى</li>
            <li>عرض الدليل الطبي العام للمستخدمين</li>
            <li>تمكين المرضى من الحجز والتواصل مع الأطباء</li>
            <li>إرسال إشعارات المواعيد والتذكيرات</li>
            <li>تحسين تجربة المستخدم وتطوير الخدمات</li>
            <li>الأغراض القانونية والامتثال للأنظمة المعمول بها</li>
          </ul>
        </section>

        <!-- 3 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">3</span>
            <h2>مشاركة المعلومات</h2>
          </div>
          <p>لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك معلوماتك في الحالات التالية فقط:</p>
          <ul>
            <li><strong>مع أصحاب العيادات:</strong> بيانات المرضى المتصلين بالعيادة متاحة لصاحب العيادة والموظفين المخولين فقط</li>
            <li><strong>بإذنك الصريح:</strong> عند موافقتك على مشاركة بياناتك مع طرف معين</li>
            <li><strong>للالتزام القانوني:</strong> عند طلب الجهات الرسمية المختصة وفقاً للقوانين المعمول بها</li>
            <li><strong>مزوّدي الخدمات:</strong> مع شركات الاستضافة والبنية التحتية الملتزمة بحماية البيانات</li>
          </ul>
        </section>

        <!-- 4 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">4</span>
            <h2>حماية البيانات الصحية</h2>
          </div>
          <div class="pp-highlight">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <strong>التزام خاص بالبيانات الصحية:</strong>
              <p>السجلات الطبية والتشخيصات والأدوية والتحاليل تعتبر بيانات حساسة وفقاً للقوانين الدولية. نتعامل معها بالمعايير التالية:</p>
            </div>
          </div>
          <ul>
            <li>تشفير جميع البيانات الصحية أثناء النقل والتخزين</li>
            <li>الوصول للسجلات الطبية مقيد بالطبيب المالك والموظفين المخولين فقط</li>
            <li>لا يمكن لأي جهة خارجية الوصول للسجلات الطبية</li>
            <li>حفظ السجلات الطبية على خوادم آمنة داخلية</li>
            <li>حق المريض في طلب حذف سجله الطبي بالكامل</li>
          </ul>
        </section>

        <!-- 5 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">5</span>
            <h2>تخزين البيانات وأمانها</h2>
          </div>
          <ul>
            <li>تُخزَّن جميع البيانات على خوادم Firebase (Google Cloud) المشفرة والمحمية</li>
            <li>يُستخدم تشفير TLS/SSL لجميع اتصالات الشبكة</li>
            <li>يتم الاحتفاظ بالبيانات طالما الحساب نشط</li>
            <li>عند حذف الحساب، يتم حذف جميع البيانات نهائياً خلال 30 يوماً</li>
            <li>نسخ احتياطي منتظمة مع حماية من الفقد</li>
          </ul>
        </section>

        <!-- 6 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">6</span>
            <h2>حقوق المستخدم</h2>
          </div>
          <p>لك الحقوق التالية بخصوص بياناتك:</p>
          <div class="pp-rights-grid">
            <div class="pp-right-card">
              <div class="pp-right-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <strong>الاطلاع</strong>
              <p>حقك في معرفة أي بيانات نحتفظ بها عنك</p>
            </div>
            <div class="pp-right-card">
              <div class="pp-right-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <strong>التعديل</strong>
              <p>حقك في تعديل أو تحديث بياناتك في أي وقت</p>
            </div>
            <div class="pp-right-card">
              <div class="pp-right-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <strong>الحذف</strong>
              <p>حقك في طلب حذف حسابك وبياناتك نهائياً</p>
            </div>
            <div class="pp-right-card">
              <div class="pp-right-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </div>
              <strong>التصدير</strong>
              <p>حقك في تصدير بياناتك بصيغة مقروءة</p>
            </div>
          </div>
        </section>

        <!-- 7 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">7</span>
            <h2>خدمات الأطراف الثالثة</h2>
          </div>
          <p>نستخدم الخدمات التالية في تشغيل التطبيق:</p>
          <div class="pp-services">
            <div class="pp-service">
              <strong>Google Firebase</strong>
              <span>استضافة قواعد البيانات والمصادقة</span>
            </div>
            <div class="pp-service">
              <strong>Google Hosting</strong>
              <span>استضافة الموقع الإلكتروني</span>
            </div>
            <div class="pp-service">
              <strong>imgBB</strong>
              <span>تخزين ورفع الصور</span>
            </div>
          </div>
          <p>جميع هذه الخدمات ملتزمة بمعايير أمان البيانات الدولية بما فيها GDPR و SOC 2.</p>
        </section>

        <!-- 8 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">8</span>
            <h2>ملفات تعريف الارتباط</h2>
          </div>
          <p>يستخدم التطبيق ملفات تعريف الارتباط وتقنيات مشابهة لـ:</p>
          <ul>
            <li>حفظ جلسة تسجيل الدخول</li>
            <li>تخزين تفضيلات المستخدم محلياً</li>
            <li>تحسين أداء التطبيق</li>
          </ul>
          <p>يمكنك إدارة ملفات تعريف الارتباط من إعدادات جهازك.</p>
        </section>

        <!-- 9 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">9</span>
            <h2>خصوصية الأطفال</h2>
          </div>
          <p>التطبيق مخصص لمستخدمي الأعمار 18 سنة فأكثر. لا نجمع عمدًا معلومات شخصية من الأطفال دون سن 18. إذا عُثر على معلومات لطفل دون السن القانوني، سيتم حذفها فوراً.</p>
        </section>

        <!-- 10 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">10</span>
            <h2>التعديلات على السياسة</h2>
          </div>
          <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني. يُنصح بمراجعة هذه الصفحة بانتظام.</p>
        </section>

        <!-- 11 -->
        <section class="pp-section">
          <div class="pp-section-header">
            <span class="pp-num">11</span>
            <h2>التواصل معنا</h2>
          </div>
          <p>إذا كانت لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، يمكنك التواصل معنا:</p>
          <div class="pp-contact-cards">
            <a href="https://wa.me/9647807202286" target="_blank" class="pp-contact-card pp-contact-wa">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>واتساب</span>
            </a>
            <a href="https://t.me/Madar_system" target="_blank" class="pp-contact-card pp-contact-tg">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              <span>تليجرام</span>
            </a>
            <a href="mailto:madar.health@outlook.com" class="pp-contact-card pp-contact-email">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>البريد الإلكتروني</span>
            </a>
          </div>
        </section>

        <!-- Footer -->
        <div class="pp-footer-line">
          <img src="/logo.jpg" alt="مدار" class="pp-footer-logo" />
          <span>مدار — منصة إدارة العيادات الطبية</span>
          <p>&copy; {{ new Date().getFullYear() }} مدار. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.pp{font-family:'Tajawal','Cairo',sans-serif;direction:rtl;color:#1e293b;background:#f4f7fa;min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased}
.pp *,.pp *::before,.pp *::after{margin:0;padding:0;box-sizing:border-box}

/* NAV */
.pp-nav{position:sticky;top:0;z-index:200;background:linear-gradient(135deg,#1150c9,#0d9488);box-shadow:0 2px 16px rgba(17,80,201,0.25)}
.pp-nav-inner{max-width:720px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between}
.pp-back{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.18);color:#fff;border:1.5px solid rgba(255,255,255,0.22);cursor:pointer;transition:all .2s;backdrop-filter:blur(8px)}
.pp-back:hover{background:rgba(255,255,255,0.28)}
.pp-nav-title{color:#fff;font:700 0.95rem/1 'Tajawal',sans-serif}

/* MAIN */
.pp-main{padding:0 12px 60px}
.pp-container{max-width:720px;margin:0 auto}

/* HEADER */
.pp-header{text-align:center;padding:40px 16px 32px}
.pp-header-icon{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#1150c9,#0d9488);display:inline-grid;place-items:center;margin-bottom:16px;box-shadow:0 8px 28px rgba(17,80,201,0.25)}
.pp-header h1{font:800 1.6rem/1.3 'Cairo',sans-serif;color:#0f172a;margin-bottom:6px}
.pp-subtitle{font:600 0.88rem/1.4 'Tajawal',sans-serif;color:#64748b;margin-bottom:14px}
.pp-meta{display:flex;align-items:center;justify-content:center;gap:10px;font-size:0.75rem;color:#94a3b8;font-weight:500}
.pp-meta-dot{width:4px;height:4px;border-radius:50%;background:#cbd5e1}

/* SECTIONS */
.pp-section{background:#fff;border-radius:18px;border:1px solid #e8ecf1;padding:24px 20px;margin-bottom:14px;box-shadow:0 1px 6px rgba(0,0,0,0.03)}
.pp-section--intro{background:linear-gradient(135deg,#eff4ff,#f0fdfa);border-color:#bfdbfe}
.pp-section--intro p{font-size:0.92rem;color:#334155;line-height:1.85}
.pp-section-header{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.pp-num{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#1150c9,#0d9488);color:#fff;display:grid;place-items:center;font:800 0.82rem/1 'Tajawal',sans-serif;flex-shrink:0}
.pp-section h2{font:800 1.02rem/1.3 'Cairo',sans-serif;color:#0f172a}
.pp-section p{font-size:0.86rem;color:#475569;line-height:1.85;margin-bottom:10px}
.pp-section h3{font:700 0.88rem/1.4 'Tajawal',sans-serif;color:#1e293b;margin:16px 0 8px}
.pp-section ul{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.pp-section li{display:flex;align-items:flex-start;gap:8px;font-size:0.84rem;color:#475569;line-height:1.7}
.pp-section li::before{content:'';width:6px;height:6px;border-radius:50%;background:#0d9488;margin-top:7px;flex-shrink:0}
.pp-section li strong{color:#0f172a;font-weight:700}

/* HIGHLIGHT BOX */
.pp-highlight{display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:12px;background:linear-gradient(135deg,#eff4ff,#f0fdfa);border:1px solid #bfdbfe;margin-bottom:12px}
.pp-highlight svg{color:#1150c9;flex-shrink:0;margin-top:2px}
.pp-highlight strong{font:700 0.84rem/1.3 'Tajawal',sans-serif;color:#0f172a;display:block;margin-bottom:4px}
.pp-highlight p{font-size:0.82rem;color:#475569;margin:0;line-height:1.75}

/* RIGHTS GRID */
.pp-rights-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.pp-right-card{padding:14px;border-radius:12px;background:#f8fafc;border:1px solid #e8ecf1;text-align:center}
.pp-right-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1150c9,#0d9488);color:#fff;display:inline-grid;place-items:center;margin-bottom:8px}
.pp-right-card strong{display:block;font:700 0.82rem/1.2 'Tajawal',sans-serif;color:#0f172a;margin-bottom:4px}
.pp-right-card p{font-size:0.72rem;color:#64748b;line-height:1.6;margin:0}

/* SERVICES */
.pp-services{display:flex;flex-direction:column;gap:8px;margin:10px 0}
.pp-service{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9}
.pp-service strong{font:700 0.82rem 'Tajawal',sans-serif;color:#0f172a}
.pp-service span{font-size:0.75rem;color:#64748b}

/* CONTACT CARDS */
.pp-contact-cards{display:flex;gap:10px;margin-top:12px}
.pp-contact-card{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:12px;color:#fff;text-decoration:none;font:700 0.82rem 'Tajawal',sans-serif;transition:all .2s}
.pp-contact-card:active{transform:scale(0.97)}
.pp-contact-wa{background:#25d366;box-shadow:0 4px 16px rgba(37,211,102,0.3)}
.pp-contact-tg{background:#0088cc;box-shadow:0 4px 16px rgba(0,136,204,0.3)}
.pp-contact-email{background:#7c3aed;box-shadow:0 4px 16px rgba(124,58,237,0.3)}

/* FOOTER LINE */
.pp-footer-line{text-align:center;padding:28px 0 20px}
.pp-footer-logo{width:28px;height:28px;border-radius:8px;object-fit:cover;margin-bottom:8px}
.pp-footer-line span{display:block;font:700 0.82rem 'Tajawal',sans-serif;color:#475569;margin-bottom:4px}
.pp-footer-line p{font-size:0.7rem;color:#94a3b8}

@media(min-width:640px){
  .pp-header{padding:56px 24px 40px}
  .pp-header h1{font-size:1.8rem}
  .pp-section{padding:28px 28px}
}
</style>
