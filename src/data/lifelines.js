// Three lifelines, each spendable once across the whole game.
//
// Each one plays its sound, shows a picture, and asks the player to name the
// person. `answers` lists every accepted spelling; matching is forgiving about
// case, accents and spacing (see `matchesAnswer`), so the first entry is just
// the canonical one.
//
// Assets live in public/lifelines/<id>.{mp3,jpg}. Filenames are kept ASCII —
// an accented name in a URL invites encoding problems.

const base = import.meta.env.BASE_URL

export const lifelines = [
  {
    id: 'espana',
    label: 'España',
    audio: `${base}lifelines/espana.mp3`,
    image: `${base}lifelines/espana.jpg`,
    body: 'Nombre del ilustre cardiólogo',
    answers: ['Jordi', 'Jordi el niño polla'],
  },
  {
    id: 'maricon',
    label: 'Maricon',
    audio: `${base}lifelines/maricon.mp3`,
    image: `${base}lifelines/maricon.jpg`,
    body: 'Nombre del exitoso influencer',
    answers: ['Aless', 'Aless Gibaja'],
  },
  {
    id: 'mujeres',
    label: 'Mujeres',
    audio: `${base}lifelines/mujeres.mp3`,
    image: `${base}lifelines/mujeres.jpg`,
    body: 'Nombre de la reputada abogada',
    answers: ['Mia', 'Mia Khalifa'],
  },
]

// Lowercase, strip accents, collapse inner whitespace. Means "MIA KHALIFA",
// "mia  khalifa" and "jordi el nino polla" all count.
function normalise(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // combining marks left by NFD
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function matchesAnswer(lifeline, guess) {
  if (!guess?.trim()) return false
  const attempt = normalise(guess)
  return lifeline.answers.some((a) => normalise(a) === attempt)
}

export const findLifeline = (id) => lifelines.find((l) => l.id === id)
