import Badge from '../common/Badge'
export default function PriorityBadge({ priority }) { return <Badge tone={`priority-${priority?.toLowerCase()}`}>{priority}</Badge> }
