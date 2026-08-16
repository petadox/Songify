<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main>
    <h1>Hello World 👋</h1>
    <p>Songify — Vue 3 + Vite, hosted on GitHub Pages.</p>
    <button type="button" @click="count++">Clicked {{ count }} times</button>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
}

h1 {
  font-size: 3rem;
  margin: 0;
}

p {
  margin: 0;
  opacity: 0.7;
}
</style>
