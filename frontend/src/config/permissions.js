export const permissions = {
  CITIZEN: ['ISSUE_CREATE', 'ISSUE_VIEW_OWN', 'ISSUE_COMMENT', 'ISSUE_REOPEN'],
  FIELD_STAFF: ['ISSUE_VIEW_ASSIGNED', 'ISSUE_UPDATE', 'ISSUE_RESOLVE'],
  DEPARTMENT_STAFF: ['ISSUE_VIEW_DEPARTMENT', 'ISSUE_ASSIGN', 'ISSUE_REASSIGN', 'ISSUE_RESOLVE', 'STAFF_MANAGE'],
  ORG_ADMIN: ['DEPARTMENT_MANAGE', 'USER_MANAGE', 'CATEGORY_MANAGE', 'ANALYTICS_VIEW'],
}
export function hasPermission(role, permission) { return permissions[role]?.includes(permission) || false }
