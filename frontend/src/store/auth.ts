import { defineStore } from 'pinia'
import api from '../api/axios'

interface User {
    id: number
    name: string
    email: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
    }),

    actions: {
        async login(email: string, password: string) {
            const { data } = await api.post('/auth/login', { email, password })
            this.accessToken = data.accessToken
            this.refreshToken = data.refreshToken
            this.user = data.user

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
        },

        async register(name: string, email: string, password: string) {
            const { data } = await api.post('/auth/register', { name, email, password })
            this.accessToken = data.accessToken
            this.refreshToken = data.refreshToken
            this.user = { id: data.userId, name, email }

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
        },

        async logout() {
            await api.post('/auth/logout', {
                refreshToken: this.refreshToken,
            })
            this.user = null
            this.accessToken = null
            this.refreshToken = null
            localStorage.clear()
            window.location.href = '/login'
        },
    },
})
