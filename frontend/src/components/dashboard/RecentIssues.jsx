import IssueCard from '../issues/IssueCard'
export default function RecentIssues({ issues }) { return <div className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent issues</h2></div></div><div className="issue-grid">{issues.slice(0, 3).map((issue) => <IssueCard issue={issue} key={issue.id} />)}</div></div> }
