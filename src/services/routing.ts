import type { GeoPoint } from '../types'

export interface RouteResult {
  coordinates: [number, number][]
  distance: number
  duration: number
  instruction?: string
  routeEnd: GeoPoint
}

export async function getWalkingRoute(from: GeoPoint, to: GeoPoint): Promise<RouteResult> {
  const key = import.meta.env.VITE_ORS_API_KEY
  if (!key) throw new Error('Walking route unavailable. Direct guidance shown.')
  const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [[from.longitude, from.latitude], [to.longitude, to.latitude]], instructions: true }),
  })
  if (!response.ok) throw new Error('Walking route unavailable. Direct guidance shown.')
  const data = await response.json()
  const feature = data.features?.[0]
  if (!feature) throw new Error('Walking route unavailable. Direct guidance shown.')
  const coordinates = feature.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number])
  const final = coordinates[coordinates.length - 1]
  return {
    coordinates,
    distance: feature.properties.summary.distance,
    duration: feature.properties.summary.duration,
    instruction: feature.properties.segments?.[0]?.steps?.[0]?.instruction,
    routeEnd: { latitude: final[0], longitude: final[1] },
  }
}
