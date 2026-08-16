<script setup>
import { songs } from '../data/songs'
import { lifelines } from '../data/lifelines'
import {
  statusOf,
  summary,
  resetAll,
  isSpent,
  hasProgress,
  lifelineOutcomes,
} from '../store/progress'
import SongCard from '../components/SongCard.vue'

function onReset() {
  if (confirm('¿Borrar todo el progreso? No se puede deshacer.')) resetAll()
}
</script>

<template>
  <div class="home">
    <header>
      <h1>Eongify</h1>
    </header>

    <!-- The title scrolls away; the score and lifelines pin to the top so
         they're readable however far down the grid he is. -->
    <div class="stats">
      <p class="score">
        {{ summary.played }} / {{ songs.length }} · {{ summary.correct }}
        {{ summary.correct === 1 ? 'acertada' : 'acertadas' }}
      </p>

      <ul class="lifelines">
        <li
          v-for="l in lifelines"
          :key="l.id"
          :class="[{ used: isSpent(l.id) }, lifelineOutcomes[l.id]]"
        >
          <span class="dot" aria-hidden="true"></span>
          {{ l.label }}
        </li>
      </ul>
    </div>

    <ul class="grid">
      <li v-for="song in songs" :key="song.id">
        <SongCard :song="song" :status="statusOf(song.id)" />
      </li>
    </ul>

    <button v-if="hasProgress" class="reset" @click="onReset">
      Reiniciar
    </button>
  </div>
</template>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}

header {
  text-align: center;
}

/* Full-bleed via negative margins so the bar's background covers the page
   gutters — otherwise cards scroll visibly past its edges. */
.stats {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 10px -16px 16px;
  padding: 8px 16px 10px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  text-align: center;
}

h1 {
  font-size: 1.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
}

.score {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Spent lifelines stay listed rather than disappearing, so the row reads as
   "what you had" rather than silently shrinking. */
.lifelines {
  list-style: none;
  margin: 7px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  font-size: 0.9rem;
  color: var(--text-dim);
}

.lifelines li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.lifelines .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
}

/* Dim via colour, not opacity: opacity on the row would also wash out the
   red/green dot, which is the one part that has to stay legible. */
.lifelines .used {
  text-decoration: line-through;
  color: color-mix(in srgb, var(--text-dim) 60%, var(--bg));
}

/* Spent but never answered — he closed the modal without guessing. */
.lifelines .used .dot {
  background: transparent;
  box-shadow: inset 0 0 0 1px currentColor;
}

.lifelines .correct .dot {
  background: var(--ok);
  box-shadow: none;
}

.lifelines .wrong .dot {
  background: var(--fail);
  box-shadow: none;
}

/* Deliberately quiet — it wipes everything, so it shouldn't invite a tap. */
.reset {
  display: block;
  margin: 28px auto 0;
  padding: 8px 16px;
  font-size: 0.8rem;
  color: var(--text-dim);
}

@media (min-width: 480px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}
</style>
