import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 15000,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || '';
        const isAuthenticationForm = requestUrl.includes('/auth/login')
            || requestUrl.includes('/auth/register')
            || requestUrl.includes('/auth/me');

        if (error.response?.status === 401 && !isAuthenticationForm) {
            window.dispatchEvent(new Event('auth:session-expired'));
        }
        return Promise.reject(error);
    }
)

export default api;