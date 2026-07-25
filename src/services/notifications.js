import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import app, { auth, db } from '@/firebase/config'

let messaging = null

export function initMessaging() {
  try {
    messaging = getMessaging(app)
    return messaging
  } catch {
    return null
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return null
  if (Notification.permission === 'granted') return await saveToken()
  if (Notification.permission === 'denied') return null
  const result = await Notification.requestPermission()
  if (result === 'granted') return await saveToken()
  return null
}

export async function saveToken() {
  if (!messaging) messaging = initMessaging()
  if (!messaging) return null
  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined })
    if (!token) return null
    const uid = auth.currentUser?.uid
    const deviceId = getDeviceId()
    const tokenDoc = {
      token,
      deviceId,
      userId: uid || null,
      platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
    await setDoc(doc(db, 'device_tokens', deviceId), tokenDoc, { merge: true })
    return token
  } catch {
    return null
  }
}

export function listenForegroundMessages(callback) {
  if (!messaging) messaging = initMessaging()
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    if (callback) callback(payload)
    if (payload.notification) {
      try {
        new Notification(payload.notification.title || 'مدار', {
          body: payload.notification.body || '',
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          tag: 'madar-notification'
        })
      } catch {}
    }
  })
}

export async function updateLastActive() {
  const deviceId = getDeviceId()
  try {
    await setDoc(doc(db, 'device_tokens', deviceId), { lastActive: new Date().toISOString() }, { merge: true })
  } catch {}
}

function getDeviceId() {
  let id = localStorage.getItem('madar_device_id')
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('madar_device_id', id)
  }
  return id
}
