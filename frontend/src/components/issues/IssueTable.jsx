import { Link } from 'react-router-dom'
import IssueStatusBadge from './IssueStatusBadge'
import { getIssueCategory, getIssueLocation } from '../../utils/issues'

export default function IssueTable({ issues = [], department = false, basePath, readOnly = false }) {
  const detailsPath = basePath || (department ? '/department/issues' : '/citizen/issues')
  return <div className="table-wrap surface"><table>
    <thead><tr><th>Issue</th>{department && <th>Citizen</th>}<th>Category</th><th>Location</th><th>Status</th><th>Assigned staff</th><th>Due date</th><th>Reported</th><th /></tr></thead>
    <tbody>{issues.map((issue) => <tr key={issue.id}>
      <td>{readOnly ? <span className="table-title">{issue.title || issue.name || 'Untitled issue'}<small>{issue.issue_number || issue.id}</small></span> : <Link className="table-title" to={`${detailsPath}/${issue.id}`}>
        {issue.title || issue.name || 'Untitled issue'}<small>{issue.issue_number || issue.id}</small>
      </Link>}</td>
      {department && <td>{issue.citizen?.name || 'Not available'}</td>}
      <td>{getIssueCategory(issue)}</td><td>{getIssueLocation(issue)}</td>
      <td><IssueStatusBadge status={issue.status} /></td>
      <td>{issue.assignedStaff || issue.assigned_to?.name || (typeof issue.assigned_to === 'string' ? issue.assigned_to : 'Unassigned')}</td>
      <td>{issue.due_at && !Number.isNaN(Date.parse(issue.due_at)) ? new Date(issue.due_at).toLocaleDateString() : 'No due date'}</td>
      <td>{issue.reported_at && !Number.isNaN(Date.parse(issue.reported_at)) ? new Date(issue.reported_at).toLocaleDateString() : 'Not available'}</td>
      <td>{!readOnly && <Link className="text-button" to={`${detailsPath}/${issue.id}`}>View</Link>}</td>
    </tr>)}</tbody>
  </table></div>
}
