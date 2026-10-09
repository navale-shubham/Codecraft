import { unwrapApiList } from './apiData'

const statusLabels = {
  REPORTED: 'Reported',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In Progress',
  RESOLUTION_PENDING: 'Resolution Pending',
  RESOLVED: 'Resolved',
}

export function formatIssueStatus(status) {
  return statusLabels[status] || status
}

export function getIssueCategory(issue) {
  const category = issue?.category
  if (typeof category === 'string') return category
  return category?.name || issue?.category_name || 'Uncategorized'
}

export function getIssueLocation(issue) {
  const location = issue?.location
  if (typeof location === 'string') return location
  if (location?.address) return location.address
  const latitude = location?.latitude ?? issue?.latitude
  const longitude = location?.longitude ?? issue?.longitude
  if (latitude !== null && latitude !== undefined && latitude !== '' && longitude !== null && longitude !== undefined && longitude !== '' && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    return `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
  }
  return 'Location not set'
}

export function normalizeIssue(issue) {
  return {
    ...issue,
    id: issue?.id,
    title: issue?.title || issue?.name || 'Untitled issue',
    category: getIssueCategory(issue),
    location: getIssueLocation(issue),
    reportedDate: issue?.reported_at || issue?.created_at || null,
    assignedStaff: issue?.assigned_to?.name || (typeof issue?.assigned_to === 'string' ? issue.assigned_to : 'Unassigned'),
  }
}

export function extractIssueArray(result) {
  return unwrapApiList(result, ['issues']).map(normalizeIssue)
}
