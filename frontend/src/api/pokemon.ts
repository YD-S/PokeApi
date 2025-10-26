import api from './axios';

export const getOptions = () => api.get('/pokemon/options');
export const createWithPrompt = (data: { name: string; prompt: string }) =>
    api.post('/pokemon/prompt', data);
export const createComposed = (data: { name: string; animals: string[]; abilities: string[] }) =>
    api.post('/pokemon/compose', data);
export const getUserPokemons = () => api.get('/pokemon');
export const getPokemon = (id: number) => api.get(`/pokemon/${id}`);
export const toggleVisibility = (id: number, isPublic: boolean) =>
    api.patch(`/pokemon/${id}/visibility`, { isPublic });
export const deletePokemon = (id: number) => api.delete(`/pokemon/${id}`);
