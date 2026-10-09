import { authAPI } from '../api/auth'
import { getApiErrorMessage } from '../utils/apiErrors'
import { redirectForRole } from '../config/roles'

const AUTH_KEY = 'civicconnect_auth'

export async function login(username, password) {
  try {
    const response = await authAPI.login(username, password)
    if (!response?.access_token) {
      throw new Error('Login failed: Invalid response from server')
    }

    const session = {
      access_token: response.access_token,
      token_type: response.token_type || 'bearer',
      user: null,
    }
    saveSession(session)
    return session
  } catch (error) {
    const status = error.response?.status
    const message = status === 401
      ? 'Invalid username or password.'
      : status === 403
        ? 'You are not authorized to access this account type.'
        : status >= 500
          ? 'Server error. Please try again later.'
          : getApiErrorMessage(error, error.response?.data?.error_code || 'Login failed. Please try again.')
    throw new Error(message)
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))?.user || null
  } catch {
    return null
  }
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const session = getSession()
  const role = session?.user?.role
  return Boolean(session?.access_token && session.accountType === role && Object.hasOwn(redirectForRole, role))
}

export function getToken() {
  return getSession()?.access_token || null
}

export function saveSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}
