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
      <!-- Face-down the tile is the physical card back; the clean poster is
           only requested once resolved, so the answer is never sitting in the
           browser beforehand. -->
      <img
        :src="status ? song.cover : song.back"
        :alt="status ? song.title : `Canción ${song.number}`"
        loading="lazy"
        decoding="async"
      />
      <!-- The card back already has its number printed on it. -->
      <span v-if="status" class="number">{{ song.number }}</span>
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

/* Only shown once resolved. Top-left, mirroring where the card back prints
   its number — the foot of the poster already carries its own lyric text. */
.number {
  position: absolute;
  top: 6px;
  left: 6px;
  min-width: 22px;
  padding: 1px 6px;
  border-radius: 11px;
  text-align: center;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  background: rgba(0, 0, 0, 0.6);
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
