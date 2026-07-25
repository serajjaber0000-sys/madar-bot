<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      class="search-input"
      :placeholder="placeholder"
    />
    <button v-if="modelValue" class="search-clear" @click="$emit('update:modelValue', '')">✕</button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'بحث...' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s;
}
.search-bar:focus-within { border-color: var(--primary); }
.search-icon { color: var(--text-muted); font-size: 0.9rem; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  padding: 11px 0;
  font: 500 0.9rem 'Tajawal';
  color: var(--text);
}
.search-input::placeholder { color: var(--text-muted); }
.search-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}
.search-clear:hover { background: var(--danger-light); color: var(--danger); }
</style>
