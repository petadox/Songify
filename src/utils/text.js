// Shared normalisation for anything the player types.
//
// Lowercases, strips accents, and drops punctuation so the answer only has to
// be right in substance. Apostrophes are deleted rather than turned into a
// space — phone keyboards produce ’ where a laptop produces ', and "dont"
// should still match "Don't".
export function normalise(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // combining marks left by NFD
    .toLowerCase()
    .replace(/['’‘`´]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // other punctuation splits words
    .trim()
    .replace(/\s+/g, ' ')
}
