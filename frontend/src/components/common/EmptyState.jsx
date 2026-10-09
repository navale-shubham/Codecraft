import { Inbox } from 'lucide-react'
export default function EmptyState({ title = 'Nothing here yet', message = 'Try adjusting your filters or check back later.', action }) { return <div className="empty-state"><Inbox size={32} /><h3>{title}</h3><p>{message}</p>{action}</div> }
