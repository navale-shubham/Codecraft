import { Link } from 'react-router-dom'
import { MapPinned } from 'lucide-react'
import Button from '../common/Button'
export default function PublicNavbar() { return <header className="public-nav"><Link to="/" className="brand"><span className="brand-icon"><MapPinned size={17} /></span><span>Civic<span>Connect</span></span></Link><nav><Link to="/about">About</Link><Link to="/login">Sign in</Link><Button onClick={() => { window.location.href = '/register' }}>Get started</Button></nav></header> }
