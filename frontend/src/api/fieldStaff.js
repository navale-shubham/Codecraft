import client from './client'

export const fieldStaffAPI = {
  async getAssignedIssues() {
    const response = await client.get('/field-staff/issues')
    return response.data
  },

  async resolveIssue(issueId) {
    const response = await client.post(`/field-staff/issues/${issueId}/resolve`)
    return response.data
  },
}

export default fieldStaffAPI
