<template>
  <div :class="['stats-card', `stats-card--${color}`]">
    <div class="stats-card__icon">{{ icon }}</div>
    <div class="stats-card__content">
      <span class="stats-card__label">{{ label }}</span>
      <strong class="stats-card__value">{{ value }}</strong>
      <span v-if="subtitle" class="stats-card__subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📊' },
  label: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'default' }
})
</script>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: all 0.2s;
}
.stats-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

.stats-card__icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.stats-card--default .stats-card__icon { background: var(--primary-light); }
.stats-card--green .stats-card__icon { background: #e8f5e9; }
.stats-card--blue .stats-card__icon { background: #e3f0f8; }
.stats-card--gold .stats-card__icon { background: #fbf1d6; }
.stats-card--red .stats-card__icon { background: #ffebee; }
.stats-card--purple .stats-card__icon { background: #f3e5f5; }

.stats-card__content { flex: 1; min-width: 0; }
.stats-card__label { display: block; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 2px; }
.stats-card__value { display: block; font: 900 1.6rem 'Cairo'; color: var(--text); }
.stats-card__subtitle { display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
</style>
