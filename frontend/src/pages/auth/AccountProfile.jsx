import { Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import { redirectForRole } from '../../config/roles'

function initials(name) {
  return name ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'U'
}

function Info({ label, value }) {
  return <div className="profile-info"><small>{label}</small><strong>{value || 'Not available'}</strong></div>
}

export default function AccountProfile() {
  const { user, role } = useAuth()
  const name = user?.name || user?.full_name || 'Account'
  return <div>
    <div className="page-heading"><div><p className="eyebrow">Account</p><h2>Profile</h2><p className="muted">Details available from your authenticated session.</p></div></div>
    <section className="profile-header surface"><Avatar initials={initials(name)} size="lg" /><div><p className="eyebrow">{role || 'Account'}</p><h2>{name}</h2><p className="muted">{user?.email || 'Email not available'}</p></div></section>
    <section className="surface profile-panel"><h3>Account information</h3><Info label="Name" value={user?.name || user?.full_name} /><Info label="Email" value={user?.email} /><Info label="Account ID" value={user?.id || user?.sub} /><Info label="Role" value={role} /></section>
    <div className="profile-note"><p>The backend does not expose an account profile editing endpoint.</p></div>
    <Link to={redirectForRole[role] || '/login'} className="text-button">Back to dashboard</Link>
  </div>
}
