import { reactive, computed, watch, ref } from 'vue'
import { songs } from '../data/songs'
import { lifelines } from '../data/lifelines'

export const MAX_PLAYS = 3

const KEY = 'eongify.progress.v1'
// Kept in its own key rather than folded into the progress blob, so the
// existing saved shape needs no migration.
const LIFELINE_KEY = 'eongify.lifelines.v1'
const RESULTS = ['correct', 'wrong']

// One entry per song the player has touched:
//   plays    how many times the distorted clip has been started
//   revealed whether "Resolver" has been pressed
//   result   'correct' | 'wrong', set once he says whether he got it

function blank() {
  // `hints` records the outcome of each lifeline spent on this song:
  // { id, correct }. A correct one earns the artist's name.
  return { plays: 0, revealed: false, result: null, hints: [] }
}

// Anything can be in localStorage — a half-written value, an older shape, or
// something a curious player typed in by hand. Rebuild each entry from
// scratch and keep only what type-checks, so a bad key can't break the grid.
function sanitise(raw) {
  const clean = {}
  if (!raw || typeof raw !== 'object') return clean

  for (const song of songs) {
    const it = raw[song.id]
    if (!it || typeof it !== 'object') continue

    const plays = Number(it.plays)
    clean[song.id] = {
      plays: Number.isFinite(plays) ? Math.min(Math.max(0, plays), MAX_PLAYS) : 0,
      revealed: it.revealed === true,
      result: RESULTS.includes(it.result) ? it.result : null,
      hints: Array.isArray(it.hints)
        ? it.hints
            .filter((h) => h && lifelines.some((l) => l.id === h.id))
            .map((h) => ({ id: h.id, correct: h.correct === true }))
        : [],
    }
  }
  return clean
}

function load() {
  try {
    return sanitise(JSON.parse(localStorage.getItem(KEY)))
  } catch {
    // Unavailable (Safari private mode) or unparseable — start fresh.
    return {}
  }
}

const state = reactive(load())

// Only persist songs he's actually touched, so the payload stays small and a
// stray visit doesn't create a record.
watch(
  state,
  () => {
    const touched = {}
    for (const [id, it] of Object.entries(state)) {
      if (it.plays > 0 || it.revealed || it.result || it.hints.length) {
        touched[id] = it
      }
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(touched))
    } catch {
      // Storage full or blocked — the session still works, it just won't survive.
    }
  },
  { deep: true },
)

function entry(id) {
  if (!state[id]) state[id] = blank()
  return state[id]
}

export function useSong(id) {
  const it = entry(id)
  return {
    plays: computed(() => it.plays),
    playsLeft: computed(() => Math.max(0, MAX_PLAYS - it.plays)),
    revealed: computed(() => it.revealed),
    result: computed(() => it.result),
    hints: computed(() => it.hints),
    countPlay: () => {
      if (it.plays < MAX_PLAYS) it.plays += 1
    },
    reveal: () => {
      it.revealed = true
    },
    setResult: (value) => {
      it.result = value
    },
  }
}

// Grid + score. A song counts as played once he's committed to an answer.
export const statusOf = (id) => state[id]?.result ?? null

// Anything worth offering a reset for — not just finished songs. Mirrors the
// persistence filter, so a song merely opened doesn't count.
export const hasProgress = computed(
  () =>
    spent.size > 0 ||
    Object.values(state).some(
      (it) => it.plays > 0 || it.revealed || it.result || it.hints.length,
    ),
)

export const summary = computed(() => {
  const done = songs.filter((s) => state[s.id]?.result)
  return {
    played: done.length,
    correct: done.filter((s) => state[s.id].result === 'correct').length,
  }
})

// --- Lifelines -------------------------------------------------------------
// Three of them, each spendable once for the entire game.

function loadSpent() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIFELINE_KEY))
    // Keep only ids we still recognise, so renaming a lifeline can't resurrect
    // or strand a spent one.
    return Array.isArray(raw)
      ? raw.filter((id) => lifelines.some((l) => l.id === id))
      : []
  } catch {
    return []
  }
}

const spent = reactive(new Set(loadSpent()))

watch(
  spent,
  () => {
    try {
      localStorage.setItem(LIFELINE_KEY, JSON.stringify([...spent]))
    } catch {
      // Same as above — the session works, it just won't survive.
    }
  },
  { deep: true },
)

export const isSpent = (id) => spent.has(id)

export function spendLifeline(id) {
  spent.add(id)
}

export const lifelinesLeft = computed(
  () => lifelines.length - [...spent].length,
)

// Which lifeline modal is on screen, if any. Lives here rather than in
// SongView because the overlay is rendered at app level — a Teleport inside a
// route component breaks when the route Transition remounts it.
export const activeLifeline = ref(null)
// Which song it was spent on, so the outcome can be written back to it.
export const activeSongId = ref(null)

export function openLifelineModal(lifeline, songId) {
  activeLifeline.value = lifeline
  activeSongId.value = songId
}

export function closeLifelineModal() {
  activeLifeline.value = null
  activeSongId.value = null
}

// Records how the guess went. First answer only — re-checking would let him
// grind through spellings until the artist falls out.
export function recordHint(songId, lifelineId, correct) {
  const it = entry(songId)
  if (it.hints.some((h) => h.id === lifelineId)) return
  it.hints.push({ id: lifelineId, correct })
}

export function resetAll() {
  for (const id of Object.keys(state)) delete state[id]
  spent.clear()
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(LIFELINE_KEY)
  } catch {
    // Nothing to do — the in-memory reset above already took effect.
  }
}
