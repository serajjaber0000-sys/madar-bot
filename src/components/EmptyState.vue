<template>
  <div class="empty-state">
    <span class="empty-icon">{{ icon }}</span>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'لا توجد بيانات' },
  subtitle: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}
.empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.6; }
.empty-title { font: 700 1.1rem 'Cairo'; color: var(--text); margin-bottom: 6px; }
.empty-subtitle { font: 400 0.88rem 'Tajawal'; color: var(--text-muted); margin: 0; }
</style>
