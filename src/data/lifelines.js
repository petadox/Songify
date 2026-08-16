// Three lifelines, each spendable once across the whole game.
//
// EVERYTHING BELOW IS PLACEHOLDER CONTENT. The sounds are generated sine tones
// and the images are ffmpeg test patterns, both there only to prove the layout.
// Replace the files in public/lifelines/ and the `heading`/`body` copy here.
//
// `image` is optional — "maricon" deliberately has none, so both the
// with-image and text-only layouts are visible in the prototype.

const base = import.meta.env.BASE_URL

export const lifelines = [
  {
    id: 'noches',
    label: 'Buenas noches, arriba España',
    audio: `${base}lifelines/noches.mp3`,
    image: `${base}lifelines/noches.jpg`,
    heading: 'Buenas noches, arriba España',
    body: 'Texto de ejemplo para esta pista. Aquí irá la ayuda real: una frase, un dato o lo que quieras contarle.',
  },
  {
    id: 'maricon',
    label: 'Maricooooon',
    audio: `${base}lifelines/maricon.mp3`,
    image: null,
    heading: 'Maricooooon',
    body: 'Esta pista no lleva imagen, sólo texto, para ver cómo queda el modal sin foto. Cambia este contenido cuando lo tengas decidido.',
  },
  {
    id: 'mujeres',
    label: 'En fin, mujeres',
    audio: `${base}lifelines/mujeres.mp3`,
    image: `${base}lifelines/mujeres.jpg`,
    heading: 'En fin, mujeres',
    body: 'Otro texto de relleno. La imagen de arriba es una carta de ajuste de ffmpeg, así que no te asustes.',
  },
]

export const findLifeline = (id) => lifelines.find((l) => l.id === id)
