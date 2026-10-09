import { Activity, CheckCircle2, ClipboardList, Clock, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { citizenAPI } from '../../api/citizen'
import Button from '../../components/common/Button'
import StatCard from '../../components/dashboard/StatCard'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentIssues from '../../components/dashboard/RecentIssues'
import EmptyState from '../../components/common/EmptyState'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import { useAuth } from '../../context/AuthContext'
import { extractIssueArray } from '../../utils/issues'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await citizenAPI.getMyIssues()
        setIssues(extractIssueArray(response))
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load your issues.'))
      } finally {
        setLoading(false)
      }
    }

    loadIssues()
  }, [reloadKey])

  const calculateStats = () => {
    const reported = issues.filter((issue) => issue.status === 'REPORTED')
    const inProgress = issues.filter((issue) => issue.status === 'IN_PROGRESS')
    const resolved = issues.filter((issue) => issue.status === 'RESOLVED')
    const pending = issues.filter((issue) => issue.status === 'RESOLUTION_PENDING')
    const rejected = issues.filter((issue) => issue.status === 'REJECTED')
    return { reported, inProgress, resolved, pending, rejected }
  }

  const { reported, inProgress, resolved, pending, rejected } = calculateStats()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const location = typeof user?.address === 'string'
    ? user.address
    : [user?.address?.street, user?.address?.area, user?.address?.city, user?.address?.state].filter(Boolean).join(', ') || user?.location || 'Location not set'

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <p className="eyebrow">{location}</p>
            <h2>Good morning, {firstName}.</h2>
            <p className="muted">Track your civic reports and help improve your community.</p>
          </div>
          <Link to="/citizen/report">
            <Button><Plus size={16} /> Report an issue</Button>
          </Link>
        </div>
        <div className="stats-grid">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
        <div className="dashboard-section">
          <Skeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{location}</p>
          <h2>Good morning, {firstName}.</h2>
          <p className="muted">Track your civic reports and help improve your community.</p>
        </div>
        <Link to="/citizen/report">
          <Button><Plus size={16} /> Report an issue</Button>
        </Link>
      </div>

      {error && (
        <div className="dashboard-section">
          <ErrorState
            title="Unable to load dashboard"
            message={error}
            action={<Button onClick={() => setReloadKey((key) => key + 1)}>Try Again</Button>}
          />
        </div>
      )}

      {!error && (
        <>
          <div className="stats-grid">
            <StatCard label="Total reports" value={issues.length} icon={ClipboardList} />
            <StatCard label="Reported" value={reported.length} icon={Activity} tone="indigo" />
            <StatCard label="In progress" value={inProgress.length} icon={Activity} tone="violet" />
            <StatCard label="Resolution pending" value={pending.length} icon={Clock} />
            <StatCard label="Resolved" value={resolved.length} icon={CheckCircle2} tone="green" />
            <StatCard label="Rejected" value={rejected.length} icon={CheckCircle2} />
          </div>

          <div className="dashboard-section">
            <QuickActions />
          </div>

          <div className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Latest activity</p>
                <h2>Recent issues</h2>
              </div>
            </div>
            {issues.length ? (
              <RecentIssues issues={issues} />
            ) : (
              <div className="surface">
                <EmptyState
                  title="No reports yet"
                  message="Your reported civic issues will appear here."
                  action={
                    <Link to="/citizen/report">
                      <Button>Report an Issue</Button>
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

