<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { matchesAnswer } from '../data/lifelines'

const props = defineProps({ lifeline: { type: Object, required: true } })
const emit = defineEmits(['close', 'checked'])

const sheet = ref(null)
const guess = ref('')
const verdict = ref(null) // null | 'correct' | 'wrong'

// One attempt: the answer buys the artist's name, so unlimited retries would
// hand it over for free.
function check() {
  if (verdict.value || !guess.value.trim()) return
  const correct = matchesAnswer(props.lifeline, guess.value)
  verdict.value = correct ? 'correct' : 'wrong'
  emit('checked', correct)
}

// Deliberately no backdrop-click dismissal — the only way out is the button.
function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  // Focus the dialog itself, not a control: focusing the input would pop the
  // mobile keyboard over the photo, and focusing Volver would make a stray
  // Enter dismiss the whole thing.
  sheet.value?.focus()
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
  <div class="backdrop" role="dialog" aria-modal="true" :aria-label="lifeline.label">
    <div ref="sheet" class="sheet" tabindex="-1">
      <img v-if="lifeline.image" :src="lifeline.image" alt="" class="shot" />

      <p v-if="lifeline.body" class="prompt">{{ lifeline.body }}</p>

      <form class="guess" @submit.prevent="check">
        <input
          v-model="guess"
          type="text"
          class="field"
          placeholder="Tu respuesta"
          autocomplete="off"
          autocapitalize="words"
          spellcheck="false"
          :disabled="!!verdict"
          :aria-invalid="verdict === 'wrong'"
        />
        <button
          type="submit"
          class="check"
          :disabled="!guess.trim() || !!verdict"
        >
          Comprobar
        </button>
      </form>

      <p v-if="verdict" class="verdict" :class="verdict" role="status">
        {{ verdict === 'correct' ? '✓ ¡Correcto!' : '✕ No es esa' }}
      </p>

      <button class="close" @click="emit('close')">Volver</button>
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
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--gold-dim);
  background: var(--surface);
  animation: rise 0.25s cubic-bezier(0.2, 0.8, 0.3, 1);
}

/* Focused programmatically for screen readers; no visible ring wanted. */
.sheet:focus {
  outline: none;
}

.shot {
  width: 100%;
  /* Portraits vary in shape; a fixed frame keeps the sheet from jumping. */
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius);
  display: block;
}

.prompt {
  margin: 0;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--gold);
}

.guess {
  display: flex;
  gap: 8px;
}

.field {
  flex: 1 1 auto;
  min-width: 0;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  /* Anything under 16px makes iOS Safari zoom the page on focus. */
  font-size: 16px;
}

.field::placeholder {
  color: var(--text-dim);
}

.field:focus {
  outline: 2px solid var(--gold);
  outline-offset: 1px;
}

.field:disabled {
  opacity: 0.6;
  -webkit-text-fill-color: var(--text); /* Safari greys disabled text out */
}

.check {
  flex: 0 0 auto;
  padding: 12px 14px;
  border-radius: var(--radius);
  font-weight: 600;
  background: var(--surface-hi);
  border: 1px solid var(--border);
  color: var(--text);
}

.check:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.verdict {
  margin: -4px 0 0;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.verdict.correct {
  color: var(--ok);
}

.verdict.wrong {
  color: var(--fail);
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
