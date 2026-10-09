function validationMessages(detail) {
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return detail.message || detail.detail || ''
  }
  if (!Array.isArray(detail)) return ''
  return detail.map((item) => {
    const field = Array.isArray(item?.loc) ? item.loc.at(-1) : ''
    const message = item?.msg || item?.message
    return [field, message].filter(Boolean).join(': ')
  }).filter(Boolean).join('. ')
}

export function getApiErrorMessage(error, fallback = 'Unable to complete this request. Please try again.') {
  const status = error?.response?.status
  const detail = error?.response?.data?.detail ?? error?.response?.data?.message
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'Requested information was not found.'
  if (status >= 500) return 'Server error. Please try again later.'
  if (status === 422) {
    return validationMessages(detail) || 'Please check the issue details and try again.'
  }
  const message = validationMessages(detail)
  if (message) return message
  if (!error?.response && error?.message && !error?.isAxiosError) return error.message
  return fallback
}
