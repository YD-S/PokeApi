import axios from 'axios'
import {useAuthStore} from "@/store/auth.ts";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) config.headers.Authorization = `Bearer ${token}`
        console.log(`[Backend Request] ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => {
        console.log('[Response]', response.status, response.config.url)
        return response
    },
    async (error) => {
        const originalRequest = error.config
        const refreshToken = localStorage.getItem('refreshToken')
        const auth = useAuthStore()

        if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                console.log('🔁 Attempting token refresh...')
                await auth.refreshTokens();
                api.defaults.headers.Authorization = `Bearer ${auth.accessToken}`
                processQueue(null, auth.accessToken)

                console.log('✅ Token refreshed, retrying request...')
                return api(originalRequest)
            } catch (err) {
                console.warn('❌ Token refresh failed. Redirecting to login...')
                processQueue(err, null)
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        if (error.response?.status === 401) {
            localStorage.clear()
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default api
