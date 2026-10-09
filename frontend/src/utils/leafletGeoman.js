import L from 'leaflet'

if (typeof window !== 'undefined') window.L = L

await import('@geoman-io/leaflet-geoman-free')

export default L
