<script setup>
import { computed } from 'vue'
import { findSong, COVER_RATIO } from '../data/songs'

const props = defineProps({ id: { type: String, required: true } })

const song = computed(() => findSong(props.id))
</script>

<template>
  <div v-if="song" class="song">
    <header>
      <RouterLink to="/" class="back" aria-label="Volver a la lista">
        <span aria-hidden="true">‹</span> Volver
      </RouterLink>
      <span class="num">{{ song.number }} / 30</span>
    </header>

    <div class="art">
      <img :src="song.blur" alt="" />
    </div>

    <!-- Mechanics land in iteration 2; this is the layout only. -->
    <div class="controls">
      <button class="primary" disabled>Escuchar · 3 restantes</button>
      <button class="secondary" disabled>Resolver</button>
    </div>
  </div>

  <div v-else class="missing">
    <p>Canción no encontrada.</p>
    <RouterLink to="/" class="back">‹ Volver</RouterLink>
  </div>
</template>

<style scoped>
.song {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: var(--tap);
  padding-right: 12px;
  color: var(--gold);
  font-size: 0.95rem;
}

.back span {
  font-size: 1.4rem;
  line-height: 1;
}

.num {
  font-size: 0.85rem;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.art {
  position: relative;
  aspect-ratio: v-bind(COVER_RATIO);
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
}

.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.controls {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls button {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.primary {
  background: var(--gold);
  color: #0a0a0c;
}

.secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.missing {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-dim);
}
</style>
