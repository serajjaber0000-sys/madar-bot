import 'dotenv/config'
import express from 'express'
import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, increment } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

process.on('unhandledRejection', (reason) => console.error('[CRASH] Unhandled rejection:', reason))
process.on('uncaughtException', (err) => { console.error('[CRASH] Uncaught exception:', err.message); })

function withTimeout(promise, ms = 8000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))])
}

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

const BOT_EMAIL = process.env.BOT_EMAIL || 'bot@madar-admin.io'
const BOT_PASS = process.env.BOT_PASS || 'MadarBot2026!Secure'
const ADMIN_ID = Number(process.env.SUPER_ADMIN_TELEGRAM_ID)

const bot = new Bot(process.env.BOT_TOKEN)
const store = {}
const founderCache = new Map()
const dirCache = { data: null, time: 0, ttl: 60000 }
const clinicCache = { data: null, time: 0, ttl: 60000 }
const profileCache = { data: null, time: 0, ttl: 60000 }

function getCache(cache) {
  if (cache.data && Date.now() - cache.time < cache.ttl) return cache.data
  return null
}
function setCache(cache, data) {
  cache.data = data; cache.time = Date.now()
}

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
    const fs = await withTimeout(getDocs(query(collection(db, 'bot_founders'), where('telegram_id', '==', tgId))), 10000)
    if (!fs.empty) {
      const fid = fs.docs[0].id
      founderCache.set(tgId, { fid })
      store[cid] = store[cid] || {}; store[cid].role = 'founder'; store[cid].founderId = fid
      return 'founder'
    }
  } catch (e) { console.error('getRole query failed:', e.message) }
  store[cid] = store[cid] || {}; store[cid].role = 'guest'; return 'guest'
}

function founderOrAdmin(ctx) { const r = store[ctx.chat.id]?.role; return r === 'admin' || r === 'founder' }

const SPECS = ['طب عام', 'أسنان', 'باطنية', 'قلب', 'عظام', 'أطفال', 'جلدية', 'نساء وتوليد', 'عيون', 'أنف وأذن', 'مسالك بولية', 'عصبية', 'جراحة عامة', 'علاج طبيعي', 'أنسجة وعظم', 'ليزر وتجميل', 'جلسات تجميل', 'جلدية وتجميل', 'تمريض', 'رعاية تمريضية', 'أخرى']
const GOVS = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']
const PLANS = { basic: 'الأساسية', premium: 'المتقدمة', enterprise: 'المؤسسات' }
const FACILITY_TYPES = { doctor: '🩺 طبيب', specialized: '🏛️ عيادة تخصصية', laser: '✨ ليزر وتجميل', pharmacy: '💊 صيدلية', hospital: '🏥 مستشفى', lab: '🔬 مختبر', physio: '🦴 علاج طبيعي', nursing: '💉 عيادة تمريضية' }
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
  const imgbbKey = process.env.IMGBB_API_KEY || 'd59971458b9412d2647906a3b0d22753'
  const boundary = '----FormBoundary' + Date.now()
  const fileName = `photo_${Date.now()}.jpg`
  const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`)
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`)
  const body = Buffer.concat([header, buf, footer])
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  })
  const data = await res.json()
  if (data.success) {
    console.log('✅ imgBB upload OK:', data.data.url)
    return data.data.url
  }
  console.error('❌ imgBB error:', JSON.stringify(data).substring(0, 200))
  return null
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
  try {
    let botUid = null
    try {
      const cred = await withTimeout(signInWithEmailAndPassword(mainAuth, BOT_EMAIL, BOT_PASS), 10000)
      botUid = cred.user.uid
    } catch (e) {
      if (['auth/user-not-found', 'auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(e.code)) {
        const cred = await withTimeout(createUserWithEmailAndPassword(secAuth, BOT_EMAIL, BOT_PASS), 10000)
        botUid = cred.user.uid
        await withTimeout(signInWithEmailAndPassword(mainAuth, BOT_EMAIL, BOT_PASS), 10000)
      } else throw e
    }
    const userSnap = await withTimeout(getDoc(doc(db, 'users', botUid)), 10000)
    if (!userSnap.exists()) {
      await withTimeout(setDoc(doc(db, 'users', botUid), { fullName: 'بوت مدار', email: BOT_EMAIL, role: 'super_admin', clinicId: '', phone: '', photoUrl: '', createdAt: new Date().toISOString() }), 10000)
    } else if (userSnap.data().role !== 'super_admin') {
      await withTimeout(updateDoc(doc(db, 'users', botUid), { role: 'super_admin' }), 10000)
    }
    console.log('✅ Firebase Auth setup OK')
  } catch (e) {
    console.error('⚠️ Firebase Auth setup failed:', e.message)
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
    const snap = await getDocs(collection(db, 'directory_listings'))
    let fixed = 0
    for (const d of snap.docs) {
      const p = d.data()
      const updates = {}
      if (!p.facility_type) updates.facility_type = 'doctor'
      if (p.is_24h === undefined) updates.is_24h = false
      if (p.view_count === undefined) updates.view_count = 0
      if (p.rating_avg === undefined) updates.rating_avg = 0
      if (p.rating_count === undefined) updates.rating_count = 0
      if (p.enabled === undefined) updates.enabled = true
      if (p.phone1) updates.phone = p.phone1
      if (p.clinic_address && !p.address) updates.address = p.clinic_address
      if (p.website === undefined) updates.website = ''
      if (p.clinic_open_time === undefined) updates.clinic_open_time = ''
      if (p.clinic_close_time === undefined) updates.clinic_close_time = ''
      updates.updated_at = new Date().toISOString()
      if (Object.keys(updates).length > 1) {
        await updateDoc(doc(db, 'directory_listings', d.id), updates)
        fixed++
      }
    }
    await ctx.reply(`✅ تمت المزامنة!\n\n🔧 تم تحديث: ${fixed} سجل\n📊 الإجمالي: ${snap.docs.length}`)
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
      snap = await withTimeout(getDocs(query(collection(db, 'clinics'), where('ownerUid', '==', store[ctx.chat.id].founderId), orderBy('createdAt', 'desc'))), 15000)
    } else {
      snap = await withTimeout(getDocs(query(collection(db, 'clinics'), orderBy('createdAt', 'desc'))), 15000)
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
    if (store[ctx.chat.id]?.role === 'founder' && snap.data().ownerUid !== store[ctx.chat.id].founderId) {
      return ctx.reply('⛔ هذه العيادة ليست لك.', { reply_markup: menuBtn() })
    }
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
  if (store[ctx.chat.id]?.role === 'founder') {
    try {
      const snap = await getDoc(doc(db, 'clinics', ctx.match[1]))
      if (snap.exists() && snap.data().ownerUid !== store[ctx.chat.id].founderId) {
        return ctx.reply('⛔ هذه العيادة ليست لك.', { reply_markup: menuBtn() })
      }
    } catch {}
  }
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
  if (store[ctx.chat.id]?.role === 'founder') {
    try {
      const snap = await getDoc(doc(db, 'clinics', id))
      if (snap.exists() && snap.data().ownerUid !== store[ctx.chat.id].founderId) {
        return ctx.reply('⛔ هذه العيادة ليست لك.', { reply_markup: menuBtn() })
      }
    } catch {}
  }
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
      withTimeout(getDocs(collection(db, 'bot_founders')), 15000),
      withTimeout(getDocs(collection(db, 'clinics')), 15000),
      withTimeout(getDocs(collection(db, 'patients')), 15000),
      withTimeout(getDocs(collection(db, 'directory_listings')), 15000)
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
// DIRECTORY LISTINGS (الدليل) — directory_listings
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════

bot.callbackQuery('dp:skipphoto', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_photo') return
  s.data.photoUrl = ''
  s.step = 'dp_name'
  await edit(ctx, `✅ تم التخطي\n\n<b>2/14:</b> ✏️ اسم الطبيب أو المنشأة:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
})

bot.callbackQuery('dp:list', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const role = store[ctx.chat.id]?.role
    if (role === 'founder') {
      const founderId = store[ctx.chat.id]?.founderId
      const snap = await withTimeout(getDocs(query(collection(db, 'directory_listings'), where('created_by', '==', founderId))), 15000)
      const kb = new InlineKeyboard()
      const msgLines = [`<b>🩺 دليلي</b> — ${snap.size}\n${DIV}\n`]
      if (snap.empty) {
        msgLines.push('📭 لا يوجد منشآت بعد')
      } else {
        snap.docs.forEach((d, i) => {
          const p = d.data()
          const ft = FACILITY_TYPES[p.facility_type] || '🩺'
          const vis = p.enabled !== false ? '🟢' : '🔴'
          msgLines.push(`${vis} <b>${i + 1}.</b> ${ft} ${p.doctor_name || '-'} — ${p.specialty || '-'}`)
          kb.text(`${vis} ${p.doctor_name || '-'}`, `dp:show:${d.id}`).row()
        })
      }
      kb.text('➕ إضافة منشأة', 'dp:new').row().text('◀️ رجوع', 'back')
      await edit(ctx, msgLines.join('\n'), { reply_markup: kb })
    } else {
      let dirSnap = getCache(dirCache)
      let clinicSnap = getCache(clinicCache)
      let profileSnap = getCache(profileCache)
      if (!dirSnap || !clinicSnap || !profileSnap) {
        const results = await Promise.all([
          dirSnap ? Promise.resolve(dirSnap) : withTimeout(getDocs(collection(db, 'directory_listings')), 8000),
          clinicSnap ? Promise.resolve(clinicSnap) : withTimeout(getDocs(collection(db, 'clinics')), 8000),
          profileSnap ? Promise.resolve(profileSnap) : withTimeout(getDocs(collection(db, 'doctor_profiles')), 8000)
        ])
        dirSnap = results[0]; clinicSnap = results[1]; profileSnap = results[2]
        setCache(dirCache, dirSnap); setCache(clinicCache, clinicSnap); setCache(profileCache, profileSnap)
      }
      const profileDocs = profileSnap.docs.filter(d => d.data().is_public === true)
      const allDocs = [
        ...profileDocs.map(d => ({ _type: 'profile', id: d.id, data: () => d.data() })),
        ...clinicSnap.docs.filter(d => d.data().status === 'active').map(d => ({ _type: 'clinic', id: d.id, data: () => d.data() })),
        ...dirSnap.docs.map(d => ({ _type: 'listing', id: d.id, data: () => d.data() }))
      ]
      const counts = { all: allDocs.length, doctor: 0, specialized: 0, laser: 0, pharmacy: 0, hospital: 0, lab: 0, physio: 0, nursing: 0 }
      allDocs.forEach(d => {
        const p = d.data()
        let ft = 'doctor'
        if (d._type === 'listing') ft = p.facility_type || 'doctor'
        counts[ft] = (counts[ft] || 0) + 1
      })
      const kb = new InlineKeyboard()
        .text(`📋 الكل (${counts.all})`, 'dp:cat:all').row()
        .text(`🩺 أطباء (${counts.doctor})`, 'dp:cat:doctor')
        .text(`🏛️ عيادات تخصصية (${counts.specialized})`, 'dp:cat:specialized').row()
        .text(`✨ ليزر وتجميل (${counts.laser})`, 'dp:cat:laser')
        .text(`💊 صيدليات (${counts.pharmacy})`, 'dp:cat:pharmacy').row()
        .text(`🏥 مستشفيات (${counts.hospital})`, 'dp:cat:hospital')
        .text(`🔬 مختبرات (${counts.lab})`, 'dp:cat:lab').row()
        .text(`🦴 علاج طبيعي (${counts.physio})`, 'dp:cat:physio')
        .text(`💉 عيادات تمريضية (${counts.nursing})`, 'dp:cat:nursing').row()
        .text('➕ إضافة منشأة', 'dp:new').row()
        .text('◀️ رجوع', 'back')
      await edit(ctx, `<b>🩺 الدليل</b> — ${counts.all} منشأة\n${DIV}\n\n⭐ العيادات المشتركة أولاً\nاختر القسم 👇`, { reply_markup: kb })
    }
  } catch (e) { console.error('dp:list:', e.message); await ctx.reply(`❌ خطأ: ${e.message}`).catch(() => {}) }
})

function buildCategoryList(docs, filter, clinicDocs = [], profileDocs = []) {
  const CAT_LABELS = { all: 'الكل', doctor: '🩺 أطباء', specialized: '🏛️ عيادات تخصصية', laser: '✨ ليزر وتجميل', pharmacy: '💊 صيدليات', hospital: '🏥 مستشفيات', lab: '🔬 مختبرات', physio: '🦴 علاج طبيعي', nursing: '💉 عيادات تمريضية' }

  const items = []

  profileDocs.forEach(d => {
    const p = d.data()
    const ft = p.facility_type || 'doctor'
    if (filter !== 'all' && ft !== filter) return
    items.push({ type: 'profile', id: d.id, name: 'د. ' + (p.doctor_name || '-'), specialty: p.specialty || '-', ft, is24h: p.is_24h, plan: 'مشترك' })
  })

  clinicDocs.forEach(d => {
    const c = d.data()
    if (c.status !== 'active') return
    const ft = 'doctor'
    if (filter !== 'all' && ft !== filter) return
    items.push({ type: 'clinic', id: d.id, name: c.name, specialty: c.specialty || '-', ft, status: c.status, plan: c.plan })
  })

  docs.forEach(d => {
    const p = d.data()
    const ft = p.facility_type || 'doctor'
    if (filter !== 'all' && ft !== filter) return
    items.push({ type: 'listing', id: d.id, name: p.doctor_name || '-', specialty: p.specialty || '-', ft, enabled: p.enabled, is24h: p.is_24h })
  })

  const label = CAT_LABELS[filter] || 'الكل'
  const msgLines = [`<b>${label}</b> — ${items.length}\n${DIV}\n`]
  const kb = new InlineKeyboard()
  if (!items.length) {
    msgLines.push('📭 لا يوجد عناصر')
  } else {
    items.forEach((item, i) => {
      const icon = FACILITY_TYPES[item.ft] || '🩺'
      if (item.type === 'profile') {
        const h24 = item.is24h ? '⏰' : ''
        msgLines.push(`⭐ <b>${i + 1}.</b> ${icon} ${item.name} — ${item.specialty} مشترك ${h24}`)
        kb.text(`⭐ ${item.name}`, `dp:showprof:${item.id}`).row()
      } else if (item.type === 'clinic') {
        const planBadge = item.plan === 'enterprise' ? '🟣' : item.plan === 'premium' ? '🔵' : '🟢'
        msgLines.push(`⭐ <b>${i + 1}.</b> ${icon} ${item.name} — ${item.specialty} ${planBadge}`)
        kb.text(`⭐ ${item.name}`, `c:show:${item.id}`).row()
      } else {
        const vis = item.enabled !== false ? '🟢' : '🔴'
        const h24 = item.is24h ? '⏰' : ''
        msgLines.push(`${vis} <b>${i + 1}.</b> ${icon} ${item.name} — ${item.specialty} ${h24}`)
        kb.text(`${vis} ${item.name}`, `dp:show:${item.id}`).row()
      }
    })
  }
  const catBtns = [
    [{ text: `📋 الكل`, data: 'dp:cat:all' }, { text: `🩺 أطباء`, data: 'dp:cat:doctor' }],
    [{ text: `🏛️ عيادات تخصصية`, data: 'dp:cat:specialized' }, { text: `✨ ليزر وتجميل`, data: 'dp:cat:laser' }],
    [{ text: `💊 صيدليات`, data: 'dp:cat:pharmacy' }, { text: `🏥 مستشفيات`, data: 'dp:cat:hospital' }],
    [{ text: `🔬 مختبرات`, data: 'dp:cat:lab' }, { text: `🦴 علاج طبيعي`, data: 'dp:cat:physio' }],
    [{ text: `💉 عيادات تمريضية`, data: 'dp:cat:nursing' }]
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
    const role = store[ctx.chat.id]?.role
    if (role === 'founder') {
      const founderId = store[ctx.chat.id]?.founderId
      const snap = await withTimeout(getDocs(query(collection(db, 'directory_listings'), where('created_by', '==', founderId))), 15000)
      const items = snap.docs.map(d => {
        const p = d.data()
        return { type: 'listing', id: d.id, name: p.doctor_name || '-', specialty: p.specialty || '-', ft: p.facility_type || 'doctor', enabled: p.enabled, is24h: p.is_24h }
      }).filter(item => filter === 'all' || item.ft === filter)
      const CAT_LABELS = { all: 'الكل', doctor: '🩺 أطبائي', specialized: '🏛️ عياداتي التخصصية', laser: '✨ الليزر والتجميل', pharmacy: '💊 صيدلياتي', hospital: '🏥 مستشفياتي', lab: '🔬 مختبراتي', physio: '🦴 علاجي الطبيعي', nursing: '💉 عياداتي التمريضية' }
      const label = CAT_LABELS[filter] || 'الكل'
      const msgLines = [`<b>${label}</b> — ${items.length}\n${DIV}\n`]
      const kb = new InlineKeyboard()
      if (!items.length) {
        msgLines.push('📭 لا يوجد عناصر')
      } else {
        items.forEach((item, i) => {
          const icon = FACILITY_TYPES[item.ft] || '🩺'
          const vis = item.enabled !== false ? '🟢' : '🔴'
          const h24 = item.is24h ? '⏰' : ''
          msgLines.push(`${vis} <b>${i + 1}.</b> ${icon} ${item.name} — ${item.specialty} ${h24}`)
          kb.text(`${vis} ${item.name}`, `dp:show:${item.id}`).row()
        })
      }
      kb.text('➕ إضافة منشأة', 'dp:new').row().text('◀️ رجوع', 'dp:list')
      await edit(ctx, msgLines.join('\n'), { reply_markup: kb })
    } else {
      let dirSnap = getCache(dirCache)
      let clinicSnap = getCache(clinicCache)
      let profileSnap = getCache(profileCache)
      if (!dirSnap || !clinicSnap || !profileSnap) {
        const results = await Promise.all([
          dirSnap ? Promise.resolve(dirSnap) : withTimeout(getDocs(collection(db, 'directory_listings')), 8000),
          clinicSnap ? Promise.resolve(clinicSnap) : withTimeout(getDocs(collection(db, 'clinics')), 8000),
          profileSnap ? Promise.resolve(profileSnap) : withTimeout(getDocs(collection(db, 'doctor_profiles')), 8000)
        ])
        dirSnap = results[0]; clinicSnap = results[1]; profileSnap = results[2]
        setCache(dirCache, dirSnap); setCache(clinicCache, clinicSnap); setCache(profileCache, profileSnap)
      }
      const profileDocs = profileSnap.docs.filter(d => d.data().is_public === true)
      const { text, kb } = buildCategoryList(dirSnap.docs, filter, clinicSnap.docs, profileDocs)
      await edit(ctx, text, { reply_markup: kb })
    }
  } catch (e) { console.error('dp:cat:', e.message); await ctx.reply(`❌ خطأ: ${e.message}`).catch(() => {}) }
})

bot.callbackQuery(/^dp:show:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
    if (!snap.exists()) return ctx.reply('❌ غير موجود.')
    const p = snap.data()
    if (store[ctx.chat.id]?.role === 'founder' && p.created_by && p.created_by !== store[ctx.chat.id].founderId) {
      return ctx.reply('⛔ هذه المنشأة ليست لك.', { reply_markup: menuBtn() })
    }
    const vis = p.enabled !== false ? '🟢 ظاهر' : '🔴 مخفي'
    const ft = FACILITY_TYPES[p.facility_type] || '🩺'
    const h24 = p.is_24h ? '⏰ 24 ساعة' : '🕐 ساعات محددة'
    let scheduleText = ''
    if (p.is_24h) {
      scheduleText = 'يعمل 24/7'
    } else if (p.clinic_open_time && p.clinic_close_time) {
      scheduleText = `${p.clinic_open_time} - ${p.clinic_close_time}`
    } else {
      scheduleText = 'غير محدد'
    }
    const namePrefix = p.facility_type === 'doctor' ? 'د. ' : ''
    let doctorsBlock = ''
    if (p.doctors_list && p.doctors_list.length) {
      doctorsBlock = '\n👥 <b>الأطباء:</b>\n' + p.doctors_list.map((doc, i) => `   ${i + 1}. ${doc.name}${doc.specialty ? ` (${doc.specialty})` : ''}`).join('\n') + '\n\n'
    }
    const msg =
      `<b>${ft} ${namePrefix}${p.doctor_name || '-'}</b>\n${DIV2}\n\n` +
      `🩺 <b>التخصص:</b> ${p.specialty || '-'}\n` +
      `${doctorsBlock}` +
      `🏛️ <b>المحافظة:</b> ${p.governorate || '-'} — ${p.area || '-'}\n` +
      `📍 <b>العنوان:</b> ${p.address || '-'}\n\n` +
      `📱 <b>الهاتف:</b> ${p.phone || '-'}\n` +
      `💬 <b>واتساب:</b> ${p.whatsapp || '-'}\n` +
      `🌐 <b>الموقع:</b> ${p.website || '-'}\n` +
      `🔗 <b>الخريطة:</b> ${p.map_url || '-'}\n\n` +
      `📝 <b>النبذة:</b> ${(p.doctor_bio || '-').substring(0, 120)}${(p.doctor_bio || '').length > 120 ? '...' : ''}\n\n` +
      `${h24}\n📅 <b>الدوام:</b> ${scheduleText}\n\n` +
      `👁 ${p.view_count || 0} مشاهدة  •  ⭐ ${p.rating_avg || 0} (${p.rating_count || 0})\n` +
      `📌 ${vis}`
    const kb = new InlineKeyboard()
      .text('✏️ تعديل', `dp:edit:${ctx.match[1]}`).row()
      .text(p.enabled !== false ? '🔴 إخفاء' : '🟢 إظهار', `dp:tg:${ctx.match[1]}`).row()
      .text(p.is_24h ? '🕐 تغيير لساعات' : '⏰ جعل 24 ساعة', `dp:set24:${ctx.match[1]}`).row()
      .text('🗑️ حذف', `dp:rm:${ctx.match[1]}`).row()
      .text('◀️ الدليل', 'dp:list').text('🏠', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error('dp:show:', e.message) }
})

bot.callbackQuery(/^dp:showprof:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDoc(doc(db, 'doctor_profiles', ctx.match[1]))
    if (!snap.exists()) return ctx.reply('❌ غير موجود.')
    const p = snap.data()
    const h24 = p.is_24h ? '⏰ 24 ساعة' : '🕐 ساعات محددة'
    let scheduleText = ''
    if (p.is_24h) {
      scheduleText = 'يعمل 24/7'
    } else if (p.clinic_open_time && p.clinic_close_time) {
      scheduleText = `${p.clinic_open_time} - ${p.clinic_close_time}`
    } else if (p.weekly_schedule && p.weekly_schedule.length) {
      const enabled = p.weekly_schedule.filter(d => d.enabled)
      if (enabled.length) scheduleText = enabled.map(d => `${d.name} ${d.from || ''}-${d.to || ''}`).join('\n')
      else scheduleText = 'غير محدد'
    } else {
      scheduleText = 'غير محدد'
    }
    const phone = p.phone || p.phone1 || '-'
    const address = p.address || p.clinic_address || '-'
    const msg =
      `⭐ <b>عيادة مشتركة</b>\n\n` +
      `<b>د. ${p.doctor_name || '-'}</b>\n${DIV2}\n\n` +
      `🩺 <b>التخصص:</b> ${p.specialty || '-'}\n` +
      `🏛️ <b>المحافظة:</b> ${p.governorate || '-'} — ${p.area || '-'}\n` +
      `📍 <b>العنوان:</b> ${address}\n\n` +
      `📱 <b>الهاتف:</b> ${phone}\n` +
      `💬 <b>واتساب:</b> ${p.whatsapp || '-'}\n` +
      `🔗 <b>الخريطة:</b> ${p.map_url || '-'}\n\n` +
      `📝 <b>النبذة:</b> ${(p.doctor_bio || '-').substring(0, 120)}${(p.doctor_bio || '').length > 120 ? '...' : ''}\n\n` +
      `${h24}\n📅 <b>الدوام:</b> ${scheduleText}\n\n` +
      `👁 ${p.view_count || 0} مشاهدة  •  ⭐ ${p.rating_avg || 0} (${p.rating_count || 0})\n` +
      `💰 ${p.consultation_fee ? Number(p.consultation_fee).toLocaleString('ar-EG') + ' د.ع' : 'مجاني'}`
    const kb = new InlineKeyboard()
      .text('◀️ الدليل', 'dp:list').text('🏠', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error('dp:showprof:', e.message) }
})

bot.callbackQuery('dp:new', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  const s = getS(ctx.chat.id); s.step = 'dp_type'; s.data = {}
  const kb = new InlineKeyboard()
  for (const [key, label] of Object.entries(FACILITY_TYPES)) { kb.text(label, `dpt:${key}`).row() }
  kb.text('❌ إلغاء', 'back')
  await edit(ctx, `🩺 <b>إضافة منشأة للدليل</b>\n${DIV}\n\n<b>1/14</b> نوع المنشأة:`, { parse_mode: 'HTML', reply_markup: kb })
})

bot.callbackQuery(/^dp:edit:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const id = ctx.match[1]
  if (store[ctx.chat.id]?.role === 'founder') {
    try {
      const snap = await getDoc(doc(db, 'directory_listings', id))
      if (snap.exists() && snap.data().created_by && snap.data().created_by !== store[ctx.chat.id].founderId) {
        return ctx.reply('⛔ هذه المنشأة ليست لك.', { reply_markup: menuBtn() })
      }
    } catch {}
  }
  const kb = new InlineKeyboard()
    .text('📸 الصورة', `dp:set:photo:${id}`).text('✏️ الاسم', `dp:set:doctor_name:${id}`).row()
    .text('🩺 التخصص', `dp:set:specialty:${id}`).text('🏢 النوع', `dp:set:facility_type:${id}`).row()
    .text('🏛️ المحافظة', `dp:set:governorate:${id}`).text('📍 المنطقة', `dp:set:area:${id}`).row()
    .text('🏠 العنوان', `dp:set:address:${id}`).text('📱 الهاتف', `dp:set:phone:${id}`).row()
    .text('💬 واتساب', `dp:set:whatsapp:${id}`).text('🌐 الموقع', `dp:set:website:${id}`).row()
    .text('🔗 الخريطة', `dp:set:map_url:${id}`).text('📝 النبذة', `dp:set:doctor_bio:${id}`).row()
    .text('⏰ دوام 24 ساعة', `dp:set24:${id}`).text('◀️ الرجوع', `dp:show:${id}`)
  await edit(ctx, `<b>✏️ تعديل المنشأة</b>\n${DIV}\n\nاختر ما تريد تعديله 👇`, { reply_markup: kb })
})

const DP_TEXT_FIELDS = { doctor_name: '✏️ الاسم الجديد', specialty: '🩺 التخصص الجديد', governorate: '🏛️ المحافظة الجديدة', area: '📍 المنطقة الجديدة', phone: '📱 رقم الهاتف الجديد', whatsapp: '💬 رقم الواتساب الجديد', website: '🌐 الموقع الإلكتروني الجديد', address: '🏠 العنوان الجديد', map_url: '🔗 رابط الخريطة الجديد', doctor_bio: '📝 النبذة الجديدة' }

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
    const docSnap = await getDoc(doc(db, 'directory_listings', id))
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
  const update = { facility_type: type }
  try {
    await updateDoc(doc(db, 'directory_listings', id), update)
    await edit(ctx, `✅ النوع: <b>${FACILITY_TYPES[type]}</b>`, { reply_markup: new InlineKeyboard().text('◀️ رجوع', `dp:edit:${id}`) })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dp:tg:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try {
    const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
    if (!snap.exists()) return
    const cur = snap.data().enabled !== false
    await updateDoc(doc(db, 'directory_listings', ctx.match[1]), { enabled: !cur })
    await edit(ctx, `✅ ${snap.data().doctor_name}: <b>${!cur ? '🟢 ظاهر' : '🔴 مخفي'}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `dp:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dp:set24:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  try {
    const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
    if (!snap.exists()) return
    const cur = snap.data().is_24h || false
    const new24h = !cur
    const update = { is_24h: new24h }
    if (new24h) {
      update.clinic_open_time = '00:00'
      update.clinic_close_time = '23:59'
    } else {
      update.clinic_open_time = ''
      update.clinic_close_time = ''
    }
    update.updated_at = new Date().toISOString()
    await updateDoc(doc(db, 'directory_listings', ctx.match[1]), update)
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
  s.step = 'dp_schedule'
  s.data = { editId: id }
  await edit(ctx, `⏰ <b>اكتب وقت الدوام:</b>\n${DIV}\n\nمثال: <code>8:00 - 14:00</code>\n\nاكتب من - الى:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', `dp:edit:${id}`) })
})

bot.callbackQuery(/^dpd:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const idx = Number(ctx.match[1])
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_schedule') return
  const days = s.data.selectedDays || []
  const dayName = SCHEDULE_DAYS[idx]
  if (days.includes(dayName)) { s.data.selectedDays = days.filter(d => d !== dayName) }
  else { s.data.selectedDays.push(dayName) }
  const timeFrom = s.data.timeFrom || '08:00'
  const timeTo = s.data.timeTo || '14:00'
  const msg = `📅 <b>اختر أيام الدوام:</b>\n${DIV}\n\n⏰ الوقت: <code>${timeFrom} - ${timeTo}</code>\n\nاكتب الوقت أولاً أو احفظ 👇`
  await edit(ctx, msg, { reply_markup: renderDaysKb(s.data.selectedDays) })
})

bot.callbackQuery('dpd:save', async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) return
  const s = getS(ctx.chat.id)
  if (s.step !== 'dp_schedule') return
  const { selectedDays, editId } = s.data
  if (!selectedDays || !selectedDays.length) return ctx.reply('❌ اختر يوماً واحداً على الأقل')
  const schedule = buildWeeklySchedule(selectedDays, s.data.timeFrom || '08:00', s.data.timeTo || '14:00')
  try {
    await updateDoc(doc(db, 'directory_listings', editId), { weekly_schedule: schedule, updated_at: new Date().toISOString() })
    clearS(ctx.chat.id)
    await ctx.reply(`✅ تم حفظ جدول الدوام\n📅 ${selectedDays.join('، ')}`, { reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:show:${editId}`) })
  } catch (e) { console.error('dpd:save:', e.message); await ctx.reply('❌ خطأ في الحفظ') }
})

bot.callbackQuery(/^dp:rm:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  if (store[ctx.chat.id]?.role === 'founder') {
    try {
      const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
      if (snap.exists() && snap.data().created_by && snap.data().created_by !== store[ctx.chat.id].founderId) {
        return ctx.reply('⛔ هذه المنشأة ليست لك.', { reply_markup: menuBtn() })
      }
    } catch {}
  }
  await edit(ctx, `⚠️ <b>حذف الطبيب من الدليل؟</b>`, {
    reply_markup: new InlineKeyboard().text('✅ نعم، حذف', `dp:rok:${ctx.match[1]}`).text('❌ لا', 'dp:list')
  })
})

bot.callbackQuery(/^dp:rok:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return }
  try { await deleteDoc(doc(db, 'directory_listings', ctx.match[1])); await edit(ctx, `✅ تم الحذف`, { reply_markup: menuBtn() }) } catch {}
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
      await ctx.reply(`✅ تم رفع الصورة${url ? ' 📸' : ' (فشل الرفع)'}\n\n<b>2/14:</b> ✏️ اسم الطبيب أو المنشأة:`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
    } else if (s.step === 'dp_setphoto') {
      const id = s.data.editId
      try {
        await updateDoc(doc(db, 'directory_listings', id), { photoUrl: url || '' })
        await ctx.reply(`✅ تم تحديث الصورة 📸`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:edit:${id}`) })
      } catch (e) { await ctx.reply('❌ خطأ في الحفظ') }
      clearS(ctx.chat.id)
    }
  } catch (e) {
    console.error('Photo upload error:', e.message)
    if (s.step === 'dp_photo') {
      s.data.photoUrl = ''
      s.step = 'dp_name'
      await ctx.reply(`⚠️ فشل رفع الصورة\n\n<b>2/14:</b> ✏️ اسم الطبيب أو المنشأة:`, { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
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
        const subtypes = { pharmacy: ['صيدلية عامة', 'صيدلية مستشفى'], hospital: ['مستشفى حكومي', 'مستشفى خاص', 'عيادة'], lab: ['مختبر حكومي', 'مختبر خاص'], physio: ['مركز علاج طبيعي', 'عيادة علاج طبيعي'], laser: ['مركز ليزر', 'عيادة تجميل', 'مركز تجميل'], specialized: ['مجمع طبي', 'مركز تخصصي', 'عيادة'], nursing: ['تمريض منزلي', 'عيادة تمريضية', 'رعاية تمريضية'] }
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

    // ── MULTI-DOCTOR STEPS (specialized/laser) ──
    if (s.step === 'dp_doc_count') {
      const count = parseInt(text)
      if (isNaN(count) || count < 0 || count > 50) return ctx.reply('❌ أرسل رقم صحيح بين 0 و 50')
      s.data.doctor_count = count
      if (count === 0) {
        s.step = 'dp_gov'
        const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
        return ctx.reply('🏛️ اختر المحافظة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
      }
      s.data.doctors_list = []
      s.data.doctor_idx = 0
      s.step = 'dp_doc_name'
      return ctx.reply(`👨‍⚕️ <b>1/${count}</b> — اسم الطبيب أو المساعد الأول:`, { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }

    if (s.step === 'dp_doc_name') {
      const idx = s.data.doctor_idx || 0
      const total = s.data.doctor_count || 1
      if (!s.data.doctors_list[idx]) s.data.doctors_list[idx] = {}
      s.data.doctors_list[idx].name = text
      s.step = 'dp_doc_spec'
      return ctx.reply(`👨‍⚕️ <b>${idx + 1}/${total}</b> — تخصص ${text}:\n\nاكتب التخصص أو - للتخطي:`, { parse_mode: 'HTML' })
    }

    if (s.step === 'dp_doc_spec') {
      const idx = s.data.doctor_idx || 0
      const total = s.data.doctor_count || 1
      s.data.doctors_list[idx].specialty = text === '-' ? '' : text
      const next = idx + 1
      if (next < total) {
        s.data.doctor_idx = next
        s.step = 'dp_doc_name'
        return ctx.reply(`👨‍⚕️ <b>${next + 1}/${total}</b> — اسم الطبيب أو المساعد التالي:`, { parse_mode: 'HTML' })
      }
      // All doctors collected, proceed to governorate
      s.step = 'dp_gov'
      s.data.doctor_name = s.data.doctors_list[0]?.name || s.data.doctor_name
      const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
      return ctx.reply(`✅ تم إضافة ${total} أطباء\n\n🏛️ اختر المحافظة:`, { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }

    if (s.step === 'dp_gov') { if (!GOVS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.governorate = text; s.step = 'dp_area'
      const areas = AREAS[text] || ['أخرى']
      const kb = [...areas, 'أخرى']
      const rows = []; for (let i = 0; i < kb.length; i += 3) rows.push(kb.slice(i, i + 3))
      return ctx.reply('📍 <b>5/14</b> اختر المنطقة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'dp_area') {
      if (text === 'أخرى') { s.step = 'dp_area_custom'; return ctx.reply('✏️ اكتب المنطقة يدوياً:', { reply_markup: { remove_keyboard: true } }) }
      const areas = AREAS[s.data.governorate] || []
      if (!areas.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.area = text; s.step = 'dp_addr'
      return ctx.reply('🏠 <b>6/14</b> العنوان بالضبط (- للتخطي):', { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }
    if (s.step === 'dp_area_custom') { s.data.area = text; s.step = 'dp_addr'
      return ctx.reply('🏠 <b>6/14</b> العنوان بالضبط (- للتخطي):', { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }

    if (s.step === 'dp_addr') { s.data.address = text === '-' ? '' : text; s.step = 'dp_phone'
      return ctx.reply('📱 <b>8/14</b> رقم الهاتف (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_phone') { s.data.phone = text === '-' ? '' : text; s.step = 'dp_wa'
      return ctx.reply('💬 <b>9/14</b> رقم الواتساب (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_wa') { s.data.whatsapp = text === '-' ? '' : text; s.step = 'dp_website'
      return ctx.reply('🌐 <b>10/14</b> الموقع الإلكتروني (- للتخطي):\n\nمثال: https://example.com', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_website') { s.data.website = text === '-' ? '' : text; s.step = 'dp_map'
      return ctx.reply('🗺️ <b>11/14</b> رابط الموقع على الخريطة (- للتخطي):\n\nمثال: https://goo.gl/maps/xxx', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_map') { s.data.map_url = text === '-' ? '' : text; s.step = 'dp_bio'
      return ctx.reply('📝 <b>12/14</b> النبذة التعريفية (- للتخطي):\n\nاكتب نبذة مختصرة عن الطبيب أو المنشأة:', { parse_mode: 'HTML' })
    }
    if (s.step === 'dp_bio') {
      s.data.doctor_bio = text === '-' ? '' : text; s.step = 'dp_24h'
      const kb = new InlineKeyboard()
        .text('نعم ⏰ يعمل 24 ساعة', 'dp24h:yes').row()
        .text('لا 🕐 ساعات محددة', 'dp24h:no').row()
        .text('❌ إلغاء', 'back')
      return edit(ctx, `⏰ <b>13/14</b> هل المنشأة تعمل 24 ساعة؟`, { reply_markup: kb })
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
      try {
        await updateDoc(doc(db, 'directory_listings', s.data.editId), { clinic_open_time: m[1], clinic_close_time: m[2], is_24h: false, updated_at: new Date().toISOString() })
        clearS(ctx.chat.id)
        await ctx.reply(`✅ تم تحديث أوقات الدوام: ${m[1]} - ${m[2]}`, { reply_markup: new InlineKeyboard().text('◀️ الرجوع', `dp:show:${s.data.editId}`) })
      } catch (e) { console.error(e.message); await ctx.reply('❌ خطأ في الحفظ') }
      return
    }

    // ── EDIT FIELD ──
    if (s.step === 'dp_set_field') {
      const { field, editId } = s.data
      if (text === '-') { clearS(ctx.chat.id); return ctx.reply('❌ تم الإلغاء') }
      const update = {}
      update[field] = text
      update.updated_at = new Date().toISOString()
      try { await updateDoc(doc(db, 'directory_listings', editId), update) } catch (e) { console.error(e.message) }
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

  // For specialized & laser: ask for number of doctors/assistants
  if (s.data.facility_type === 'specialized' || s.data.facility_type === 'laser') {
    s.step = 'dp_doc_count'
    s.data.doctors_list = []
    return edit(ctx, `✅ ${subType}\n\n👥 كم عدد الأطباء/المساعدين في المنشأة؟\n${DIV2}\n\nأرسل الرقم (0 إن لم يوجد):`, { parse_mode: 'HTML' })
  }

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
    await saveDoctorProfile(ctx, s)
  } else {
    s.step = 'dp_hours'
    return edit(ctx, `⏰ <b>14/14</b> اكتب وقت الدوام:\n${DIV}\n\nمثال: <code>8:00 - 14:00</code>\n\nاكتب من - الى:`, { reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back') })
  }
})

// ═══════════════════════════════════════
// SAVE DOCTOR PROFILE
// ═══════════════════════════════════════
async function saveDoctorProfile(ctx, s) {
  try {
    const d = s.data
    const payload = {
      facility_type: d.facility_type || 'doctor',
      doctor_name: d.doctor_name || '',
      specialty: d.specialty || '',
      doctors_list: d.doctors_list || [],
      doctor_count: d.doctor_count || 0,
      governorate: d.governorate || '',
      area: d.area || '',
      phone: d.phone || '',
      phone2: '',
      whatsapp: d.whatsapp || '',
      website: d.website || '',
      photoUrl: d.photoUrl || '',
      address: d.address || '',
      map_url: d.map_url || '',
      doctor_bio: d.doctor_bio || '',
      is_24h: d.is_24h || false,
      clinic_open_time: d.is_24h ? '00:00' : (d.timeFrom || ''),
      clinic_close_time: d.is_24h ? '23:59' : (d.timeTo || ''),
      view_count: 0,
      rating_avg: 0,
      rating_count: 0,
      enabled: true,
      created_by: store[ctx.chat.id]?.founderId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const newRef = doc(collection(db, 'directory_listings'))
    await setDoc(newRef, payload)

    clearS(ctx.chat.id)
    const ft = FACILITY_TYPES[d.facility_type] || '🩺'
    const loc = [d.governorate, d.area].filter(Boolean).join(' - ') || '-'
    const sched = d.is_24h ? 'يعمل 24 ساعة' : (d.timeFrom && d.timeTo ? `${d.timeFrom} - ${d.timeTo}` : '-')

    let doctorsText = ''
    if (d.doctors_list && d.doctors_list.length) {
      doctorsText = '\n👥 <b>الأطباء:</b>\n' + d.doctors_list.map((doc, i) => `   ${i + 1}. ${doc.name}${doc.specialty ? ` (${doc.specialty})` : ''}`).join('\n') + '\n'
    }

    await ctx.reply(
      `✅ <b>تمت الإضافة بنجاح!</b>\n${DIV2}\n\n` +
      `${ft} <b>${d.doctor_name}</b>\n` +
      `🩺 ${d.specialty || '-'}\n` +
      `${doctorsText}` +
      `🏛️ ${loc}\n` +
      `📱 ${d.phone || '-'}\n` +
      `⏰ ${sched}\n\n` +
      `🔗 عرض في الدليل:\n<code>asaasedu.com/listing/${newRef.id}</code>`,
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
console.log('🤖 Madar Bot starting...')

const webhookPath = '/webhook'
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.RENDER_EXTERNAL_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.APP_URL || process.env.WEBHOOK_URL || ''
const app = express()
app.use(express.json())

app.get('/', (_, res) => res.send('🤖 Madar Bot is running'))
app.get('/health', (_, res) => res.json({ ok: true }))

app.post(webhookPath, (req, res) => {
  webhookCallback(bot, 'express')(req, res).catch(e => {
    console.error('⚠️ Webhook error:', e.message)
    if (!res.headersSent) res.status(500).send('OK')
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server listening on port ${PORT}`)
  if (BASE_URL) {
    bot.api.setWebhook(`${BASE_URL}${webhookPath}`)
      .then(() => console.log(`✅ Webhook set: ${BASE_URL}${webhookPath}`))
      .catch(e => console.error('⚠️ Webhook set failed:', e.message))
  } else {
    console.log('No webhook URL — waiting for manual webhook or starting polling...')
  }
})

setupFirebaseAuth()
