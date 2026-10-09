import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import Skeleton from '../../components/common/Skeleton'

function initials(name) {
  return name ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'CU'
}

function Info({ label, value }) {
  return (
    <div className="profile-info">
      <small>{label}</small>
      <strong>{value || 'Not set'}</strong>
    </div>
  )
}

export default function CitizenProfile() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div>
        <Link to="/citizen/dashboard" className="back-link">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
        <div className="profile-header surface">
          <Skeleton />
        </div>
        <div className="profile-grid">
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="surface">
        <p className="muted">Profile information not available</p>
        <Link to="/citizen/dashboard" className="text-button">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const displayName = user.name || user.full_name || 'Name not available'
  const address = typeof user.address === 'string'
    ? user.address
    : [user.address?.house_no, user.address?.street, user.address?.area, user.address?.city, user.address?.state, user.address?.pincode].filter(Boolean).join(', ')

  return (
    <div>
      <Link to="/citizen/dashboard" className="back-link">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="profile-header surface">
        <Avatar initials={initials(displayName)} size="lg" />
        <div>
          <p className="eyebrow">Citizen profile</p>
          <h2>{displayName}</h2>
          <p className="muted">{user.role || 'Citizen'} · {user.id || 'Citizen ID'}</p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="surface profile-panel">
          <h3>Personal information</h3>
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Citizen ID" value={user.id} />
          {user.phone && <Info label="Phone" value={user.phone} />}
        </section>

        <section className="surface profile-panel">
          <h3>Address information</h3>
          {address ? (
            <>
              <Info label="Address" value={address} />
            </>
          ) : (
            <p className="muted">Address information not provided</p>
          )}
        </section>

        <section className="surface profile-panel">
          <h3>Account information</h3>
          <Info label="Account type" value="Citizen" />
          <Info label="Role" value={user.role} />
          {user.created_at && <Info label="Registration date" value={new Date(user.created_at).toLocaleDateString()} />}
          {user.updated_at && <Info label="Last updated" value={new Date(user.updated_at).toLocaleDateString()} />}
        </section>
      </div>

      <div className="profile-note">
        <p>The current backend API does not provide a profile update endpoint.</p>
      </div>
    </div>
  )
}

