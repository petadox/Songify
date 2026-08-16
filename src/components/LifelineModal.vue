<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

defineProps({ lifeline: { type: Object, required: true } })
const emit = defineEmits(['close'])

const closeBtn = ref(null)

// Deliberately no backdrop-click dismissal — the only way out is the button.
function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  closeBtn.value?.focus()
  window.addEventListener('keydown', onKey)
  // Stop the grid behind from scrolling under the overlay.
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="backdrop" role="dialog" aria-modal="true" :aria-label="lifeline.heading">
    <div class="sheet">
      <img v-if="lifeline.image" :src="lifeline.image" alt="" class="shot" />

      <div class="copy">
        <h2 v-if="lifeline.heading">{{ lifeline.heading }}</h2>
        <p v-if="lifeline.body">{{ lifeline.body }}</p>
      </div>

      <button ref="closeBtn" class="close" @click="emit('close')">Volver</button>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.82);
  animation: fade 0.2s ease;
}

.sheet {
  width: 100%;
  max-width: 420px;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--gold-dim);
  background: var(--surface);
  animation: rise 0.25s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.shot {
  width: 100%;
  border-radius: var(--radius);
  display: block;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h2 {
  font-size: 1.2rem;
  color: var(--gold);
}

p {
  margin: 0;
  color: var(--text);
  font-size: 0.95rem;
}

.close {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius);
  font-weight: 600;
  background: var(--gold);
  color: #0a0a0c;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
