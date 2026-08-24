import { ref, onBeforeUnmount } from 'vue'

const STALL_TIMEOUT = 8000
const FALLBACK_DURATION = 5 // clips are all 5s; only used if metadata is late

// A single piece of audio. Kept deliberately small: one Audio element per
// source, so the distorted, real and full-length tracks never fight over
// playback state.
//
// The element is created lazily on first play. On iOS an Audio element only
// becomes playable if the first play() happens inside a user gesture, and
// creating it up front doesn't help — so we build it on the tap itself.
//
// Options:
//   resume            play() picks up where a pause left off instead of
//                     restarting. For the 5s clips restarting is what you
//                     want; for a full 3-minute track it isn't.
//   fallbackDuration  what to divide by while the real duration is still
//                     unknown. `null` means don't guess — right for a track
//                     whose length we don't know up front.
//
// The returned startScrub/scrubTo/endScrub trio lets a caller drag the
// playback position around; see the Scrubbing section below.
export function useClip(src, { resume = false, fallbackDuration = FALLBACK_DURATION } = {}) {
  const playing = ref(false)
  const loading = ref(false)
  const error = ref(false)
  const progress = ref(0) // 0..1 through the clip, for the button fill
  const duration = ref(0) // seconds, 0 until the metadata lands

  let el = null
  let raf = null
  let destroyed = false
  let scrubbing = false // while true the fill belongs to the finger, not playback
  let pendingSeek = null // a scrub that landed before the audio was ready

  const clamp01 = (n) => Math.min(Math.max(Number(n) || 0, 0), 1)

  // Where the fill should sit for the current playback position.
  function fillFromPlayback() {
    if (!el) return 0
    const total = duration.value || fallbackDuration
    // No duration and nothing sane to assume — hold the fill where it is
    // rather than sweeping it to the end against a made-up length.
    if (!total) return progress.value
    return clamp01(el.currentTime / total)
  }

  // 'timeupdate' only fires about four times a second, which visibly steps on
  // a clip this short — so drive the bar off the frame loop instead.
  function tick() {
    if (!el) return
    if (!scrubbing) progress.value = fillFromPlayback()
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
    // Both events: 'loadedmetadata' is the usual source, but a stream whose
    // length is refined later only reports it through 'durationchange'.
    const noteDuration = () => {
      if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
      duration.value = el.duration
      applyPendingSeek()
    }
    el.addEventListener('loadedmetadata', noteDuration)
    el.addEventListener('durationchange', noteDuration)
    el.addEventListener('ended', () => {
      playing.value = false
      stopTicking()
    })
    el.addEventListener('pause', () => {
      playing.value = false
      // A resumable track keeps its fill while paused, so picking it back up
      // reads as one continuous listen.
      stopTicking(!resume)
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
      // A resumable track only rewinds once it has run to the end.
      if (!resume || audio.ended) audio.currentTime = 0
      // A drag that happened before this element existed wins over both — it's
      // the most recent thing he asked for.
      applyPendingSeek()
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

  // --- Scrubbing -------------------------------------------------------------
  // A drag, driven by the caller: startScrub() takes the fill away from
  // playback, scrubTo() moves it under the finger, and endScrub() commits the
  // position to the audio. Nothing is seeked until the finger lifts — seeking
  // continuously through an mp3 stutters and can stall the stream.

  function applyPendingSeek() {
    if (pendingSeek === null || !el || !duration.value) return
    el.currentTime = pendingSeek * duration.value
    pendingSeek = null
  }

  function startScrub() {
    scrubbing = true
  }

  function scrubTo(fraction) {
    progress.value = clamp01(fraction)
  }

  function endScrub(fraction) {
    const at = clamp01(fraction)
    progress.value = at
    scrubbing = false
    // Nothing has been fetched yet — don't start a download off a drag alone.
    // Remember the spot and let the next play() jump to it.
    if (!el || !duration.value) {
      pendingSeek = at
      return
    }
    el.currentTime = at * duration.value
  }

  // The browser took the gesture over (a vertical pan, say) — hand the fill
  // back to playback without moving the audio.
  function cancelScrub() {
    scrubbing = false
    progress.value = fillFromPlayback()
  }

  // Leaves the position alone, so a later play() resumes from here.
  function pause() {
    if (el) el.pause()
  }

  async function toggle() {
    if (playing.value) {
      pause()
      return false
    }
    return play()
  }

  function stop() {
    // Before the early return: a drag can leave a fill and a pending seek on a
    // track that was never played, and stopping has to clear those too.
    pendingSeek = null
    scrubbing = false
    if (!el) {
      stopTicking()
      return
    }
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

  return {
    play,
    prime,
    pause,
    toggle,
    stop,
    startScrub,
    scrubTo,
    endScrub,
    cancelScrub,
    playing,
    loading,
    error,
    progress,
    duration,
  }
}
