import axios from 'axios'

const api = axios.create({
    baseURL: 'http://stable-diffusion.42malaga.com:7860',
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`)

        return config
    },
    (error) => {
        console.error('[Request Error]', error)
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        console.log('[Response]', response.status, response.config.url)
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized! Redirecting to login...')
        }

        console.error('[Response Error]', error.response || error.message)

        return Promise.reject(error)
    }
)

export default api
