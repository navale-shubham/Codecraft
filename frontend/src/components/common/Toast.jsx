import { CheckCircle2, X } from 'lucide-react'
export default function Toast({ message, onClose }) { if (!message) return null; return <div className="toast" role="status"><CheckCircle2 size={18} /><span>{message}</span><button className="icon-button" aria-label="Dismiss" onClick={onClose}><X size={15} /></button></div> }
