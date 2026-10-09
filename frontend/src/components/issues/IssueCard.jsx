import { MapPin, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import IssueStatusBadge from './IssueStatusBadge'
import PriorityBadge from './PriorityBadge'
import { getIssueCategory, getIssueLocation } from '../../utils/issues'

export default function IssueCard({ issue }) {
  const reportedAt = issue.reportedDate || issue.reported_at || issue.created_at
  const date = reportedAt && !Number.isNaN(Date.parse(reportedAt)) ? new Date(reportedAt).toLocaleDateString() : 'Date unavailable'
  const assigned = issue.assigned_to?.name || (typeof issue.assigned_to === 'string' ? issue.assigned_to : 'Unassigned')
  return <article className="issue-card surface">
    <div className="issue-card-top"><span className="issue-id">{issue.issue_number || issue.id || 'Issue'}</span><IssueStatusBadge status={issue.status} /></div>
    <h3>{issue.title || issue.name || 'Untitled issue'}</h3>
    <p className="muted line-clamp">{issue.description || 'No description provided.'}</p>
    <div className="issue-meta"><span><MapPin size={15} />{getIssueLocation(issue)}</span>{issue.priority && <PriorityBadge priority={issue.priority} />}</div>
    <div className="issue-card-footer"><span>{getIssueCategory(issue)} · {date}<br />Assigned: {assigned} · Due: {issue.due_at && !Number.isNaN(Date.parse(issue.due_at)) ? new Date(issue.due_at).toLocaleDateString() : 'No due date'}</span><Link className="text-button" to={`/citizen/issues/${issue.id}`}>View <ArrowUpRight size={15} /></Link></div>
  </article>
}
