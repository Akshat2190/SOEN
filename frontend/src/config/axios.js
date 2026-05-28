import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
})

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

export default axiosInstance;
