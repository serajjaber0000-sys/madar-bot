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
        <div class="about-hero-orbs"><div class="about-orb o1"></div><div class="about-orb o2"></div></div>
        <div class="about-hero-inner">
          <div class="about-hero-logo">
            <img src="/logo.jpg" alt="مدار" width="72" height="72" style="border-radius:18px;object-fit:cover" />
          </div>
          <h1>مدار</h1>
          <p>منصة طبية عراقية شاملة لإدارة العيادات والبحث عن الأطباء</p>
        </div>
      </section>

      <section class="about-body">
        <div class="about-card">
          <div class="about-card-icon" style="background:#eff6ff">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0d9488" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </div>
          <div>
            <h2>ما هو مدار؟</h2>
            <p>مدار هي منصة طبية عراقية شاملة لإدارة العيادات والمستشفيات. نوفر لأصحاب العيادات أداة احترافية لإدارة مرضاتهم ومواعيدهم وفواتيرهم، مع دليل عام للمرضى للبحث عن الأطباء وحجز مواعيدهم.</p>
          </div>
        </div>

        <div class="about-card">
          <div class="about-card-icon" style="background:#f0fdf4">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h2>مهمتنا</h2>
            <p>تبسيط إدارة العيادات الطبية في العراق والمنطقة العربية. نريد كل طبيب أن يركّز على علاج مرضاه بينما نتولى نحن الإدارة والتنظيم.</p>
          </div>
        </div>

        <div class="about-features-title">
          <h2>ما نقدمه</h2>
        </div>

        <div class="about-features-grid">
          <div class="about-feat">
            <div class="about-feat-icon" style="background:#eff6ff">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0d9488" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>إدارة المرضى</span>
          </div>
          <div class="about-feat">
            <div class="about-feat-icon" style="background:#f0fdf4">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#059669" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span>نظام المواعيد</span>
          </div>
          <div class="about-feat">
            <div class="about-feat-icon" style="background:#fefce8">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d69e1f" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span>المحاسبة</span>
          </div>
          <div class="about-feat">
            <div class="about-feat-icon" style="background:#fdf2f8">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#db2777" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
            </div>
            <span>دليل الأطباء</span>
          </div>
        </div>

        <div class="about-card">
          <div class="about-card-icon" style="background:#f5f3ff">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h2>تواصل معنا</h2>
            <p>لأي استفسار أو دعم فني، تواصل معنا عبر واتساب أو تيليجرام. فريقنا جاهز لمساعدتك في أي وقت.</p>
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

.about-hero{position:relative;overflow:hidden;background:linear-gradient(160deg,#0d9488 0%,#0f766e 100%);padding:40px 20px 36px;text-align:center}
.about-hero-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.about-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.25}
.about-orb.o1{width:260px;height:260px;background:#14b8a6;top:-80px;right:-60px}
.about-orb.o2{width:220px;height:220px;background:#064e3b;bottom:-60px;left:-50px}
.about-hero-inner{position:relative;max-width:600px;margin:0 auto}
.about-hero-logo{margin-bottom:16px}
.about-hero h1{font-size:2rem;font-weight:900;color:#fff;margin-bottom:8px}
.about-hero p{font-size:.92rem;color:#94a3b8;line-height:1.6}

.about-body{padding:20px 16px}
.about-card{background:linear-gradient(145deg,#ffffff 0%,#f0fdf9 100%);border-radius:18px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 4px 16px rgba(13,148,136,.05);border:1px solid rgba(13,148,136,.06);margin-bottom:14px;display:flex;gap:16px;align-items:flex-start}
.about-card-icon{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;flex-shrink:0}
.about-card h2{font-size:1rem;font-weight:800;margin-bottom:6px}
.about-card p{font-size:.85rem;color:#64748b;line-height:1.7}

.about-features-title{margin-bottom:14px}
.about-features-title h2{font-size:1.1rem;font-weight:800}

.about-features-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.about-feat{display:flex;align-items:center;gap:10px;padding:14px;background:linear-gradient(145deg,#ffffff 0%,#f0fdf9 100%);border-radius:14px;border:1px solid rgba(13,148,136,.06);box-shadow:0 1px 3px rgba(0,0,0,.03)}
.about-feat-icon{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;flex-shrink:0}
.about-feat span{font-size:.82rem;font-weight:700}

.about-app-badge{display:flex;align-items:center;justify-content:center;gap:10px;padding:24px 0 0;color:#94a3b8;font-size:.75rem;font-weight:600}
.badge-logo{width:36px;height:36px;border-radius:10px;object-fit:cover}

@media(max-width:480px){
  .about-hero{padding:28px 16px 24px}
  .about-hero h1{font-size:1.5rem}
  .about-hero p{font-size:.85rem}
  .about-hero-logo img{width:56px;height:56px;border-radius:14px!important}
  .about-body{padding:16px 14px}
  .about-card{padding:16px;gap:12px;border-radius:16px}
  .about-card-icon{width:44px;height:44px;border-radius:12px}
  .about-card h2{font-size:.92rem}
  .about-card p{font-size:.82rem}
  .about-features-grid{grid-template-columns:1fr;gap:8px}
  .about-feat{padding:12px}
}
</style>
