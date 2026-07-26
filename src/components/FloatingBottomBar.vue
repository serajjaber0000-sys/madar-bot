<template>
  <nav class="fbb" :class="{ hidden: hideBar }">
    <router-link to="/" class="fbb-item" :class="{ active: $route.path === '/' }">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>الرئيسية</span>
    </router-link>
    <router-link to="/favorites" class="fbb-item" :class="{ active: $route.path === '/favorites' }">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <span>المفضلة</span>
    </router-link>
    <router-link to="/bookings" class="fbb-item" :class="{ active: $route.path === '/bookings' }">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>حجوزاتي</span>
      <span v-if="bookingsCount > 0" class="fbb-badge fbb-badge-blue">{{ bookingsCount }}</span>
    </router-link>
    <router-link to="/about" class="fbb-item" :class="{ active: $route.path === '/about' }">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <span>من نحن</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'

const route = useRoute()
const hideBar = ref(false)
const bookingsCount = ref(0)
let lastScroll = 0, unsubBookings = null

function onScroll() {
  const y = window.scrollY
  hideBar.value = y > lastScroll && y > 200
  lastScroll = y
}

function getDeviceId() {
  let id = localStorage.getItem('madar_device_id')
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('madar_device_id', id)
  }
  return id
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  const deviceId = getDeviceId()
  try {
    unsubBookings = onSnapshot(query(collection(db, 'appointments'), where('device_id', '==', deviceId)), (snap) => {
      bookingsCount.value = snap.size
    }, () => {})
  } catch {}
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (unsubBookings) unsubBookings()
})
</script>

<style scoped>
.fbb{position:fixed;bottom:0;left:0;right:0;z-index:999;display:flex;align-items:center;justify-content:space-around;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(226,232,240,0.6);padding:6px 0 env(safe-area-inset-bottom,6px);transition:transform .3s ease;box-shadow:0 -2px 12px rgba(0,0,0,0.04)}
.fbb.hidden{transform:translateY(100%)}
.fbb-item{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;text-decoration:none;color:#94a3b8;font-size:0.65rem;font-weight:600;padding:4px 12px;border-radius:10px;transition:all .2s;-webkit-tap-highlight-color:transparent;min-width:56px}
.fbb-item.active{color:#0d9488}
.fbb-item.active svg{filter:drop-shadow(0 2px 4px rgba(17,80,201,0.3))}
.fbb-badge{position:absolute;top:0;right:4px;min-width:16px;height:16px;border-radius:8px;background:#ef4444;color:#fff;font-size:0.55rem;font-weight:800;display:grid;place-items:center;padding:0 4px;line-height:1}
.fbb-badge-blue{background:#0d9488}
@media(min-width:769px){.fbb{display:none}}
</style>
