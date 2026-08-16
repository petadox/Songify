import { ref, onBeforeUnmount } from 'vue'

const STALL_TIMEOUT = 8000
const FALLBACK_DURATION = 5 // clips are all 5s; only used if metadata is late

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
  const progress = ref(0) // 0..1 through the clip, for the button fill

  let el = null
  let raf = null
  let destroyed = false

  // 'timeupdate' only fires about four times a second, which visibly steps on
  // a clip this short — so drive the bar off the frame loop instead.
  function tick() {
    if (!el) return
    const total = Number.isFinite(el.duration) && el.duration > 0
      ? el.duration
      : FALLBACK_DURATION
    progress.value = Math.min(el.currentTime / total, 1)
    raf = requestAnimationFrame(tick)
  }

  function startTicking() {
    if (raf === null) raf = requestAnimationFrame(tick)
  }

  function stopTicking(reset = true) {
    if (raf !== null) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (reset) progress.value = 0
  }

  function ensure() {
    if (el) return el
    el = new Audio(src)
    el.preload = 'auto'
    el.addEventListener('ended', () => {
      playing.value = false
      stopTicking()
    })
    el.addEventListener('pause', () => {
      playing.value = false
      stopTicking()
    })
    el.addEventListener('playing', () => {
      playing.value = true
      loading.value = false
      startTicking()
    })
    el.addEventListener('waiting', () => (loading.value = true))
    el.addEventListener('error', () => {
      error.value = true
      loading.value = false
      playing.value = false
      stopTicking()
    })
    return el
  }

  // Resolves true if playback actually started, so the caller only spends one
  // of the three attempts on a clip that really played.
  // Play once, silently, to satisfy the mobile autoplay rules: iOS only lets
  // an element start programmatically after it has been played from inside a
  // user gesture. Call this synchronously in the handler, then a later play()
  // — after an await, or on a timer — is allowed.
  function prime() {
    if (destroyed) return
    const audio = ensure()
    audio.muted = true
    Promise.resolve(audio.play())
      .then(() => {
        audio.pause()
        audio.currentTime = 0
      })
      .catch(() => {})
      .finally(() => {
        audio.muted = false
      })
  }

  async function play() {
    if (destroyed) return false
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
      startTicking()
      return true
    } catch {
      // Autoplay refusal, decode failure or a stall — don't burn an attempt.
      audio.pause()
      loading.value = false
      playing.value = false
      error.value = true
      stopTicking()
      return false
    }
  }

  function stop() {
    if (!el) return
    el.pause()
    el.currentTime = 0
    stopTicking()
  }

  onBeforeUnmount(() => {
    // Latched so a queued play() can't resurrect the element after the view is
    // gone and leave audio playing over the next screen.
    destroyed = true
    stopTicking()
    if (!el) return
    el.pause()
    el.src = ''
    el = null
  })

  return { play, prime, stop, playing, loading, error, progress }
}
