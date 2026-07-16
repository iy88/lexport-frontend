import axios from 'axios';

const apiFile = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

apiFile.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiFile;
