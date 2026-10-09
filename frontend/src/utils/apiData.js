export function unwrapApiData(response) {
  if (response?.success === false) {
    throw new Error(response.message || 'The server could not complete this request.')
  }
  return response?.data ?? response
}

export function unwrapApiList(response, keys = []) {
  const data = unwrapApiData(response)
  if (Array.isArray(data)) return data
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }
  throw new Error('The server returned an unexpected list response.')
}
