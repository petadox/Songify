<script setup>
import { songs } from '../data/songs'
import SongCard from '../components/SongCard.vue'

// Wired to real progress in iteration 3.
const played = 0
const correct = 0
</script>

<template>
  <div class="home">
    <header>
      <h1>Eongify</h1>
      <p class="score">
        {{ played }} / {{ songs.length }} · {{ correct }} acertadas
      </p>
    </header>

    <ul class="grid">
      <li v-for="song in songs" :key="song.id">
        <SongCard :song="song" />
      </li>
    </ul>
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
