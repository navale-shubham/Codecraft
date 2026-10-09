import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { departmentAPI } from '../../api/department'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import StatCard from '../../components/dashboard/StatCard'
import IssueTable from '../../components/issues/IssueTable'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { extractIssueArray } from '../../utils/issues'

export default function DepartmentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const [dashResponse, issuesResponse] = await Promise.all([departmentAPI.getDashboard(), departmentAPI.getIssues()])
        if (dashResponse?.success === false) throw new Error(dashResponse.message || 'Unable to load dashboard statistics.')
        const stats = dashResponse?.data ?? dashResponse
        const reports = extractIssueArray(issuesResponse)
        if (active) {
          setDashboard(stats)
          setIssues(reports)
        }
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError, 'Unable to load department dashboard.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [reloadKey])

  if (loading) return <div><div className="page-heading"><div><p className="eyebrow">Department</p><h2>Dashboard</h2><p className="muted">Keep every incoming issue moving toward resolution.</p></div></div><div className="stats-grid"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div><div className="dashboard-section"><Skeleton /></div></div>

  return <div>
    <div className="page-heading"><div><p className="eyebrow">Department</p><h2>Department dashboard</h2><p className="muted">Keep every incoming issue moving toward resolution.</p></div><div className="topbar-actions"><Link className="btn btn-secondary" to="/department/issues">Manage issues</Link><Link className="btn btn-outline" to="/department/staff">Field staff</Link><Button variant="ghost" onClick={() => setReloadKey((key) => key + 1)}>Refresh</Button></div></div>
    {error ? <div className="surface"><ErrorState title="Unable to load dashboard" message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div> : <>
      {dashboard && <div className="stats-grid">
        <StatCard label="Total issues" value={dashboard.total_issues ?? '—'} />
        <StatCard label="Open issues" value={dashboard.open_issues ?? '—'} tone="indigo" />
        <StatCard label="In progress" value={dashboard.in_progress_issues ?? '—'} tone="violet" />
        <StatCard label="Resolved" value={dashboard.resolved_issues ?? '—'} tone="green" />
        {dashboard.overdue_issues !== undefined && <StatCard label="Overdue" value={dashboard.overdue_issues} />}
      </div>}
      <div className="dashboard-section">
        <div className="section-heading"><div><p className="eyebrow">Work queue</p><h2>Recent issues</h2></div></div>
        {issues.length ? <IssueTable issues={issues} department basePath="/department/issues" /> : <div className="surface"><EmptyState title="No issues found" message="Department reports returned by the backend will appear here." /></div>}
      </div>
    </>}
  </div>
}
