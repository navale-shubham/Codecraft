import client from './client'

export const departmentAPI = {
  async getDashboard() {
    const response = await client.get('/departments/dashboard')
    return response.data
  },

  async getFieldStaff() {
    const response = await client.get('/departments/fieldstaff')
    return response.data
  },

  async createFieldStaff(name, email, password) {
    const response = await client.post('/departments/fieldstaff', {
      name,
      email,
      password,
    })
    return response.data
  },

  async getIssues() {
    const response = await client.get('/departments/issues')
    return response.data
  },

  async assignIssue(issueId, assignedToId, dueAt) {
    const response = await client.post(`/departments/issues/${issueId}/assign`, {
      issue_id: issueId,
      assigned_to_id: assignedToId,
      due_at: dueAt,
    })
    return response.data
  },

  async resolveIssue(issueId) {
    const response = await client.post(`/departments/issues/${issueId}/resolve`)
    return response.data
  },
}

export default departmentAPI
