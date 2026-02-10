import axios, { AxiosInstance } from 'axios'

const API_URL = 'http://localhost:3001/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('✅ API configured with baseURL:', API_URL)

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('📤 Request:', config.method?.toUpperCase(), config.baseURL + config.url)
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
