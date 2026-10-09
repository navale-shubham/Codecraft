import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { citizenAPI } from '../api/citizen'
import { departmentAPI } from '../api/department'
import { fieldStaffAPI } from '../api/fieldStaff'
import { organizationAPI } from '../api/organization'
import { getSession, login as requestLogin, logout as clearSession, saveSession } from '../services/authService'
import { redirectForRole } from '../config/roles'
import { getApiErrorMessage } from '../utils/apiErrors'

const AuthContext = createContext(null)
const ROLE_ENDPOINTS = {
  CITIZEN: () => citizenAPI.getCitizenProfile(),
  ORG_ADMIN: () => organizationAPI.getDashboard(),
  DEPARTMENT_STAFF: () => departmentAPI.getDashboard(),
  FIELD_STAFF: () => fieldStaffAPI.getAssignedIssues(),
}
const ACCOUNT_TYPE_MISMATCH = 'The selected account type does not match this account.'

function getTokenDisplayClaims(token) {
  try {
    const payload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    if (!payload) return {}
    const binary = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='))
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes))
    return {
      id: claims.sub || '',
      name: claims.name || claims.full_name || claims.email || 'User',
      email: claims.email || '',
    }
  } catch {
    return { id: '', name: 'User', email: '' }
  }
}

function getProfileFromResponse(response) {
  const data = response?.data
  const candidate = response?.user || response?.profile || data?.user || data?.profile || data?.data?.user || data?.data?.profile || data?.data || data || response
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null
  const hasProfileFields = ['id', 'user_id', 'sub', 'name', 'full_name', 'email'].some((key) => candidate[key])
  return hasProfileFields ? candidate : null
}

function profileErrorMessage(error) {
  if (error.response?.status === 403) return ACCOUNT_TYPE_MISMATCH
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  return getApiErrorMessage(error, "Your account was authenticated, but we couldn't load your account profile.")
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  const resolveSessionRole = useCallback(async (tokenSession) => {
    if (!Object.hasOwn(ROLE_ENDPOINTS, tokenSession.accountType)) {
      throw new Error('Your account was authenticated, but the server did not provide an account role.')
    }
    const endpoint = ROLE_ENDPOINTS[tokenSession.accountType]

    let response
    try {
      response = await endpoint()
    } catch (error) {
      throw new Error(profileErrorMessage(error), { cause: error })
    }

    if (response?.success === false) {
      throw new Error(response.message || 'The server did not confirm this account type.')
    }

    const citizenUser = response?.data?.role ? response.data : response?.role ? response : null
    if (tokenSession.accountType === 'CITIZEN' && citizenUser?.role !== 'CITIZEN') {
      throw new Error(ACCOUNT_TYPE_MISMATCH)
    }

    const user = tokenSession.accountType === 'CITIZEN'
      ? citizenUser
      : { ...getTokenDisplayClaims(tokenSession.access_token), ...(getProfileFromResponse(response) || {}) }
    const authenticatedSession = {
      ...tokenSession,
      user: { ...user, role: tokenSession.accountType },
    }

    saveSession(authenticatedSession)
    setSession(authenticatedSession)
    setProfileError('')
    return authenticatedSession
  }, [])

  useEffect(() => {
    let active = true
    const restore = async () => {
      const saved = getSession()
      if (!saved?.access_token || !saved?.accountType) {
        clearSession()
        setSession(null)
        setLoading(false)
        return
      }

      const tokenSession = {
        access_token: saved.access_token,
        token_type: saved.token_type || 'bearer',
        accountType: saved.accountType,
      }
      setSession(tokenSession)
      try {
        await resolveSessionRole(tokenSession)
      } catch (error) {
        clearSession()
        setSession(null)
        if (active) setProfileError(error.message || profileErrorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    }

    restore()
    const handleUnauthorized = () => {
      clearSession()
      setSession(null)
      setProfileError('Your session has expired. Please sign in again.')
      setLoading(false)
    }
    window.addEventListener('civicconnect:unauthorized', handleUnauthorized)
    return () => {
      active = false
      window.removeEventListener('civicconnect:unauthorized', handleUnauthorized)
    }
  }, [resolveSessionRole])

  const login = async (username, password, accountType) => {
    clearSession()
    setSession(null)
    setLoading(true)
    setProfileError('')
    let tokenObtained = false
    try {
      const tokenSession = { ...(await requestLogin(username, password)), accountType }
      tokenObtained = true
      saveSession(tokenSession)
      setSession(tokenSession)
      return await resolveSessionRole(tokenSession)
    } catch (error) {
      if (tokenObtained) {
        clearSession()
        setSession(null)
        setProfileError(error.message || profileErrorMessage(error))
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const retryProfile = async (accountType) => {
    const saved = getSession()
    if (!saved?.access_token) {
      setProfileError('Please sign in again to continue.')
      return
    }
    setLoading(true)
    try {
      if (accountType !== saved.accountType) throw new Error(ACCOUNT_TYPE_MISMATCH)
      const tokenSession = {
        access_token: saved.access_token,
        token_type: saved.token_type || 'bearer',
        accountType: saved.accountType,
      }
      return await resolveSessionRole(tokenSession)
    } catch (error) {
      clearSession()
      setSession(null)
      setProfileError(error.message || profileErrorMessage(error))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearSession()
    setSession(null)
    setProfileError('')
  }

  const updateUser = (updates) => {
    setSession((current) => {
      if (!current?.user) return current
      const next = { ...current, user: { ...current.user, ...updates, role: current.user.role } }
      saveSession(next)
      return next
    })
  }

  const user = session?.user || null
  const role = user?.role
  const value = {
    user,
    currentUser: user,
    token: session?.access_token || null,
    accountType: session?.accountType || '',
    role: role || null,
    isAuthenticated: Boolean(session?.access_token && session.accountType === role && Object.hasOwn(redirectForRole, role)),
    loading,
    profileError,
    login,
    retryProfile,
    logout,
    updateUser,
    redirectForRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
