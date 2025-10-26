import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Dashboard from '../pages/Dashboard.vue'
import CreatePokemon from '../pages/CreatePokemon.vue'
import PublicPokemon from '../pages/PublicPokemon.vue'

const routes: RouteRecordRaw[] = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/create', component: CreatePokemon, meta: { requiresAuth: true } },
    { path: '/pokemon/:id', component: PublicPokemon },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.accessToken) {
        return '/login'
    }
})

export default router
