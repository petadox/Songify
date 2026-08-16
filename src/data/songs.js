// The 30 songs, in the order they appear in the grid.
//
// `artist` is filled in as the posters are reviewed — the poster art already
// shows it, so it's only used as a text label on the reveal screen.
// Assets live in public/songs/<id>/: cover.jpg (the full poster, shown on
// reveal), blur.jpg (the obscured teaser in the song view), back.jpg (the
// numbered card back used as the grid tile), plus distorted.mp3 and real.mp3.
// Run scripts/import-images.sh to regenerate the images.

const RAW = [
  ['01', 'More Than You Know', 'Axwell Λ Ingrosso'],
  ['02', 'Levels', ''],
  ['03', 'Firestone', ''],
  ['04', 'Tell Me Why', ''],
  ['05', 'Moth To A Flame', ''],
  ['06', 'Heroes', ''],
  ['07', 'Destination Calabria', ''],
  ['08', 'Blinding Lights', ''],
  ['09', 'One', ''],
  ['10', 'The Business', ''],
  ['11', 'If I Lose Myself', ''],
  ['12', 'Watch The Sunrise', ''],
  ['13', 'Stereo Love', ''],
  ['14', 'Save The World', ''],
  ['15', 'Starboy', ''],
  ['16', 'Infinity', ''],
  ['17', 'Clarity', ''],
  ['18', 'Remember', ''],
  ['19', 'Wake Me Up', ''],
  ['20', 'One Kiss', ''],
  ['21', 'Seek Bromance', ''],
  ['22', 'Save Your Tears', ''],
  ['23', "Don't You Worry Child", ''],
  ['24', 'Leave The World Behind', ''],
  ['25', 'I Wanna Know', ''],
  ['26', 'Love Is Gone', ''],
  ['27', 'Call On Me', ''],
  ['28', 'Waiting For Love', ''],
  ['29', "It Ain't Me", ''],
  ['30', "I'm Good", ''],
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
}))

export function findSong(id) {
  return songs.find((song) => song.id === id)
}

// Posters are 1084x1508 in print; every card and image uses this ratio.
export const COVER_RATIO = '1084 / 1508'
