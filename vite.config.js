import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// `base` must match the GitHub Pages path. For a project site served at
// https://<user>.github.io/Songify/ that is '/Songify/'. The CI workflow
// overrides it via BASE_PATH so renaming the repo doesn't break the build.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Songify/',
  plugins: [vue()],
})
