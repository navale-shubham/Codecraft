import client from './client'

async function getCitizenProfile() {
  const response = await client.get('/citizens/me')
  return response.data
}

export const citizenAPI = {
  getCitizenProfile,

  // Retain the existing method name for pages already using it.
  getProfile: getCitizenProfile,

  async getIssueCategories() {
    const response = await client.get('/citizens/issue-categories')
    return response.data
  },

  async createIssue(payload) {
    const response = await client.post('/citizens/issues', payload)
    return response.data
  },

  async uploadIssueMedia(issueId, file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await client.post(`/citizens/issues/${issueId}/media`, formData)
    return response.data
  },

  async getMyIssues() {
    const response = await client.get('/citizens/issues')
    return response.data
  },

  async getIssue(issueId) {
    const response = await client.get(`/citizens/issues/${issueId}`)
    return response.data
  },
}

export default citizenAPI
