import axios from 'axios'

const API_BASE_URL = 'https://codecraft.fastapicloud.dev/api/v1'
const BACKEND_URL = 'https://codecraft.fastapicloud.dev'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
})

// Request interceptor to add token
client.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token.replace(/^(?:Bearer\s+)+/i, '')}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle common errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/auth/login')) {
      localStorage.removeItem('civicconnect_auth')
      window.dispatchEvent(new Event('civicconnect:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export function getAuthToken() {
  try {
    const session = JSON.parse(localStorage.getItem('civicconnect_auth') || '{}')
    return session.access_token || null
  } catch {
    return null
  }
}

export function getBackendURL() {
  return BACKEND_URL
}

export function getMediaURL(filePath) {
  if (!filePath) return null
  try {
    const url = new URL(filePath, `${BACKEND_URL}/`)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

export default client
