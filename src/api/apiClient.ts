import axios from 'axios'; 

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  withCredentials: true,
});

export default apiClient;
