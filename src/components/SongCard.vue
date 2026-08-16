<script setup>
import { COVER_RATIO } from '../data/songs'

defineProps({
  song: { type: Object, required: true },
  // null while unplayed, then 'correct' | 'wrong' once resolved (iteration 3)
  status: { type: String, default: null },
})
</script>

<template>
  <RouterLink :to="`/song/${song.id}`" class="card" :class="status">
    <div class="art">
      <!-- The clean poster is only requested once the song has been resolved,
           so the answer is never sitting in the browser beforehand. -->
      <img
        :src="status ? song.cover : song.blur"
        :alt="status ? song.title : `Canción ${song.number}`"
        loading="lazy"
        decoding="async"
      />
      <span class="number">{{ song.number }}</span>
      <span v-if="status" class="badge" aria-hidden="true">
        {{ status === 'correct' ? '✓' : '✕' }}
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.card:active {
  transform: scale(0.97);
}

.card.correct {
  border-color: color-mix(in srgb, var(--ok) 55%, transparent);
}

.card.wrong {
  border-color: color-mix(in srgb, var(--fail) 55%, transparent);
}

.art {
  position: relative;
  aspect-ratio: v-bind(COVER_RATIO);
  overflow: hidden;
}

.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.number {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 2.1rem;
  font-weight: 600;
  color: var(--text);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
}

.card.correct .number,
.card.wrong .number {
  /* once revealed the artwork is the point — tuck the number into a corner */
  inset: auto 0 6px 0;
  font-size: 0.95rem;
  color: var(--text-dim);
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0a0a0c;
  background: var(--ok);
}

.card.wrong .badge {
  background: var(--fail);
}
</style>
