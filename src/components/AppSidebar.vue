<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="sidebar-header">
      <router-link to="/" class="sidebar-logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#0A5E52" stroke-width="3" opacity="0.3"/>
            <path d="M24 10v28M10 24h28" stroke="#0A5E52" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
        <span v-if="!isCollapsed" class="logo-text">مدار</span>
      </router-link>
      <button class="sidebar-toggle" @click="$emit('toggle')">
        <svg v-if="!isCollapsed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :class="['nav-item', { active: isActive(item.to) }]"
        :title="isCollapsed ? item.label : ''"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div v-if="!isCollapsed" class="sidebar-user">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ roleLabel }}</span>
        </div>
      </div>

      <button class="nav-item logout-btn" @click="$emit('logout')" :title="isCollapsed ? t.signOut : ''">
        <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
        <span v-if="!isCollapsed" class="nav-label">{{ t.signOut }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const props = defineProps({
  isCollapsed: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  userName: { type: String, default: '' },
  userRole: { type: String, default: '' }
})

defineEmits(['toggle', 'logout'])

const route = useRoute()

const roleLabels = {
  super_admin: 'مدير النظام',
  owner: 'مالك العيادة',
  doctor: 'طبيب',
  assistant: 'مساعد',
  secretary: 'سكرتير'
}

const roleLabel = computed(() => {
  return roleLabels[props.userRole] || props.userRole
})

const userInitials = computed(() => {
  const name = props.userName
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? parts[0].charAt(0) + parts[1].charAt(0) : parts[0].charAt(0)
})

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<style scoped>
.sidebar {
  position: fixed; right: 0; top: 0; bottom: 0; width: 264px;
  background: linear-gradient(180deg, #0f1923 0%, #101B2C 50%, #0d1520 100%);
  color: #fff; display: flex; flex-direction: column; z-index: 1000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto; overflow-x: hidden;
  border-left: 1px solid rgba(201,162,39,0.1);
}
.sidebar.collapsed { width: 72px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); min-height: 64px; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; background: linear-gradient(135deg, #C9A227, #E9CD79); flex-shrink: 0; }
.sidebar-logo:hover .logo-icon { transform: scale(1.05); }
.logo-text { font: 800 1rem 'Cairo'; color: #E9CD79; white-space: nowrap; }
.sidebar-toggle { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; color: rgba(255,255,255,0.4); transition: all 0.2s; }
.sidebar-toggle:hover { color: #E9CD79; background: rgba(201,162,39,0.1); }
.sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: rgba(255,255,255,0.5); text-decoration: none; font: 500 0.875rem 'Tajawal'; transition: all 0.2s; white-space: nowrap; position: relative; }
.nav-item:hover { background: rgba(201,162,39,0.08); color: rgba(255,255,255,0.9); }
.nav-item.active { background: rgba(201,162,39,0.15); color: #E9CD79; font-weight: 700; }
.nav-item.active::before { content: ''; position: absolute; right: -10px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; border-radius: 2px; background: #C9A227; }
.nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-icon :deep(svg) { width: 18px; height: 18px; }
.nav-label { overflow: hidden; text-overflow: ellipsis; }
.sidebar-footer { padding: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
.sidebar-user { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin: 6px 0; border-radius: 10px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: rgba(201,162,39,0.15); color: #E9CD79; font: 700 0.8rem 'Cairo'; flex-shrink: 0; }
.user-info { overflow: hidden; min-width: 0; }
.user-name { display: block; font: 600 0.8rem 'Tajawal'; color: rgba(255,255,255,0.9); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-role { display: block; font-size: 0.68rem; color: rgba(255,255,255,0.35); }
.logout-btn { color: rgba(255,255,255,0.35); margin-top: 2px; }
.logout-btn:hover { background: rgba(220,38,38,0.12); color: #f87171; }
@media (max-width: 768px) {
  .sidebar { width: 72px; }
  .sidebar-header { padding: 16px 8px; justify-content: center; }
  .sidebar-toggle { display: none; }
  .logo-text, .nav-label, .user-info { display: none; }
  .sidebar-nav { padding: 12px 6px; }
  .nav-item { justify-content: center; padding: 12px; }
  .nav-item.active::before { display: none; }
  .sidebar-footer { padding: 8px 6px; }
  .sidebar-user { justify-content: center; padding: 8px; }
}
</style>
