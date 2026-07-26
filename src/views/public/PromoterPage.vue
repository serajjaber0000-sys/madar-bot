<template>
  <div class="pp">
    <nav class="pp-nav">
      <div class="pp-nav-inner">
        <router-link to="/" class="pp-logo">
          <img src="/logo.jpg" alt="مدار" class="pp-logo-img" />
          <span class="pp-logo-text">مدار</span>
        </router-link>
        <div class="pp-nav-links">
          <a href="#what" class="pp-nav-link">ما هو مدار</a>
          <a href="#pricing" class="pp-nav-link">الأسعار</a>
          <a href="#owner" class="pp-nav-link">لوحة الطبيب</a>
          <a href="#secretary" class="pp-nav-link">لوحة السكرتير</a>
          <a href="#directory" class="pp-nav-link">الدليل العام</a>
          <a href="#how" class="pp-nav-link">كيفية التسجيل</a>
          <a href="#faq" class="pp-nav-link">الأسئلة الشائعة</a>
        </div>
        <button class="pp-hamburger" @click="mobileOpen = !mobileOpen">
          <svg v-if="!mobileOpen" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <transition name="pp-menu">
        <div v-if="mobileOpen" class="pp-mobile-menu">
          <a href="#what" class="pp-mm-link" @click="mobileOpen = false">ما هو مدار</a>
          <a href="#pricing" class="pp-mm-link" @click="mobileOpen = false">الأسعار</a>
          <a href="#owner" class="pp-mm-link" @click="mobileOpen = false">لوحة الطبيب</a>
          <a href="#secretary" class="pp-mm-link" @click="mobileOpen = false">لوحة السكرتير</a>
          <a href="#directory" class="pp-mm-link" @click="mobileOpen = false">الدليل العام</a>
          <a href="#how" class="pp-mm-link" @click="mobileOpen = false">كيفية التسجيل</a>
          <a href="#faq" class="pp-mm-link" @click="mobileOpen = false">الأسئلة الشائعة</a>
        </div>
      </transition>
    </nav>

    <section class="pp-hero">
      <div class="pp-hero-inner">
        <img src="/logo.jpg" alt="مدار" class="pp-hero-logo" />
        <div class="pp-hero-chip">دليل المروج — منصة مدار الطبية</div>
        <h1>كل ما تحتاج تعرفه عن <span class="pp-hl">مدار</span></h1>
        <p>هذا الدليل مخصص للمروجين والمندوبين — يشرح كل شي عن النظام والأسعار وكيف تشرحه للطبيب</p>
        <div class="pp-hero-btns">
          <a href="#pricing" class="pp-btn pp-btn-white-lg">الأسعار والاشتراكات</a>
          <a href="#what" class="pp-btn pp-btn-outline-white">ابدأ الشرح</a>
        </div>
      </div>
    </section>

    <section id="what" class="pp-section">
      <div class="pp-container">
        <div class="pp-sec-badge">التعريف</div>
        <h2 class="pp-sec-title">ما هو نظام <span class="pp-text-blue">مدار</span>؟</h2>
        <p class="pp-sec-desc">نظام متكامل لإدارة العيادات والمراكز الطبية في العراق — سحابي ويعمل من أي جهاز</p>
        <div class="pp-what-grid">
          <div class="pp-what-card">
            <div class="pp-what-icon" style="background:#eff6ff;color:#1150c9">🩺</div>
            <h3>نظام إدارة العيادات</h3>
            <p>إدارة المرضى، المواعيد، الفواتير، السجل الطبي — كل شي بمكان واحد</p>
          </div>
          <div class="pp-what-card">
            <div class="pp-what-icon" style="background:#f0fdfa;color:#0d9488">🔍</div>
            <h3>الدليل الطبي العام</h3>
            <p>صفحة مجانية تعرض العيادة — المرضى يلقون العيادة بسهولة</p>
          </div>
          <div class="pp-what-card">
            <div class="pp-what-icon" style="background:#eff6ff;color:#1150c9">💬</div>
            <h3>محادثة مباشرة</h3>
            <p>تواصل بين الطبيب والسكرتير، وبين السكرتير والمرضى — بدون واتساب خارجي</p>
          </div>
        </div>
        <div class="pp-who-box">
          <h3>مكونات النظام (المروج لازم يعرفهم)</h3>
          <div class="pp-who-grid">
            <div class="pp-who-item"><span class="pp-who-num">1</span><div><strong>لوحة تحكم الطبيب (المالك)</strong><p>اللوحة الرئيسية — يدير كل شي من هنا</p></div></div>
            <div class="pp-who-item"><span class="pp-who-num">2</span><div><strong>لوحة تحكم السكرتير</strong><p>لوحة فرعية للموظف — إدارة المرضى والمواعيد والمحادثات</p></div></div>
            <div class="pp-who-item"><span class="pp-who-num">3</span><div><strong>الدليل الطبي العام</strong><p>صفحة عامة تظهر فيها العيادة — المرضى يلقون الطبيب</p></div></div>
            <div class="pp-who-item"><span class="pp-who-num">4</span><div><strong>نظام الحجز الأونلاين</strong><p>المرضى يحجزون مواعيد من صفحة الطبيب بالدليل</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="pp-section pp-section-alt">
      <div class="pp-container">
        <div class="pp-sec-badge" style="background:#fef3c7;color:#92400e;border-color:#fde68a">الاشتراكات</div>
        <h2 class="pp-sec-title">أسعار <span class="pp-text-blue">الاشتراكات</span></h2>
        <p class="pp-sec-desc">نظام مدار ب اشتراكات — اشرح للطبيب الباقات والأسعار</p>

        <div class="pp-pricing-table">
          <div class="pp-pt-header">
            <span>مدة الاشتراك</span><span>السعر</span><span>نسبة المروج</span><span>عمولة المروج</span>
          </div>
          <div class="pp-pt-row" v-for="(plan, i) in plans" :key="i">
            <span class="pp-pt-dur">{{ plan.duration }}</span>
            <span class="pp-pt-price">{{ plan.price }}</span>
            <span class="pp-pt-comm">{{ plan.commission }}</span>
            <span class="pp-pt-reward">{{ plan.reward }}</span>
          </div>
        </div>

        <div class="pp-pricing-note">
          <h4>شروط استحقاق العمولة:</h4>
          <ul>
            <li>تُصرف العمولة بعد اكتمال عملية الدفع وتفعيل الاشتراك</li>
            <li>لا تُحتسب العمولة على الاشتراكات الملغاة أو المسترجعة</li>
            <li>تُصرف العمولات والمكافآت شهرياً وفق سياسة الشركة</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="owner" class="pp-section">
      <div class="pp-container">
        <div class="pp-sec-badge">القسم الأول</div>
        <h2 class="pp-sec-title">لوحة تحكم <span class="pp-text-blue">الطبيب (المالك)</span></h2>
        <p class="pp-sec-desc">هذي اللوحة الرئيسية — الطبيب يدير كل شي من هنا. اشرح للطبيب إنو بس يحتاج بريد وكلمة مرور ويدخل</p>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">01</div><div><h3>تسجيل الدخول</h3><p>الطبيب يفتح الرابط ويدخل بريده وكلمة المرور</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>صفحة دخول بسيطة بالعربي</li>
                <li>إمكانية تذكر بيانات الدخول</li>
                <li>دخول مباشر للوحة التحكم</li>
              </ul>
              <div class="pp-tip">اشرح للطبيب: "مجرد ما تفتح الرابط وتدخل بياناتك، تدخل على لوحتك مباشرة"</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-login">
                <img src="/logo.jpg" alt="مدار" class="pp-ml-logo" />
                <div class="pp-ml-name">مدار</div>
                <div class="pp-ml-tag">نظام إدارة العيادات الطبية</div>
                <div class="pp-ml-field"><label>البريد الإلكتروني</label><div class="pp-ml-input">doctor@clinic.com</div></div>
                <div class="pp-ml-field"><label>كلمة المرور</label><div class="pp-ml-input pp-ml-pass">••••••••</div></div>
                <div class="pp-ml-btn">تسجيل الدخول</div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">02</div><div><h3>القائمة الجانبية (Sidebar)</h3><p>قائمة ثابتة باليمين — فيها كل الأقسام</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li><strong>لوحة التحكم:</strong> إحصائيات اليوم والطابور</li>
                <li><strong>المرضى:</strong> إضافة وتعديل المرضى وملفهم الطبي</li>
                <li><strong>المواعيد:</strong> جدول المواعيد والحجوزات</li>
                <li><strong>السجل الطبي:</strong> التشخيصات والوصفات</li>
                <li><strong>الفواتير:</strong> إنشاء فواتير ومتابعة المدفوعات</li>
                <li><strong>الطاقم:</strong> إضافة السكرتير فقط</li>
                <li><strong>الإشعارات:</strong> إشعارات من السكرتير وخدمة العملاء</li>
                <li><strong>المحادثة:</strong> تواصل مع السكرتير</li>
                <li><strong>التقارير:</strong> تقارير الأداء والإيرادات</li>
                <li><strong>الإعدادات:</strong> تعديل معلومات العيادة وساعات العمل</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-sidebar">
                <div class="pp-ms-brand"><img src="/logo.jpg" alt="" class="pp-ms-logo" /><div><div class="pp-ms-name">مدار</div><div class="pp-ms-clinic">عيادة الدكتور أحمد</div></div></div>
                <div class="pp-ms-menu">
                  <div class="pp-ms-item active">🏠 لوحة التحكم</div>
                  <div class="pp-ms-item">👥 المرضى</div>
                  <div class="pp-ms-item">📅 المواعيد</div>
                  <div class="pp-ms-item">🩺 السجل الطبي</div>
                  <div class="pp-ms-item">💰 الفواتير</div>
                  <div class="pp-ms-item">👨‍⚕️ الطاقم</div>
                  <div class="pp-ms-item">🔔 الإشعارات <span class="pp-ms-badge">3</span></div>
                  <div class="pp-ms-item">💬 المحادثة</div>
                  <div class="pp-ms-item">📊 التقارير</div>
                  <div class="pp-ms-item">⚙️ الإعدادات</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">03</div><div><h3>لوحة التحكم الرئيسية (Dashboard)</h3><p>أول صفحة يشوفها الطبيب — إحصائيات اليوم وطابور المرضى</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li><strong>إيرادات اليوم:</strong> المبلغ المالي اللي دخل اليوم (بالدينار العراقي)</li>
                <li><strong>المرضى المكتملون:</strong> عدد المرضى اللي تم كشفهم وانتهوا</li>
                <li><strong>المرضى تحت الاستشارة:</strong> المرضى اللي الحين عند الطبيب</li>
                <li><strong>المرضى في الانتظار:</strong> المرضى اللي لسه ما دخلوا</li>
                <li><strong>طابور اليوم:</strong> قائمة المواعيد مع الحالة (قادم / تحت الاستشارة / تم)</li>
                <li><strong>سجل العمليات:</strong> آخر العمليات المسجلة بالعيادة</li>
              </ul>
              <div class="pp-tip">اشرح للطبيب: "هذي交易中心 — كل يوم تشوف شلون عيادتك شغالة"</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">📊 لوحة التحكم</div>
                <div class="pp-mock-stats">
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">2,500,000</div><div class="pp-mk-stat-lbl">إيرادات اليوم (د.ع)</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">12</div><div class="pp-mk-stat-lbl">المرضى المكتملون</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">3</div><div class="pp-mk-stat-lbl">تحت الاستشارة</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">5</div><div class="pp-mk-stat-lbl">في الانتظار</div></div>
                </div>
                <div class="pp-mock-box-sub">طابور اليوم</div>
                <div class="pp-mock-queue">
                  <div class="pp-mk-q-item"><span class="pp-mk-q-dot" style="background:#16a34a"></span><div><strong>أحمد محمد</strong><small>09:00 كشف عام</small></div><span style="color:#16a34a;font-weight:700;font-size:0.7rem">تم</span></div>
                  <div class="pp-mk-q-item" style="border-color:#1150c9;background:#eff6ff"><span class="pp-mk-q-dot" style="background:#1150c9"></span><div><strong>سارة علي</strong><small>09:30 متابعة</small></div><span style="color:#1150c9;font-weight:700;font-size:0.7rem">جاري</span></div>
                  <div class="pp-mk-q-item"><span class="pp-mk-q-dot" style="background:#d69e1f"></span><div><strong>خالد حسين</strong><small>10:00 كشف عام</small></div><span style="color:#d69e1f;font-weight:700;font-size:0.7rem">انتظار</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">04</div><div><h3>إدارة المرضى</h3><p>إضافة وتعديل المرضى — ملف طبي كامل لكل مريض</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>إضافة مريض: الاسم، رقم الهاتف، العمر، الجنس</li>
                <li>بحث سريع بالاسم أو رقم الهاتف</li>
                <li>ملف مريض كامل: تاريخ المرض، التشخيصات، الوصفات</li>
                <li>رفع صور الأشعة والتحاليل</li>
                <li>متابعة المواعيد القادمة لكل مريض</li>
                <li>طباعة التقارير الطبية</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">👥 إدارة المرضى</div>
                <div class="pp-mock-search">🔍 البحث عن مريض، رقم هاتف...</div>
                <div class="pp-mock-table">
                  <div class="pp-mk-t-row pp-mk-t-head"><span>الاسم</span><span>الهاتف</span><span>الحالة</span></div>
                  <div class="pp-mk-t-row"><span>أحمد محمد</span><span>07701234567</span><span class="pp-mk-badge green">نشط</span></div>
                  <div class="pp-mk-t-row"><span>سارة علي</span><span>07801234567</span><span class="pp-mk-badge blue">متابعة</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">05</div><div><h3>الفواتير والمدفوعات</h3><p>نظام فوترة متكامل — فواتير، أقساط، مصروفات</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>إنشاء فاتورة: اختيار المريض + البنود + المبالغ</li>
                <li>طرق الدفع: نقدي، تحويل بنكي، شبكة</li>
                <li>نظام الأقساط: تقسيم الفاتورة مع جدول سداد</li>
                <li>تتبع المدفوعات: كل دفعة مع التاريخ</li>
                <li>طباعة الفاتورة الرسمية</li>
                <li>تسجيل مصروفات العيادة</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">💰 الفواتير</div>
                <div class="pp-mock-stats">
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">45</div><div class="pp-mk-stat-lbl">إجمالي الفواتير</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">3.2M</div><div class="pp-mk-stat-lbl">المدفوع</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">400K</div><div class="pp-mk-stat-lbl">المتبقي</div></div>
                </div>
                <div class="pp-mk-list"><strong>فاتورة #1024 — أحمد محمد</strong><small>50,000 د.ع — نقدي</small><span class="pp-mk-badge green">مدفوع</span></div>
                <div class="pp-mk-list"><strong>فاتورة #1023 — سارة علي</strong><small>75,000 د.ع — 3 أقساط</small><span class="pp-mk-badge yellow">أقساط</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">06</div><div><h3>السجل الطبي</h3><p>تشخيصات ووصفات وسجل زيارات — لكل مريض</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>التشخيصات: إضافة تشخيص مع التاريخ والوصف</li>
                <li>الوصفات الطبية: إنشاء وصفة وطباعتها</li>
                <li>سجل الزيارات: ملاحظات الطبيب لكل زيارة</li>
                <li>رفع المستندات: صور أشعة، تحاليل مختبرية</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">🩺 السجل الطبي — أحمد محمد</div>
                <div class="pp-mock-tabs"><span class="pp-mk-tab active">التشخيصات</span><span class="pp-mk-tab">الوصفات</span><span class="pp-mk-tab">الزيارات</span></div>
                <div class="pp-mk-list"><strong>ارتفاع ضغط الدم</strong><small>15 تموز 2026 — وصفة: لوسارتان 50mg</small></div>
                <div class="pp-mk-list"><strong>متابعة: تحسن الحالة</strong><small>1 آب 2026 — تم تعديل الجرعة</small></div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">07</div><div><h3>إدارة الطاقم (السكرتير فقط)</h3><p>إضافة سكرتير واحد فقط — الطبيب يدير العيادة والسكرتير يساعد بالمواعيد</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>إضافة سكرتير واحد: الاسم، البريد، كلمة المرور</li>
                <li>السكرتير يدخل بنفس صفحة الدخول</li>
                <li>لوحة تحكم مخصصة للسكرتير بصلحيات محددة</li>
                <li>السكرتير يدير: المرضى، المواعيد، محادثة المرضى</li>
                <li>السكرتير لا يرى: الفواتير، الإعدادات، التقارير</li>
              </ul>
              <div class="pp-note">ملاحظة: الطاقم يتكون فقط من السكرتير — لا يوجد أدوار أخرى</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">👨‍⚕️ الطاقم</div>
                <div class="pp-mk-list"><div class="pp-mk-avatar" style="background:#1150c9">دأ</div><div><strong>د. أحمد (المالك)</strong><small>مدير العيادة — صلاحيات كاملة</small></div><span class="pp-mk-badge blue">مالك</span></div>
                <div class="pp-mk-list"><div class="pp-mk-avatar" style="background:#7c3aed">سن</div><div><strong>سارة ناصر</strong><small>سكرتيرة — 07701112233</small></div><span class="pp-mk-badge purple">سكرتير</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">08</div><div><h3>المحادثة (الطبيب ↔ السكرتير)</h3><p>تواصل مباشر بين الطبيب والسكرتير — بدون واتساب</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>محادثة مباشرة بين الطبيب والسكرتير</li>
                <li>رسائل فورية مع إشعارات</li>
                <li>أرشيف المحادثات السابقة</li>
                <li>الطبيب يراسل السكرتير من أي جهاز</li>
              </ul>
              <div class="pp-note">ملاحظة: الطبيب لا يراسل المرضى مباشرة — السكرتير يراسل المرضى من قسم "محادثة المرضى"</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">💬 محادثة الطاقم</div>
                <div class="pp-mk-chat">
                  <div class="pp-mk-chat-msg doctor">سارة، تأكدي موعد أحمد محمد الساعة 10</div>
                  <div class="pp-mk-chat-msg user">تم التأكيد دكتور، المريض وافق</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num">09</div><div><h3>الإعدادات</h3><p>تعديل معلومات العيادة وساعات العمل والملف العام</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>معلومات العيادة: الاسم، الوصف، الشعار، الصور</li>
                <li>ساعات العمل: تحديد الأيام والأوقات (أو 24 ساعة)</li>
                <li>الملف العام: اللي يظهر بالدليل الطبي</li>
                <li>رفع وثائق التحقق لعمل علامة ✓ زرقاء</li>
                <li>تعديل كلمة المرور</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">⚙️ الإعدادات</div>
                <div class="pp-mk-list"><div><strong>معلومات العيادة</strong><small>الاسم، الوصف، الشعار</small></div><span style="color:#94a3b8">←</span></div>
                <div class="pp-mk-list"><div><strong>ساعات العمل</strong><small>الأحد — الخميس | 8:00 — 14:00</small></div><span style="color:#94a3b8">←</span></div>
                <div class="pp-mk-list"><div><strong>الملف العام بالدليل</strong><small>يظهر للمريض في الدليل</small></div><span style="color:#94a3b8">←</span></div>
                <div class="pp-mk-list"><div><strong>تعديل كلمة المرور</strong><small>الأمان والخصوصية</small></div><span style="color:#94a3b8">←</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="secretary" class="pp-section pp-section-alt">
      <div class="pp-container">
        <div class="pp-sec-badge" style="background:#eff6ff;color:#1150c9;border-color:#bfdbfe">القسم الثاني</div>
        <h2 class="pp-sec-title">لوحة تحكم <span class="pp-text-blue">السكرتير</span></h2>
        <p class="pp-sec-desc">لوحة فرعية للموظف — نفس صفحة الدخول، بس بصلحيات محددة. الطبيب يضيف السكرتير من قسم الطاقم</p>

        <div class="pp-compare-box">
          <h3>الفرق بين الطبيب والسكرتير</h3>
          <div class="pp-compare-grid">
            <div class="pp-compare-col">
              <div class="pp-compare-header" style="background:#1150c9;color:#fff">الطبيب (المالك)</div>
              <ul>
                <li class="pp-yes">لوحة التحكم الكاملة</li>
                <li class="pp-yes">إدارة المرضى</li>
                <li class="pp-yes">المواعيد</li>
                <li class="pp-yes">السجل الطبي</li>
                <li class="pp-yes">الفواتير والمدفوعات</li>
                <li class="pp-yes">إدارة الطاقم (السكرتير)</li>
                <li class="pp-yes">التقارير</li>
                <li class="pp-yes">الإعدادات</li>
                <li class="pp-yes">محادثة السكرتير</li>
                <li class="pp-yes">الإشعارات</li>
              </ul>
            </div>
            <div class="pp-compare-col">
              <div class="pp-compare-header" style="background:#f1f5f9;color:#475569">السكرتير (الموظف)</div>
              <ul>
                <li class="pp-yes">لوحة التحكم</li>
                <li class="pp-yes">إدارة المرضى</li>
                <li class="pp-yes">المواعيد</li>
                <li class="pp-no">السجل الطبي</li>
                <li class="pp-no">الفواتير</li>
                <li class="pp-no">إدارة الطاقم</li>
                <li class="pp-no">التقارير</li>
                <li class="pp-no">الإعدادات</li>
                <li class="pp-yes">محادثة الطاقم</li>
                <li class="pp-yes">محادثة المرضى</li>
                <li class="pp-yes">الإشعارات</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)">01</div><div><h3>لوحة تحكم السكرتير</h3><p>أول صفحة يشوفها السكرتير — إحصائيات اليوم</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li><strong>حجوزات اليوم:</strong> عدد المواعيد المحجوزة</li>
                <li><strong>دخل العيادة:</strong> المرضى اللي وصلوا</li>
                <li><strong>اكتمل:</strong> المرضى اللي انتهى كشفهم</li>
                <li><strong>إيرادات اليوم:</strong> المبلغ المالي</li>
                <li><strong>أزرار سريعة:</strong> حجز موعد جديد، إضافة مريض، أرشيف الحجوزات</li>
              </ul>
              <div class="pp-tip">اشرح للطبيب: "السكرتير يشوف لوحة أبسط — يدير المرضى والمواعيد والمحادثات"</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">📊 لوحة السكرتير</div>
                <div class="pp-mock-stats">
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">8</div><div class="pp-mk-stat-lbl">حجوزات اليوم</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">5</div><div class="pp-mk-stat-lbl">دخل العيادة</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">3</div><div class="pp-mk-stat-lbl">اكتمل</div></div>
                  <div class="pp-mk-stat"><div class="pp-mk-stat-val">250K</div><div class="pp-mk-stat-lbl">إيرادات اليوم</div></div>
                </div>
                <div class="pp-mock-box-sub">أزرار سريعة</div>
                <div class="pp-mock-quick-btns">
                  <span class="pp-mk-qbtn blue">+ حجز موعد</span>
                  <span class="pp-mk-qbtn pink">+ مريض جديد</span>
                  <span class="pp-mk-qbtn gold">أرشيف</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-step">
          <div class="pp-step-head"><div class="pp-step-num" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)">02</div><div><h3>محادثة المرضى (السكرتير ↔ المرضى)</h3><p>تواصل مباشر مع كل مريض — السكرتير يرد على المرضى</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>قائمة المرضى مع آخر رسالة</li>
                <li>محادثة مباشرة مع كل مريض</li>
                <li>رسائل فورية مع إشعارات</li>
                <li>المريض يراسل العيادة من صفحة الدليل</li>
                <li>السكرتير يرد على المرضى</li>
              </ul>
              <div class="pp-note">ملاحظة: الطبيب لا يراسل المرضى مباشرة — السكرتير هو沟通Points مع المرضى</div>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">💬 محادثة المرضى</div>
                <div class="pp-mk-chat">
                  <div class="pp-mk-chat-msg user">مرحباً، بدي موعد عند الدكتور أحمد</div>
                  <div class="pp-mk-chat-msg doctor">أهلاً، تفضل الوقت متاح غداً الساعة 10 صباحاً</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-steps-mini">
          <div class="pp-steps-mini-title">كيف تضيف سكرتير جديد:</div>
          <div class="pp-steps-mini-list">
            <div class="pp-steps-mini-item"><span>1</span>الطبيب يفتح "الطاقم" من القائمة الجانبية</div>
            <div class="pp-steps-mini-item"><span>2</span>يضغط "إضافة موظف جديد"</div>
            <div class="pp-steps-mini-item"><span>3</span>يكتب اسم الموظف وبريدده وكلمة المرور</div>
            <div class="pp-steps-mini-item"><span>4</span>السكرتير يفتح نفس الرابط ويدخل بنفس البريد وكلمة المرور</div>
            <div class="pp-steps-mini-item"><span>5</span>يدخل على لوحته — يدير المرضى والمواعيد والمحادثات</div>
          </div>
        </div>
      </div>
    </section>

    <section id="directory" class="pp-section">
      <div class="pp-container">
        <div class="pp-sec-badge" style="background:#ecfdf5;color:#059669;border-color:#a7f3d0">القسم الثالث</div>
        <h2 class="pp-sec-title">الدليل الطبي <span class="pp-text-teal">العام</span></h2>
        <p class="pp-sec-desc">صفحة عامة مجانية — المرضى يلقون فيها الأطباء والصيدليات والمستشفيات</p>

        <div class="pp-dir-flow">
          <div class="pp-dir-flow-title">كيف يشتغل الدليل:</div>
          <div class="pp-dir-flow-steps">
            <div class="pp-dir-flow-item"><div class="pp-dir-flow-num">1</div><strong>الطبيب يسجّل عيادته</strong><p>يكمّل المعلومات ويختار التخصص والمحافظة</p></div>
            <div class="pp-dir-flow-arrow">←</div>
            <div class="pp-dir-flow-item"><div class="pp-dir-flow-num">2</div><strong>الأدمن يوافق</strong><p>مشرف النظام يراجع العيادة ويوافق عليها</p></div>
            <div class="pp-dir-flow-arrow">←</div>
            <div class="pp-dir-flow-item"><div class="pp-dir-flow-num">3</div><strong>العيادة تظهر بالدليل</strong><p>تظهر حسب التخصص والمحافظة</p></div>
            <div class="pp-dir-flow-arrow">←</div>
            <div class="pp-dir-flow-item"><div class="pp-dir-flow-num">4</div><strong>المرضى يلقون العيادة</strong><p>يبحثون بالاسم أو التخصص أو المنطقة</p></div>
          </div>
        </div>

        <div class="pp-dir-types">
          <h3>أنواع العيادات بالدليل:</h3>
          <div class="pp-dir-types-grid">
            <div class="pp-dir-type"><div class="pp-dir-type-icon" style="background:#eff6ff;color:#1150c9">🩺</div><strong>أطباء ومراكز طبية</strong><p>عيادات عامة ومتخصصة</p></div>
            <div class="pp-dir-type"><div class="pp-dir-type-icon" style="background:#f0fdfa;color:#0d9488">💊</div><strong>صيدليات</strong><p>قائمة بالصيدليات مع ساعات العمل</p></div>
            <div class="pp-dir-type"><div class="pp-dir-type-icon" style="background:#eff6ff;color:#1150c9">🏥</div><strong>مستشفيات</strong><p>دليل المستشفيات مع التخصصات</p></div>
            <div class="pp-dir-type"><div class="pp-dir-type-icon" style="background:#f0fdfa;color:#0d9488">🔬</div><strong>مختبرات</strong><p>المختبرات الطبية</p></div>
            <div class="pp-dir-type"><div class="pp-dir-type-icon" style="background:#eff6ff;color:#1150c9">🦴</div><strong>علاج طبيعي</strong><p>مراكز العلاج والتأهيل</p></div>
          </div>
        </div>

        <div class="pp-dir-features">
          <h3>مميزات العيادة المشتركة (المدفوعة):</h3>
          <div class="pp-dir-features-grid">
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> تظهر بأول القائمة مع نجمة</div>
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> علامة ✓ زرقاء للعيادة المتحققة</div>
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> صفحة ملف شخصي كاملة مع صور</div>
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> المرضى يقدرون يقيّمون الطبيب</div>
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> حجز أونلاين مباشر من صفحة الطبيب</div>
            <div class="pp-dir-feat"><span style="color:#1150c9;font-weight:800">✓</span> تواصل عبر واتساب أو المحادثة</div>
          </div>
        </div>

        <div class="pp-step" style="margin-top:32px">
          <div class="pp-step-head"><div class="pp-step-num" style="background:linear-gradient(135deg,#059669,#10b981)">📅</div><div><h3>كيف يحجز المريض موعد أونلاين</h3><p>خطوات الحجز من صفحة الطبيب بالدليل</p></div></div>
          <div class="pp-step-content">
            <div class="pp-step-text">
              <ul>
                <li>يفتح صفحة الطبيب بالدليل</li>
                <li>يشوف ملف الطبيب: التخصص، التقييم، ساعات العمل</li>
                <li>يضغط "حجز موعد"</li>
                <li>يختار التاريخ والوقت المتاح</li>
                <li>يكتب الاسم ورقم الهاتف</li>
                <li>يرسل طلب الحجز</li>
                <li>إشعار للسكرتير (يدخل على لوحته)</li>
                <li>السكرتير يأكد أو يرفض الحجز</li>
                <li>إشعار للمريض بالتأكيد</li>
              </ul>
            </div>
            <div class="pp-step-mock">
              <div class="pp-mock-box">
                <div class="pp-mock-box-title">📅 حجز موعد — د. أحمد محمد</div>
                <div class="pp-mock-row"><div class="pp-mock-field"><label>التاريخ</label><div class="pp-mock-input">الأحد، 27 تموز 2026</div></div><div class="pp-mock-field"><label>الوقت</label><div class="pp-mock-input">10:00 ص</div></div></div>
                <div class="pp-mock-row"><div class="pp-mock-field"><label>الاسم</label><div class="pp-mock-input">أحمد محمد</div></div><div class="pp-mock-field"><label>الهاتف</label><div class="pp-mock-input">07701234567</div></div></div>
                <div class="pp-mock-field"><label>نوع الكشف</label><div class="pp-mock-input">كشف عام</div></div>
                <div class="pp-mock-btn" style="background:#0d9488">إرسال طلب الحجز</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how" class="pp-section pp-section-alt">
      <div class="pp-container">
        <div class="pp-sec-badge">للمروج</div>
        <h2 class="pp-sec-title">كيفية <span class="pp-text-blue">تسجيل الطبيب</span></h2>
        <p class="pp-sec-desc">المروج يتواصل مع خدمة العملاء — يتم إنشاء الحساب فوراً</p>

        <div class="pp-steps-mini" style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;margin-bottom:24px">
          <div class="pp-steps-mini-title" style="font:800 1.1rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:16px">خطوات التسجيل:</div>
          <div class="pp-steps-mini-list">
            <div class="pp-steps-mini-item"><span>1</span>المروج يتواصل مع خدمة العملاء عبر الواتساب أو التلكرام</div>
            <div class="pp-steps-mini-item"><span>2</span>ينطي لخدمة العملاء معلومات الطبيب: الاسم، البريد، اسم العيادة، التخصص، المحافظة</div>
            <div class="pp-steps-mini-item"><span>3</span>خدمة العملاء تنشئ الحساب فوراً</div>
            <div class="pp-steps-mini-item"><span>4</span>خدمة العملاء ترسل بيانات الدخول (البريد + كلمة المرور) للمروج</div>
            <div class="pp-steps-mini-item"><span>5</span>المروج ينطي بيانات الدخول للطبيب</div>
            <div class="pp-steps-mini-item"><span>6</span>الطبيب يفتح الرابط ويدخل — يشوف لوحة التحكم جاهزة</div>
            <div class="pp-steps-mini-item"><span>7</span>الطبيب يكمّل معلومات العيادة من الإعدادات</div>
          </div>
        </div>

        <div class="pp-reg-contact" style="text-align:center">
          <p style="font-size:0.95rem;color:#475569;margin-bottom:16px">للتواصل مع خدمة العملاء:</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <a href="https://wa.me/9647807202286" target="_blank" rel="noopener" class="pp-btn pp-btn-green">واتساب</a>
            <a href="https://t.me/Madar_System" target="_blank" rel="noopener" class="pp-btn pp-btn-blue">تيليجرام</a>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="pp-section">
      <div class="pp-container">
        <div class="pp-sec-badge">للإجابة على أسئلة الطبيب</div>
        <h2 class="pp-sec-title">الأسئلة <span class="pp-text-blue">الشائعة</span></h2>
        <p class="pp-sec-desc">أسئلة يسألها الطبيب كثير — جهّز لها الإجابات</p>
        <div class="pp-faq-list">
          <div class="pp-faq-item" v-for="(faq, i) in faqs" :key="i">
            <div class="pp-faq-q" @click="faq.open = !faq.open">
              <span>{{ faq.q }}</span>
              <span class="pp-faq-arrow" :class="{ open: faq.open }">‹</span>
            </div>
            <transition name="pp-faq">
              <div v-if="faq.open" class="pp-faq-a">{{ faq.a }}</div>
            </transition>
          </div>
        </div>
      </div>
    </section>

    <section class="pp-cta">
      <div class="pp-container">
        <div class="pp-cta-box">
          <img src="/logo.jpg" alt="مدار" class="pp-cta-logo" />
          <h2>ابدأ الآن مع مدار</h2>
          <p>تواصل مع خدمة العملاء وسجّل الطبيب اليوم</p>
          <div class="pp-cta-btns">
            <a href="https://wa.me/9647807202286" target="_blank" rel="noopener" class="pp-btn pp-btn-white">تواصل عبر الواتساب</a>
            <a href="https://t.me/Madar_System" target="_blank" rel="noopener" class="pp-btn pp-btn-outline-white">تيليجرام</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="pp-footer">
      <div class="pp-container">
        <div class="pp-footer-inner">
          <img src="/logo.jpg" alt="مدار" class="pp-ft-logo" />
          <span>&copy; {{ new Date().getFullYear() }} مدار — جميع الحقوق محفوظة</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
const mobileOpen = ref(false)

const plans = [
  { duration: 'شهر واحد', price: '20,000 د.ع', commission: '20%', reward: '4,000 د.ع' },
  { duration: 'شهران', price: '38,000 د.ع', commission: '20%', reward: '7,600 د.ع' },
  { duration: '3 أشهر', price: '55,000 د.ع', commission: '20%', reward: '11,000 د.ع' },
  { duration: '6 أشهر', price: '99,000 د.ع', commission: '25%', reward: '24,750 د.ع' },
  { duration: 'سنة كاملة (عرض الإطلاق)', price: '149,000 د.ع', commission: '25%', reward: '37,250 د.ع' },
]

const faqs = reactive([
  { q: 'كم تكلفة النظام؟', a: 'نظام مدار ب اشتراكات: شهر واحد 20,000 د.ع، شهران 38,000 د.ع، 3 أشهر 55,000 د.ع، 6 أشهر 99,000 د.ع، سنة كاملة 149,000 د.ع (عرض الإطلاق).', open: false },
  { q: 'هل يحتاج تثبيت على الكمبيوتر؟', a: 'لا — النظام سحابي ويعمل من المتصفح. فقط افتح الرابط وسجل دخول. يعمل على الكمبيوتر والموبايل والتابلت.', open: false },
  { q: 'كم أخذ وقت التسجيل؟', a: 'المروج يتواصل مع خدمة العملاء — الحساب ينشئ فوراً وينرسل له. بعدها الطبيب يدخل ويكمل معلومات العيادة.', open: false },
  { q: 'البيانات آمنة؟', a: 'نعم — البيانات مخزنة على خوادم Firebase الآمنة ومشفّرة. فقط الصلاحيات المخولة تقدر توصل للبيانات.', open: false },
  { q: 'السكرتير يقدر يشوف الفواتير؟', a: 'لا — السكرتير ما يشوف الفواتير ولا الإعدادات المالية. صلاحياته: المرضى، المواعيد، الإشعارات، محادثة المرضى.', open: false },
  { q: 'هل الطبيب يقدر يحذف حسابه؟', a: 'نعم — من الإعدادات يقدر يحذف حسابه وبياناته بالكامل.', open: false },
  { q: 'كيف المريض يحجز موعد؟', a: 'المريض يفتح صفحة الطبيب بالدليل ويضغط "حجز موعد" — يختار التاريخ والوقت ويرسل الطلب. السكرتير يأكد الحجز.', open: false },
  { q: 'هل يشتغل بدون إنترنت؟', a: 'لا — النظام يحتاج إنترنت لأنه سحابي. بس يشتغل حتى على إنترنت بطيء.', open: false },
  { q: 'كم مريض يقدر الطبيب يضيف؟', a: 'لا يوجد حد — الطبيب يقدر يضيف عدد ما يريده من المرضى.', open: false },
  { q: 'هل فيه تطبيق موبايل؟', a: 'النظام يعمل من متصفح الموبايل بشكل ممتاز. تطبيق موبايل مستقبلاً إن شاء الله.', open: false },
  { q: 'المحادثة كيف تشتغل؟', a: 'الطبيب يراسل السكرتير من قسم "المحادثة". السكرتير يراسل المرضى من قسم "محادثة المرضى". لا يوجد محادثة مباشرة بين الطبيب والمرضى.', open: false },
  { q: 'كم عدد الطاقم المسموح؟', a: 'الطاقم يتكون فقط من سكرتير واحد — لا يوجد أدوار أخرى مثل طبيب مساعد أو ممرض.', open: false },
])
</script>

<style scoped>
.pp{font-family:'Cairo','Tajawal','Segoe UI',sans-serif;direction:rtl;color:#0f172a;background:#f8fafc;min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden}
*{margin:0;padding:0;box-sizing:border-box}
.pp-container{max-width:1100px;margin:0 auto;padding:0 24px}

.pp-nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);border-bottom:1px solid #e2e8f0}
.pp-nav-inner{max-width:1100px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between}
.pp-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.pp-logo-img{width:34px;height:34px;border-radius:10px;object-fit:cover}
.pp-logo-text{font-weight:900;font-size:1.2rem;color:#1150c9}
.pp-nav-links{display:flex;gap:4px}
.pp-nav-link{padding:8px 14px;border-radius:10px;text-decoration:none;color:#475569;font:600 0.78rem 'Cairo',sans-serif;transition:all .2s}
.pp-nav-link:hover{color:#1150c9;background:#eff6ff}
.pp-hamburger{display:none;background:none;border:1.5px solid #e2e8f0;border-radius:10px;width:42px;height:42px;cursor:pointer;color:#475569;align-items:center;justify-content:center}
.pp-mobile-menu{background:#fff;border-top:1px solid #e2e8f0;padding:12px 24px;box-shadow:0 8px 32px rgba(0,0,0,0.08)}
.pp-mm-link{display:block;padding:12px 16px;border-radius:10px;text-decoration:none;color:#334155;font:600 0.9rem 'Cairo',sans-serif;transition:all .2s}
.pp-mm-link:hover{background:#eff6ff;color:#1150c9}
.pp-menu-enter-active,.pp-menu-leave-active{transition:all .25s ease}
.pp-menu-enter-from,.pp-menu-leave-to{opacity:0;transform:translateY(-8px)}

.pp-hero{padding:72px 24px 56px;background:linear-gradient(135deg,#0a2757 0%,#1150c9 50%,#1f6feb 100%);color:#fff;text-align:center;position:relative;overflow:hidden}
.pp-hero::before{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(13,148,136,0.15),transparent 70%);bottom:-200px;left:-100px;pointer-events:none}
.pp-hero::after{content:'';position:absolute;width:300px;height:300px;background:radial-gradient(circle,rgba(255,255,255,0.06),transparent 70%);top:-100px;right:-50px;pointer-events:none}
.pp-hero-inner{position:relative;max-width:750px;margin:0 auto}
.pp-hero-logo{width:80px;height:80px;border-radius:20px;object-fit:cover;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.2)}
.pp-hero-chip{display:inline-block;padding:8px 20px;border-radius:24px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);font-size:0.82rem;font-weight:600;margin-bottom:24px}
.pp-hero h1{font:900 2.4rem/1.15 'Cairo',sans-serif;margin:0 0 16px}
.pp-hl{color:#fef3c7}
.pp-hero p{font-size:1rem;opacity:0.85;max-width:580px;margin:0 auto 32px;line-height:1.7}
.pp-hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

.pp-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border-radius:14px;font:700 0.95rem 'Cairo',sans-serif;text-decoration:none;transition:all .3s;cursor:pointer;border:none;font-family:inherit;white-space:nowrap}
.pp-btn-white-lg{background:#fff;color:#1150c9;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:16px 40px;font-size:1rem;border-radius:16px}
.pp-btn-white-lg:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,0.2)}
.pp-btn-white{background:#fff;color:#1150c9;box-shadow:0 4px 20px rgba(0,0,0,0.12)}
.pp-btn-white:hover{transform:translateY(-2px)}
.pp-btn-outline-white{background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.4)}
.pp-btn-outline-white:hover{background:rgba(255,255,255,0.1)}
.pp-btn-green{background:#16a34a;color:#fff;padding:12px 28px;border-radius:12px}
.pp-btn-green:hover{background:#15803d;transform:translateY(-2px)}
.pp-btn-blue{background:#1150c9;color:#fff;padding:12px 28px;border-radius:12px}
.pp-btn-blue:hover{background:#0e3a86;transform:translateY(-2px)}

.pp-section{padding:72px 0}
.pp-section-alt{background:#fff}
.pp-sec-badge{display:inline-block;padding:6px 16px;border-radius:20px;background:linear-gradient(135deg,#eff6ff,#f0fdfa);color:#1150c9;font:700 0.78rem 'Cairo',sans-serif;border:1px solid #dbeafe;margin-bottom:16px}
.pp-sec-title{font:900 1.8rem/1.25 'Cairo',sans-serif;color:#0f172a;margin:0 0 10px;text-align:center}
.pp-sec-desc{font-size:0.95rem;color:#64748b;max-width:560px;margin:0 auto 48px;text-align:center;line-height:1.6}
.pp-text-blue{color:#1150c9}
.pp-text-teal{color:#0d9488}

.pp-what-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px}
.pp-what-card{background:#fff;border-radius:18px;padding:28px 20px;border:1px solid #e2e8f0;text-align:center;transition:all .3s}
.pp-what-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.06)}
.pp-what-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:1.5rem}
.pp-what-card h3{font:800 1rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:8px}
.pp-what-card p{font-size:0.85rem;color:#64748b;line-height:1.6}

.pp-who-box{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px}
.pp-who-box h3{font:800 1.1rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:20px}
.pp-who-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.pp-who-item{display:flex;gap:14px;align-items:flex-start;padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #f1f5f9}
.pp-who-num{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#1150c9,#1f6feb);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;flex-shrink:0}
.pp-who-item strong{display:block;font-size:0.9rem;margin-bottom:2px}
.pp-who-item p{font-size:0.8rem;color:#64748b;margin:0}

.pp-pricing-table{background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;margin-bottom:24px}
.pp-pt-header{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:8px;padding:14px 20px;background:#f1f5f9;font:700 0.82rem 'Cairo',sans-serif;color:#475569;border-bottom:1px solid #e2e8f0}
.pp-pt-row{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:8px;padding:14px 20px;border-bottom:1px solid #f1f5f9;font-size:0.88rem;align-items:center}
.pp-pt-row:last-child{border-bottom:none}
.pp-pt-dur{font-weight:700;color:#0f172a}
.pp-pt-price{color:#1150c9;font-weight:800}
.pp-pt-comm{color:#0d9488;font-weight:700}
.pp-pt-reward{color:#16a34a;font-weight:800}
.pp-pricing-note{background:#fef3c7;border:1px solid #fde68a;border-radius:14px;padding:20px}
.pp-pricing-note h4{font:700 0.95rem 'Cairo',sans-serif;color:#92400e;margin-bottom:10px}
.pp-pricing-note ul{list-style:none;padding:0}
.pp-pricing-note li{padding:4px 0 4px 16px;position:relative;font-size:0.85rem;color:#78350f}
.pp-pricing-note li::before{content:'•';position:absolute;right:0;color:#d97706;font-weight:800}

.pp-step{background:#fff;border-radius:20px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:20px;transition:all .3s}
.pp-step:hover{box-shadow:0 8px 32px rgba(0,0,0,0.05)}
.pp-step-head{display:flex;align-items:center;gap:14px;padding:20px 24px;border-bottom:1px solid #f1f5f9;background:#f8fafc}
.pp-step-num{font:900 1rem 'Cairo',sans-serif;color:#fff;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,#1150c9,#1f6feb)}
.pp-step-head h3{font:800 1.05rem/1.2 'Cairo',sans-serif;color:#0f172a}
.pp-step-head p{font-size:0.82rem;color:#64748b;margin-top:2px}
.pp-step-content{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:220px}
.pp-step-text{padding:24px;font-size:0.88rem;color:#475569;line-height:1.7}
.pp-step-text ul{list-style:none;padding:0;margin:0}
.pp-step-text li{padding:5px 0 5px 20px;position:relative;font-size:0.85rem}
.pp-step-text li::before{content:'✓';position:absolute;right:0;color:#1150c9;font-weight:800}
.pp-note{background:#eff6ff;border-radius:10px;padding:10px 14px;font-size:0.82rem;color:#1e40af;border:1px solid #bfdbfe;margin-top:12px}
.pp-tip{background:#f0fdfa;border-radius:10px;padding:10px 14px;font-size:0.82rem;color:#0f766e;border:1px solid #99f6e4;margin-top:8px}

.pp-step-mock{padding:20px;background:#f1f5f9;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.pp-mock-login{background:#fff;border-radius:16px;padding:24px 20px;width:100%;max-width:280px;box-shadow:0 4px 16px rgba(0,0,0,0.06);text-align:center;margin:auto}
.pp-ml-logo{width:48px;height:48px;border-radius:12px;object-fit:cover;margin-bottom:8px}
.pp-ml-name{font:900 1.3rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:2px}
.pp-ml-tag{font-size:0.72rem;color:#64748b;margin-bottom:16px}
.pp-ml-field{margin-bottom:10px;text-align:right}
.pp-ml-field label{display:block;font-size:0.72rem;font-weight:700;color:#64748b;margin-bottom:4px}
.pp-ml-input{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:0.85rem;color:#0f172a;text-align:right}
.pp-ml-pass{color:#94a3b8;letter-spacing:2px}
.pp-ml-btn{background:linear-gradient(135deg,#1150c9,#1f6feb);color:#fff;border-radius:12px;padding:12px;font:700 0.9rem 'Cairo',sans-serif;cursor:pointer}

.pp-mock-box{background:#fff;border-radius:12px;padding:16px;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px}
.pp-mock-box-title{font:700 0.82rem 'Cairo',sans-serif;color:#0f172a;padding-bottom:8px;border-bottom:1px solid #f1f5f9}
.pp-mock-box-sub{font:700 0.75rem 'Cairo',sans-serif;color:#475569;padding:4px 0}
.pp-mock-row{display:flex;gap:8px}
.pp-mock-row .pp-mock-field{flex:1}
.pp-mock-field{margin-bottom:0}
.pp-mock-field label{display:block;font-size:0.72rem;font-weight:700;color:#64748b;margin-bottom:4px}
.pp-mock-input{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;color:#0f172a}
.pp-mock-search{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;color:#64748b}
.pp-mock-btn{color:#fff;border-radius:10px;padding:10px;text-align:center;font:700 0.85rem 'Cairo',sans-serif;cursor:pointer}
.pp-mock-tabs{display:flex;gap:4px}
.pp-mk-tab{padding:6px 12px;border-radius:8px;font-size:0.72rem;font-weight:700;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b}
.pp-mk-tab.active{background:#1150c9;color:#fff;border-color:#1150c9}

.pp-mock-stats{display:flex;gap:8px;flex-wrap:wrap}
.pp-mk-stat{flex:1;min-width:80px;background:#f8fafc;border-radius:10px;padding:10px;text-align:center;border:1px solid #e2e8f0}
.pp-mk-stat-val{display:block;font:800 1rem 'Cairo',sans-serif;color:#0f172a}
.pp-mk-stat-lbl{font-size:0.65rem;color:#64748b}

.pp-mock-queue{display:flex;flex-direction:column;gap:6px}
.pp-mk-q-item{display:flex;align-items:center;gap:10px;background:#f8fafc;border-radius:10px;padding:8px 12px;border:1px solid #e2e8f0;font-size:0.82rem}
.pp-mk-q-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pp-mk-q-item div{flex:1}
.pp-mk-q-item strong{display:block;font-size:0.8rem}
.pp-mk-q-item small{color:#94a3b8;font-size:0.7rem}

.pp-mk-apt{display:flex;align-items:center;gap:10px;background:#f8fafc;border-radius:10px;padding:8px 12px;border:1px solid #e2e8f0;font-size:0.82rem}
.pp-mk-apt-time{font:700 0.8rem 'Cairo',sans-serif;color:#1150c9;background:#eff6ff;padding:4px 8px;border-radius:6px;flex-shrink:0}
.pp-mk-apt div{flex:1}
.pp-mk-apt strong{display:block;font-size:0.8rem}
.pp-mk-apt small{color:#94a3b8;font-size:0.7rem}

.pp-mk-badge{font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap}
.pp-mk-badge.green{background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0}
.pp-mk-badge.blue{background:#dbeafe;color:#2563eb;border:1px solid #bfdbfe}
.pp-mk-badge.yellow{background:#fef9c3;color:#a16207;border:1px solid #fde68a}
.pp-mk-badge.purple{background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe}

.pp-mock-table{display:flex;flex-direction:column;gap:4px}
.pp-mk-t-row{display:grid;grid-template-columns:1.5fr 1fr auto;gap:8px;background:#f8fafc;border-radius:8px;padding:8px 12px;border:1px solid #e2e8f0;font-size:0.8rem;align-items:center}
.pp-mk-t-head{background:#f1f5f9;font-weight:700;color:#64748b;font-size:0.72rem;border:none}

.pp-mk-list{display:flex;align-items:center;gap:10px;background:#f8fafc;border-radius:10px;padding:8px 12px;border:1px solid #e2e8f0;font-size:0.82rem}
.pp-mk-list strong{display:block;font-size:0.8rem}
.pp-mk-list small{color:#94a3b8;font-size:0.7rem}
.pp-mk-avatar{width:32px;height:32px;border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.7rem;flex-shrink:0}

.pp-mk-chat{display:flex;flex-direction:column;gap:6px}
.pp-mk-chat-msg{padding:8px 12px;border-radius:10px;font-size:0.82rem;line-height:1.5}
.pp-mk-chat-msg.user{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0}
.pp-mk-chat-msg.doctor{background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe}
.pp-mk-notif{background:#f8fafc;border-radius:8px;padding:8px 12px;font-size:0.8rem;border:1px solid #e2e8f0}

.pp-mock-quick-btns{display:flex;gap:6px;flex-wrap:wrap}
.pp-mk-qbtn{padding:8px 14px;border-radius:8px;font-size:0.78rem;font-weight:700;color:#fff;cursor:default}
.pp-mk-qbtn.blue{background:#1150c9}
.pp-mk-qbtn.pink{background:#db2777}
.pp-mk-qbtn.gold{background:#d69e1f}

.pp-mock-sidebar{background:linear-gradient(165deg,#0a2757 0%,#3730a3 42%,#1f6feb 78%,#0d9488 130%);border-radius:14px;padding:14px 10px;color:#fff;min-height:360px;display:flex;flex-direction:column}
.pp-ms-brand{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:14px}
.pp-ms-logo{width:34px;height:34px;border-radius:10px;object-fit:cover}
.pp-ms-name{font:800 0.95rem 'Cairo',sans-serif}
.pp-ms-clinic{font-size:0.68rem;opacity:0.7}
.pp-ms-menu{flex:1;display:flex;flex-direction:column;gap:2px}
.pp-ms-item{padding:10px 12px;border-radius:10px;font:600 0.78rem 'Cairo',sans-serif;cursor:default;display:flex;align-items:center;gap:8px;transition:background .2s}
.pp-ms-item:hover{background:rgba(255,255,255,0.1)}
.pp-ms-item.active{background:rgba(255,255,255,0.15);font-weight:700}
.pp-ms-badge{margin-right:auto;background:#ef4444;color:#fff;font-size:0.58rem;padding:2px 6px;border-radius:8px;font-weight:700}

.pp-compare-box{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;margin-bottom:32px}
.pp-compare-box h3{font:800 1.1rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:20px;text-align:center}
.pp-compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.pp-compare-col{border-radius:14px;overflow:hidden;border:1px solid #e2e8f0}
.pp-compare-header{padding:14px 16px;font:700 0.9rem 'Cairo',sans-serif;text-align:center}
.pp-compare-col ul{list-style:none;padding:12px;margin:0}
.pp-yes{padding:8px 12px;font-size:0.85rem;color:#16a34a;border-bottom:1px solid #f1f5f9}
.pp-yes::before{content:'✓ ';font-weight:800}
.pp-no{padding:8px 12px;font-size:0.85rem;color:#dc2626;border-bottom:1px solid #f1f5f9}
.pp-no::before{content:'✕ ';font-weight:800}

.pp-steps-mini{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px}
.pp-steps-mini-title{font:800 1.05rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:16px}
.pp-steps-mini-list{display:flex;flex-direction:column;gap:10px}
.pp-steps-mini-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9;font-size:0.88rem}
.pp-steps-mini-item span{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1150c9,#1f6feb);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;flex-shrink:0}

.pp-dir-flow{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;margin-bottom:32px}
.pp-dir-flow-title{font:800 1.05rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:20px;text-align:center}
.pp-dir-flow-steps{display:flex;align-items:flex-start;justify-content:center;gap:8px;flex-wrap:wrap}
.pp-dir-flow-item{flex:1;min-width:140px;max-width:200px;text-align:center;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #f1f5f9}
.pp-dir-flow-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1150c9,#1f6feb);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 10px}
.pp-dir-flow-item strong{display:block;font-size:0.85rem;margin-bottom:4px}
.pp-dir-flow-item p{font-size:0.78rem;color:#64748b;margin:0}
.pp-dir-flow-arrow{color:#cbd5e1;font-size:1.5rem;font-weight:800;align-self:center;padding-top:16px}

.pp-dir-types{margin-bottom:28px}
.pp-dir-types h3{font:800 1.05rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:16px}
.pp-dir-types-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.pp-dir-type{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 12px;text-align:center;transition:all .3s}
.pp-dir-type:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.05)}
.pp-dir-type-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:1.4rem}
.pp-dir-type strong{display:block;font-size:0.85rem;margin-bottom:4px}
.pp-dir-type p{font-size:0.75rem;color:#64748b;margin:0}

.pp-dir-features{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;margin-bottom:28px}
.pp-dir-features h3{font:800 1.05rem 'Cairo',sans-serif;color:#0f172a;margin-bottom:16px}
.pp-dir-features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.pp-dir-feat{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9;font-size:0.88rem}

.pp-faq-list{max-width:700px;margin:0 auto}
.pp-faq-item{background:#fff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:10px;overflow:hidden}
.pp-faq-q{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;font:700 0.95rem 'Cairo',sans-serif;color:#0f172a;transition:background .2s}
.pp-faq-q:hover{background:#f8fafc}
.pp-faq-arrow{font-size:1.3rem;color:#94a3b8;transition:transform .3s;transform:rotate(-90deg)}
.pp-faq-arrow.open{transform:rotate(90deg)}
.pp-faq-a{padding:0 20px 16px;font-size:0.9rem;color:#475569;line-height:1.7}
.pp-faq-enter-active,.pp-faq-leave-active{transition:all .25s ease}
.pp-faq-enter-from,.pp-faq-leave-to{opacity:0;max-height:0;padding-top:0;padding-bottom:0}
.pp-faq-enter-to,.pp-faq-leave-from{max-height:200px}

.pp-cta{padding:0 0 48px}
.pp-cta-box{position:relative;background:linear-gradient(135deg,#0a2757 0%,#1150c9 50%,#0d9488 100%);border-radius:24px;padding:56px 32px;text-align:center;color:#fff;overflow:hidden}
.pp-cta-box::before{content:'';position:absolute;width:300px;height:300px;background:radial-gradient(circle,rgba(255,255,255,0.06),transparent 70%);top:-100px;right:-60px;pointer-events:none}
.pp-cta-logo{width:64px;height:64px;border-radius:16px;object-fit:cover;margin-bottom:16px;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
.pp-cta-box h2{font:900 1.8rem/1.2 'Cairo',sans-serif;margin:0 0 12px}
.pp-cta-box p{font-size:0.95rem;opacity:0.85;margin:0 0 28px}
.pp-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

.pp-footer{background:#0f172a;padding:24px 0}
.pp-footer-inner{display:flex;align-items:center;justify-content:center;gap:10px;color:#475569;font-size:0.82rem}
.pp-ft-logo{width:28px;height:28px;border-radius:8px;object-fit:cover}

@media(max-width:480px){
  .pp-nav-links{display:none}.pp-hamburger{display:flex}
  .pp-hero{padding:48px 16px 40px}.pp-hero h1{font-size:1.7rem}.pp-hero-logo{width:60px;height:60px}
  .pp-container{padding:0 16px}.pp-sec-title{font-size:1.3rem}
  .pp-what-grid,.pp-dir-types-grid{grid-template-columns:1fr}
  .pp-who-grid,.pp-compare-grid,.pp-dir-features-grid{grid-template-columns:1fr}
  .pp-step-content{grid-template-columns:1fr}.pp-step-mock{min-height:auto}
  .pp-dir-flow-steps{flex-direction:column;align-items:center}
  .pp-dir-flow-arrow{transform:rotate(90deg);padding:0}
  .pp-cta-box{padding:40px 20px;border-radius:20px}.pp-cta-box h2{font-size:1.3rem}
  .pp-pt-header,.pp-pt-row{grid-template-columns:1.5fr 1fr 1fr 1fr;font-size:0.72rem}
}
@media(min-width:481px) and (max-width:768px){
  .pp-nav-links{display:none}.pp-hamburger{display:flex}
  .pp-what-grid{grid-template-columns:1fr}
  .pp-dir-types-grid{grid-template-columns:repeat(3,1fr)}
  .pp-dir-flow-steps{flex-wrap:nowrap}
}
@media(min-width:769px){.pp-mobile-menu{display:none!important}}
</style>
