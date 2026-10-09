import { NavLink } from 'react-router-dom'
import { navigation } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'

export default function MobileNavigation() {
  const { role } = useAuth()
  const items = (navigation[role] || []).slice(0, 4)
  return <nav className="mobile-navigation">{items.map(({ label, path, icon: Icon }) => <NavLink to={path} key={path}><Icon size={18} />{label}</NavLink>)}</nav>
}
