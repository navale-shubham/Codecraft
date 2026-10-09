import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { departmentAPI } from '../../api/department'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import IssueStatusBadge from '../../components/issues/IssueStatusBadge'
import Skeleton from '../../components/common/Skeleton'
import StatCard from '../../components/dashboard/StatCard'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { extractIssueArray, getIssueCategory, getIssueLocation } from '../../utils/issues'
import { unwrapApiData, unwrapApiList } from '../../utils/apiData'

const dateLabel = (value, fallback = 'Not available') => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString() : fallback

export default function DepartmentIssues() {
  const { id: selectedIssueId } = useParams()
  const [issues, setIssues] = useState([])
  const [staff, setStaff] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingIssue, setSavingIssue] = useState('')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [issueResponse, staffResponse, dashboardResponse] = await Promise.all([
        departmentAPI.getIssues(),
        departmentAPI.getFieldStaff(),
        departmentAPI.getDashboard(),
      ])
      setIssues(extractIssueArray(issueResponse))
      setStaff(unwrapApiList(staffResponse, ['staff', 'field_staff']))
      const data = dashboardResponse?.data ?? dashboardResponse
      if (dashboardResponse?.success === false) throw new Error(dashboardResponse.message || 'Unable to load department statistics.')
      setDashboard(data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load department issues.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, reloadKey])

  const assign = async (event, issue) => {
    event.preventDefault()
    const value = assignments[issue.id] || {}
    if (!value.staffId || !value.dueAt) {
      setActionError('Select a field staff member and due date.')
      return
    }
    setSavingIssue(issue.id)
    setActionError('')
    setSuccess('')
    try {
      unwrapApiData(await departmentAPI.assignIssue(issue.id, value.staffId, new Date(value.dueAt).toISOString()))
      setSuccess(`Issue ${issue.issue_number || issue.id} assigned successfully.`)
      setReloadKey((key) => key + 1)
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure, 'Unable to assign this issue.'))
    } finally {
      setSavingIssue('')
    }
  }

  const resolve = async (issue) => {
    setSavingIssue(issue.id)
    setActionError('')
    setSuccess('')
    try {
      unwrapApiData(await departmentAPI.resolveIssue(issue.id))
      setSuccess(`Resolution for ${issue.issue_number || issue.id} approved.`)
      setReloadKey((key) => key + 1)
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure, 'Unable to resolve this issue.'))
    } finally {
      setSavingIssue('')
    }
  }

  const setAssignment = (issueId, field, value) => setAssignments((current) => ({
    ...current,
    [issueId]: { ...(current[issueId] || {}), [field]: value },
  }))

  const filteredIssues = useMemo(() => {
    const search = query.trim().toLowerCase()
    return (selectedIssueId ? issues.filter((issue) => String(issue.id) === String(selectedIssueId)) : issues)
      .filter((issue) => (!search || [issue.issue_number, issue.id, issue.title, issue.description, getIssueCategory(issue), getIssueLocation(issue), issue.citizen?.name].some((value) => String(value || '').toLowerCase().includes(search))) && (statusFilter === 'all' || String(issue.status || '').toUpperCase() === statusFilter))
      .sort((a, b) => (Date.parse(a.reportedDate || a.created_at || 0) - Date.parse(b.reportedDate || b.created_at || 0)) * (sortOrder === 'newest' ? -1 : 1))
  }, [issues, selectedIssueId, query, statusFilter, sortOrder])
  const visibleIssues = filteredIssues.slice((page - 1) * 10, page * 10)

  if (loading) return <div><div className="page-heading"><div><p className="eyebrow">Department workspace</p><h2>Issue management</h2></div></div><div className="stats-grid"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div><div className="dashboard-section"><Skeleton /></div></div>

  return <div>
    <div className="page-heading"><div>{selectedIssueId && <Link to="/department/issues" className="back-link">Back to all issues</Link>}<p className="eyebrow">Department workspace</p><h2>{selectedIssueId ? 'Issue review' : 'Issue management'}</h2><p className="muted">Review reports, assign field staff, and approve completed work.</p></div><Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Refresh</Button></div>
    {error ? <div className="surface"><ErrorState title="Unable to load department work" message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div> : <>
      {dashboard && <div className="stats-grid">
        <StatCard label="Total issues" value={dashboard.total_issues ?? '—'} icon={ClipboardList} />
        <StatCard label="Open issues" value={dashboard.open_issues ?? '—'} icon={Clock} tone="indigo" />
        <StatCard label="In progress" value={dashboard.in_progress_issues ?? '—'} icon={Activity} tone="violet" />
        <StatCard label="Resolved" value={dashboard.resolved_issues ?? '—'} icon={CheckCircle2} tone="green" />
        {dashboard.overdue_issues !== undefined && <StatCard label="Overdue" value={dashboard.overdue_issues} icon={AlertTriangle} />}
      </div>}
      {actionError && <p className="field-error" role="alert">{actionError}</p>}
      {success && <p className="muted" role="status">{success}</p>}
      <div className="dashboard-section">
        <div className="section-heading"><h3>Department issues</h3><span className="muted">{filteredIssues.length} issues</span></div>
        {!selectedIssueId && <div className="surface filter-bar issue-filters"><label className="field"><span>Search reports</span><input className="input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="ID, title, category, location" /></label><label className="field"><span>Status</span><select className="input" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}><option value="all">All statuses</option>{[...new Set(issues.map((item) => item.status).filter(Boolean))].map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><label className="field"><span>Sort by date</span><select className="input" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>}
        {visibleIssues.length ? <div className="issue-grid">{visibleIssues.map((issue) => {
          const assignment = assignments[issue.id] || {}
          const assignedName = issue.assigned_to?.name || issue.assigned_to || 'Unassigned'
          return <article className="surface detail-panel" key={issue.id}>
            <div className="section-heading"><div><p className="eyebrow">{issue.issue_number || issue.id}</p><h3>{issue.title || issue.name || 'Untitled issue'}</h3></div><IssueStatusBadge status={issue.status} /></div>
            <p>{issue.description || 'No description provided.'}</p>
            <div className="detail-facts">
              <span><small>Category</small><b>{getIssueCategory(issue)}</b></span>
              <span><small>Citizen</small><b>{issue.citizen?.name || 'Not available'}</b></span>
              <span><small>Location</small><b>{getIssueLocation(issue)}</b></span>
              <span><small>Assigned staff</small><b>{typeof assignedName === 'string' ? assignedName : assignedName.name || 'Unassigned'}</b></span>
              <span><small>Due date</small><b>{dateLabel(issue.due_at, 'No due date')}</b></span>
              <span><small>Created</small><b>{dateLabel(issue.created_at || issue.reported_at)}</b></span>
              <span><small>Resolved</small><b>{dateLabel(issue.resolved_at, 'Not resolved')}</b></span>
            </div>
            {issue.resolution_note && <p><strong>Resolution details:</strong> {issue.resolution_note}</p>}
            {issue.status !== 'RESOLVED' && issue.status !== 'REJECTED' && <form className="dashboard-section" onSubmit={(event) => assign(event, issue)}>
              <div className="form-grid">
                <label className="field"><span>Assign field staff</span><select className="input" value={assignment.staffId || ''} onChange={(event) => setAssignment(issue.id, 'staffId', event.target.value)} required><option value="">Select staff member</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select></label>
                <label className="field"><span>Due date</span><input className="input" type="datetime-local" value={assignment.dueAt || ''} onChange={(event) => setAssignment(issue.id, 'dueAt', event.target.value)} required /></label>
              </div>
              <Button type="submit" variant="secondary" disabled={savingIssue === issue.id || staff.length === 0}>{savingIssue === issue.id ? 'Saving...' : 'Assign issue'}</Button>
            </form>}
            {issue.status === 'RESOLUTION_PENDING' && <Button disabled={savingIssue === issue.id} onClick={() => resolve(issue)}>{savingIssue === issue.id ? 'Saving...' : 'Approve resolution'}</Button>}
          </article>
        })}</div> : <div className="surface"><EmptyState title={selectedIssueId ? 'Issue not found' : 'No issues found'} message="Department reports returned by the backend will appear here." /></div>}
        {!selectedIssueId && filteredIssues.length > 10 && <div className="pagination"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {page} of {Math.ceil(filteredIssues.length / 10)}</span><Button variant="secondary" disabled={page >= Math.ceil(filteredIssues.length / 10)} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
      </div>
    </>}
  </div>
}
