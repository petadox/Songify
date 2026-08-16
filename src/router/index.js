import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SongView from '../views/SongView.vue'

// Hash history: GitHub Pages serves static files only, so /song/7 would 404 on
// a hard refresh. /#/song/7 never hits the server.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/song/:id', name: 'song', component: SongView, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    return saved ?? { top: 0 }
  },
})
