import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { citizenAPI } from '../../api/citizen'
import IssueCard from '../../components/issues/IssueCard'
import IssueTable from '../../components/issues/IssueTable'
import EmptyState from '../../components/common/EmptyState'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import Button from '../../components/common/Button'
import { extractIssueArray } from '../../utils/issues'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function MyIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
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

  const filtered = issues.filter((issue) => {
    const statusMatch = status === 'ALL' || issue.status === status
    const searchMatch = `${issue.title || issue.name} ${issue.category} ${issue.location}`.toLowerCase().includes(query.toLowerCase())
    return statusMatch && searchMatch
  })

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Your reports</p>
            <h2>My issues</h2>
            <p className="muted">Follow every report from submission to resolution.</p>
          </div>
        </div>
        <div className="filter-bar surface">
          <Skeleton />
        </div>
        <div className="issue-grid">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your reports</p>
          <h2>My issues</h2>
          <p className="muted">Follow every report from submission to resolution.</p>
        </div>
      </div>

      {error && (
        <div className="surface">
          <ErrorState
            title="Unable to load issues"
            message={error}
            action={<Button onClick={() => setReloadKey((key) => key + 1)}>Try Again</Button>}
          />
        </div>
      )}

      {!error && (
        <>
          <div className="filter-bar surface">
            <label className="topbar-search">
              <Search size={16} />
              <input
                placeholder="Search issues"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              className="input filter-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLUTION_PENDING">Pending resolution</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {filtered.length ? (
            <>
              <div className="desktop-only">
                <IssueTable issues={filtered} />
              </div>
              <div className="mobile-only issue-grid">
                {filtered.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </>
          ) : (
            <div className="surface">
              <EmptyState
                title={issues.length ? 'No matching issues' : 'No issues reported yet'}
                message="Report a civic issue to see it here."
                action={
                  <Link to="/citizen/report">
                    <Button>Report an Issue</Button>
                  </Link>
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

