import { Component, useEffect, useRef, useState } from 'react'
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import { Edit3, MapPin, Maximize, MousePointer2, Trash2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import Button from '../common/Button'
import L from '../../utils/leafletGeoman'
import { buildWardGeoBoundary, parseWardBoundary } from '../../utils/wardBoundary'

const DEFAULT_CENTER = [22.9734, 78.6569]
const ACTIVE_STYLE = { color: '#4f46e5', weight: 3, opacity: 0.95, fillColor: '#4f46e5', fillOpacity: 0.24 }

class LeafletMapBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <div className="ward-map-message ward-map-error" role="alert">Unable to initialize the map. Refresh the page and try again.</div>
    return this.props.children
  }
}

function MapController({ wards, pointsChanged, editingChanged, actionsRef, mapFailure }) {
  const map = useMap()
  const wardsRef = useRef(wards)
  const pointsChangedRef = useRef(pointsChanged)
  const editingChangedRef = useRef(editingChanged)
  const mapFailureRef = useRef(mapFailure)

  useEffect(() => {
    wardsRef.current = wards
    pointsChangedRef.current = pointsChanged
    editingChangedRef.current = editingChanged
    mapFailureRef.current = mapFailure
  }, [editingChanged, mapFailure, pointsChanged, wards])

  useEffect(() => {
    let activeLayer = null
    let activeLayerListener = null
    let editing = false
    const editEvents = 'pm:edit pm:markerdrag pm:markerdragend pm:vertexadded pm:vertexremoved'

    const readCoordinates = (layer) => {
      const shape = layer.getLatLngs()
      const ring = Array.isArray(shape[0]) ? shape[0] : shape
      const result = ring.map(({ lat, lng }) => ({ latitude: lat, longitude: lng }))
      if (result.length > 1 && result[0].latitude === result.at(-1).latitude && result[0].longitude === result.at(-1).longitude) result.pop()
      return result
    }

    const notifyCoordinates = (layer) => pointsChangedRef.current(readCoordinates(layer))

    const clearActive = () => {
      map.pm?.disableDraw()
      if (activeLayer) {
        if (activeLayerListener) activeLayer.off(editEvents, activeLayerListener)
        if (activeLayer.pm?.enabled()) activeLayer.pm.disable()
        map.removeLayer(activeLayer)
        activeLayer = null
      }
      editing = false
      editingChangedRef.current(false)
      pointsChangedRef.current([])
    }

    const fitAllWards = () => {
      const allPoints = wardsRef.current.flatMap((ward) => parseWardBoundary(ward.geo_boundary))
      if (!allPoints.length) return
      const bounds = L.latLngBounds(allPoints.map(({ lat, lng }) => [lat, lng]))
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 })
    }

    const handleCreate = (event) => {
      if (event.shape !== 'Polygon') {
        map.removeLayer(event.layer)
        return
      }
      clearActive()
      activeLayer = event.layer
      activeLayer.setStyle(ACTIVE_STYLE)
      activeLayerListener = () => notifyCoordinates(activeLayer)
      activeLayer.on(editEvents, activeLayerListener)
      editing = true
      editingChangedRef.current(true)
      activeLayer.pm.enable({ allowSelfIntersection: false })
      notifyCoordinates(activeLayer)
    }

    try {
      if (!map.pm) throw new Error('Leaflet-Geoman did not initialize.')
      map.pm.setGlobalOptions({ snappable: true, allowSelfIntersection: false })
      map.on('pm:create', handleCreate)
      actionsRef.current = {
        draw() {
          clearActive()
          map.pm.enableDraw('Polygon', {
            snappable: true,
            allowSelfIntersection: false,
            pathOptions: ACTIVE_STYLE,
            templineStyle: { color: '#4f46e5', weight: 2 },
            hintlineStyle: { color: '#4f46e5', dashArray: [5, 5] },
          })
        },
        edit() {
          if (!activeLayer) return false
          editing = !editing
          if (editing) activeLayer.pm.enable({ allowSelfIntersection: false })
          else activeLayer.pm.disable()
          editingChangedRef.current(editing)
          return editing
        },
        clear: clearActive,
        fitBoundary() {
          if (activeLayer) {
            const bounds = activeLayer.getBounds()
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 })
          }
        },
        fitAllWards,
      }
    } catch (error) {
      mapFailureRef.current(error)
    }

    return () => {
      map.off('pm:create', handleCreate)
      map.pm?.disableDraw()
      if (activeLayer) {
        if (activeLayerListener) activeLayer.off(editEvents, activeLayerListener)
        if (activeLayer.pm?.enabled()) activeLayer.pm.disable()
        map.removeLayer(activeLayer)
      }
      activeLayerListener = null
      actionsRef.current = null
    }
  }, [actionsRef, map])

  return null
}

export default function WardBoundaryMap({ wards, onBoundaryChange }) {
  const actionsRef = useRef(null)
  const [points, setPoints] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [mapError, setMapError] = useState('')

  const pointsChanged = (nextPoints) => {
    setPoints(nextPoints)
    onBoundaryChange(nextPoints)
    if (nextPoints.length < 3) setIsEditing(false)
  }

  const mapFailure = (error) => {
    console.error('Leaflet map initialization failed:', error)
    setMapError('Unable to initialize the map. Check your connection and refresh the page.')
  }

  const runAction = (action) => actionsRef.current?.[action]?.()

  return <section className="ward-boundary-card">
    <div className="ward-section-heading"><div><p className="eyebrow">Boundary selection</p><h4>Draw the ward on the map</h4><p className="muted">Click Draw Boundary, then click map locations to add points. Finish by clicking the first point or double-clicking.</p></div></div>
    <div className="ward-map-toolbar" role="toolbar" aria-label="Ward boundary map controls">
      <Button type="button" onClick={() => {
        if (points.length && !window.confirm('Start a new boundary and clear the current one?')) return
        setMapError('')
        runAction('draw')
      }} disabled={Boolean(mapError)}><MapPin size={16} /> Draw Boundary</Button>
      {points.length >= 3 && <Button type="button" variant="secondary" onClick={() => setIsEditing(runAction('edit') ?? false)}><Edit3 size={16} /> {isEditing ? 'Done Editing' : 'Edit Boundary'}</Button>}
      <Button type="button" variant="outline" onClick={() => { runAction('clear'); setIsEditing(false) }}><Trash2 size={16} /> Clear</Button>
      <Button type="button" variant="outline" onClick={() => runAction('fitBoundary')} disabled={!points.length}><Maximize size={16} /> Fit Boundary</Button>
      <Button type="button" variant="outline" onClick={() => runAction('fitAllWards')} disabled={!wards.some((ward) => parseWardBoundary(ward.geo_boundary).length)}><MousePointer2 size={16} /> Fit All Wards</Button>
    </div>
    <p className="ward-map-instruction" aria-live="polite">{points.length >= 3 ? 'Boundary ready. Drag vertices to refine it before saving.' : 'A ward boundary needs at least 3 distinct points.'}</p>
    <LeafletMapBoundary>
      <div className="ward-map-wrap">
        {mapError && <div className="ward-map-overlay ward-map-error" role="alert">{mapError}</div>}
        <MapContainer center={DEFAULT_CENTER} zoom={5} scrollWheelZoom className="ward-map-canvas">
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>' />
          <MapController wards={wards} pointsChanged={pointsChanged} editingChanged={setIsEditing} actionsRef={actionsRef} mapFailure={mapFailure} />
          {wards.map((ward, index) => {
            const path = parseWardBoundary(ward.geo_boundary)
            if (path.length < 3) return null
            return <Polygon key={ward.id || `${ward.name}-${index}`} positions={path.map(({ lat, lng }) => [lat, lng])} interactive={false} pathOptions={{ color: index % 2 ? '#818cf8' : '#60a5fa', weight: 2, opacity: 0.75, fillColor: index % 2 ? '#818cf8' : '#60a5fa', fillOpacity: 0.1 }} />
          })}
        </MapContainer>
      </div>
    </LeafletMapBoundary>
    {points.length > 0 && <p className="ward-live-point">Latest point: {points.at(-1).latitude.toFixed(6)}, {points.at(-1).longitude.toFixed(6)}</p>}
    <div className="ward-coordinate-header"><div><strong>Boundary coordinates</strong><span>{points.length} point{points.length === 1 ? '' : 's'}</span></div></div>
    <div className="ward-coordinate-scroll"><table className="ward-coordinate-table"><thead><tr><th>#</th><th>Latitude</th><th>Longitude</th></tr></thead><tbody>{points.length ? points.map((point, index) => <tr key={`${point.latitude}-${point.longitude}-${index}`}><td>{index + 1}</td><td>{point.latitude.toFixed(6)}</td><td>{point.longitude.toFixed(6)}</td></tr>) : <tr><td colSpan="3">Boundary coordinates will appear here after you draw a polygon.</td></tr>}</tbody></table></div>
    <details className="ward-json-details"><summary>Advanced: Generated JSON</summary><pre>{JSON.stringify(buildWardGeoBoundary(points), null, 2)}</pre></details>
    <p className="ward-map-note">OpenStreetMap contributors · Existing wards are shown with subtle overlays. Use “Fit All Wards” to view available boundaries.</p>
  </section>
}
