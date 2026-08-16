<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <!-- Keyed on the route so going straight from one song to another
           remounts rather than reusing stale clip state. -->
      <component :is="Component" :key="$route.fullPath" />
    </Transition>
  </RouterView>
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
