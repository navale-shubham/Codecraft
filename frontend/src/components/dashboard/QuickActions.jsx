import { ArrowRight, FilePlus2, ListChecks, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function QuickActions() {
  return <div className="quick-actions">
    <Link to="/citizen/report"><FilePlus2 size={19} /><span><strong>Report an issue</strong><small>Tell us what needs attention</small></span><ArrowRight size={16} /></Link>
    <Link to="/citizen/issues"><ListChecks size={19} /><span><strong>Track your reports</strong><small>See every update in one place</small></span><ArrowRight size={16} /></Link>
    <Link to="/citizen/profile"><UserRound size={19} /><span><strong>Review your account</strong><small>Check your profile information</small></span><ArrowRight size={16} /></Link>
  </div>
}
