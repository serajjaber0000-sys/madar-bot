<template>
  <div class="app-page">
    <nav class="app-bar">
      <button class="app-bar-back" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h1 class="app-bar-title">من نحن</h1>
      <div class="app-bar-spacer"></div>
    </nav>

    <div class="app-scroll">
      <section class="about-hero">
        <div class="about-hero-orbs">
          <div class="about-orb o1"></div>
          <div class="about-orb o2"></div>
          <div class="about-orb o3"></div>
        </div>
        <div class="about-hero-inner">
          <div class="about-hero-logo">
            <img src="/logo.jpg" alt="مدار" width="80" height="80" />
          </div>
          <h1>مدار</h1>
          <p class="about-hero-tag">نغيّر واقع الرعاية الصحية في العراق</p>
          <div class="about-hero-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            صنع عراقي ١٠٠٪
          </div>
        </div>
      </section>

      <section class="about-body">
        <!-- من نحن -->
        <div class="about-card about-card-hero">
          <div class="about-card-head">
            <div class="about-card-icon" style="background:linear-gradient(135deg,#0d9488,#14b8a6)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <h2>من نحن؟</h2>
          </div>
          <p>نحن <strong>مجموعة من الشباب والبنات العراقيين</strong> الطموحين الذين يؤمنون بأن التكنولوجيا يمكن أن تُحدث فرقاً حقيقياً في حياتنا اليومية. اجتمعنا بشغف وحلمنا بمنصة عراقية تخدم المجتمع الطبي وتقرب المريض من الطبيب.</p>
          <p>دارك مدار أنّ إدارة العيادات في العراق تحتاج إلى حلول ذكية وبسيطة، فكرنا وعملنا بجد لنقدم لكم <strong>مدار</strong> — منصة شاملة تجمع كل ما تحتاجه العيادة في مكان واحد.</p>
        </div>

        <!-- رؤيتنا -->
        <div class="about-card">
          <div class="about-card-head">
            <div class="about-card-icon" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h2>رؤيتنا</h2>
          </div>
          <p>أن نكون <strong>المنصة الطبية الأولى في العراق والمنطقة العربية</strong>. نريد أن يصل كل مريض لأفضل طبيب بسهولة، وأن تدار كل عيادة بأحدث التقنيات وأبسط الطرق.</p>
        </div>

        <!-- مهمتنا -->
        <div class="about-card">
          <div class="about-card-head">
            <div class="about-card-icon" style="background:linear-gradient(135deg,#059669,#34d399)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2>مهمتنا</h2>
          </div>
          <p>تبسيط إدارة العيادات الطبية في العراق. نريد كل طبيب يركّز على <strong>علاج مرضاه</strong> بينما نتولى نحن <strong>الإدارة والتنظيم</strong>. ومريض يلاقي طبيبه بسهولة وثقة.</p>
        </div>

        <!-- قيمنا -->
        <div class="about-values-title">
          <h2>قيمنا</h2>
          <p>الأشياء اللي نؤمن فيها ونعمل عليها كل يوم</p>
        </div>

        <div class="about-values">
          <div class="about-value">
            <div class="about-value-icon" style="background:#eff6ff">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0d9488" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h4>الشغف</h4>
            <p>نعمل بشغف لأننا نؤمن إنّ اللي نسويه يغيّر حياة ناس</p>
          </div>
          <div class="about-value">
            <div class="about-value-icon" style="background:#f0fdf4">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4>الثقة</h4>
            <p>الخصوصية والأمان أولويتنا — بيانات المرضى والأطباء عندنا بأمان</p>
          </div>
          <div class="about-value">
            <div class="about-value-icon" style="background:#fefce8">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d69e1f" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h4>الجودة</h4>
            <p>نعمل بأعلى المعايير لأنّ خدمات صحية تستاهل الأفضل</p>
          </div>
          <div class="about-value">
            <div class="about-value-icon" style="background:#fdf2f8">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#db2777" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h4>الفريق</h4>
            <p>شباب وبنات عراقيين يشتغلون مع بعض بروح واحدة</p>
          </div>
        </div>

        <!-- ليش مدار؟ -->
        <div class="about-card">
          <div class="about-card-head">
            <div class="about-card-icon" style="background:linear-gradient(135deg,#ea580c,#fb923c)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h2>ليش مدار؟</h2>
          </div>
          <div class="about-reasons">
            <div class="about-reason">
              <span class="about-reason-num">١</span>
              <div>
                <strong>عراقي صرف</strong>
                <p>مصمم خصيصاً للسوق العراقي — بالعملة العراقية وبالعربي</p>
              </div>
            </div>
            <div class="about-reason">
              <span class="about-reason-num">٢</span>
              <div>
                <strong>مجاني للمرضى</strong>
                <p>البحث والحجز مجاني تماماً — بدون تسجيل أو اشتراك</p>
              </div>
            </div>
            <div class="about-reason">
              <span class="about-reason-num">٣</span>
              <div>
                <strong>سهل الاستخدام</strong>
                <p>تصميم بسيط وأنيق — أي طبيب يقدر يبدأ باستخدامه فوراً</p>
              </div>
            </div>
            <div class="about-reason">
              <span class="about-reason-num">٤</span>
              <div>
                <strong>دعم فوري</strong>
                <p>فريق الدعم جاهز على واتساب وتيليجرام لمساعدتك</p>
              </div>
            </div>
          </div>
        </div>

        <!-- أرقام -->
        <div class="about-stats">
          <div class="about-stat">
            <span class="about-stat-val">+٥٠٠</span>
            <span class="about-stat-label">عيادة مسجلة</span>
          </div>
          <div class="about-stat">
            <span class="about-stat-val">+١٠٠٠</span>
            <span class="about-stat-label">طبيب نشط</span>
          </div>
          <div class="about-stat">
            <span class="about-stat-val">+١٠٠٠٠</span>
            <span class="about-stat-label">زيارة يومية</span>
          </div>
        </div>

        <!-- تواصل معنا -->
        <div class="about-contact">
          <h3>تواصل معنا</h3>
          <p>عندك سؤال أو اقتراح؟ احنا دايمين نسمعك</p>
          <div class="about-contact-btns">
            <a href="https://wa.me/9647807202286" target="_blank" rel="noopener" class="about-contact-btn wa">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              واتساب
            </a>
            <a href="https://t.me/Madar_System" target="_blank" rel="noopener" class="about-contact-btn tg">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              تيليجرام
            </a>
          </div>
        </div>

        <div class="about-app-badge">
          <img src="/logo.jpg" alt="مدار" class="badge-logo" />
          <span>© {{ new Date().getFullYear() }} مدار — جميع الحقوق محفوظة</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.app-page{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#1e293b;background:#f0faf9;height:100dvh;height:-webkit-fill-available;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
*{margin:0;padding:0;box-sizing:border-box}

.app-bar{display:flex;align-items:center;padding:0 8px;height:56px;background:linear-gradient(120deg,#0d9488,#0f766e);border-bottom:none;flex-shrink:0;z-index:10}
.app-bar-back{width:44px;height:44px;border:none;background:none;border-radius:12px;display:grid;place-items:center;color:#fff;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent}
.app-bar-back:active{background:rgba(255,255,255,0.2)}
.app-bar-title{flex:1;text-align:center;font-size:1rem;font-weight:800;color:#fff}
.app-bar-spacer{width:44px}

.app-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom,0)}

/* HERO */
.about-hero{position:relative;overflow:hidden;background:linear-gradient(160deg,#064e3b 0%,#0d9488 50%,#0f766e 100%);padding:44px 20px 40px;text-align:center}
.about-hero-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.about-orb{position:absolute;border-radius:50%;filter:blur(80px)}
.about-orb.o1{width:300px;height:300px;background:rgba(20,184,166,0.3);top:-100px;right:-80px;animation:orbA 6s ease-in-out infinite}
.about-orb.o2{width:250px;height:250px;background:rgba(6,78,59,0.3);bottom:-60px;left:-40px;animation:orbB 8s ease-in-out infinite}
.about-orb.o3{width:180px;height:180px;background:rgba(214,158,31,0.15);top:30%;left:60%;animation:orbC 7s ease-in-out infinite}
@keyframes orbA{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,30px)}}
@keyframes orbB{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-25px)}}
@keyframes orbC{0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,-25px)}}
.about-hero-inner{position:relative;max-width:600px;margin:0 auto}
.about-hero-logo{margin-bottom:14px}
.about-hero-logo img{width:80px;height:80px;border-radius:22px;object-fit:cover;box-shadow:0 8px 40px rgba(0,0,0,0.3);animation:logoGlow 3s ease-in-out infinite}
@keyframes logoGlow{0%,100%{box-shadow:0 8px 40px rgba(13,148,136,0.3)}50%{box-shadow:0 8px 50px rgba(13,148,136,0.5)}}
.about-hero h1{font:900 2rem/1 'Segoe UI',sans-serif;color:#fff;margin:0 0 6px;letter-spacing:-0.5px}
.about-hero-tag{font:600 0.9rem/1.4 'Segoe UI',sans-serif;color:rgba(255,255,255,0.7);margin:0 0 12px}
.about-hero-badge{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);font:600 0.72rem/1 'Tajawal',sans-serif}

/* BODY */
.about-body{padding:20px 16px}

.about-card{background:linear-gradient(145deg,#ffffff 0%,#f0fdf9 100%);border-radius:18px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 4px 16px rgba(13,148,136,.05);border:1px solid rgba(13,148,136,.06);margin-bottom:14px}
.about-card-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.about-card-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;flex-shrink:0}
.about-card h2{font-size:1rem;font-weight:800}
.about-card p{font-size:.85rem;color:#64748b;line-height:1.8;margin-bottom:8px}
.about-card p:last-child{margin-bottom:0}
.about-card-hero{border:1px solid rgba(13,148,136,.12);box-shadow:0 2px 8px rgba(13,148,136,.08),0 8px 32px rgba(13,148,136,.06)}

/* VALUES */
.about-values-title{margin-bottom:14px}
.about-values-title h2{font-size:1.1rem;font-weight:800;margin-bottom:2px}
.about-values-title p{font-size:.78rem;color:#94a3b8}

.about-values{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.about-value{padding:16px 14px;background:linear-gradient(145deg,#ffffff 0%,#f8faff 100%);border-radius:16px;border:1px solid rgba(0,0,0,.04);box-shadow:0 1px 4px rgba(0,0,0,.03)}
.about-value-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;margin-bottom:8px}
.about-value h4{font-size:.85rem;font-weight:800;margin-bottom:4px}
.about-value p{font-size:.75rem;color:#94a3b8;line-height:1.5;margin:0}

/* REASONS */
.about-reasons{display:flex;flex-direction:column;gap:12px}
.about-reason{display:flex;align-items:flex-start;gap:12px}
.about-reason-num{flex-shrink:0;width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;display:grid;place-items:center;font:800 0.75rem/1 'Segoe UI',sans-serif}
.about-reason strong{display:block;font-size:.85rem;font-weight:800;margin-bottom:2px}
.about-reason p{font-size:.78rem;color:#94a3b8;margin:0;line-height:1.5}

/* STATS */
.about-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.about-stat{text-align:center;padding:18px 8px;background:linear-gradient(145deg,#ffffff 0%,#f0fdf9 100%);border-radius:16px;border:1px solid rgba(13,148,136,.08);box-shadow:0 1px 4px rgba(0,0,0,.03)}
.about-stat-val{display:block;font:900 1.3rem/1 'Segoe UI',sans-serif;color:#0d9488;margin-bottom:4px}
.about-stat-label{font:600 0.7rem/1 'Tajawal',sans-serif;color:#94a3b8}

/* CONTACT */
.about-contact{text-align:center;padding:24px 20px;background:linear-gradient(160deg,#0d9488,#0f766e);border-radius:20px;margin-bottom:18px}
.about-contact h3{font:800 1rem/1 'Segoe UI',sans-serif;color:#fff;margin-bottom:6px}
.about-contact p{font:500 0.8rem/1.4 'Tajawal',sans-serif;color:rgba(255,255,255,0.65);margin:0 0 16px}
.about-contact-btns{display:flex;gap:10px;justify-content:center}
.about-contact-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:12px;color:#fff;font:700 0.82rem/1 'Tajawal',sans-serif;text-decoration:none;transition:all 0.25s}
.about-contact-btn.wa{background:#25d366;box-shadow:0 4px 16px rgba(37,211,102,0.3)}
.about-contact-btn.tg{background:#0088cc;box-shadow:0 4px 16px rgba(0,136,204,0.3)}
.about-contact-btn:active{transform:scale(0.96)}

/* BADGE */
.about-app-badge{display:flex;align-items:center;justify-content:center;gap:10px;padding:24px 0 0;color:#94a3b8;font-size:.75rem;font-weight:600}
.badge-logo{width:36px;height:36px;border-radius:10px;object-fit:cover}

@media(max-width:480px){
  .about-hero{padding:32px 16px 28px}
  .about-hero h1{font-size:1.6rem}
  .about-hero-logo img{width:64px;height:64px;border-radius:18px}
  .about-body{padding:16px 14px}
  .about-card{padding:16px;border-radius:16px}
  .about-card-icon{width:40px;height:40px;border-radius:10px}
  .about-values{grid-template-columns:1fr}
  .about-stats{grid-template-columns:repeat(3,1fr);gap:8px}
  .about-stat{padding:14px 6px}
  .about-stat-val{font-size:1.1rem}
  .about-stat-label{font-size:.65rem}
  .about-contact{padding:20px 16px}
  .about-contact-btns{flex-direction:column;align-items:stretch}
}
</style>
