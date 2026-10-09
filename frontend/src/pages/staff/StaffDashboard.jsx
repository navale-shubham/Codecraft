import { useEffect, useState } from 'react'
import { Activity, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { fieldStaffAPI } from '../../api/fieldStaff'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import StatCard from '../../components/dashboard/StatCard'
import IssueTable from '../../components/issues/IssueTable'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { extractIssueArray } from '../../utils/issues'

export default function StaffDashboard() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadIssues = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fieldStaffAPI.getAssignedIssues()
        const list = extractIssueArray(response)
        if (active) setIssues(list)
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError, 'Unable to load assigned issues.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadIssues()
    return () => { active = false }
  }, [reloadKey])

  const inProgress = issues.filter((issue) => issue.status === 'IN_PROGRESS').length
  const resolutionPending = issues.filter((issue) => issue.status === 'RESOLUTION_PENDING').length
  const resolved = issues.filter((issue) => issue.status === 'RESOLVED').length

  if (loading) return <div><div className="page-heading"><div><p className="eyebrow">Field operations</p><h2>My work dashboard</h2><p className="muted">Assigned field work and progress updates in one place.</p></div></div><div className="stats-grid"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div><div className="dashboard-section"><Skeleton /></div></div>

  return <div>
    <div className="page-heading"><div><p className="eyebrow">Field operations</p><h2>My work dashboard</h2><p className="muted">Assigned field work and progress updates in one place.</p></div><Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Refresh</Button></div>
    {error ? <div className="dashboard-section surface"><ErrorState title="Unable to load assignments" message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div> : <>
      <div className="stats-grid">
        <StatCard label="Assigned issues" value={issues.length} icon={ClipboardList} />
        <StatCard label="In progress" value={inProgress} icon={Activity} tone="indigo" />
        <StatCard label="Pending resolution" value={resolutionPending} icon={Clock} tone="violet" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} tone="green" />
      </div>
      <div className="dashboard-section">
        <div className="section-heading"><h2>Assigned issues</h2></div>
        {issues.length ? <IssueTable issues={issues} basePath="/field-staff/issues" /> : <div className="surface"><EmptyState title="No assignments yet" message="Assigned field work will appear here when department staff assigns issues to you." /></div>}
      </div>
    </>}
  </div>
}
