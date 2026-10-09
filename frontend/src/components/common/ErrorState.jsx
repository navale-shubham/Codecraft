import { AlertTriangle } from 'lucide-react'
export default function ErrorState({ title = 'Something went wrong', message = 'Unable to load this information.', action, onRetry }) {
  return <div className="empty-state error-state"><AlertTriangle size={32} /><h3>{title}</h3><p>{message}</p>{action || (onRetry && <button className="text-button" onClick={onRetry}>Try again</button>)}</div>
}
