import 'dotenv/config'
import express from 'express'
import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
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

const SPECS = ['طب عام', 'أسنان', 'باطنية', 'قلب', 'عظام', 'أطفال', 'جلدية', 'نساء وتوليد', 'عيون', 'أنف وأذن', 'مسالك بولية', 'عصبية', 'جراحة عامة', 'صيدلية', 'أخرى']
const GOVS = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'القادسية', 'بابل', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'دهوك', 'السليمانية', 'ميسان', 'ذي قار', 'واسط', 'المثنى', 'حلبجة']
const PLANS = { basic: 'الأساسية', premium: 'المتقدمة', enterprise: 'المؤسسات' }

function rndEmail(n) {
  const s = n.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)
  return `m-${s}-${Date.now().toString(36)}@madar.io`
}
function rndPass() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => c[Math.floor(Math.random() * c.length)]).join('')
}

const DIV = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈'
const DIV2 = '════════════════'

function menuBtn() { return new InlineKeyboard().text('🏠 القائمة الرئيسية', 'back') }

// Fast edit helper — edits the message the user clicked on
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
    kb.text('🏥 العيادات', 'c:list').text('📋 الدليل', 'dl:list').row()
      .text('👥 المؤسسسين', 'f:list').text('➕ مؤسس', 'f:new').row()
      .text('📊 إحصائيات', 'stats').text('🔍 بحث', 'c:find')
  } else if (role === 'founder') {
    kb.text('🏥 عياداتي', 'my:list').text('➕ جديدة', 'c:new').row()
      .text('📋 الدليل', 'dl:list').text('➕ طبيب', 'dl:new').row()
      .text('📊 إحصائيات', 'stats').text('🔍 بحث', 'c:find').row()
      .text('👤 ملفي', 'my:profile')
  } else {
    kb.text('🏥 منصة مدار', 'my:clinic').text('📱 الموقع', 'open:web')
  }
  return kb
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
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
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

bot.callbackQuery('dl:skipphoto', async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  const s = getS(ctx.chat.id)
  if (s.step !== 'dl_photo') return
  await saveListing(ctx, s, '')
})

bot.on('message:photo', async (ctx) => {
  const s = getS(ctx.chat.id)
  if (s.step !== 'dl_photo') return
  await ctx.reply('⏳ جاري رفع الصورة...')
  try {
    const photo = ctx.message.photo[ctx.message.photo.length - 1]
    const file = await ctx.api.getFile(photo.file_id)
    const tgUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`
    const imgRes = await fetch(tgUrl)
    const buf = Buffer.from(await imgRes.arrayBuffer())
    const b64 = buf.toString('base64')
    const imgbbKey = process.env.IMGBB_API_KEY || '5e643e07b1f815e2c3e668267e5081c3'
    const formBody = 'image=' + encodeURIComponent(b64)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody
    })
    const data = await res.json()
    if (data.success) {
      console.log('Photo uploaded:', data.data.url)
      await saveListing(ctx, s, data.data.url)
    } else {
      console.error('imgbb error:', JSON.stringify(data))
      await saveListing(ctx, s, '')
    }
  } catch (e) {
    console.error('Photo upload error:', e.message, e.stack)
    await saveListing(ctx, s, '')
  }
})

async function saveListing(ctx, s, photoUrl) {
  try {
    await addDoc(collection(db, 'directory_listings'), {
      doctor_name: s.data.doctor_name, specialty: s.data.specialty,
      governorate: s.data.governorate, phone: s.data.phone, whatsapp: s.data.whatsapp,
      address: s.data.address, photoUrl, area: '', doctor_bio: '',
      view_count: 0, rating_avg: 0, rating_count: 0,
      enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    })
    clearS(ctx.chat.id)
    await ctx.reply(`✅ <b>د. ${s.data.doctor_name}</b> تمت إضافته!${photoUrl ? ' 📸' : ''}`, { parse_mode: 'HTML', reply_markup: mainKb('admin') })
  } catch (e) { console.error('saveListing:', e.message); await ctx.reply('❌ خطأ في الحفظ') }
}

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
    if (snap.empty) return edit(ctx, `👥 <b>المؤسسسين</b>\n${DIV}\n\n📭 لا يوجد مؤسسين`, { reply_markup: new InlineKeyboard().text('➕ إضافة', 'f:new').row().text('◀️', 'back') })
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
    const [fc, cc, pc, dc] = await Promise.all([
      getDocs(collection(db, 'bot_founders')),
      getDocs(collection(db, 'clinics')),
      getDocs(collection(db, 'patients')),
      getDocs(collection(db, 'directory_listings'))
    ])
    const active = cc.docs.filter(d => d.data().status === 'active').length
    await edit(ctx,
      `<b>📊 الإحصائيات</b>\n${DIV2}\n\n` +
      `👥 المؤسسسين: <b>${fc.size}</b>\n` +
      `🏥 العيادات: <b>${cc.size}</b> (${active} نشطة)\n` +
      `🩺 الدليل: <b>${dc.size}</b>\n` +
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

// ═══════════════════════════════════════
// DIRECTORY LISTINGS
// ═══════════════════════════════════════
bot.callbackQuery('dl:list', async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDocs(query(collection(db, 'directory_listings'), orderBy('created_at', 'desc')))
    if (snap.empty) return edit(ctx, `📋 <b>دليل الأطباء</b>\n${DIV}\n\n📭 لا يوجد أطباء بعد`, { reply_markup: new InlineKeyboard().text('➕ إضافة', 'dl:new').row().text('◀️', 'back') })
    let msg = `<b>📋 الدليل</b> — ${snap.size}\n${DIV}\n\n`
    const kb = new InlineKeyboard()
    snap.docs.forEach((d, i) => {
      const l = d.data()
      const s = l.enabled !== false ? '🟢' : '🔴'
      msg += `${s} <b>${i + 1}.</b> د. ${l.doctor_name} — ${l.specialty || '-'}\n`
      kb.text(`${s} ${l.doctor_name}`, `dl:show:${d.id}`).row()
    })
    kb.text('➕ إضافة', 'dl:new').row().text('◀️ رجوع', 'back')
    await edit(ctx, msg, { reply_markup: kb })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dl:show:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
    if (!snap.exists()) return ctx.reply('❌ غير موجود.')
    const l = snap.data()
    const st = l.enabled !== false ? '🟢 ظاهر' : '🔴 مخفي'
    const fee = l.consultation_fee ? Number(l.consultation_fee).toLocaleString('ar-EG') + ' د.ع' : '-'
    await edit(ctx,
      `<b>🩺 د. ${l.doctor_name}</b>\n${DIV2}\n` +
      `🩺 ${l.specialty || '-'}  •  📍 ${l.governorate || '-'}${l.area ? ' - ' + l.area : ''}\n` +
      `🏠 ${l.address || '-'}\n\n` +
      `📱 ${l.phone || '-'}  •  💬 ${l.whatsapp || '-'}\n` +
      `💰 ${fee}  •  👁 ${l.view_count || 0}\n` +
      `📌 ${st}`,
      { reply_markup: new InlineKeyboard()
        .text(l.enabled !== false ? '🔴 إخفاء' : '🟢 إظهار', `dl:tg:${ctx.match[1]}`).row()
        .text('🗑️ حذف', `dl:rm:${ctx.match[1]}`).row()
        .text('◀️ الدليل', 'dl:list').text('🏠', 'back')
      }
    )
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dl:tg:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try {
    const snap = await getDoc(doc(db, 'directory_listings', ctx.match[1]))
    if (!snap.exists()) return
    const ne = snap.data().enabled === false ? true : false
    await updateDoc(doc(db, 'directory_listings', ctx.match[1]), { enabled: ne })
    await edit(ctx, `✅ د. ${snap.data().doctor_name}: <b>${ne ? '🟢 ظاهر' : '🔴 مخفي'}</b>`, {
      reply_markup: new InlineKeyboard().text('◀️ رجوع', `dl:show:${ctx.match[1]}`)
    })
  } catch (e) { console.error(e.message) }
})

bot.callbackQuery(/^dl:rm:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  await edit(ctx, `⚠️ <b>حذف الطبيب؟</b>`, {
    reply_markup: new InlineKeyboard().text('✅ نعم', `dl:rok:${ctx.match[1]}`).text('❌ لا', 'dl:list')
  })
})

bot.callbackQuery(/^dl:rok:(.+)$/, async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  try { await deleteDoc(doc(db, 'directory_listings', ctx.match[1])); await edit(ctx, `✅ تم الحذف`, { reply_markup: menuBtn() }) } catch {}
})

bot.callbackQuery('dl:new', async (ctx) => {
  if (!founderOrAdmin(ctx)) { await getRole(ctx); if (!founderOrAdmin(ctx)) return ctx.answerCallbackQuery({ text: '⛔', cacheTime: 0 }) }
  await ctx.answerCallbackQuery({ cacheTime: 0 })
  const s = getS(ctx.chat.id); s.step = 'dl_name'; s.data = {}
  await edit(ctx, `➕ <b>إضافة طبيب للدليل</b>\n${DIV}\n\n<b>1/7:</b> اسم الطبيب`, {
    reply_markup: new InlineKeyboard().text('❌ إلغاء', 'back')
  })
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
    // ── DIRECTORY LISTING ──
    if (s.step === 'dl_name') { s.data.doctor_name = text; s.step = 'dl_spec'
      const rows = []; for (let i = 0; i < SPECS.length; i += 3) rows.push(SPECS.slice(i, i + 3))
      return ctx.reply('🩺 <b>2/7</b> التخصص:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'dl_spec') { if (!SPECS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.specialty = text; s.step = 'dl_gov'
      const rows = []; for (let i = 0; i < GOVS.length; i += 3) rows.push(GOVS.slice(i, i + 3))
      return ctx.reply('🏛️ <b>3/7</b> المحافظة:', { parse_mode: 'HTML', reply_markup: { keyboard: rows.map(r => r.map(t => ({ text: t }))), one_time: true, resize_keyboard: true } })
    }
    if (s.step === 'dl_gov') { if (!GOVS.includes(text)) return ctx.reply('❌ اختر من القائمة')
      s.data.governorate = text; s.step = 'dl_phone'
      return ctx.reply('📱 <b>4/7</b> الهاتف (- للتخطي):', { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } })
    }
    if (s.step === 'dl_phone') { s.data.phone = text === '-' ? '' : text; s.step = 'dl_wa'
      return ctx.reply('💬 <b>5/7</b> الواتساب (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dl_wa') { s.data.whatsapp = text === '-' ? '' : text; s.step = 'dl_addr'
      return ctx.reply('📍 <b>6/7</b> العنوان (- للتخطي):', { parse_mode: 'HTML' })
    }
    if (s.step === 'dl_addr') { s.data.address = text === '-' ? '' : text; s.step = 'dl_photo'
      return ctx.reply('📸 صورة الطبيب (ارسل صورة أو اكتب - للتخطي):', { reply_markup: new InlineKeyboard().text('⏭️تخطي', 'dl:skipphoto') })
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

    // ── EDIT ──
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
// START
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
