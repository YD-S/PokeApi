import api from './axios';

export const register = (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
    api.post('/auth/login', data);

export const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
};

export const refreshToken = (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken });

export const logout = (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken });
