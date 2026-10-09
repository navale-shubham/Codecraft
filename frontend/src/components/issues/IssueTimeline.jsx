import { formatIssueStatus } from '../../utils/issues'

const progression = ['REPORTED', 'IN_PROGRESS', 'RESOLUTION_PENDING', 'RESOLVED']

export default function IssueTimeline({ current = 'REPORTED' }) {
  if (![...progression, 'REJECTED'].includes(current)) {
    return <div className="timeline"><div className="timeline-item complete"><span className="timeline-dot" /><div><strong>{formatIssueStatus(current)}</strong><small>Current status</small></div></div></div>
  }
  const stages = current === 'REJECTED' ? [...progression.slice(0, 1), 'REJECTED'] : progression
  const currentIndex = Math.max(0, stages.indexOf(current))
  return <div className="timeline">{stages.map((key, index) => <div className={`timeline-item ${index <= currentIndex ? 'complete' : ''}`} key={key}>
    <span className="timeline-dot" />
    <div><strong>{formatIssueStatus(key)}</strong><small>{index === currentIndex ? 'Current stage' : index < currentIndex ? 'Completed' : 'Awaiting update'}</small></div>
  </div>)}</div>
}
