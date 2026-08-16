<script setup>
import { computed, ref } from 'vue'
import { findSong, COVER_RATIO } from '../data/songs'
import { lifelines } from '../data/lifelines'
import {
  useSong,
  MAX_PLAYS,
  isSpent,
  spendLifeline,
  openLifelineModal,
} from '../store/progress'
import { useClip } from '../composables/useClip'

const props = defineProps({ id: { type: String, required: true } })

const song = computed(() => findSong(props.id))
const { playsLeft, revealed, result, hints, countPlay, reveal, setResult } =
  useSong(props.id)

// Both clips are set up here so their lifecycle hooks register during setup.
// Neither fetches anything yet — useClip builds its Audio element on the first
// play(), so the real clip stays off the wire until he asks for it.
const distorted = useClip(song.value?.distortedAudio)
const real = useClip(song.value?.realAudio)

const {
  playing: distortedPlaying,
  loading: distortedLoading,
  error: distortedError,
  progress: distortedProgress,
} = distorted
const { playing: realPlaying, progress: realProgress } = real

const canPlay = computed(() => playsLeft.value > 0 && !distortedPlaying.value)

async function playDistorted() {
  if (!canPlay.value) return
  // Only spend an attempt if playback actually started.
  if (await distorted.play()) countPlay()
}

// `flipped` drives the visuals; the store's `revealed` is the saved fact.
// They only differ for the moment between tapping Resolver and the poster
// being ready to show. Starts already flipped for a song resolved earlier, so
// revisiting doesn't replay the animation.
const flipped = ref(revealed.value)
const revealing = ref(false)

// Don't start the flip until the poster is decoded, or the card would turn to
// a blank face on a slow connection. Capped so a failed load can't hang it.
function preload(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = src
    setTimeout(resolve, 1500)
  })
}

// The modal and its sound are owned by App.vue; this just spends and opens.
function useLifeline(lifeline) {
  if (isSpent(lifeline.id)) return
  distorted.stop()
  spendLifeline(lifeline.id)
  openLifelineModal(lifeline, props.id)
}

async function onReveal() {
  if (revealing.value) return
  revealing.value = true
  distorted.stop()
  reveal()
  await preload(song.value.cover)
  flipped.value = true
  revealing.value = false
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

    <div class="art" :class="{ flipped }">
      <div class="flipper">
        <img class="face front" :src="song.blur" alt="" />
        <!-- Only mounted once revealed, so the poster isn't fetched early. -->
        <img
          v-if="revealed"
          class="face back"
          :src="song.cover"
          :alt="song.title"
        />
      </div>
    </div>

    <!-- What each spent lifeline earned him on this song. A right answer buys
         the artist's name; a wrong one buys nothing. -->
    <p
      v-for="hint in hints"
      :key="hint.id"
      class="hint"
      :class="hint.correct ? 'correct' : 'wrong'"
    >
      <template v-if="hint.correct">
        ¡Correcto! El artista es: {{ song.artist }}
      </template>
      <template v-else>¡Error! Eres lamentable!</template>
    </p>

    <p v-if="flipped" class="title">
      {{ song.title }}
      <span v-if="song.artist" class="artist">{{ song.artist }}</span>
    </p>

    <div class="controls">
      <template v-if="!flipped">
        <button
          class="primary"
          :style="{ '--p': distortedProgress }"
          :disabled="!canPlay"
          @click="playDistorted"
        >
          <span class="label">
            <template v-if="distortedLoading">Cargando…</template>
            <template v-else-if="distortedPlaying">Sonando…</template>
            <template v-else-if="playsLeft === 0">Sin intentos</template>
            <template v-else>
              Escuchar · {{ playsLeft }} de {{ MAX_PLAYS }}
            </template>
          </span>
        </button>
        <p v-if="distortedError" class="err">No se pudo cargar el audio.</p>

        <button class="secondary" :disabled="revealing" @click="onReveal">
          {{ revealing ? 'Resolviendo…' : 'Resolver' }}
        </button>

        <!-- Hints only make sense before the answer is out. -->
        <p class="lifelines-title">Comodines</p>
        <div class="lifelines">
          <button
            v-for="l in lifelines"
            :key="l.id"
            class="lifeline"
            :class="{ used: isSpent(l.id) }"
            :disabled="isSpent(l.id)"
            :title="l.label"
            @click="useLifeline(l)"
          >
            {{ l.label }}
          </button>
        </div>
      </template>

      <template v-else>
        <button
          class="primary"
          :style="{ '--p': realProgress }"
          :disabled="realPlaying"
          @click="real.play()"
        >
          <span class="label">
            {{ realPlaying ? 'Sonando…' : 'Escuchar original' }}
          </span>
        </button>

        <!-- No limit once resolved — the answer is already out. -->
        <button
          class="secondary"
          :style="{ '--p': distortedProgress }"
          :disabled="distortedPlaying"
          @click="distorted.play()"
        >
          <span class="label">
            {{ distortedPlaying ? 'Sonando…' : 'Escuchar distorsionada' }}
          </span>
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
  perspective: 1200px;
}

.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.1, 0.2, 1);
}

.art.flipped .flipper {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  /* Without this the far side shows through during the turn. */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.face.back {
  transform: rotateY(180deg);
  border-color: var(--gold-dim);
}

/* No 3D for anyone who's asked the OS to tone down motion — just swap. */
@media (prefers-reduced-motion: reduce) {
  .flipper,
  .art.flipped .flipper {
    transform: none;
  }
  .face.back {
    transform: none;
  }
  .art:not(.flipped) .face.back {
    display: none;
  }
}

.hint {
  margin: 12px 0 0;
  padding: 9px 12px;
  border-radius: var(--radius);
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
}

.hint.correct {
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--ok) 40%, transparent);
}

.hint.wrong {
  color: var(--fail);
  background: color-mix(in srgb, var(--fail) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--fail) 40%, transparent);
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
  position: relative;
  width: 100%;
  padding: 14px;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  transition: opacity 0.15s ease;
}

/* Playback position, drawn as a fill sweeping the button. Driven by scaleX so
   it stays on the compositor — animating width would relayout every frame. */
.controls button::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: scaleX(var(--p, 0));
  transform-origin: left;
  background: rgba(0, 0, 0, 0.22);
  pointer-events: none;
}

/* Opaque, not a tint: it has to stay legible under white label text, which
   rules out the brighter golds. Needs the .controls prefix to outweigh the
   `.controls button::before` default above — without it the dark overlay
   meant for the gold buttons wins and the fill vanishes into the surface. */
.controls .secondary::before {
  background: var(--gold-dim);
}

.label {
  position: relative; /* above the fill */
}

.primary {
  background: var(--gold);
  color: #0a0a0c;
}

/* Solid rather than transparent: the playback fill needs a surface to read
   against, and over the page background a tint that subtle is invisible. */
.secondary {
  background: var(--surface-hi);
  border: 1px solid var(--border);
  color: var(--text);
}

.controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Smaller and quieter than the main controls — they're a side option, not the
   thing he should reach for first. */
.lifelines-title {
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.lifelines {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.controls .lifeline {
  flex: 1 1 0;
  min-width: 0;
  min-height: 40px;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-dim);
  font-size: 0.68rem;
  font-weight: 500;
  line-height: 1.25;
  overflow: hidden;
}

.controls .lifeline::before {
  content: none; /* no playback fill on these */
}

.controls .lifeline.used {
  opacity: 0.3;
  text-decoration: line-through;
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
