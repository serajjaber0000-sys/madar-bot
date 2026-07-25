<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div :class="['modal-box', `modal-box--${size}`]">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('update:modelValue', false)">✕</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16,27,44,0.5);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 16px;
}
.modal-box {
  background: var(--card);
  border-radius: 16px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
}
.modal-box--sm { max-width: 400px; }
.modal-box--md { max-width: 560px; }
.modal-box--lg { max-width: 780px; }
.modal-box--xl { max-width: 1000px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.modal-title { font: 800 1.05rem 'Cairo'; color: var(--text); margin: 0; }
.modal-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--danger-light); color: var(--danger); }
.modal-body { padding: 22px; }
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--border);
}

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
