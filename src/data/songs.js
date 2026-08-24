// The 30 songs, in the order they appear in the grid.
//
// `artist` is filled in as the posters are reviewed — the poster art already
// shows it, so it's only used as a text label on the reveal screen.
// Assets live in public/songs/<id>/: cover.jpg (the full poster, shown on
// reveal), blur.jpg (the obscured teaser in the song view), back.jpg (the
// numbered card back used as the grid tile), plus distorted.mp3, real.mp3 and
// full.mp3 — the complete track, offered only after the reveal.
// Run scripts/import-images.sh to regenerate the images, and
// scripts/import-full.sh to refresh the full-length tracks.

import { normalise } from '../utils/text'

// Artists are transcribed from the credit line printed on each poster, so the
// reveal screen matches the physical card rather than the streaming credits
// (which often list extra featured artists).
const RAW = [
  ['01', 'More Than You Know', 'Axwell Λ Ingrosso'],
  ['02', 'Levels', 'Avicii'],
  ['03', 'Firestone', 'Kygo'],
  ['04', 'Tell Me Why', 'Supermode'],
  ['05', 'Moth To A Flame', 'Swedish House Mafia'],
  ['06', 'Heroes', 'Alesso'],
  ['07', 'Destination Calabria', 'Alex Gaudino'],
  ['08', 'Blinding Lights', 'The Weeknd'],
  ['09', 'One', 'Swedish House Mafia'],
  ['10', 'The Business', 'Tiësto'],
  ['11', 'If I Lose Myself', 'Alesso'],
  ['12', 'Watch The Sunrise', 'Axwell'],
  ['13', 'Stereo Love', 'Edward Maya'],
  ['14', 'Save The World', 'Swedish House Mafia'],
  ['15', 'Starboy', 'The Weeknd'],
  ['16', 'Infinity', 'Guru Josh'],
  ['17', 'Clarity', 'Zedd'],
  ['18', 'Remember', 'Steve Angello'],
  ['19', 'Wake Me Up', 'Avicii'],
  ['20', 'One Kiss', 'Calvin Harris'],
  ['21', 'Seek Bromance', 'Avicii'],
  ['22', 'Save Your Tears', 'The Weeknd'],
  ['23', "Don't You Worry Child", 'Swedish House Mafia'],
  ['24', 'Leave The World Behind', 'Swedish House Mafia'],
  ['25', 'I Wanna Know', 'Alesso'],
  ['26', 'Love Is Gone', 'David Guetta'],
  ['27', 'Call On Me', 'Eric Prydz'],
  ['28', 'Waiting For Love', 'Avicii'],
  ['29', "It Ain't Me", 'Kygo'],
  ['30', "I'm Good (Blue)", 'David Guetta'],
]

// Vite rewrites this to the deployed subpath (/Songify/) at build time.
const base = import.meta.env.BASE_URL

export const songs = RAW.map(([id, title, artist], index) => ({
  id,
  number: index + 1,
  title,
  artist,
  cover: `${base}songs/${id}/cover.jpg`,
  blur: `${base}songs/${id}/blur.jpg`,
  back: `${base}songs/${id}/back.jpg`,
  distortedAudio: `${base}songs/${id}/distorted.mp3`,
  realAudio: `${base}songs/${id}/real.mp3`,
  // ~3.5MB each, so nothing here is fetched until the player taps for it.
  fullAudio: `${base}songs/${id}/full.mp3`,
}))

export function findSong(id) {
  return songs.find((song) => song.id === id)
}

// Every spelling of a title we'll accept. Beyond the shared normalisation,
// the version without a parenthetical counts too — nobody types
// "I'm Good (Blue)" when "I'm Good" is the song.
function titleVariants(title) {
  const forms = new Set([normalise(title)])
  const withoutParens = title.replace(/\([^)]*\)/g, '')
  if (normalise(withoutParens)) forms.add(normalise(withoutParens))
  return forms
}

export function matchesTitle(song, guess) {
  if (!guess?.trim()) return false
  return titleVariants(song.title).has(normalise(guess))
}

// Posters are 1084x1508 in print; every card and image uses this ratio.
export const COVER_RATIO = '1084 / 1508'
