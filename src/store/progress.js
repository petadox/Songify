import { reactive, computed } from 'vue'
import { songs } from '../data/songs'

export const MAX_PLAYS = 3

// One entry per song the player has touched:
//   plays    how many times the distorted clip has been started
//   revealed whether "Resolver" has been pressed
//   result   'correct' | 'wrong', set once he says whether he got it
//
// In-memory only for now; iteration 3 hydrates this from localStorage and
// writes it back, without the rest of the app changing.
const state = reactive({})

function entry(id) {
  if (!state[id]) {
    state[id] = { plays: 0, revealed: false, result: null }
  }
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
