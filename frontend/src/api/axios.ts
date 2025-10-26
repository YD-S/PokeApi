import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[Backend Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        console.log('[Response]', response.status, response.config.url)
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized! Redirecting to login...')
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error)
    }
)

export default api
