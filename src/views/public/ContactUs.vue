<template>
  <div class="app-page">
    <nav class="app-bar">
      <button class="app-bar-back" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h1 class="app-bar-title">تواصل معنا</h1>
      <div class="app-bar-spacer"></div>
    </nav>

    <div class="app-scroll">
      <section class="contact-hero">
        <div class="contact-hero-orbs"><div class="contact-orb o1"></div><div class="contact-orb o2"></div></div>
        <div class="contact-hero-inner">
          <h1>يسعدنا تواصلك</h1>
          <p>اختر الطريقة التي تناسبك</p>
        </div>
      </section>

      <section class="contact-body">
        <a href="https://wa.me/9647807202286" target="_blank" rel="noopener" class="contact-card wa">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div class="contact-card-info">
            <h3>واتساب</h3>
            <p>راسلنا للدعم الفني والاستفسارات</p>
            <span class="contact-card-num">0780 720 2286</span>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>

        <a href="https://t.me/Madar_System" target="_blank" rel="noopener" class="contact-card tg">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </div>
          <div class="contact-card-info">
            <h3>تيليجرام</h3>
            <p>تابعنا للإعلانات والتحديثات</p>
            <span class="contact-card-num">@Madar_System</span>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>

        <a href="mailto:support@madar.iq" class="contact-card email">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div class="contact-card-info">
            <h3>البريد الإلكتروني</h3>
            <p>أرسل استفسارك أو ملاحظاتك</p>
            <span class="contact-card-num">support@madar.iq</span>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>

        <div class="contact-hours">
          <h3>ساعات الدعم</h3>
          <div class="contact-hours-row"><span>السبت — الخميس</span><strong>9:00 ص — 5:00 م</strong></div>
          <div class="contact-hours-row off"><span>الجمعة</span><strong>إجازة</strong></div>
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
.app-page{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;color:#1e293b;background:#f0f2f5;height:100dvh;height:-webkit-fill-available;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
*{margin:0;padding:0;box-sizing:border-box}

.app-bar{display:flex;align-items:center;padding:0 8px;height:56px;background:rgba(255,255,255,.92);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.06);flex-shrink:0;z-index:10}
.app-bar-back{width:44px;height:44px;border:none;background:none;border-radius:12px;display:grid;place-items:center;color:#475569;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent}
.app-bar-back:active{background:#f1f5f9}
.app-bar-title{flex:1;text-align:center;font-size:1rem;font-weight:800;color:#1e293b}
.app-bar-spacer{width:44px}

.app-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom,0)}

.contact-hero{position:relative;overflow:hidden;background:linear-gradient(160deg,#0f172a 0%,#1e293b 100%);padding:40px 20px 36px;text-align:center}
.contact-hero-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.contact-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.25}
.contact-orb.o1{width:260px;height:260px;background:#25d366;top:-80px;right:-60px}
.contact-orb.o2{width:220px;height:220px;background:#0088cc;bottom:-60px;left:-50px}
.contact-hero-inner{position:relative;max-width:600px;margin:0 auto}
.contact-hero h1{font-size:1.8rem;font-weight:900;color:#fff;margin-bottom:8px}
.contact-hero p{font-size:.92rem;color:#94a3b8}

.contact-body{padding:20px 16px}

.contact-card{display:flex;align-items:center;gap:16px;padding:18px;background:linear-gradient(145deg,#ffffff 0%,#fafbff 100%);border-radius:18px;text-decoration:none;color:inherit;border:1px solid rgba(0,0,0,.05);box-shadow:0 2px 12px rgba(0,0,0,.05);margin-bottom:12px;transition:transform .2s}
.contact-card:active{transform:scale(.98)}
.contact-card-icon{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;flex-shrink:0}
.contact-card.wa .contact-card-icon{background:#25d366}
.contact-card.tg .contact-card-icon{background:#0088cc}
.contact-card.email .contact-card-icon{background:#0d9488}
.contact-card-info{flex:1;min-width:0}
.contact-card-info h3{font-size:.95rem;font-weight:800;margin-bottom:2px}
.contact-card-info p{font-size:.78rem;color:#94a3b8}
.contact-card-num{font-size:.85rem;font-weight:700;color:#0d9488;display:block;margin-top:4px}

.contact-hours{background:linear-gradient(145deg,#ffffff 0%,#f8faff 100%);border-radius:18px;padding:20px;border:1px solid rgba(17,80,201,.06);box-shadow:0 1px 3px rgba(0,0,0,.03);margin-top:8px;margin-bottom:16px}
.contact-hours h3{font-size:.95rem;font-weight:800;margin-bottom:12px}
.contact-hours-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:.85rem}
.contact-hours-row:last-child{border-bottom:none}
.contact-hours-row span{color:#64748b}
.contact-hours-row strong{color:#059669;font-weight:700}
.contact-hours-row.off strong{color:#ef4444}

.about-app-badge{display:flex;align-items:center;justify-content:center;gap:10px;padding:24px 0 0;color:#94a3b8;font-size:.75rem;font-weight:600}
.badge-logo{width:36px;height:36px;border-radius:10px;object-fit:cover}

@media(max-width:480px){
  .contact-hero{padding:28px 16px 24px}
  .contact-hero h1{font-size:1.4rem}
  .contact-hero p{font-size:.85rem}
  .contact-body{padding:16px 14px}
  .contact-card{padding:14px;gap:12px;border-radius:16px}
  .contact-card-icon{width:48px;height:48px;border-radius:14px}
  .contact-card-info p{font-size:.8rem}
  .contact-card-info h3{font-size:.88rem}
  .contact-card-num{font-size:.82rem}
  .contact-hours{padding:16px;border-radius:16px}
  .contact-hours-row{font-size:.82rem}
}
</style>
