import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fieldStaffAPI } from '../../api/fieldStaff'
import Button from '../../components/common/Button'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import IssueStatusBadge from '../../components/issues/IssueStatusBadge'
import { getMediaURL } from '../../api/client'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { extractIssueArray, getIssueCategory, getIssueLocation } from '../../utils/issues'
import { unwrapApiData } from '../../utils/apiData'

const dateLabel = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString() : 'Not available'

export default function AssignedIssueDetails() {
  const { id } = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fieldStaffAPI.getAssignedIssues()
      const list = extractIssueArray(response)
      setIssue(list.find((item) => String(item.id) === String(id)) || null)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load issue details.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const resolve = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      unwrapApiData(await fieldStaffAPI.resolveIssue(id))
      setSuccess('Resolution request accepted. Refreshing issue data.')
      await load()
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'Unable to resolve this issue.'))
    } finally {
      setSaving(false)
    }
  }

  return <div>
    <Link to="/field-staff/assignments" className="back-link"><ArrowLeft size={15} /> Back to assignments</Link>
    {loading ? <div className="dashboard-section"><Skeleton /></div> : error && !issue ? <div className="surface"><ErrorState title="Unable to load issue" message={error} action={<Button variant="secondary" onClick={load}>Try again</Button>} /></div> : !issue ? <div className="surface"><ErrorState title="Issue not found" message="This issue is not in the field staff assignment list." /></div> : <>
      <div className="page-heading"><div><p className="eyebrow">{issue.issue_number || issue.id}</p><h2>{issue.title || 'Untitled issue'}</h2><p className="muted">{getIssueLocation(issue)}</p></div><IssueStatusBadge status={issue.status} /></div>
      {error && <p className="field-error" role="alert">{error}</p>}{success && <p className="muted" role="status">{success}</p>}
      <section className="surface detail-panel"><p className="eyebrow">Issue details</p><p>{issue.description || 'No description provided.'}</p><div className="detail-facts">
        <span><small>Category</small><b>{getIssueCategory(issue)}</b></span>
        <span><small>Citizen</small><b>{issue.citizen?.name || 'Not available'}</b></span>
        <span><small>Department</small><b>{issue.department?.name || 'Not available'}</b></span>
        <span><small>Assigned staff</small><b>{issue.assigned_to?.name || 'Not available'}</b></span>
        <span><small>Due date</small><b>{dateLabel(issue.due_at)}</b></span>
        <span><small>Created</small><b>{dateLabel(issue.created_at || issue.reported_at)}</b></span>
      </div></section>
      {issue.status === 'RESOLVED' && <section className="surface detail-panel"><p className="eyebrow">Resolution</p><p>Resolved {dateLabel(issue.resolved_at)}.</p>{issue.resolution_note && <p>{issue.resolution_note}</p>}</section>}
      {Array.isArray(issue.media) && issue.media.length > 0 && <section className="surface detail-panel"><p className="eyebrow">Media</p><div className="media-grid">{issue.media.map((media, index) => { const url = getMediaURL(media.file_url || media.url || media.path); return <div key={media.id || url || index}>{url ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Evidence ${index + 1}`} className="media-image" /></a> : 'Media unavailable'}</div> })}</div></section>}
      {issue.status !== 'RESOLVED' && issue.status !== 'REJECTED' && <Button onClick={resolve} disabled={saving}>{saving ? 'Submitting...' : 'Mark work complete'}</Button>}
    </>}
  </div>
}
