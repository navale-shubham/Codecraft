import client from './client'

export const organizationAPI = {
  async getDashboard() {
    const response = await client.get('/organizations/dashboard')
    return response.data
  },

  async getDepartments() {
    const response = await client.get('/organizations/departments')
    return response.data
  },

  async createDepartment(payload) {
    const response = await client.post('/organizations/departments', payload)
    return response.data
  },

  async getStaff() {
    const response = await client.get('/organizations/departments/staff')
    return response.data
  },

  async createStaff(payload) {
    const response = await client.post('/organizations/departments/staff', payload)
    return response.data
  },

  async getWards() {
    const response = await client.get('/organizations/wards')
    return response.data
  },

  async createWard(payload) {
    const response = await client.post('/organizations/wards', payload)
    return response.data
  },

  async getCategories() {
    const response = await client.get('/organizations/categories')
    return response.data
  },

  async createCategory(payload) {
    const response = await client.post('/organizations/categories', payload)
    return response.data
  },
}

export default organizationAPI
