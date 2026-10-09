import Badge from '../common/Badge'
import { formatIssueStatus } from '../../utils/issues'
export default function IssueStatusBadge({ status }) { return <Badge tone={status || 'unknown'}>{formatIssueStatus(status)}</Badge> }
