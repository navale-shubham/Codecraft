import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { organizationAPI } from '../../api/organization'
import StatCard from '../../components/dashboard/StatCard'
import DepartmentChart from '../../components/charts/DepartmentChart'
import CategoryChart from '../../components/charts/CategoryChart'
import IssueTable from '../../components/issues/IssueTable'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { unwrapApiList } from '../../utils/apiData'

function numberFrom(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback
}

export default function OrganizationDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [departments, setDepartments] = useState([])
  const [staffCount, setStaffCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const [dashboardResponse, departmentResponse, staffResponse] = await Promise.all([
          organizationAPI.getDashboard(),
          organizationAPI.getDepartments(),
          organizationAPI.getStaff(),
        ])
        const stats = dashboardResponse?.data ?? dashboardResponse
        if (dashboardResponse?.success === false) throw new Error(dashboardResponse.message || 'Unable to load organization dashboard.')
        const departmentList = unwrapApiList(departmentResponse, ['departments'])
        const staffList = unwrapApiList(staffResponse, ['staff', 'users'])
        if (active) {
          setDashboard(stats && typeof stats === 'object' ? stats : {})
          setDepartments(departmentList)
          setStaffCount(staffList.length)
        }
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError, 'Unable to load organization dashboard.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [reloadKey])

  if (loading) return <div><div className="page-heading"><div><p className="eyebrow">Organization</p><h2>Dashboard</h2><p className="muted">A clear view across departments and wards.</p></div></div><div className="stats-grid"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div><div className="dashboard-section chart-grid"><Skeleton /><Skeleton /></div></div>

  const departmentStats = departments.map((department) => department.dashboard || {})
  const totalIssues = departmentStats.reduce((sum, item) => sum + numberFrom(item.total_issues, 0), 0)
  const openIssues = departmentStats.reduce((sum, item) => sum + numberFrom(item.open_issues, 0), 0)
  const resolvedIssues = departmentStats.reduce((sum, item) => sum + numberFrom(item.resolved_issues, 0), 0)
  const dashboardData = dashboard || {}
  const total = numberFrom(dashboardData.total_issues, totalIssues)
  const open = numberFrom(dashboardData.open_issues, openIssues)
  const resolved = numberFrom(dashboardData.resolved_issues, resolvedIssues)
  const departmentChartData = departments.map((department) => ({ name: department.name || 'Department', issues: numberFrom(department.dashboard?.total_issues, 0) }))
  const categoryData = dashboardData.issue_statistics?.by_category
    ? Object.entries(dashboardData.issue_statistics.by_category).map(([name, value]) => ({ name, value: Number(value) || 0 }))
    : []
  const recentIssues = Array.isArray(dashboardData.recent_issues) ? dashboardData.recent_issues : []

  return <div>
    <div className="page-heading"><div><p className="eyebrow">{user?.organization_name || 'Organization'}</p><h2>Organization overview</h2><p className="muted">A clear view across departments and wards.</p></div><div className="topbar-actions"><Link className="btn btn-secondary" to="/organization/departments">Manage departments</Link><Button variant="ghost" onClick={() => setReloadKey((key) => key + 1)}>Refresh</Button></div></div>
    {error ? <div className="dashboard-section"><ErrorState title="Unable to load dashboard" message={error} action={<Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>} /></div> : <>
      <div className="stats-grid">
        <StatCard label="Total issues" value={total} icon={ClipboardList} />
        <StatCard label="Open issues" value={open} detail="Across all departments" icon={Clock} tone="indigo" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} tone="green" />
        <StatCard label="Departments" value={departments.length} detail={`${staffCount} staff members`} icon={Building2} tone="violet" />
      </div>
      {(departmentChartData.length > 0 || categoryData.length > 0) && <div className="dashboard-section chart-grid">
        {departmentChartData.length > 0 && <div className="surface chart-panel"><h3>Issues by department</h3><DepartmentChart data={departmentChartData} /></div>}
        {categoryData.length > 0 && <div className="surface chart-panel"><h3>Issues by category</h3><CategoryChart data={categoryData} /></div>}
      </div>}
      <div className="dashboard-section"><div className="section-heading"><h2>Recent activity</h2></div>{recentIssues.length ? <IssueTable issues={recentIssues} department readOnly /> : <div className="surface"><EmptyState title="No recent issues" message="The organization dashboard did not return recent issue records." /></div>}</div>
    </>}
  </div>
}
