<template>
  <div class="loading-spinner">
    <div class="spinner-ring"></div>
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' }
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 14px;
}
.spinner-ring {
  width: 42px;
  height: 42px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spinner-text { font: 500 0.9rem 'Tajawal'; color: var(--text-muted); }
</style>
