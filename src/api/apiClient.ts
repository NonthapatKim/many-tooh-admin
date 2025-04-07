import axios from 'axios'; 

const apiClient = axios.create({
  baseURL: "https://many-tooh-backend-api-359586997523.asia-southeast1.run.app/api/v1",
  withCredentials: true,
});

export default apiClient;
