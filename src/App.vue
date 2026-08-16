<script setup>
import { watch } from 'vue'
import { lifelines } from './data/lifelines'
import { activeLifeline, closeLifelineModal } from './store/progress'
import { useClip } from './composables/useClip'
import LifelineModal from './components/LifelineModal.vue'

// The lifeline overlay and its sound live at app level, above the router, so
// they survive route changes and stay clear of the route Transition.
const clips = Object.fromEntries(
  lifelines.map((l) => [l.id, useClip(l.audio)]),
)

watch(activeLifeline, (now, before) => {
  if (before) clips[before.id].stop() // don't let it outlive its modal
  if (now) clips[now.id].play()
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <!-- Keyed on the route so going straight from one song to another
           remounts rather than reusing stale clip state. -->
      <component :is="Component" :key="$route.fullPath" />
    </Transition>
  </RouterView>

  <LifelineModal
    v-if="activeLifeline"
    :lifeline="activeLifeline"
    @close="closeLifelineModal"
  />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
