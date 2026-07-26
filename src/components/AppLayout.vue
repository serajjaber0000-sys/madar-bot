<template>
  <div class="app-shell">
    <button class="mobile-menu-btn" @click="sidebarOpen = true" v-if="!sidebarOpen">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M3 6h18M3 12h18M3 18h18"/>
      </svg>
    </button>

    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>

    <aside :class="['sidebar', { collapsed: isCollapsed, open: sidebarOpen }]">
      <!-- Brand -->
      <div class="sidebar-brand" v-if="!isCollapsed">
        <div class="brand-top-row">
          <div class="brand-icon-wrap">
            <div class="brand-icon">
              <img src="/logo.jpg" alt="مدار" class="brand-logo-img" />
            </div>
            <button class="brand-gear-btn" title="تعديل اسم العيادة" @click="editClinicNameInput = authStore.clinicName; showEditClinicName = true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <h1 class="brand-title">{{ t.appName }}</h1>
        </div>
        <div class="clinic-screen">
          <span>{{ authStore.clinicName || t.appName }}</span>
        </div>
      </div>
      <div v-else class="sidebar-header">
        <router-link to="/" class="logo-link">
          <img src="/logo.jpg" alt="مدار" class="sidebar-logo-img" />
        </router-link>
      </div>

      <!-- Main Navigation -->
      <nav class="sidebar-nav">
        <template v-for="item in menuItems" :key="item.to">
          <router-link
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
            :title="item.label"
            @click="sidebarOpen = false"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge && !isCollapsed" class="nav-badge">{{ item.badge > 99 ? '+99' : item.badge }}</span>
            <span v-if="item.badge && isCollapsed" class="nav-badge-dot"></span>
          </router-link>
        </template>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <span v-if="!isCollapsed" class="sidebar-version">الإصدار 1.0.0</span>
        <button class="nav-item sidebar-logout" title="تسجيل الخروج" @click="handleLogout">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span v-if="!isCollapsed" class="nav-label">تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <main class="content">
      <slot />

      <!-- Support FAB -->
      <div v-if="authStore.role !== 'super_admin'" class="fab-wrap" @click.stop>
        <div v-if="!fabOpen" class="fab-label">الدعم</div>
        <button class="fab-main" :class="{ open: fabOpen }" @click="fabOpen = !fabOpen">
          <svg v-if="!fabOpen" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
        </button>
        <transition name="fab-pop">
          <div v-if="fabOpen" class="fab-options">
            <a href="https://wa.me/9647807202286" target="_blank" rel="noopener" class="fab-option fab-wa" title="واتساب">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>واتساب</span>
            </a>
            <a href="https://t.me/Madar_System" target="_blank" rel="noopener" class="fab-option fab-tg" title="تيليجرام">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>تيليجرام</span>
            </a>
          </div>
        </transition>
      </div>
    </main>

    <!-- Edit Clinic Name Modal -->
    <div v-if="showEditClinicName" class="modal-overlay" @click.self="showEditClinicName = false">
      <div class="modal-box" style="max-width: 400px;">
        <h3 style="margin: 0 0 16px; font-size: 18px; color: #1e293b;">تعديل اسم العيادة</h3>
        <input v-model="editClinicNameInput" type="text" placeholder="اسم العيادة الجديد"
          style="width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; transition: border 0.2s;"
          @focus="$event.target.style.borderColor='#3b82f6'"
          @blur="$event.target.style.borderColor='#e2e8f0'" />
        <div style="display:flex; gap:8px; margin-top:16px; justify-content: flex-end;">
          <button @click="showEditClinicName = false" style="padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:8px; background:#fff; color:#64748b; font-size:14px; cursor:pointer;">إلغاء</button>
          <button @click="saveClinicName" :disabled="!editClinicNameInput.trim()" style="padding:8px 18px; border:none; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; font-size:14px; cursor:pointer; opacity: 0.9;">حفظ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'
import { db } from '../firebase/config'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { playNotifSound } from '../utils/time'

const authStore = useAuthStore()
const { t } = useI18n()
const route = useRoute()
const isCollapsed = ref(false)
const sidebarOpen = ref(false)
const unreadNotifCount = ref(0)
const fabOpen = ref(false)
const showEditClinicName = ref(false)
const editClinicNameInput = ref('')
let unsubscribeNotif = null
let notifSound = null
let lastNotifCount = 0

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 8.5L10 2.5l7.5 6v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16.5z" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8 18 8 11 12 11 12 18" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  patients: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  appointments: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>',
  billing: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  medicalRecord: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12h6M9 16h6" stroke-linecap="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  staff: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  subscriptions: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
}

const superAdminItems = computed(() => [
  { to: '/super-admin/dashboard', icon: icons.dashboard, label: 'لوحة التحكم' },
  { to: '/super-admin/clinics', icon: icons.patients, label: 'العيادات' },
  { to: '/super-admin/directory-settings', icon: icons.settings, label: 'إعدادات الدليل' },
  { to: '/super-admin/slider', icon: icons.dashboard, label: 'إدارة السلايدر' },
  { to: '/super-admin/subscriptions', icon: icons.subscriptions, label: 'الاشتراكات' },
  { to: '/super-admin/maintenance', icon: icons.settings, label: 'الصيانة والإشعارات' },
])

const ownerItems = computed(() => [
  { to: '/clinic/:clinicId/owner/dashboard', icon: icons.dashboard, label: 'لوحة التحكم' },
  { to: '/clinic/:clinicId/owner/patients', icon: icons.patients, label: 'المرضى' },
  { to: '/clinic/:clinicId/owner/appointments', icon: icons.appointments, label: 'المواعيد' },
  { to: '/clinic/:clinicId/owner/medical-record', icon: icons.medicalRecord, label: 'السجل الطبي' },
  { to: '/clinic/:clinicId/owner/billing', icon: icons.billing, label: 'الفواتير' },
  { to: '/clinic/:clinicId/owner/staff', icon: icons.staff, label: 'الطاقم' },
  { to: '/clinic/:clinicId/notifications', icon: icons.bell, label: 'الإشعارات', badge: unreadNotifCount.value },
  { to: '/clinic/:clinicId/chat', icon: icons.chat, label: 'المحادثة' },
  { to: '/clinic/:clinicId/owner/reports', icon: icons.dashboard, label: 'التقارير' },
  { to: '/clinic/:clinicId/owner/settings', icon: icons.settings, label: 'الإعدادات' },
])

const secretaryItems = computed(() => [
  { to: '/clinic/:clinicId/secretary/dashboard', icon: icons.dashboard, label: 'لوحة التحكم' },
  { to: '/clinic/:clinicId/secretary/patients', icon: icons.patients, label: 'المرضى' },
  { to: '/clinic/:clinicId/secretary/appointments', icon: icons.appointments, label: 'المواعيد' },
  { to: '/clinic/:clinicId/notifications', icon: icons.bell, label: 'الإشعارات', badge: unreadNotifCount.value },
  { to: '/clinic/:clinicId/chat', icon: icons.chat, label: 'محادثة الطاقم' },
  { to: '/clinic/:clinicId/secretary/chats', icon: icons.chat, label: 'محادثة المرضى' },
])

const menuItems = computed(() => {
  const role = authStore.role
  const cid = authStore.clinicId
  let items = []
  if (role === 'super_admin') items = superAdminItems.value
  else if (role === 'owner') items = ownerItems.value
  else if (role === 'secretary') items = secretaryItems.value

  return items.map(item => ({
    ...item,
    to: item.to.replace(':clinicId', cid)
  }))
})

const userInitials = computed(() => {
  const name = authStore.fullName || ''
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
})

const roleLabel = computed(() => {
  const roles = { super_admin: 'مدير النظام', owner: 'مالك العيادة', secretary: 'سكرتير' }
  return roles[authStore.role] || authStore.role
})

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  if (unsubscribeNotif) unsubscribeNotif()
  authStore.logout()
}

function saveClinicName() {
  const newName = editClinicNameInput.value.trim()
  if (!newName) return
  authStore.updateClinicName(newName)
  showEditClinicName.value = false
}

function closeFab() { fabOpen.value = false }

function handleResize() {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeFab)
  window.addEventListener('resize', handleResize)
  const cid = authStore.clinicId
  const uid = authStore.uid
  const role = authStore.role
  if (cid && uid && role !== 'super_admin') {
    unsubscribeNotif = onSnapshot(
      query(collection(db, 'notifications'), where('clinicId', '==', cid), limit(100)),
      (snap) => {
        const newCount = snap.docs
          .map(d => d.data())
          .filter(n => (n.toUserId === uid || n.toUserId === 'all') && n.type !== 'message' && !n.read)
          .length
        if (lastNotifCount > 0 && newCount > lastNotifCount) {
          playNotifSound()
        }
        lastNotifCount = newCount
        unreadNotifCount.value = newCount
      },
      () => { unreadNotifCount.value = 0 }
    )
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeFab)
  window.removeEventListener('resize', handleResize)
  if (unsubscribeNotif) unsubscribeNotif()
})
</script>

<style scoped>
.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}
.sidebar-logo-img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 10px;
}
.nav-badge {
  margin-right: auto;
  margin-left: 8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  animation: badgePop 0.3s ease;
}
@keyframes badgePop {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.nav-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  margin-right: auto;
  margin-left: 4px;
  flex-shrink: 0;
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* SUPPORT FAB */
.fab-wrap {
  position: fixed;
  bottom: 24px;
  left: 20px;
  z-index: 90;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
}
.fab-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  background: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  white-space: nowrap;
  pointer-events: none;
}
.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  transition: all 0.3s;
}
.fab-main:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
}
.fab-main.open {
  background: #475569;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transform: rotate(0deg);
}
.fab-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  max-height: 60vh;
  overflow-y: auto;
}
.fab-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 16px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 0.2s;
}
.fab-option:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
.fab-wa { background: #25d366; }
.fab-wa:hover { background: #20bd5a; }
.fab-tg { background: #0088cc; }
.fab-tg:hover { background: #006ba3; }
.fab-pop-enter-active { transition: all 0.25s ease; }
.fab-pop-leave-active { transition: all 0.15s ease; }
.fab-pop-enter-from { opacity: 0; transform: scale(0.7); }
.fab-pop-leave-to { opacity: 0; transform: scale(0.8); }

@media (max-width: 768px) {
  .fab-wrap { bottom: 16px; left: 14px; }
  .fab-main { width: 50px; height: 50px; }
  .fab-main svg { width: 22px; height: 22px; }
  .fab-label { font-size: 0.68rem; padding: 3px 10px; }
  .fab-option { padding: 10px 16px; font-size: 0.8rem; gap: 8px; }
}
</style>
