<script setup>
import { songs } from '../data/songs'
import { statusOf, summary, resetAll } from '../store/progress'
import SongCard from '../components/SongCard.vue'

function onReset() {
  if (confirm('¿Borrar todo el progreso? No se puede deshacer.')) resetAll()
}
</script>

<template>
  <div class="home">
    <header>
      <h1>Eongify</h1>
      <p class="score">
        {{ summary.played }} / {{ songs.length }} · {{ summary.correct }}
        {{ summary.correct === 1 ? 'acertada' : 'acertadas' }}
      </p>
    </header>

    <ul class="grid">
      <li v-for="song in songs" :key="song.id">
        <SongCard :song="song" :status="statusOf(song.id)" />
      </li>
    </ul>

    <button v-if="summary.played" class="reset" @click="onReset">
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
  margin-bottom: 20px;
  text-align: center;
}

h1 {
  font-size: 1.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
}

.score {
  margin: 6px 0 0;
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
