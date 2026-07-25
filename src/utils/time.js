const arMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export function to12h(time24) {
  if (!time24) return ''
  const parts = time24.split(':')
  let h = parseInt(parts[0], 10)
  const m = parts[1] || '00'
  const period = h < 12 ? 'صباحاً' : 'مساءً'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}

export function to12hShort(time24) {
  if (!time24) return ''
  const parts = time24.split(':')
  let h = parseInt(parts[0], 10)
  const m = parts[1] || '00'
  const period = h < 12 ? 'ص' : 'م'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}

export function formatArabicDate(iso) {
  if (!iso) return ''
  try {
    const [y, m, d] = iso.split('-').map(Number)
    return `${d} ${arMonths[m - 1]} ${y}`
  } catch { return iso }
}

export function formatDateAr(iso) {
  if (!iso) return ''
  try {
    const date = new Date(iso + 'T00:00:00')
    return date.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return iso }
}

export function timeUntil(dateStr, timeStr) {
  if (!dateStr) return ''
  try {
    const dt = new Date(`${dateStr}T${timeStr || '00:00'}:00`)
    const now = new Date()
    const diff = dt - now
    if (diff < 0) return 'انتهى الوقت'
    if (diff < 60000) return 'الآن'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const parts = []
    if (days > 0) parts.push(`${days} ${days === 1 ? 'يوم' : 'أيام'}`)
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`)
    if (mins > 0 && days === 0) parts.push(`${mins} ${mins === 1 ? 'دقيقة' : 'دقائق'}`)
    return parts.length > 0 ? `متبقي ${parts.join(' و')}` : 'الآن'
  } catch { return '' }
}

export function timeAgoAr(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'الآن'
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`
    if (diff < 604800000) return `منذ ${Math.floor(diff / 86400000)} ${Math.floor(diff / 86400000) === 1 ? 'يوم' : 'أيام'}` 
    return d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
  } catch { return '' }
}

export function playNotifSound(type = 'default') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (type === 'approval') {
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.15 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.4)
      })
    } else if (type === 'rejection') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 330
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } else {
      const notes = [880, 1100, 1320]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.3)
      })
    }
  } catch {}
}
