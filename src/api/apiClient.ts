import axios from 'axios'; 

if (!window.__APP_CONFIG__?.BASE_API) {
  console.warn("BASE_API not defined in runtime config!");
}

const baseURL = window.__APP_CONFIG__?.BASE_API

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export default apiClient;
