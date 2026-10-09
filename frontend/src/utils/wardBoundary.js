export function buildWardGeoBoundary(points) {
  const ring = points.map(({ latitude, longitude }) => [longitude, latitude])
  if (ring.length > 0) {
    const [firstLongitude, firstLatitude] = ring[0]
    const [lastLongitude, lastLatitude] = ring[ring.length - 1]
    if (firstLongitude !== lastLongitude || firstLatitude !== lastLatitude) {
      ring.push([firstLongitude, firstLatitude])
    }
  }
  return { type: 'Polygon', coordinates: [ring] }
}

export function parseWardBoundary(value) {
  try {
    const boundary = typeof value === 'string' ? JSON.parse(value) : value
    const coordinates = boundary?.coordinates
    let raw = boundary?.type === 'Polygon' ? coordinates?.[0] : coordinates || boundary?.points || boundary
    if (boundary?.type !== 'Polygon' && Array.isArray(raw) && Array.isArray(raw[0]) && Array.isArray(raw[0][0])) {
      raw = raw[0]
    }
    if (!Array.isArray(raw)) return []

    const points = raw.map((point) => {
      if (Array.isArray(point) && point.length >= 2) {
        return { lat: Number(point[1]), lng: Number(point[0]) }
      }
      if (point && typeof point === 'object') {
        const lat = Number(point.latitude ?? point.lat)
        const lng = Number(point.longitude ?? point.lng ?? point.lon)
        return { lat, lng }
      }
      return null
    }).filter((point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
      && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180)

    if (points.length > 1 && points[0].lat === points.at(-1).lat && points[0].lng === points.at(-1).lng) points.pop()
    return points.length >= 3 ? points : []
  } catch {
    return []
  }
}

export function validateWardBoundary(name, points) {
  if (!name.trim()) return 'Please enter a ward name.'
  if (name.trim().length < 2) return 'Ward name must contain at least 2 characters.'
  if (!points.length) return 'Please draw a ward boundary.'
  if (points.length < 3) return 'A ward boundary must contain at least 3 points.'
  if (points.some(({ latitude, longitude }) => !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)) {
    return 'Boundary coordinates must use valid latitude and longitude values.'
  }
  const unique = new Set(points.map(({ latitude, longitude }) => `${latitude},${longitude}`))
  if (unique.size < 3) return 'A ward boundary must contain at least 3 unique points.'
  const signedDoubleArea = points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length]
    return area + point.longitude * next.latitude - next.longitude * point.latitude
  }, 0)
  if (Math.abs(signedDoubleArea) < 1e-12) return 'Boundary points must enclose an area.'
  return ''
}
