import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, UserRound } from 'lucide-react'
import { departmentAPI } from '../../api/department'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import IssueStatusBadge from '../../components/issues/IssueStatusBadge'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { extractIssueArray, getIssueCategory, getIssueLocation } from '../../utils/issues'
import { unwrapApiData, unwrapApiList } from '../../utils/apiData'

const PAGE_SIZE = 10
const labelDate = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString() : 'Not set'
const assignedId = (issue) => issue.assigned_to?.id ?? issue.assigned_to_id ?? (typeof issue.assigned_to === 'string' && issue.assigned_to.trim() ? issue.assigned_to : null) ?? (typeof issue.assigned_to === 'number' ? issue.assigned_to : null)

export default function DepartmentAssignments() {
  const [issues, setIssues] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [search, setSearch] = useState('')
  const [staffFilter, setStaffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState('')
  const [reload, setReload] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [issueResponse, staffResponse] = await Promise.all([departmentAPI.getIssues(), departmentAPI.getFieldStaff()])
      setIssues(extractIssueArray(issueResponse))
      setStaff(unwrapApiList(staffResponse, ['staff', 'field_staff']))
      setCurrentTime(Date.now())
    } catch (cause) { setError(getApiErrorMessage(cause, 'Unable to load department assignments.')) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load, reload])

  const assignments = useMemo(() => issues.filter((issue) => assignedId(issue) !== null || issue.assigned_to?.name || issue.assigned_to_name), [issues])
  const unassigned = useMemo(() => issues.filter((issue) => !assignedId(issue) && !issue.assigned_to?.name && !issue.assigned_to_name), [issues])
  const filtered = useMemo(() => assignments.filter((issue) => {
    const query = search.trim().toLowerCase()
    const staffName = issue.assigned_to?.name || issue.assigned_to_name || staff.find((person) => String(person.id) === String(assignedId(issue)))?.name || ''
    const matchesQuery = !query || [issue.issue_number, issue.id, issue.title, issue.description, getIssueCategory(issue), staffName].some((value) => String(value || '').toLowerCase().includes(query))
    const matchesStaff = staffFilter === 'all' || String(assignedId(issue)) === staffFilter
    const matchesStatus = statusFilter === 'all' || String(issue.status || '').toUpperCase() === statusFilter
    const due = issue.due_at ? Date.parse(issue.due_at) : NaN
    const overdue = Number.isFinite(due) && due < currentTime && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(String(issue.status).toUpperCase())
    return matchesQuery && matchesStaff && matchesStatus && (!overdueOnly || overdue)
  }).sort((a, b) => Date.parse(b.assigned_at || b.updated_at || b.created_at || 0) - Date.parse(a.assigned_at || a.updated_at || a.created_at || 0)), [assignments, search, staffFilter, statusFilter, overdueOnly, staff, currentTime])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const submit = async (event, issue) => {
    event.preventDefault()
    const draft = drafts[issue.id] || {}
    if (!draft.staffId || !draft.dueAt) return
    setSaving(issue.id); setActionMessage('')
    try {
      unwrapApiData(await departmentAPI.assignIssue(issue.id, draft.staffId, new Date(draft.dueAt).toISOString()))
      setActionMessage(`Assignment updated for ${issue.issue_number || `issue ${String(issue.id).slice(0, 8)}`}.`)
      setReload((value) => value + 1)
    } catch (cause) { setActionMessage(getApiErrorMessage(cause, 'Unable to update this assignment.')) }
    finally { setSaving('') }
  }

  if (loading) return <div><div className="page-heading"><div><p className="eyebrow">Department workspace</p><h2>Assignments</h2></div></div><div className="stats-grid"><Skeleton /><Skeleton /><Skeleton /></div><div className="dashboard-section"><Skeleton /></div></div>
  return <div>
    <div className="page-heading"><div><p className="eyebrow">Department workspace</p><h2>Assignments</h2><p className="muted">Allocate department work, monitor due dates, and update staff assignments.</p></div><Button variant="secondary" onClick={() => setReload((value) => value + 1)}>Refresh</Button></div>
    {error ? <div className="surface"><ErrorState title="Unable to load assignments" message={error} action={<Button variant="secondary" onClick={() => setReload((value) => value + 1)}>Try again</Button>} /></div> : <>
      <div className="stats-grid"><article className="stat-card surface"><div className="stat-icon stat-blue"><ClipboardList /></div><div><p>Active assignments</p><strong>{assignments.length}</strong></div></article><article className="stat-card surface"><div className="stat-icon stat-indigo"><UserRound /></div><div><p>Unassigned issues</p><strong>{unassigned.length}</strong></div></article><article className="stat-card surface"><div className="stat-icon stat-violet"><Clock /></div><div><p>Overdue assignments</p><strong>{assignments.filter((item) => item.due_at && Date.parse(item.due_at) < currentTime && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(String(item.status).toUpperCase())).length}</strong></div></article></div>
      {actionMessage && <p className="muted" role="status">{actionMessage}</p>}
      <section className="dashboard-section">
        <div className="surface filter-bar assignment-filters">
          <label className="field"><span>Search assignments</span><input className="input" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Issue, category, or staff" /></label>
          <label className="field"><span>Assigned staff</span><select className="input" value={staffFilter} onChange={(event) => { setStaffFilter(event.target.value); setPage(1) }}><option value="all">All staff</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
          <label className="field"><span>Assignment status</span><select className="input" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}><option value="all">All statuses</option>{[...new Set(assignments.map((item) => item.status).filter(Boolean))].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
          <label className="check-label"><input type="checkbox" checked={overdueOnly} onChange={(event) => { setOverdueOnly(event.target.checked); setPage(1) }} /> Overdue only</label>
        </div>
        <div className="section-heading"><h3>Assigned work</h3><span className="muted">{filtered.length} assignments</span></div>
        {visible.length ? <div className="table-wrap surface"><table><thead><tr><th>Issue</th><th>Employee</th><th>Assigned</th><th>Due date</th><th>Status</th><th>Work allocation</th></tr></thead><tbody>{visible.map((issue) => {
          const personId = assignedId(issue)
          const person = issue.assigned_to?.name || issue.assigned_to_name || staff.find((member) => String(member.id) === String(personId))?.name || 'Assigned staff'
          const draft = drafts[issue.id] || { staffId: personId || '', dueAt: issue.due_at ? new Date(new Date(issue.due_at).getTime() - new Date(issue.due_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '' }
          return <tr key={issue.id}><td><Link className="table-title" to={`/department/issues/${issue.id}`}>{issue.title}<small>{issue.issue_number || `#${String(issue.id).slice(0, 8)}`} · {getIssueCategory(issue)} · {getIssueLocation(issue)}</small></Link></td><td>{person}</td><td>{labelDate(issue.assigned_at || issue.updated_at || issue.created_at)}</td><td>{labelDate(issue.due_at)}</td><td><IssueStatusBadge status={issue.status} /></td><td><form className="assignment-inline-form" onSubmit={(event) => submit(event, issue)}><select className="input" aria-label={`Reassign ${issue.title}`} value={draft.staffId} onChange={(event) => setDrafts((current) => ({ ...current, [issue.id]: { ...draft, staffId: event.target.value } }))}><option value="">Choose staff</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select><input className="input" aria-label="Assignment due date" type="datetime-local" value={draft.dueAt} onChange={(event) => setDrafts((current) => ({ ...current, [issue.id]: { ...draft, dueAt: event.target.value } }))} /><Button type="submit" variant="secondary" disabled={saving === issue.id || !draft.staffId || !draft.dueAt}>{saving === issue.id ? 'Saving…' : 'Save'}</Button></form></td></tr>
        })}</tbody></table></div> : <div className="surface"><EmptyState title={assignments.length ? 'No matching assignments' : 'No assigned work yet'} message={assignments.length ? 'Adjust the filters to see other assigned work.' : 'Issues appear here after department staff assigns them to an employee.'} /></div>}
        {pages > 1 && <div className="pagination"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {page} of {pages}</span><Button variant="secondary" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
      </section>
      {unassigned.length > 0 && <section className="dashboard-section"><div className="section-heading"><h3>Unassigned work</h3><span className="muted">{unassigned.length} issues</span></div><div className="table-wrap surface"><table><thead><tr><th>Issue</th><th>Category</th><th>Reported</th><th>Status</th><th></th></tr></thead><tbody>{unassigned.slice(0, 10).map((issue) => <tr key={issue.id}><td className="table-title">{issue.title}<small>{issue.issue_number || `#${String(issue.id).slice(0, 8)}`}</small></td><td>{getIssueCategory(issue)}</td><td>{labelDate(issue.reportedDate)}</td><td><IssueStatusBadge status={issue.status} /></td><td><Link className="text-button" to={`/department/issues/${issue.id}`}>Review issue</Link></td></tr>)}</tbody></table></div></section>}
    </>}
  </div>
}
