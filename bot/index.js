import 'dotenv/config'
import express from 'express'
import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, increment } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const cfg = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

const mainApp = getApps().find(a => a.name === 'madar-main') || initializeApp(cfg, 'madar-main')
const secApp = getApps().find(a => a.name === 'madar-sec') || initializeApp(cfg, 'madar-sec')
const mainAuth = getAuth(mainApp)
const secAuth = getAuth(secApp)
const db = getFirestore(mainApp)

const BOT_EMAIL = 'bot@madar-admin.io'
const BOT_PASS = 'MadarBot2026!Secure'
const ADMIN_ID = Number(process.env.SUPER_ADMIN_TELEGRAM_ID)

const bot = new Bot(process.env.BOT_TOKEN)
const store = {}
const founderCache = new Map()

function getS(cid) {
  if (!store[cid]) store[cid] = { step: null, data: {} }
  return store[cid]
}
function clearS(cid) { store[cid] = { step: null, data: {} } }
function ok(ctx) { return ADMIN_ID && ctx.from?.id === ADMIN_ID }

async function getRole(ctx) {
  const cid = ctx.chat.id
  if (store[cid]?.role) return store[cid].role
  if (ok(ctx)) { store[cid] = store[cid] || {}; store[cid].role = 'admin'; return 'admin' }
  const tgId = ctx.from.id
  if (founderCache.has(tgId)) {
    const cached = founderCache.get(tgId)
    store[cid] = store[cid] || {}; store[cid].role = 'founder'; store[cid].founderId = cached.fid
    return 'founder'
  }
  try {
    const fs = await getDocs(query(collection(db, 'bot_founders'), where('telegram_id', '==', tgId)))
    if (!fs.empty) {
      const fid = fs.docs[0].id
      founderCache.set(tgId, { fid })
      store[cid] = store[cid] || {}; store[cid].role = 'founder'; store[cid].founderId = fid
      return 'founder'
    }
  } catch (e) { }
  store[cid] = store[cid] || {}; store[cid].role = 'guest'; return 'guest'
}

function founderOrAdmin(ctx) { const r = store[ctx.chat.id]?.role; return r === 'admin' || r === 'founder' }

const SPECS = ['طب عام', 'أسنان', 'باطنية', 'قلب', 'عظام', 'أطفال', 'جلدية', 'نساء وتوليد', 'عيون', 'أنف وأذن', 'مسالك بولية', 'عصبية', 'جراحة عامة', 'علاج طبيعي', 'أنسجة وعظم', 'أخرى']
const GOVS = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']
const PLANS = { basic: 'الأساسية', premium: 'المتقدمة', enterprise: 'المؤسسات' }
const FACILITY_TYPES = { doctor: '🩺 طبيب', pharmacy: '💊 صيدلية', hospital: '🏥 مستشفى', lab: '🔬 مختبر', physio: '🦴 علاج طبيعي' }
const SCHEDULE_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const AREAS = {
  'بغداد': ['الكرخ', 'الرصافة', 'المنصور', 'الكاظمية', 'الأعظمية', 'الكرادة', 'الجادرية', 'زيونة', 'الحارثية', 'الكفاح', 'الجوسق', 'الأمين', 'الشالجية', 'الحبيبية', 'الدورة', 'الحويج', 'الحناوية', 'الشعب', 'البياع', 'الحرية', 'العبيدي', 'الزوية', 'العطيفي', 'الدهامشة', 'البو عيثة', 'الحرة'],
  'البصرة': ['الزبير', 'أبو الخصيب', 'الفاو', 'شط العرب', 'القرنة', 'العمارة', 'قلعة سكر', 'الرميلة', 'أبو فلوس', 'الشطرة', 'تراس', 'الهارثة', 'القرشية', 'بستان الرشيد'],
  'نينوى': ['الموصل', 'تلكيف', 'سنجار', 'الحمدانية', 'عمادية', 'الشخانة', 'بلد', 'القيار'],
  'أربيل': ['أربيل', 'عنكاوا', 'شقلاوة', 'سوران', 'كويسنجق', 'الشيخان'],
  'النجف': ['النجف', 'الكوفة', 'المناذرة', 'الحيرة', 'العطار', 'الجباوي', 'المنصورية', 'الحبوبي'],
  'كربلاء': ['كربلاء', 'الهندية', 'عين التمر', 'عنه', 'الردي', 'المحور', 'الغزالية'],
  'القادسية': ['الديوانية', 'عفك', 'الشامية', 'الحمزة', 'الوركاء', 'البر임'],
  'بابل': ['الحلة', 'المسيب', 'الهاشمية', 'المحاويل', 'القليع', 'البلداور', 'الزهير', 'الجعيفي', 'الكبيسة'],
  'كركوك': ['كركوك', 'الحويجة', 'داقوق', 'دبس'],
  'صلاح الدين': ['تكريت', 'سامراء', 'بلد', 'الدور', 'بيجي', 'الشرقاط', 'العميق'],
  'ديالى': ['بعقوبة', 'خانقين', 'المقدادية', 'الخالص', 'خان بني سعد', 'الحيدري'],
  'الأنبار': ['الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'القائم', 'الرطبة', 'حبانية', 'الصقلاوية', 'بوعبيد', 'الزバッグ'],
  'دهوك': ['دهوك', 'زاخو', 'سيميل', 'بردرش', 'كلار', 'شيخان', 'الكوير'],
  'السليمانية': ['السليمانية', 'حلبجة', 'رانية', 'دوكان', 'بنجوين', 'قرة داغ'],
  'ميسان': ['العمارة', 'المجر الكبير', 'علي الغربي', 'المجر الصغير', 'قلعة سكر', 'الشطرة'],
  'ذي قار': ['الناصرية', 'سوق الشيوخ', 'الرفاعي', 'الشطرة', 'الجباوي', 'الكوالين'],
  'واسط': ['الكوت', 'الحي', 'النعمانية', 'الصويرة', 'العزيزية', 'الوركاء', 'الكحلاء'],
  'المثنى': ['السماوة', 'الرميثة', 'الوركاء', 'الشامية', 'النجد', 'المجر الكبير'],
  'حلبجة': ['حلبجة', 'الجوما', 'بنجوين', 'شيران', 'كلار']
}

function rndEmail(n) {
  const s = n.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)
  return `m-${s}-${Date.now().toString(36)}@madar.io`
}
function rndPass() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => c[Math.floor(Math.random() * c.length)]).join('')
}

function buildWeeklySchedule(selectedDays, timeFrom, timeTo) {
  return SCHEDULE_DAYS.map(name => ({
    name,
    enabled: selectedDays.includes(name),
    from: selectedDays.includes(name) ? timeFrom : '',
    to: selectedDays.includes(name) ? timeTo : ''
  }))
}

function renderDaysKb(selectedDays) {
  const kb = new InlineKeyboard()
  for (let i = 0; i < SCHEDULE_DAYS.length; i++) {
    const day = SCHEDULE_DAYS[i]
    const checked = selectedDays.includes(day)
    kb.text(`${checked ? '☑️' : '⬜'} ${day}`, `dpd:${i}`).row()
  }
  kb.text('✅ حفظ الأيام والوقت', 'dpd:save')
  return kb
}

const DIV = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈'
const DIV2 = '════════════════'

function menuBtn() { return new InlineKeyboard().text('🏠 القائمة الرئيسية', 'back') }

async function edit(ctx, text, options = {}) {
  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...options })
  } catch {
    try { await ctx.reply(text, { parse_mode: 'HTML', ...options }) } catch {}
  }
}

function mainKb(role) {
  const kb = new InlineKeyboard()
  if (role === 'admin') {
    kb.text('🏥 العيادات', 'c:list').text('🩺 الدليل', 'dp:list').row()
      .text('👥 المؤسسسين', 'f:list').text('➕ مؤسس', 'f:new').row()
      .text('📊 إحصائيات', 'stats').text('🔍 بحث', 'c:find')
  } else if (role === 'founder') {
    kb.text('🏥 عياداتي', 'my:list').text('➕ جديدة', 'c:new').row()
      .text('🩺 الدليل', 'dp:list').text('➕ منشأة', 'dp:new').row()
      .text('📊 إحصائيات', 'stats').text('🔍 بحث', 'c:find').row()
      .text('👤 ملفي', 'my:profile')
  } else {
    kb.text('🏥 منصة مدار', 'my:clinic').text('📱 الموقع', 'open:web')
  }
  return kb
}

async function uploadPhotoToImgbb(buf) {
  const b64 = buf.toString('base64')
  const imgbbKey = process.env.IMGBB_API_KEY || '5e643e07b1f815e2c3e668267e5081c3'
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'image=' + encodeURIComponent(b64)
  })
  const data = await res.json()
  return data.success ? data.data.url : null
}

async function downloadTelegramPhoto(ctx, photo) {
  const file = await ctx.api.getFile(photo.file_id)
  const tgUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`
  const imgRes = await fetch(tgUrl)
  return Buffer.from(await imgRes.arrayBuffer())
}

// ═══════════════════════════════════════
// Firebase Auth
// ═══════════════════════════════════════
async function setupFirebaseAuth() {
  let botUid = null
  try {
    const cred = await signInWithEmailAndPassword(mainAuth, BOT_EMAIL, BOT_PASS)
    botUid = cred.user.uid
  } catch (e) {
    if (['auth/user-not-found', 'auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(e.code)) {
      const cred = await createUserWithEmailAndPassword(secAuth, BOT_EMAIL, BOT_PASS)
      botUid = cred.user.uid
      await signInWithEmailAndPassword(mainAuth, BOT_EMAIL, BOT_PASS)
    } else throw e
  }
  const userSnap = await getDoc(doc(db, 'users', botUid))
  if (!userSnap.exists()) {
    await setDoc(doc(db, 'users', botUid), { fullName: 'بوت مدار', email: BOT_EMAIL, role: 'super_admin', clinicId: '', phone: '', photoUrl: '', createdAt: new Date().toISOString() })
  } else if (userSnap.data().role !== 'super_admin') {
    await updateDoc(doc(db, 'users', botUid), { role: 'super_admin' })
  }
}

// ═══════════════════════════════════════
// /start
// ═══════════════════════════════════════
bot.command('start', async (ctx) => {
  clearS(ctx.chat.id)
  const role = await getRole(ctx)
  if (role === 'admin') {
    return edit(ctx, `<b>${DIV2}</b>\n  👑 <b>لوحة تحكم مدار</b>\n<b>${DIV2}</b>\n\nمرحباً بك يا <b>مشرف عام</b> 👋\nاختر من القائمة 👇`, { reply_markup: mainKb('admin') })
  }
  if (role === 'founder') {
    let founderName = ''
    try {
      const fs = await getDocs(query(collection(db, 'bot_founders'), where('telegram_id', '==', ctx.from.id)))
      if (!fs.empty) founderName = fs.docs[0].data().name || ''
    } catch {}
    return edit(ctx, `<b>${DIV2}</b>\n  🏥 <b>مرحباً بك في مدار</b>\n<b>${DIV2}</b>\n\nأهلاً <b>${founderName || 'عزيزنا'}</b> 👋\nاختر من القائمة 👇`, { reply_markup: mainKb('founder') })
  }
  ctx.reply(`<b>${DIV2}</b>\n  🏥 <b>مدار للعيادات</b>\n<b>${DIV2}</b>\n\nمرحباً! ⚠️ أنت غير مسجّل.\n🔗 <code>asaasedu.com/login</code>`, { parse_mode: 'HTML' })
})

bot.command('myid', (ctx) => ctx.reply(`🆔 <code>${ctx.from.id}</code>`, { parse_mode: 'HTML' }))

bot.command('sync', async (ctx) => {
  if (!ok(ctx)) return
  await ctx.reply('⏳ جاري مزامنة الدليل...')
  try {
    const snap = await getDocs(collection(db, 'doctor_profiles'))
    let fixed = 0
    for (const d of snap.docs) {
      const p = d.data()
      const updates = {}
      if (!p.clinicId) updates.clinicId = d.id
      if (!p.facility_type) {
        updates.facility_type = 'doctor'
        updates.is_pharmacy = false
        updates.is_hospital = false
        updates.is_lab = false
        updates.is_physio = false
      } else {
        updates.is_pharmacy = p.facility_type === 'pharmacy'
        updates.is_hospital = p.facility_type === 'hospital'
        updates.is_lab = p.facility_type === 'lab'
        updates.is_physio = p.facility_type === 'physio'
      }
      if (p.is_24h === undefined) updates.is_24h = false
      if (!p.weekly_schedule) updates.weekly_schedule = buildWeeklySchedule([], '', '')
      if (p.is_public === undefined) updates.is_public = true
      if (p.is_directory_listing === undefined) updates.is_directory_listing = true
      if (p.view_count === undefined) updates.view_count = 0
      if (p.rating_avg === undefined) updates.rating_avg = 0
      if (p.rating_count === undefined) updates.rating_count = 0
      if (!p.photoUrl) updates.photoUrl = ''
      if (!p.phone1) updates.phone1 = ''
      if (!p.whatsapp) updates.whatsapp = ''
      if (!p.doctor_name) updates.doctor_name = ''
      if (!p.governorate) updates.governorate = ''
      if (!p.area) updates.area = ''
      if (!p.clinic_address) updates.clinic_address = ''
      if (!p.map_url) updates.map_url = ''
      if (!p.doctor_bio) updates.doctor_bio = ''
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'doctor_profiles', d.id), updates)
        fixed++
      }
    }

    let migrated = 0
    try {
      const oldSnap = await getDocs(collection(db, 'directory_listings'))
      const existingSnap = await getDocs(collection(db, 'doctor_profiles'))
      const existingNames = new Set(existingSnap.docs.map(d => (d.data().doctor_name || '').toLowerCase().trim()))
      for (const old of oldSnap.docs) {
        const o = old.data()
        const name = (o.doctor_name || '').toLowerCase().trim()
        if (existingNames.has(name)) continue
        const payload = {
          clinicId: '',
          doctor_name: o.doctor_name || '',
          specialty: o.specialty || '',
          facility_type: o.facility_type || 'doctor',
          governorate: o.governorate || '',
          area: o.area || '',
          clinic_address: o.address || o.clinic_address || '',
          phone1: o.phone || o.phone1 || '',
          phone2: '',
          whatsapp: o.whatsapp || '',
          map_url: o.map_url || '',
          doctor_bio: o.bio || o.doctor_bio || '',
          photoUrl: o.photoUrl || '',
          consultation_fee: o.consultation_fee || 0,
          is_public: o.is_public !== false && o.enabled !== false,
          is_directory_listing: true,
          is_24h: o.is_24h || false,
          weekly_schedule: o.weekly_schedule || buildWeeklySchedule([], '', ''),
          verified: false,
          is_top_rated: false,
          rating_avg: o.rating_avg || 0,
          rating_count: o.rating_count || 0,
          view_count: o.view_count || 0,
          created_at: o.created_at || o.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        if (o.facility_type === 'pharmacy') payload.is_pharmacy = true
        if (o.facility_type === 'hospital') payload.is_hospital = true
        if (o.facility_type === 'lab') payload.is_lab = true
        if (o.facility_type === 'physio') payload.is_physio = true
        const newRef = doc(collection(db, 'doctor_profiles'))
        payload.clinicId = newRef.id
        await setDoc(newRef, payload)
        migrated++
      }
    } catch (e) { console.error('Migration error:', e.message) }

    await ctx.reply(`✅ تمت المزامنة!\n\n🔧 تم تحديث: ${fixed} سجل\n📦 تم نقل من القديم: ${migrated} سجل\n📊 الإجمالي: ${snap.docs.length + migrated}`)
  } catch (e) { await ctx.reply(`❌ خطأ: ${e.message}`) }
})

// ═══════════════════════════════════════
// BACK
// ═══════════════════════════════════════
bot.callbackQuery('back', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  clearS(ctx.chat.id)
  const role = await getRole(ctx)
  const titles = { admin: '👑 لوحة التحكم', founder: '🏠 القائمة الرئيسية', guest: '📋 القائمة' }
  await edit(ctx, `<b>${titles[role]}</b>\n${DIV}\nاختر 👇`, { reply_markup: mainKb(role) })
})

bot.callbackQuery('open:web', async (ctx) => {
  await ctx.answerCallbackQuery({ url: 'https://asaasedu.com/login', cacheTime: 0 })
})

// ═══════════════════════════════════════
// CLINIC LIST
// ═══════════════════════════════════════
bot.callbackQuery('c:list', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    let snap
    if (store[ctx.chat.id]?.role === 'founder') {
      snap = await getDocs(query(collection(db, 'clinics'), where('ownerUid', '==', store[ctx.chat.id].founderId), orderBy('createdAt', 'desc')))
    } else {
      snap = await getDocs(query(collection(db, 'clinics'), orderBy('createdAt', 'desc')))
    }
    if (snap.empty) return edit(ctx, `<b>🏥 العيادات</b>\n${DIV}\n\n📭 لا توجد عيادات بعد.\nابدأ بإنشاء عيادتك!`, { reply_markup: new InlineKeyboard().text('➕ إنشاء', 'c:new').row().text('◀️ رجوع', 'back') })
    let msg = `<b>🏥 العيادات</b> — ${snap.size}\n${DIV}\n\n`
    const kb = new InlineKeyboard()
    snap.docs.forEach((d, i) => {
      const c = d.data()
      const s = c.status === 'active' ? '🟢' : '🔴'
      msg += `${s} <b>${i + 1}.</b> ${c.name} — ${c.specialty || '-'}\n`
      kb.text(`${s} ${c.name}`, `c:show:${d.id}`).row()
    })
    kb.text('➕ إنشاء', 'c:new').row().text('◀️ رجوع', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error('c:list:', e.message) }
})

bot.callbackQuery(/^c:show:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDoc(doc(db, 'clinics', ctx.match[1]))
    if (!snap.exists()) return ctx.reply('❌ غير موجودة')
    const c = snap.data()
    const st = c.status === 'active' ? '🟢 نشطة' : '🔴 مغلقة'
    const fee = c.consultation_fee ? Number(c.consultation_fee).toLocaleString('ar-EG') + ' د.ع' : 'مجاني'
    const msg =
      `<b>${c.name}</b>\n${DIV}\n` +
      `👤 ${c.ownerName || '-'}  •  📱 ${c.phone || '-'}\n` +
      `📧 ${c.email || '-'}\n\n` +
      `📍 ${c.address || '-'} — ${c.governorate || '-'}\n` +
      `🩺 ${c.specialty || '-'}  •  💰 ${fee}\n` +
      `📊 ${PLANS[c.plan] || c.plan || '-'}  •  ${st}\n` +
      `📅 ${c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '-'}`
    const kb = new InlineKeyboard()
      .text('✏️ تعديل', `c:ed:${ctx.match[1]}`).row()
      .text(c.status === 'active' ? '🔴 إيقاف' : '🟢 تفعيل', `c:tg:${ctx.match[1]}`).row()
      .text('🗑️ حذف', `c:rm:${ctx.match[1]}`).row()
      .text('◀️ العيادات', 'c:list').text('🏠', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error('c:show:', e.message) }
})

bot.callbackQuery(/^c:tg:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDoc(doc(db, 'clinics', ctx.match[1]))
    if (!snap.exists()) return
    const ns = snap.data().status === 'active' ? 'closed' : 'active'
    await updateDoc(doc(db, 'clinics', ctx.match[1]), { status: ns })
    await edit(ctx, `✅ ${snap.data().name}: <b>${ns === 'active' ? '🟢 نشطة' : '🔴 مغلقة'}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `c:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error('c:tg:', e.message) }
})

bot.callbackQuery(/^c:rm:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  await edit(ctx, `⚠️ <b>تأكيد الحذف</b>\nهل أنت متأكد؟`, {
    reply_markup: new InlineKeyboard().text('✅ نعم', `c:rok:${ctx.match[1]}`).text('❌ لا', `c:show:${ctx.match[1]}`)
  })
})

bot.callbackQuery(/^c:rok:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    await deleteDoc(doc(db, 'clinics', ctx.match[1]))
    await edit(ctx, `✅ تم الحذف بنجاح`, { reply_markup: menuBtn() })
  } catch (e) { console.error('c:rok:', e.message) }
})

// ═══════════════════════════════════════
// CREATE CLINIC
// ═══════════════════════════════════════
bot.callbackQuery('c:new', async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const s = getS(ctx.chat.id); s.step = 'c_name'; s.data = {}
  await edit(ctx, `🏥 <b>إنشاء عيادة</b>\n${DIV}\n\nالخطوة <b>1/8</b>: اسم العيادة`, {
    reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back')
  })
})

// ═══════════════════════════════════════
// EDIT CLINIC
// ═══════════════════════════════════════
bot.callbackQuery(/^c:ed:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const id = ctx.match[1]
  await edit(ctx, `✏️ <b>تعديل العيادة</b>\n${DIV}`, {
    reply_markup: new InlineKeyboard()
      .text('✏️ الاسم', `ef:name:${id}`).text('👤 الصاحب', `ef:ownerName:${id}`).row()
      .text('📱 الهاتف', `ef:phone:${id}`).text('📍 العنوان', `ef:address:${id}`).row()
      .text('🩺 التخصص', `ef:specialty:${id}`).text('💰 الكشفية', `ef:consultation_fee:${id}`).row()
      .text('🏛️ المحافظة', `ef:governorate:${id}`).text('📊 الباقة', `ef:plan:${id}`).row()
      .text('◀️ رجوع', `c:show:${id}`)
  })
})

bot.callbackQuery(/^ef:plan:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const id = ctx.match[1]
  await edit(ctx, `📊 <b>اختر الباقة:</b>`, {
    reply_markup: new InlineKeyboard()
      .text('🟢 أساسية', `efv:${id}:plan:basic`).row()
      .text('🔵 متقدمة', `efv:${id}:plan:premium`).row()
      .text('🟣 مؤسسات', `efv:${id}:plan:enterprise`).row()
      .text('◀️ رجوع', `c:ed:${id}`)
  })
})

bot.callbackQuery(/^efv:(.+):plan:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    await updateDoc(doc(db, 'clinics', ctx.match[1]), { plan: ctx.match[2] })
    await edit(ctx, `✅ الباقة: <b>${PLANS[ctx.match[2]]}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `c:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^ef:(\w+):(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const field = ctx.match[1], id = ctx.match[2]
  const s = getS(ctx.chat.id)
  s.step = 'edit_val'; s.data = { cid: id, field }
  const names = { name: 'الاسم', ownerName: 'الصاحب', phone: 'الهاتف', address: 'العنوان', consultation_fee: 'الكشفية', specialty: 'التخصص', governorate: 'المحافظة' }
  if (field === 'specialty') {
    const rows = []; for (let i = 0; i < SPECS.length; i += 3) rows.push(SPECS.slice(i, i + 3))
    return ctx.reply('🩺 اختر التخصص:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
  }
  if (field === 'governorate') {
    const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
    return ctx.reply('🏛️ اختر المحافظة:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
  }
  await edit(ctx, `✏️ <b>الجديد لـ ${names[field]}:</b>`)
})

// ═══════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════
bot.callbackQuery('c:find', async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const s = getS(ctx.chat.id); s.step = 'search'
  await edit(ctx, `🔍 <b>اكتب للبحث:</b>`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
})

// ═══════════════════════════════════════
// FOUNDERS
// ═══════════════════════════════════════
bot.callbackQuery('f:new', async (ctx) => {
  if (!ok(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const s = getS(ctx.chat.id); s.step = 'f_name'
  await edit(ctx, `➕ <b>إضافة مؤسس</b>\n${DIV}\n\n<b>1/3:</b> الاسم`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
})

bot.callbackQuery('f:list', async (ctx) => {
  if (!ok(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDocs(query(collection(db, 'bot_founders'), orderBy('created_at', 'desc')))
    if (snap.empty) return edit(ctx, `👥 <b>المؤسسسين</b>\n${DIV}\n\n📭 لا يوجد مؤسسسين`, { reply_markup: new InlineKeyboard().text('➕ إضافة', 'f:new').row().text('◀️', 'back') })
    let msg = `<b>👥 المؤسسسين</b> — ${snap.size}\n${DIV}\n\n`
    const kb = new InlineKeyboard()
    snap.docs.forEach((d, i) => {
      const f = d.data()
      msg += `<b>${i + 1}.</b> ${f.name} — @${f.username || '-'}\n`
      kb.text(`🗑️ ${f.name}`, `f:rm:${d.id}`).row()
    })
    kb.text('➕ إضافة', 'f:new').row().text('◀️ رجوع', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^f:rm:(.+)$/, async (ctx) => {
  if (!ok(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  await edit(ctx, `⚠️ <b>حذف المؤسس؟</b>`, {
    reply_markup: new InlineKeyboard().text('✅ نعم', `f:rok:${ctx.match[1]}`).text('❌ لا', 'f:list')
  })
})

bot.callbackQuery(/^f:rok:(.+)$/, async (ctx) => {
  if (!ok(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try { await deleteDoc(doc(db, 'bot_founders', ctx.match[1])); await edit(ctx, `✅ تم الحذف`, { reply_markup: menuBtn() }) } catch {}
})

// ═══════════════════════════════════════
// STATS
// ═══════════════════════════════════════
bot.callbackQuery('stats', async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const [fc, cc, pc, dlSnap] = await Promise.all([
      getDocs(collection(db, 'bot_founders')),
      getDocs(collection(db, 'clinics')),
      getDocs(collection(db, 'patients')),
      getDocs(collection(db, 'doctor_profiles'))
    ])
    const active = cc.docs.filter(d => d.data().status === 'active').length
    await edit(ctx,
      `<b>📊 الإحصائيات</b>\n${DIV2}\n\n` +
      `👥 المؤسسسين: <b>${fc.size}</b>\n` +
      `🏥 العيادات: <b>${cc.size}</b> (${active} نشطة)\n` +
      `🩺 الدليل: <b>${dlSnap.size}</b>\n` +
      `🧑‍⚕️ المرضى: <b>${pc.size}</b>\n\n` +
      `${DIV}\n📅 ${new Date().toLocaleDateString('ar-EG')}`,
      { reply_markup: menuBtn() }
    )
  } catch (e) { console.error(e.message) }
})

// ═══════════════════════════════════════
// FOUNDER: MY STUFF
// ═══════════════════════════════════════
bot.callbackQuery('my:list', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const fs = await getDocs(query(collection(db, 'bot_founders'), where('telegram_id', '==', ctx.from.id)))
    if (fs.empty) return ctx.reply('⛔ غير مسجل.')
    const snap = await getDocs(query(collection(db, 'clinics'), where('ownerUid', '==', fs.docs[0].id)))
    if (snap.empty) return edit(ctx, `🏥 <b>عياداتي</b>\n${DIV}\n\n📭 لا توجد عيادات`, { reply_markup: new InlineKeyboard().text('➕ إنشاء', 'c:new').row().text('◀️', 'back') })
    let msg = `<b>🏥 عياداتي</b> — ${snap.size}\n${DIV}\n\n`
    const kb = new InlineKeyboard()
    snap.docs.forEach((d, i) => {
      const c = d.data()
      const s = c.status === 'active' ? '🟢' : '🔴'
      msg += `${s} <b>${i + 1}.</b> ${c.name} — ${c.specialty || '-'}\n`
      kb.text(`${s} ${c.name}`, `c:show:${d.id}`).row()
    })
    kb.text('➕ جديدة', 'c:new').row().text('◀️', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery('my:clinic', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  await edit(ctx, `🏥 <b>منصة مدار</b>\n${DIV}\n\n🔗 <code>asaasedu.com/login</code>`, { reply_markup: menuBtn() })
})

bot.callbackQuery('my:profile', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const fs = await getDocs(query(collection(db, 'bot_founders'), where('telegram_id', '==', ctx.from.id)))
    if (fs.empty) return ctx.reply('⛔ غير مسجل.')
    const f = fs.docs[0].data()
    const cc = await getDocs(query(collection(db, 'clinics'), where('ownerUid', '==', fs.docs[0].id)))
    const active = cc.docs.filter(d => d.data().status === 'active').length
    await edit(ctx,
      `<b>👤 ملفي الشخصي</b>\n${DIV2}\n\n` +
      `👤 ${f.name}  •  @${f.username || '-'}\n` +
      `🆔 <code>${f.telegram_id}</code>\n` +
      `🏥 ${cc.size} عيادة (${active} نشطة)\n` +
      `📅 ${f.created_at ? new Date(f.created_at).toLocaleDateString('ar-EG') : '-'}`,
      { reply_markup: menuBtn() }
    )
  } catch (e) { console.error(e.message) }
})

// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// DIRECTORY LISTINGS (الدليل) — doctor_profiles
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════

bot.callbackQuery('dp:skipphoto', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_photo') return
  s.data.photoUrl = ''
  s.step = 'dp_name'
  await edit(ctx, `✅ تم التخطي\n\n<b>2/13:</b> ✏️ اسم الطبيب أو المنشأة:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
})

bot.callbackQuery('dp:list', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDocs(collection(db, 'doctor_profiles'))
    const docs = snap.docs
    const counts = { all: docs.length, doctor: 0, pharmacy: 0, hospital: 0, lab: 0, physio: 0 }
    docs.forEach(d => { const ft = d.data().facility_type || 'doctor'; counts[ft] = (counts[ft] || 0) + 1 })
    const kb = new InlineKeyboard()
      .text(`📋 الكل (${counts.all})`, 'dp:cat:all').row()
      .text(`🩺 أطباء (${counts.doctor})`, 'dp:cat:doctor')
      .text(`💊 صيدليات (${counts.pharmacy})`, 'dp:cat:pharmacy').row()
      .text(`🏥 مستشفيات (${counts.hospital})`, 'dp:cat:hospital')
      .text(`🔬 مختبرات (${counts.lab})`, 'dp:cat:lab').row()
      .text(`🦴 علاج طبيعي (${counts.physio})`, 'dp:cat:physio').row()
      .text('➕ إضافة منشأة', 'dp:new').row()
      .text('◀️ رجوع', 'back')
    await edit(ctx, `<b>🩺 الدليل</b> — ${counts.all} منشأة\n${DIV}\n\nاختر القسم 👇`, { reply_markup: kb })
  } catch (e) { console.error('dp:list:', e.message); await ctx.reply(`❌ خطأ: ${e.message}`).catch(() => {}) }
})

function buildCategoryList(docs, filter) {
  const CAT_LABELS = { all: 'الكل', doctor: '🩺 أطباء', pharmacy: '💊 صيدليات', hospital: '🏥 مستشفيات', lab: '🔬 مختبرات', physio: '🦴 علاج طبيعي' }
  let filtered = filter === 'all' ? docs : docs.filter(d => (d.data().facility_type || 'doctor') === filter)
  filtered.sort((a, b) => {
    const a24 = a.data().is_24h ? 1 : 0, b24 = b.data().is_24h ? 1 : 0
    if (b24 !== a24) return b24 - a24
    return (b.data().created_at || '').localeCompare(a.data().created_at || '')
  })
  const label = CAT_LABELS[filter] || 'الكل'
  const msgLines = [`<b>${label}</b> — ${filtered.length}\n${DIV}\n`]
  const kb = new InlineKeyboard()
  if (!filtered.length) {
    msgLines.push('📭 لا يوجد عناصر')
  } else {
    filtered.forEach((d, i) => {
      const p = d.data()
      const vis = p.is_public !== false ? '🟢' : '🔴'
      const ft = FACILITY_TYPES[p.facility_type] || '🩺'
      const h24 = p.is_24h ? '⏰' : ''
      msgLines.push(`${vis} <b>${i + 1}.</b> ${ft} ${p.doctor_name || '-'} — ${p.specialty || '-'} ${h24}`)
      kb.text(`${vis} ${p.doctor_name || 'منشأة'}`, `dp:show:${d.id}`).row()
    })
  }
  const catBtns = [
    [{ text: `📋 الكل`, data: 'dp:cat:all' }, { text: `🩺 أطباء`, data: 'dp:cat:doctor' }],
    [{ text: `💊 صيدليات`, data: 'dp:cat:pharmacy' }, { text: `🏥 مستشفيات`, data: 'dp:cat:hospital' }],
    [{ text: `🔬 مختبرات`, data: 'dp:cat:lab' }, { text: `🦴 علاج طبيعي`, data: 'dp:cat:physio' }]
  ]
  catBtns.forEach(row => kb.row(...row.map(b => InlineKeyboard.text(b.text, b.data))))
  kb.text('➕ إضافة منشأة', 'dp:new').row().text('◀️ رجوع', 'back')
  return { text: msgLines.join('\n'), kb }
}

bot.callbackQuery(/^dp:cat:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const filter = ctx.match[1]
    const snap = await getDocs(collection(db, 'doctor_profiles'))
    const docs = snap.docs
    const { text, kb } = buildCategoryList(docs, filter)
    await edit(ctx, text, { reply_markup: kb })
  } catch (e) { console.error('dp:cat:', e.message); await ctx.reply(`❌ خطأ: ${e.message}`).catch(() => {}) }
})

bot.callbackQuery(/^dp:show:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDoc(doc(db, 'doctor_profiles', ctx.match[1]))
    if (!snap.exists()) return ctx.reply('❌ غير موجود.')
    const p = snap.data()
    const vis = p.enabled !== false ? '🟢 ظاهر' : '🔴 مخفي'
    const ft = FACILITY_TYPES[p.facility_type] || '🩺'
    const h24 = p.is_24h ? '⏰ 24 ساعة' : '🕐 ساعات محددة'
    let scheduleText = ''
    if (p.is_24h) {
      scheduleText = 'يعمل 24/7'
    } else if (p.weekly_schedule && p.weekly_schedule.length) {
      const enabled = p.weekly_schedule.filter(d => d.enabled)
      if (enabled.length) {
        scheduleText = enabled.map(d => `${d.name} ${d.from || ''}-${d.to || ''}`).join('\n')
      } else {
        scheduleText = 'لا يوجد جدول'
      }
    }
    const namePrefix = p.facility_type === 'doctor' ? 'د. ' : ''
    const msg =
      `<b>${ft} ${namePrefix}${p.doctor_name || '-'}</b>\n${DIV2}\n\n` +
      `🩺 <b>التخصص:</b> ${p.specialty || '-'}\n` +
      `🏛️ <b>المحافظة:</b> ${p.governorate || '-'} — ${p.area || '-'}\n` +
      `📍 <b>العنوان:</b> ${p.clinic_address || '-'}\n\n` +
      `📱 <b>الهاتف:</b> ${p.phone1 || '-'}\n` +
      `💬 <b>واتساب:</b> ${p.whatsapp || '-'}\n` +
      `🔗 <b>الخريطة:</b> ${p.map_url || '-'}\n\n` +
      `📝 <b>النبذة:</b> ${(p.doctor_bio || '-').substring(0, 120)}${(p.doctor_bio || '').length > 120 ? '...' : ''}\n\n` +
      `${h24}\n📅 <b>الدوام:</b>\n${scheduleText}\n\n` +
      `👁 ${p.view_count || 0} مشاهدة  •  ⭐ ${p.rating_avg || 0} (${p.rating_count || 0})\n` +
      `📌 ${vis}`
    const kb = new InlineKeyboard()
      .text('✏️ تعديل', `dp:edit:${ctx.match[1]}`).row()
      .text(p.enabled !== false ? '🔴 إخفاء' : '🟢 إظهار', `dp:tg:${ctx.match[1]}`).row()
      .text(p.is_24h ? '🕐 تغيير لساعات' : '⏰ جعل 24 ساعة', `dp:set24:${ctx.match[1]}`).row()
      .text('📅 تعديل الجدول', `dp:setschedule:${ctx.match[1]}`).row()
      .text('🗑️ حذف', `dp:rm:${ctx.match[1]}`).row()
      .text('◀️ الدليل', 'dp:list').text('🏠', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error('dp:show:', e.message) }
})

bot.callbackQuery('dp:new', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  const s = getS(ctx.chat.id); s.step = 'dp_type'; s.data = {}
  const kb = new InlineKeyboard()
  for (const [key, label] of Object.entries(FACILITY_TYPES)) { kb.text(label, `dpt:${key}`).row() }
  kb.text('❌ إلغاء', 'back')
  await edit(ctx, `🩺 <b>إضافة منشأة للدليل</b>\n${DIV}\n\n<b>1/?</b> نوع المنشأة:`, { parse_mode: 'HTML', reply_markup: kb })
})

bot.callbackQuery(/^dp:edit:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const id = ctx.match[1]
  const kb = new InlineKeyboard()
    .text('📸 الصورة', `dp:set:photo:${id}`).text('✏️ الاسم', `dp:set:doctor_name:${id}`).row()
    .text('🩺 التخصص', `dp:set:specialty:${id}`).text('🏢 النوع', `dp:set:facility_type:${id}`).row()
    .text('🏛️ المحافظة', `dp:set:governorate:${id}`).text('📍 المنطقة', `dp:set:area:${id}`).row()
    .text('🏠 العنوان', `dp:set:clinic_address:${id}`).text('📱 الهاتف', `dp:set:phone1:${id}`).row()
    .text('💬 واتساب', `dp:set:whatsapp:${id}`).text('🔗 الخريطة', `dp:set:map_url:${id}`).row()
    .text('📝 النبذة', `dp:set:doctor_bio:${id}`).text('💰 الكشفية', `dp:set:consultation_fee:${id}`).row()
    .text('⏰ دوام 24 ساعة', `dp:set24:${id}`).text('📅 الجدول', `dp:setschedule:${id}`).row()
    .text('◀️ الرجوع', `dp:show:${id}`)
  await edit(ctx, `<b>✏️ تعديل الطبيب</b>\n${DIV}\n\nاختر ما تريد تعديله 👇`, { reply_markup: kb })
})

const DP_TEXT_FIELDS = { doctor_name: '✏️ الاسم الجديد', specialty: '🩺 التخصص الجديد', governorate: '🏛️ المحافظة الجديدة', area: '📍 المنطقة الجديدة', phone1: '📱 رقم الهاتف الجديد', whatsapp: '💬 رقم الواتساب الجديد', clinic_address: '🏠 العنوان الجديد', map_url: '🔗 رابط الخريطة الجديد', doctor_bio: '📝 النبذة الجديدة', consultation_fee: '💰 الكشفية الجديدة (رقم فقط)' }

bot.callbackQuery(/^dp:set:([^:]+):(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const field = ctx.match[1], id = ctx.match[2]

  if (field === 'photo') {
    const s = getS(ctx.chat.id)
    s.step = 'dp_setphoto'; s.data = { editId: id }
    return edit(ctx, `📸 <b>ارسل الصورة الجديدة:</b>\n${DIV}\n\nارسل صورة أو اكتب - لإلغاء:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', `dp:edit:${id}`) })
  }

  if (field === 'facility_type') {
    const kb = new InlineKeyboard()
    for (const [key, label] of Object.entries(FACILITY_TYPES)) {
      kb.text(label, `dp:ft:${key}:${id}`).row()
    }
    kb.text('◀️ رجوع', `dp:edit:${id}`)
    return edit(ctx, `🏢 <b>اختر النوع:</b>`, { reply_markup: kb })
  }

  if (field === 'specialty') {
    const s = getS(ctx.chat.id)
    s.step = 'dp_set_field'; s.data = { field, editId: id }
    const rows = []; for (let i = 0; i < SPECS.length; i += 3) rows.push(SPECS.slice(i, i + 3))
    return ctx.reply('🩺 اختر التخصص:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
  }

  if (field === 'governorate') {
    const s = getS(ctx.chat.id)
    s.step = 'dp_set_field'; s.data = { field, editId: id }
    const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
    return ctx.reply('🏛️ اختر المحافظة:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
  }

  if (field === 'area') {
    const s = getS(ctx.chat.id)
    const docSnap = await getDoc(doc(db, 'doctor_profiles', id))
    const gov = docSnap.exists() ? docSnap.data().governorate : ''
    s.step = 'dp_set_field'; s.data = { field, editId: id }
    if (gov && AREAS[gov]) {
      const areas = [...AREAS[gov], 'أخرى']
      const rows = []; for (let i = 0; i < areas.length; i += 3) rows.push(areas.slice(i, i + 3))
      return ctx.reply('📍 اختر المنطقة:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    return edit(ctx, `📝 <b>اكتب المنطقة الجديدة:</b>`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', `dp:edit:${id}`) })
  }

  if (!DP_TEXT_FIELDS[field]) return
  const s = getS(ctx.chat.id)
  s.step = 'dp_set_field'; s.data = { field, editId: id }
  await edit(ctx, `📝 <b>${DP_TEXT_FIELDS[field]}</b>\n${DIV}\n\nاكتب القيمة الجديدة أو اكتب - لإلغاء:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', `dp:edit:${id}`) })
})

bot.callbackQuery(/^dp:ft:([^:]+):(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const type = ctx.match[1], id = ctx.match[2]
  const flags = { doctor: {}, pharmacy: { is_pharmacy: true }, hospital: { is_hospital: true }, lab: { is_lab: true }, physio: { is_physio: true } }
  const update = { facility_type: type, ...flags[type] || {} }
  try {
    await updateDoc(doc(db, 'doctor_profiles', id), update)
    await edit(ctx, `✅ النوع: <b>${FACILITY_TYPES[type]}</b>`, { reply_markup: new InlineKeyboard().text('◀️ رجوع', `dp:edit:${id}`) })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dp:tg:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDoc(doc(db, 'doctor_profiles', ctx.match[1]))
    if (!snap.exists()) return
    const cur = snap.data().is_public !== false
    await updateDoc(doc(db, 'doctor_profiles', ctx.match[1]), { is_public: !cur })
    await edit(ctx, `✅ ${snap.data().doctor_name}: <b>${!cur ? '🟢 ظاهر' : '🔴 مخفي'}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `dp:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dp:set24:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  try {
    const snap = await getDoc(doc(db, 'doctor_profiles', ctx.match[1]))
    if (!snap.exists()) return
    const cur = snap.data().is_24h || false
    const new24h = !cur
    const update = { is_24h: new24h }
    if (new24h) {
      update.weekly_schedule = buildWeeklySchedule(SCHEDULE_DAYS, '00:00', '23:59')
    } else {
      update.weekly_schedule = buildWeeklySchedule([], '', '')
    }
    await updateDoc(doc(db, 'doctor_profiles', ctx.match[1]), update)
    await edit(ctx, `✅ دوام 24 ساعة: <b>${new24h ? 'نعم ⏰' : 'لا 🕐'}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `dp:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dp:setschedule:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const id = ctx.match[1]
  const s = getS(ctx.chat.id)
  s.step = 'dp_edit_schedule'; s.data = { editId: id, selectedDays: [] }
  try {
    const snap = await getDoc(doc(db, 'doctor_profiles', id))
    if (snap.exists() && snap.data().weekly_schedule) {
      snap.data().weekly_schedule.forEach(d => { if (d.enabled && d.from) s.data.selectedDays.push(d.name) })
    }
  } catch {}
  await edit(ctx, `📅 <b>اختر ايام الدوام:</b>\n${DIV}\n\nاضغط على كل يوم لتفعيله أو تعطيله:`, { reply_markup: renderDaysKb(s.data.selectedDays) })
})

bot.callbackQuery(/^dpd:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const idx = Number(ctx.match[1])
  const s = getS(ctx.chat.id)
  if (!s.data.selectedDays) s.data.selectedDays = []
  const day = SCHEDULE_DAYS[idx]
  const i = s.data.selectedDays.indexOf(day)
  if (i > -1) s.data.selectedDays.splice(i, 1)
  else s.data.selectedDays.push(day)
  try {
    await ctx.editMessageReplyMarkup({ reply_markup: renderDaysKb(s.data.selectedDays) })
  } catch {}
})

bot.callbackQuery('dpd:save', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const s = getS(ctx.chat.id)
  if (!s.data.selectedDays || !s.data.selectedDays.length) {
    return edit(ctx, `⚠️ اختر يوماً واحداً على الأقل!`, { reply_markup: renderDaysKb(s.data.selectedDays || []) })
  }
  if (s.step === 'dp_edit_schedule') {
    s.step = 'dp_edit_hours'
    return edit(ctx, `⏰ <b>اكتب وقت الدوام:</b>\n${DIV}\n\nمثال: <code>8:00 - 14:00</code>\n\nاكتب من - الى:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', `dp:edit:${s.data.editId}`) })
  }
  if (s.step === 'dp_days') {
    s.step = 'dp_hours'
    return edit(ctx, `⏰ <b>اكتب وقت الدوام:</b>\n${DIV}\n\nمثال: <code>8:00 - 14:00</code>\n\nاكتب من - الى:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
  }
})

bot.callbackQuery(/^dp:rm:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  await edit(ctx, `⚠️ <b>حذف الطبيب من الدليل؟</b>`, {
    reply_markup: new InlineKeyboard().text('✅ نعم، حذف', `dp:rok:${ctx.match[1]}`).text('❌ لا', 'dp:list')
  })
})

bot.callbackQuery(/^dp:rok:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try { await deleteDoc(doc(db, 'doctor_profiles', ctx.match[1])); await edit(ctx, `✅ تم الحذف`, { reply_markup: menuBtn() }) } catch {}
})

// ═══════════════════════════════════════
// PHOTO HANDLER
// ═══════════════════════════════════════
bot.on('message:photo', async (ctx) => {
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_photo' && s.step !== 'dp_setphoto') return
  await ctx.reply('⏳ جاري رفع الصورة...')
  try {
    const photo = ctx.message.photo[ctx.message.photo.length - 1]
    const buf = await downloadTelegramPhoto(ctx, photo)
    const url = await uploadPhotoToImgbb(buf)
    if (s.step === 'dp_photo') {
      s.data.photoUrl = url || ''
      s.step = 'dp_name'
      await ctx.reply(`✅ تم رفع الصورة${url ? ' 📸' : ' (فشل الرفع)'}\n\n<b>2/13:</b> ✏️ اسم الطبيب أو المنشأة:`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
    } else if (s.step === 'dp_setphoto') {
      const id = s.data.editId
      try {
        await updateDoc(doc(db, 'doctor_profiles', id), { photoUrl: url || '' })
        await ctx.reply(`✅ تم تحديث الصورة 📸`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:edit:${id}`) })
      } catch (e) { await ctx.reply('❌ خطأ في الحفظ') }
      clearS(ctx.chat.id)
    }
  } catch (e) {
    console.error('Photo upload error:', e.message)
    if (s.step === 'dp_photo') {
      s.data.photoUrl = ''
      s.step = 'dp_name'
      await ctx.reply(`⚠️ فشل رفع الصورة\n\n<b>2/13:</b> ✏️ اسم الطبيب أو المنشأة:`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
    }
  }
})

// ═══════════════════════════════════════
// TEXT HANDLER
// ═══════════════════════════════════════
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim()
  const s = getS(ctx.chat.id)
  if (!s.step) return

  if (text === '❌ إلغاء' || text === '🏠 القائمة الرئيسية' || text === '📋 القائمة') {
    clearS(ctx.chat.id)
    const role = store[ctx.chat.id]?.role || 'guest'
    return ctx.reply(`🏠 <b>القائمة</b>`, { parse_mode: 'HTML', reply_markup: mainKb(role) })
  }

  try {
    // ── DOCTOR PROFILE WIZARD ──

    if (s.step === 'dp_name') {
      s.data.doctor_name = text
      if (s.data.facility_type === 'doctor') {
        s.step = 'dp_spec'
        const rows = []; for (let i = 0; i < SPECS.length; i += 3) rows.push(SPECS.slice(i, i + 3))
        return ctx.reply('🩺 اختر التخصص:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
      } else {
        s.step = 'dp_subtype'
        const subtypes = { pharmacy: ['صيدلية عامة', 'صيدلية مستشفى'], hospital: ['مستشفى حكومي', 'مستشفى خاص', 'عيادة'], lab: ['مختبر حكومي', 'مختبر خاص'], physio: ['مركز علاج طبيعي', 'عيادة علاج طبيعي'] }
        const options = subtypes[s.data.facility_type] || ['أخرى']
        const kb = new InlineKeyboard()
        options.forEach(opt => kb.text(opt, `dp:sub:${opt}`).row())
        kb.text('أخرى', 'dp:sub:أخرى').row()
        kb.text('❌ إلغاء', 'back')
        return ctx.reply('🏷️ نوع المنشأة الفرعي:', { parse_mode: 'HTML', reply_markup: kb })
      }
    }
    if (s.step === 'dp_spec') {
      if (text === 'أخرى') { s.step = 'dp_spec_custom'; return ctx.reply('✏️ اكتب التخصص يدوياً:', { reply_markup: { remove_keyboard: true } }) }
      if (!SPECS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.specialty = text; s.step = 'dp_gov'
      const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
      return ctx.reply('🏛️ اختر المحافظة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'dp_spec_custom') { s.data.specialty = text; s.step = 'dp_gov'
      const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
      return ctx.reply('🏛️ اختر المحافظة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }

    if (s.step === 'dp_gov') { if (!GOVS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.governorate = text; s.step = 'dp_area'
      const areas = AREAS[text] || ['أخرى']
      const kb = [...areas, 'أخرى']
      const rows = []; for (let i = 0; i < kb.length; i += 3) rows.push(kb.slice(i, i + 3))
      return ctx.reply('📍 <b>6/13</b> اختر المنطقة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'dp_area') {
      if (text === 'أخرى') { s.step = 'dp_area_custom'; return ctx.reply('✏️ اكتب المنطقة يدوياً:', { reply_markup: { remove_keyboard: true } }) }
      const areas = AREAS[s.data.governorate] || []
      if (!areas.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.area = text; s.step = 'dp_addr'
      return ctx.reply('🏠 <b>7/13</b> العنوان بالضبط (- للتخطي):', { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }
    if (s.step === 'dp_area_custom') { s.data.area = text; s.step = 'dp_addr'
      return ctx.reply('🏠 <b>7/13</b> العنوان بالضبط (- للتخطي):', { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }

    if (s.step === 'dp_addr') { s.data.clinic_address = text === '-' ? '' : text; s.step = 'dp_phone'
      return ctx.reply('📱 <b>8/13</b> رقم الهاتف (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_phone') { s.data.phone1 = text === '-' ? '' : text; s.step = 'dp_wa'
      return ctx.reply('💬 <b>9/13</b> رقم الواتساب (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_wa') { s.data.whatsapp = text === '-' ? '' : text; s.step = 'dp_map'
      return ctx.reply('🗺️ <b>10/13</b> رابط الموقع على الخريطة (- للتخطي):\n\nمثال: https://goo.gl/maps/xxx', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_map') { s.data.map_url = text === '-' ? '' : text; s.step = 'dp_bio'
      return ctx.reply('📝 <b>11/13</b> النبذة التعريفية (- للتخطي):\n\nاكتب نبذة مختصرة عن الطبيب أو المنشأة:', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_bio') {
      s.data.doctor_bio = text === '-' ? '' : text; s.step = 'dp_24h'
      const kb = new InlineKeyboard()
        .text('نعم ⏰ يعمل 24 ساعة', 'dp24h:yes').row()
        .text('لا 🕐 ساعات محددة', 'dp24h:no').row()
        .text('❌ إلغاء', 'back')
      return edit(ctx, `⏰ <b>12/13</b> هل المنشأة تعمل 24 ساعة؟`, { reply_markup: kb })
    }

    if (s.step === 'dp_hours') {
      const m = text.match(/(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})/i)
      if (!m) return ctx.reply('❌ الصيغة: <code>8:00 - 14:00</code>\n\nاكتب الوقت صحيحاً:', { parse_mode: 'HTML' })
      s.data.timeFrom = m[1]; s.data.timeTo = m[2]
      await saveDoctorProfile(ctx, s)
      return
    }

    // ── EDIT SCHEDULE HOURS ──
    if (s.step === 'dp_edit_hours') {
      const m = text.match(/(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})/i)
      if (!m) return ctx.reply('❌ الصيغة: <code>8:00 - 14:00</code>\n\nاكتب الوقت صحيحاً:', { parse_mode: 'HTML' })
      const schedule = buildWeeklySchedule(s.data.selectedDays, m[1], m[2])
      try {
        await updateDoc(doc(db, 'doctor_profiles', s.data.editId), { weekly_schedule: schedule, is_24h: false, updated_at: new Date().toISOString() })
        clearS(ctx.chat.id)
        await ctx.reply(`✅ تم تحديث جدول الدوام`, { reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:show:${s.data.editId}`) })
      } catch (e) { console.error(e.message); await ctx.reply('❌ خطأ في الحفظ') }
      return
    }

    // ── EDIT FIELD ──
    if (s.step === 'dp_set_field') {
      const { field, editId } = s.data
      if (text === '-') { clearS(ctx.chat.id); return ctx.reply('❌ تم الإلغاء') }
      const update = {}
      if (field === 'consultation_fee') {
        const fee = Number(text); if (isNaN(fee) || fee < 0) return ctx.reply('❌ رقم فقط، حاول مرة أخرى:')
        update[field] = fee
      } else {
        update[field] = text
      }
      update.updated_at = new Date().toISOString()
      try { await updateDoc(doc(db, 'doctor_profiles', editId), update) } catch (e) { console.error(e.message) }
      clearS(ctx.chat.id)
      return edit(ctx, `✅ تم تحديث <b>${DP_TEXT_FIELDS[field] || field}</b>`, { reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:edit:${editId}`) })
    }

    // ── CREATE CLINIC ──
    if (s.step === 'c_name') { s.data.name = text; s.step = 'c_owner'; return ctx.reply('👤 صاحب العيادة:') }
    if (s.step === 'c_owner') { s.data.ownerName = text; s.step = 'c_phone'; return ctx.reply('📱 الهاتف:') }
    if (s.step === 'c_phone') { s.data.phone = text; s.step = 'c_addr'; return ctx.reply('📍 العنوان:') }
    if (s.step === 'c_addr') {
      s.data.address = text; s.step = 'c_gov'
      const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
      return ctx.reply('🏛️ المحافظة:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'c_gov') { if (!GOVS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.governorate = text; s.step = 'c_spec'
      const rows = []; for (let i = 0; i < SPECS.length; i += 3) rows.push(SPECS.slice(i, i + 3))
      return ctx.reply('🩺 التخصص:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'c_spec') { if (!SPECS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.specialty = text; s.step = 'c_fee'; return ctx.reply('💰 الكشفية (0 = مجاني):', { reply_markup: { remove_keyboard: true } })
    }
    if (s.step === 'c_fee') {
      const fee = Number(text); if (isNaN(fee) || fee < 0) return ctx.reply('❌ رقم فقط')
      s.data.consultation_fee = fee; s.step = 'c_plan'
      return ctx.reply('📊 الباقة:', { reply_markup: { inline_keyboard: [[{ text: '🟢 أساسية', callback_data: 'bp:basic' }], [{ text: '🔵 متقدمة', callback_data: 'bp:premium' }], [{ text: '🟣 مؤسسات', callback_data: 'bp:enterprise' }]] } })
    }

    // ── EDIT CLINIC ──
    if (s.step === 'edit_val') {
      const { cid, field } = s.data
      const update = {}; update[field] = field === 'consultation_fee' ? Number(text) || 0 : text
      await updateDoc(doc(db, 'clinics', cid), update)
      clearS(ctx.chat.id)
      return ctx.reply(`✅ تم التحديث`, { reply_markup: new InlineKeyboard().text('◀️', `c:show:${cid}`) })
    }

    // ── SEARCH ──
    if (s.step === 'search') {
      const q = text.toLowerCase()
      const snap = await getDocs(collection(db, 'clinics'))
      const res = snap.docs.filter(d => { const c = d.data(); return (c.name || '').toLowerCase().includes(q) || (c.ownerName || '').toLowerCase().includes(q) || (c.specialty || '').toLowerCase().includes(q) }).slice(0, 5)
      clearS(ctx.chat.id)
      if (!res.length) return ctx.reply(`🔍 لا نتائج لـ "${text}"`, { reply_markup: menuBtn() })
      let msg = `🔍 "<b>${text}</b>" — ${res.length}\n${DIV}\n\n`
      const kb = new InlineKeyboard()
      res.forEach((d, i) => { const c = d.data(); msg += `${c.status === 'active' ? '🟢' : '🔴'} ${c.name}\n`; kb.text(c.name, `c:show:${d.id}`).row() })
      kb.text('◀️', 'back')
      return ctx.reply(msg, { parse_mode: 'HTML', reply_markup: kb })
    }

    // ── ADD FOUNDER ──
    if (ok(ctx) && s.step === 'f_name') { s.data.name = text; s.step = 'f_user'; return ctx.reply('📱 يوزرنيم (بدون @):') }
    if (ok(ctx) && s.step === 'f_user') { s.data.username = text.replace('@', ''); s.step = 'f_tgid'; return ctx.reply('🆔 المعرّف (/myid):') }
    if (ok(ctx) && s.step === 'f_tgid') {
      const tgId = Number(text); if (isNaN(tgId)) return ctx.reply('❌ رقم فقط')
      await addDoc(collection(db, 'bot_founders'), { name: s.data.name, username: s.data.username, telegram_id: tgId, created_by: ctx.from.id, created_at: new Date().toISOString() })
      founderCache.delete(tgId)
      clearS(ctx.chat.id)
      await ctx.reply(`✅ تمت إضافة ${s.data.name}!`, { reply_markup: mainKb('admin') })
      try { await bot.api.sendMessage(tgId, `🎉 مرحباً <b>${s.data.name}</b>!\nتم إنشاء حسابك.\n🔗 <code>asaasedu.com/login</code>\n\n/start`, { parse_mode: 'HTML' }) } catch {}
      return
    }
  } catch (e) {
    console.error('[MSG]', e.message)
    try { await ctx.reply('❌ خطأ') } catch {}
  }
})

// ═══════════════════════════════════════
// FACILITY TYPE SELECTION (Wizard)
// ═══════════════════════════════════════
bot.callbackQuery(/^dpt:([^:]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const type = ctx.match[1]
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_type') return
  s.data.facility_type = type
  s.step = 'dp_photo'
  await edit(ctx, `✅ النوع: <b>${FACILITY_TYPES[type]}</b>\n\n📸 ارسل صورة المنشأة أو اضغط التخطي:`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('⏭️ تخطي', 'dp:skipphoto').row().text('❌ إلغاء', 'back') })
})

bot.callbackQuery(/^dp:sub:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_subtype') return
  const subType = ctx.match[1]
  s.data.subtype = subType === 'أخرى' ? '' : subType
  s.data.specialty = s.data.subtype || s.data.facility_type
  s.step = 'dp_gov'
  const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
  await edit(ctx, `✅ ${subType}\n\n🏛️ اختر المحافظة:`, { parse_mode: 'HTML' })
  await ctx.reply('🏛️ اختر المحافظة:', { reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
})

// ═══════════════════════════════════════
// 24H SELECTION (Wizard)
// ═══════════════════════════════════════
bot.callbackQuery(/^dp24h:(yes|no)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_24h') return
  const is24h = ctx.match[1] === 'yes'
  s.data.is_24h = is24h

  if (is24h) {
    s.data.weekly_schedule = buildWeeklySchedule(SCHEDULE_DAYS, '00:00', '23:59')
    await saveDoctorProfile(ctx, s)
  } else {
    s.step = 'dp_days'; s.data.selectedDays = []
    await edit(ctx, `📅 <b>13/13</b> اختر ايام الدوام:\n${DIV}\n\nاضغط على كل يوم لتفعيله أو تعطيله:`, { reply_markup: renderDaysKb([]) })
  }
})

// ═══════════════════════════════════════
// SAVE DOCTOR PROFILE
// ═══════════════════════════════════════
async function saveDoctorProfile(ctx, s) {
  try {
    const d = s.data
    const payload = {
      doctor_name: d.doctor_name || '',
      specialty: d.specialty || '',
      facility_type: d.facility_type || 'doctor',
      governorate: d.governorate || '',
      area: d.area || '',
      clinic_address: d.clinic_address || '',
      phone1: d.phone1 || '',
      phone2: '',
      whatsapp: d.whatsapp || '',
      map_url: d.map_url || '',
      doctor_bio: d.doctor_bio || '',
      photoUrl: d.photoUrl || '',
      consultation_fee: 0,
      is_public: true,
      is_directory_listing: true,
      is_24h: d.is_24h || false,
      weekly_schedule: d.weekly_schedule || buildWeeklySchedule([], '', ''),
      verified: false,
      is_top_rated: false,
      rating_avg: 0,
      rating_count: 0,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (d.facility_type === 'pharmacy') payload.is_pharmacy = true
    if (d.facility_type === 'hospital') payload.is_hospital = true
    if (d.facility_type === 'lab') payload.is_lab = true
    if (d.facility_type === 'physio') payload.is_physio = true

    const newRef = doc(collection(db, 'doctor_profiles'))
    payload.clinicId = newRef.id
    await setDoc(newRef, payload)

    clearS(ctx.chat.id)
    const ft = FACILITY_TYPES[d.facility_type] || '🩺'
    const loc = [d.governorate, d.area].filter(Boolean).join(' - ') || '-'
    const sched = d.is_24h ? 'يعمل 24 ساعة' : (d.selectedDays?.length ? `${d.selectedDays.length} أيام` : '-')

    await ctx.reply(
      `✅ <b>تمت الإضافة بنجاح!</b>\n${DIV2}\n\n` +
      `${ft} <b>${d.doctor_name}</b>\n` +
      `🩺 ${d.specialty || '-'}\n` +
      `🏛️ ${loc}\n` +
      `📱 ${d.phone1 || '-'}\n` +
      `⏰ ${sched}\n\n` +
      `🔗 عرض في الدليل:\n<code>asaasedu.com/doctor/${newRef.id}</code>`,
      { parse_mode: 'HTML', reply_markup: mainKb(store[ctx.chat.id]?.role || 'admin') }
    )
  } catch (e) {
    console.error('saveDoctorProfile:', e.message)
    clearS(ctx.chat.id)
    await ctx.reply('❌ خطأ في الحفظ', { reply_markup: menuBtn() })
  }
}

// ═══════════════════════════════════════
// PLAN SELECTION
// ═══════════════════════════════════════
bot.callbackQuery(/^bp:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 })
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const plan = ctx.match[1]
  const s = getS(ctx.chat.id)
  if (s.step !== 'c_plan') return ctx.reply('⚠️ ابدأ بإنشاء عيادة')
  const d = s.data
  const email = rndEmail(d.name)
  const password = rndPass()
  await ctx.reply(`⏳ جاري الإنشاء...`, { parse_mode: 'HTML' })
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, password)
    const uid = cred.user.uid
    await setDoc(doc(db, 'users', uid), { fullName: d.ownerName, email, phone: d.phone, role: 'owner', clinicId: '', photoUrl: '', createdAt: new Date().toISOString() })
    const clinicRef = await addDoc(collection(db, 'clinics'), { name: d.name, ownerName: d.ownerName, ownerUid: uid, email, phone: d.phone, address: d.address, governorate: d.governorate, specialty: d.specialty, plan, consultation_fee: d.consultation_fee || 0, photoUrl: '', status: 'active', patientsCount: 0, createdAt: new Date().toISOString() })
    await setDoc(doc(db, 'users', uid), { clinicId: clinicRef.id }, { merge: true })
    clearS(ctx.chat.id)
    await ctx.reply(
      `✅ <b>تم الإنشاء!</b>\n\n🏥 ${d.name}\n👤 ${d.ownerName}\n\n🔑 <code>${email}</code>\n🔒 <code>${password}</code>\n\n🔗 <code>asaasedu.com/login</code>`,
      { parse_mode: 'HTML', reply_markup: mainKb(store[ctx.chat.id]?.role || 'admin') }
    )
  } catch (err) {
    clearS(ctx.chat.id)
    await ctx.reply(`❌ ${err.message || 'خطأ'}`, { reply_markup: mainKb(store[ctx.chat.id]?.role || 'admin') })
  }
})

bot.catch(e => console.error('[CATCH]', e.message))

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.RENDER_EXTERNAL_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.APP_URL || process.env.WEBHOOK_URL || ''
const app = express()
app.use(express.json())

app.get('/', (_, res) => res.send('🤖 Madar Bot is running'))
app.get('/health', (_, res) => res.json({ ok: true }))

console.log('🤖 Madar Bot starting...')
try {
  setupFirebaseAuth().catch(e => console.error('⚠️ Firebase Auth setup failed:', e.message))

  const webhookPath = '/webhook'
  app.post(webhookPath, (req, res) => {
    webhookCallback(bot, 'express')(req, res).catch(e => {
      console.error('⚠️ Webhook error:', e.message)
      if (!res.headersSent) res.status(500).send('OK')
    })
  })

  app.listen(PORT, '0.0.0.0', () => console.log(`🌐 Server listening on port ${PORT}`))

  if (BASE_URL) {
    await bot.api.setWebhook(`${BASE_URL}${webhookPath}`)
    console.log(`✅ Webhook set: ${BASE_URL}${webhookPath}`)
  } else {
    console.log('No webhook URL — waiting for manual webhook or starting polling...')
  }
} catch (e) { console.error('❌', e.message); process.exit(1) }
