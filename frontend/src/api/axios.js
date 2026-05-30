import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8082/api',
});

// We will inject the toast function from a central place or handle it via events
// For now, let's set up a global event bus or use a simpler approach
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }

    if (error.config?.meta?.suppressGlobalErrorToast) {
      return Promise.reject(error);
    }

    // Don't show toast for 403 Forbidden (role-based auth failures) - let component handle it
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || error.message;
    const event = new CustomEvent('api-error', { detail: { message, status: error.response?.status } });
    window.dispatchEvent(event);
    
    return Promise.reject(error);
  }
);

export default apiClient;
