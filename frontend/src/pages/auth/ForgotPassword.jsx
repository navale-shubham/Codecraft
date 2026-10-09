import { ArrowLeft, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return <div className="simple-auth"><div className="auth-card">
    <div className="simple-auth-icon"><Mail size={22} /></div>
    <p className="eyebrow">Account recovery</p>
    <h2>Password recovery is unavailable.</h2>
    <p className="muted">The current backend API does not provide a password reset endpoint. Contact your administrator to recover access.</p>
    <Link to="/login" className="back-link"><ArrowLeft size={15} /> Back to sign in</Link>
  </div></div>
}
