import { ref, onBeforeUnmount } from 'vue'

const STALL_TIMEOUT = 8000

// A single 5s clip. Kept deliberately small: one Audio element per clip, so
// the distorted and real clips never fight over playback state.
//
// The element is created lazily on first play. On iOS an Audio element only
// becomes playable if the first play() happens inside a user gesture, and
// creating it up front doesn't help — so we build it on the tap itself.
export function useClip(src) {
  const playing = ref(false)
  const loading = ref(false)
  const error = ref(false)

  let el = null

  function ensure() {
    if (el) return el
    el = new Audio(src)
    el.preload = 'auto'
    el.addEventListener('ended', () => (playing.value = false))
    el.addEventListener('pause', () => (playing.value = false))
    el.addEventListener('playing', () => {
      playing.value = true
      loading.value = false
    })
    el.addEventListener('waiting', () => (loading.value = true))
    el.addEventListener('error', () => {
      error.value = true
      loading.value = false
      playing.value = false
    })
    return el
  }

  // Resolves true if playback actually started, so the caller only spends one
  // of the three attempts on a clip that really played.
  async function play() {
    const audio = ensure()
    try {
      audio.currentTime = 0
      loading.value = true
      error.value = false // clear any previous failure so a retry can succeed
      // play() stays pending indefinitely while the media is stalled, which
      // on a bad connection would leave the button stuck on "Cargando…".
      await Promise.race([
        audio.play(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('stalled')), STALL_TIMEOUT),
        ),
      ])
      // A resolved play() means playback has begun. Don't wait on the
      // 'playing' event alone — it never arrives on a device with no audio
      // output, which would strand the button on "Cargando…".
      loading.value = false
      playing.value = true
      return true
    } catch {
      // Autoplay refusal, decode failure or a stall — don't burn an attempt.
      audio.pause()
      loading.value = false
      playing.value = false
      error.value = true
      return false
    }
  }

  function stop() {
    if (!el) return
    el.pause()
    el.currentTime = 0
  }

  onBeforeUnmount(() => {
    if (!el) return
    el.pause()
    el.src = ''
    el = null
  })

  return { play, stop, playing, loading, error }
}
