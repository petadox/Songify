<script setup>
import { computed } from 'vue'
import { findSong, COVER_RATIO } from '../data/songs'
import { useSong, MAX_PLAYS } from '../store/progress'
import { useClip } from '../composables/useClip'

const props = defineProps({ id: { type: String, required: true } })

const song = computed(() => findSong(props.id))
const { playsLeft, revealed, result, countPlay, reveal, setResult } = useSong(
  props.id,
)

// Both clips are set up here so their lifecycle hooks register during setup.
// Neither fetches anything yet — useClip builds its Audio element on the first
// play(), so the real clip stays off the wire until he asks for it.
const distorted = useClip(song.value?.distortedAudio)
const real = useClip(song.value?.realAudio)

const {
  playing: distortedPlaying,
  loading: distortedLoading,
  error: distortedError,
} = distorted
const { playing: realPlaying } = real

const canPlay = computed(() => playsLeft.value > 0 && !distortedPlaying.value)

async function playDistorted() {
  if (!canPlay.value) return
  // Only spend an attempt if playback actually started.
  if (await distorted.play()) countPlay()
}

function onReveal() {
  distorted.stop()
  reveal()
}
</script>

<template>
  <div v-if="song" class="song">
    <header>
      <RouterLink to="/" class="back" aria-label="Volver a la lista">
        <span aria-hidden="true">‹</span> Volver
      </RouterLink>
      <span class="num">{{ song.number }} / 30</span>
    </header>

    <div class="art" :class="{ revealed }">
      <img
        :src="revealed ? song.cover : song.blur"
        :alt="revealed ? song.title : ''"
      />
    </div>

    <p v-if="revealed" class="title">
      {{ song.title }}
      <span v-if="song.artist" class="artist">{{ song.artist }}</span>
    </p>

    <div class="controls">
      <template v-if="!revealed">
        <button class="primary" :disabled="!canPlay" @click="playDistorted">
          <template v-if="distortedLoading">Cargando…</template>
          <template v-else-if="distortedPlaying">Sonando…</template>
          <template v-else-if="playsLeft === 0">Sin intentos</template>
          <template v-else>
            Escuchar · {{ playsLeft }} de {{ MAX_PLAYS }}
          </template>
        </button>
        <p v-if="distortedError" class="err">No se pudo cargar el audio.</p>

        <button class="secondary" @click="onReveal">Resolver</button>
      </template>

      <template v-else>
        <button class="primary" :disabled="realPlaying" @click="real.play()">
          {{ realPlaying ? 'Sonando…' : 'Escuchar original' }}
        </button>

        <template v-if="!result">
          <p class="ask">¿La has acertado?</p>
          <div class="verdict">
            <button class="ok" @click="setResult('correct')">Sí</button>
            <button class="no" @click="setResult('wrong')">No</button>
          </div>
        </template>

        <p v-else class="outcome" :class="result">
          {{ result === 'correct' ? '✓ Acertada' : '✕ Fallada' }}
        </p>
      </template>
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

.art.revealed {
  border-color: var(--gold-dim);
}

.art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  animation: reveal 0.35s ease;
}

@keyframes reveal {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}

.title {
  margin: 14px 0 0;
  text-align: center;
  font-size: 1.15rem;
  font-weight: 600;
}

.artist {
  display: block;
  margin-top: 2px;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-dim);
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

.ask {
  margin: 6px 0 0;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.95rem;
}

.verdict {
  display: flex;
  gap: 10px;
}

.verdict button {
  border: 1px solid var(--border);
}

.ok {
  color: var(--ok);
}

.no {
  color: var(--fail);
}

.outcome {
  margin: 4px 0 0;
  text-align: center;
  font-weight: 600;
}

.outcome.correct {
  color: var(--ok);
}

.outcome.wrong {
  color: var(--fail);
}

.err {
  margin: 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--fail);
}

.missing {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-dim);
}
</style>
