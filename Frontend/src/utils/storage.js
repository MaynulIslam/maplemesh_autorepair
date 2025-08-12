export const getToken = () => localStorage.getItem('access_token');
export const setToken = t => localStorage.setItem('access_token', t);
export const clearToken = () => localStorage.removeItem('access_token');