import { useEffect } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { GeoPoint, PhotographySpot } from '../types'

const spotIcon = L.divIcon({ className: 'spot-marker-wrap', html: '<span class="spot-marker"><span></span></span>', iconSize: [34,42], iconAnchor: [17,40] })
const selectedIcon = L.divIcon({ className: 'spot-marker-wrap', html: '<span class="spot-marker selected"><span></span></span>', iconSize: [40,48], iconAnchor: [20,46] })
const targetIcon = L.divIcon({ className: 'spot-marker-wrap', html: '<span class="target-marker">◎</span>', iconSize: [38,38], iconAnchor: [19,19] })

function Recenter({ point, zoom }: { point?: GeoPoint, zoom?: number }) {
  const map = useMap()
  useEffect(() => { if (point) map.setView([point.latitude, point.longitude], zoom ?? map.getZoom()) }, [map, point, zoom])
  return null
}

function ClickHandler({ onClick }: { onClick?: (point: GeoPoint) => void }) {
  useMapEvents({ click: event => onClick?.({ latitude:event.latlng.lat, longitude:event.latlng.lng }) })
  return null
}

interface Props {
  heading?: number | null
  spots?: PhotographySpot[]
  userPosition?: GeoPoint | null
  selectedId?: string
  onSelect?: (spot: PhotographySpot) => void
  route?: [number, number][]
  directLine?: [number, number][]
  target?: GeoPoint
  center?: GeoPoint
  zoom?: number
  editablePoint?: GeoPoint
  onPointChange?: (point: GeoPoint) => void
  className?: string
}

export function MapCanvas({ heading, spots=[], userPosition, selectedId, onSelect, route, directLine, target, center, zoom=11, editablePoint, onPointChange, className='' }: Props) {
  const initial = center || userPosition || { latitude:-33.8688, longitude:151.2093 }
  return <MapContainer center={[initial.latitude, initial.longitude]} zoom={zoom} className={`map-canvas ${className}`} zoomControl attributionControl>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Recenter point={center} zoom={zoom} />
    <ClickHandler onClick={onPointChange} />
    {spots.map(spot => <Marker key={spot.id} position={[spot.latitude,spot.longitude]} icon={spot.id===selectedId?selectedIcon:spotIcon} eventHandlers={{click:()=>onSelect?.(spot)}}>
      <Tooltip direction="top" offset={[0,-32]}>{spot.name}</Tooltip>
    </Marker>)}
    {userPosition && heading != null && <Marker interactive={false} position={[userPosition.latitude,userPosition.longitude]} icon={L.divIcon({className:'heading-marker',html:`<div style="transform:rotate(${heading}deg)"><span></span></div>`,iconSize:[70,70],iconAnchor:[35,35]})}/>}
    {userPosition && <CircleMarker center={[userPosition.latitude,userPosition.longitude]} radius={9} pathOptions={{color:'#fff',weight:3,fillColor:'#1976d2',fillOpacity:1}}><Tooltip>Your location{userPosition.accuracy ? ` · ±${Math.round(userPosition.accuracy)} m` : ''}</Tooltip></CircleMarker>}
    {route && <Polyline positions={route} pathOptions={{color:'#1565c0',weight:6,opacity:.9}} />}
    {directLine && <Polyline positions={directLine} pathOptions={{color:'#1565c0',weight:4,dashArray:'8 10',opacity:.85}} />}
    {target && <Marker position={[target.latitude,target.longitude]} icon={targetIcon}><Tooltip>Shooting position</Tooltip></Marker>}
    {editablePoint && <Marker draggable position={[editablePoint.latitude,editablePoint.longitude]} icon={targetIcon} eventHandlers={{dragend:event=>{const p=event.target.getLatLng();onPointChange?.({latitude:p.lat,longitude:p.lng})}}}><Tooltip permanent direction="top" offset={[0,-22]}>Exact shooting position</Tooltip></Marker>}
  </MapContainer>
}
