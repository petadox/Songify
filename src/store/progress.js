import { reactive, computed, watch } from 'vue'
import { songs } from '../data/songs'

export const MAX_PLAYS = 3

const KEY = 'eongify.progress.v1'
const RESULTS = ['correct', 'wrong']

// One entry per song the player has touched:
//   plays    how many times the distorted clip has been started
//   revealed whether "Resolver" has been pressed
//   result   'correct' | 'wrong', set once he says whether he got it

function blank() {
  return { plays: 0, revealed: false, result: null }
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
      if (it.plays > 0 || it.revealed || it.result) touched[id] = it
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

export const summary = computed(() => {
  const done = songs.filter((s) => state[s.id]?.result)
  return {
    played: done.length,
    correct: done.filter((s) => state[s.id].result === 'correct').length,
  }
})

export function resetAll() {
  for (const id of Object.keys(state)) delete state[id]
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to do — the in-memory reset above already took effect.
  }
}
