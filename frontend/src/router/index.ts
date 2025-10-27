import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Dashboard from '../pages/Dashboard.vue'
import CreatePokemon from '../pages/CreatePokemon.vue'
import PublicPokemon from '../pages/PublicPokemon.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        component: Login,
        meta: { title: 'Login - PokéAPI Creator' }
    },
    {
        path: '/register',
        component: Register,
        meta: { title: 'Register - PokéAPI Creator' }
    },
    {
        path: '/',
        component: Dashboard,
        meta: { requiresAuth: true, title: 'Dashboard - PokéAPI Creator' }
    },
    {
        path: '/create',
        component: CreatePokemon,
        meta: { requiresAuth: true, title: 'Create Pokémon - PokéAPI Creator' }
    },
    {
        path: '/pokemon/:id',
        component: PublicPokemon,
        meta: { title: 'View Pokémon - PokéAPI Creator' }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()

    if (to.meta.title) {
        document.title = to.meta.title as string
    }

    if (to.meta.requiresAuth && !auth.accessToken) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && auth.accessToken) {
        next('/')
    } else {
        next()
    }
})

export default router