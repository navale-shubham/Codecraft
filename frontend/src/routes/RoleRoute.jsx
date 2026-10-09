import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ roles, allowedRoles, children }) {
  const { role } = useAuth()
  const permitted = roles || allowedRoles || []
  if (!role) {
    return <main className="page-container page-message"><h1>Account role unavailable</h1><p className="muted">The server authenticated this account but did not provide a role. Ask your administrator to confirm the account setup.</p><Link className="btn btn-secondary" to="/login">Return to sign in</Link></main>
  }
  const fallback = role === 'FIELD_STAFF' ? '/field-staff/dashboard' : role === 'ORG_ADMIN' ? '/organization/dashboard' : role === 'CITIZEN' ? '/citizen/dashboard' : role === 'DEPARTMENT_STAFF' ? '/department/dashboard' : null
  if (!fallback) return <main className="page-container page-message"><h1>Unrecognized account role</h1><p className="muted">This account role is not supported by the application.</p><Link className="btn btn-secondary" to="/login">Return to sign in</Link></main>
  return permitted.includes(role) ? (children || <Outlet />) : <Navigate to={fallback} replace />
}
