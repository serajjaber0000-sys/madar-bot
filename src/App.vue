<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </router-view>
  <FloatingBottomBar v-if="isPublicPage" />
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import FloatingBottomBar from './components/FloatingBottomBar.vue'
import { initMessaging, requestNotificationPermission, listenForegroundMessages, updateLastActive } from './services/notifications'

const route = useRoute()
const isPublicPage = computed(() => {
  const path = route.path
  if (path.startsWith('/doctor/') || path.startsWith('/listing/')) return false
  return (path === '/directory' || path === '/about' || path === '/contact' || path === '/bmi' || path === '/favorites' || path === '/bookings')
})

let unsubForeground = null

onMounted(() => {
  updateLastActive()
  initMessaging()
  setTimeout(() => { requestNotificationPermission() }, 3000)
  unsubForeground = listenForegroundMessages((payload) => {
    console.log('Foreground message:', payload)
  })
})

onUnmounted(() => { if (unsubForeground) unsubForeground() })
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
html{overflow-x:hidden;-webkit-text-size-adjust:100%}
body{overflow-x:hidden}
.page-enter-active, .page-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
