import { ArrowLeft, MapPin, MessageCircle, Send, AlertCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { citizenAPI } from '../../api/citizen'
import { getMediaURL } from '../../api/client'
import Button from '../../components/common/Button'
import IssueStatusBadge from '../../components/issues/IssueStatusBadge'
import PriorityBadge from '../../components/issues/PriorityBadge'
import IssueTimeline from '../../components/issues/IssueTimeline'
import Skeleton from '../../components/common/Skeleton'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { getIssueCategory, getIssueLocation } from '../../utils/issues'

export default function IssueDetails() {
  const { id } = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await citizenAPI.getIssue(id)
        
        if (response?.success && response?.data && typeof response.data === 'object') {
          setIssue(response.data)
        } else {
          setError('Issue not found.')
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load this issue.'))
      } finally {
        setLoading(false)
      }
    }

    loadIssue()
  }, [id])

  if (loading) {
    return (
      <div>
        <Link to="/citizen/issues" className="back-link">
          <ArrowLeft size={15} /> Back to my issues
        </Link>
        <div className="detail-header">
          <Skeleton />
        </div>
        <div className="detail-grid">
          <section className="detail-main">
            <Skeleton />
            <Skeleton />
          </section>
        </div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="surface">
        <div className="issue-error">
          <AlertCircle size={18} />
          <div>
            <p className="muted">{error || 'Issue not found.'}</p>
          </div>
        </div>
        <Link to="/citizen/issues" className="text-button">
          Back to my issues
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/citizen/issues" className="back-link">
        <ArrowLeft size={15} /> Back to my issues
      </Link>

      <div className="detail-header">
        <div>
          <span className="issue-id">{issue.issue_number || issue.id}</span>
          <h2>{issue.title}</h2>
          <p className="muted"><MapPin size={15} /> {getIssueLocation(issue)}</p>
        </div>
        <div className="detail-badges">
          <IssueStatusBadge status={issue.status} />
          {issue.priority && <PriorityBadge priority={issue.priority} />}
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-main">
          <div className="surface detail-panel">
            <p className="eyebrow">Issue description</p>
            <p>{issue.description}</p>
            {issue.resolution_note && <><p className="eyebrow">Resolution details</p><p>{issue.resolution_note}</p></>}
            <div className="detail-facts">
              <span>
                <small>Category</small>
                <b>{getIssueCategory(issue)}</b>
              </span>
              <span>
                <small>Reported on</small>
                <b>{issue.reported_at || issue.created_at ? new Date(issue.reported_at || issue.created_at).toLocaleDateString() : 'Date unavailable'}</b>
              </span>
              <span>
                <small>Department</small>
                <b>{issue.department?.name || issue.department_name || (typeof issue.department === 'string' ? issue.department : 'Pending routing')}</b>
              </span>
              <span>
                <small>Assigned staff</small>
                <b>{issue.assigned_to?.name || issue.assigned_to_name || (typeof issue.assigned_to === 'string' ? issue.assigned_to : 'Unassigned')}</b>
              </span>
              {issue.due_at && !Number.isNaN(Date.parse(issue.due_at)) && (
                <span>
                  <small>Due date</small>
                  <b>{new Date(issue.due_at).toLocaleDateString()}</b>
                </span>
              )}
            </div>
          </div>

          {Array.isArray(issue.media) && issue.media.length > 0 && (
            <div className="surface detail-panel">
              <p className="eyebrow">Media & Evidence</p>
              <div className="media-grid">
                {issue.media.map((mediaItem, idx) => {
                  const mediaUrl = getMediaURL(mediaItem?.file_url || mediaItem?.url || mediaItem?.path)
                  return <div key={mediaItem?.id || mediaUrl || idx}>
                    {mediaUrl ? <a href={mediaUrl} target="_blank" rel="noreferrer"><img src={mediaUrl} alt={`Evidence ${idx + 1}`} className="media-image" /></a> : <span>Media unavailable</span>}
                  </div>
                })}
              </div>
            </div>
          )}

          <div className="surface detail-panel">
            <p className="eyebrow">Progress timeline</p>
            <IssueTimeline current={issue.status} />
          </div>

          <div className="surface detail-panel">
            <div className="section-heading">
              <h3>Comments</h3>
              <MessageCircle size={18} />
            </div>
            <p className="muted">The current backend API does not provide issue comments.</p>
            <div className="comment-box">
              <input className="input" placeholder="Add a comment" disabled />
              <Button disabled>
                <Send size={15} />
              </Button>
            </div>
          </div>
        </section>

        <aside className="detail-side">
          <div className="surface map-card">
            <MapPin size={28} />
            <strong>{getIssueLocation(issue)}</strong>
            {Number.isFinite(Number(issue.location?.latitude ?? issue.latitude)) && Number.isFinite(Number(issue.location?.longitude ?? issue.longitude)) && (
              <small>
                {Number(issue.location?.latitude ?? issue.latitude).toFixed(4)}, {Number(issue.location?.longitude ?? issue.longitude).toFixed(4)}
              </small>
            )}
          </div>

          {issue.status === 'RESOLVED' && (
            <div className="surface detail-panel">
              <p className="eyebrow">Issue resolved</p>
              <h3>{issue.resolved_at ? `Completed on ${new Date(issue.resolved_at).toLocaleDateString()}` : 'Resolution completed'}</h3>
              <p className="muted">Thank you for helping improve your community!</p>
            </div>
          )}

          {issue.status === 'REJECTED' && (
            <div className="surface detail-panel">
              <p className="eyebrow">Issue rejected</p>
              <h3>This issue could not be resolved</h3>
              <p className="muted">{issue.rejection_reason || 'No additional details provided'}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

