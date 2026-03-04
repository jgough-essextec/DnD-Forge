import axios from 'axios'

/**
 * Read a cookie value by name from document.cookie.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor: attach the CSRF token from the cookie to mutating requests.
 * Django sets the csrftoken cookie; we read it and send it back in the X-CSRFToken header.
 */
api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()
  if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrfToken = getCookie('csrftoken')
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  return config
})
