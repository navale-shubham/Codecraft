import client from './client'

function responseData(response) {
  if (response.data?.success === false) {
    throw new Error(response.data.message || 'The server could not complete this request.')
  }
  return response.data
}

export const authAPI = {
  async login(username, password) {
    // Backend uses application/x-www-form-urlencoded
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await client.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  async registerCitizen(name, email, password) {
    const response = await client.post('/auth/citizen/register', {
      name,
      email,
      password,
    })
    return responseData(response)
  },

  async registerOrganization(name, email, organizationName, password) {
    const response = await client.post('/auth/organization/register', {
      name,
      email,
      organization_name: organizationName,
      password,
    })
    return responseData(response)
  },
}

export default authAPI
