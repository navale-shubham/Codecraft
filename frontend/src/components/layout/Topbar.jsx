import { Bell, Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'

function initials(name) {
  return name ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'U'
}

export default function Topbar({ onMenu, title = 'Overview' }) {
  const { currentUser, role } = useAuth()
  const location = [currentUser?.address?.city, currentUser?.address?.state].filter(Boolean).join(', ') || currentUser?.location || 'Location not set'
  const name = currentUser?.fullName || currentUser?.name || 'Your account'
  const profilePath = role === 'CITIZEN' ? '/citizen/profile' : '/profile'
  const notificationsPath = role === 'CITIZEN' ? '/citizen/notifications' : null

  return <header className="topbar">
    <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
    <div><p className="topbar-kicker">{location}</p><h1>{title}</h1></div>
    <div className="topbar-actions">
      <label className="topbar-search"><Search size={16} /><input placeholder="Search" aria-label="Search" /></label>
      {notificationsPath && <Link className="icon-button notification-link" to={notificationsPath} aria-label="Notifications"><Bell size={19} /></Link>}
      <Link to={profilePath} className="topbar-user"><Avatar initials={initials(name)} /><span><strong>{name}</strong><small>{role || 'Account'}</small></span></Link>
    </div>
  </header>
}
