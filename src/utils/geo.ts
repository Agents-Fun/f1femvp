import type { GeoPoint } from '../types'

const R = 6371000
const rad = (degrees: number) => degrees * Math.PI / 180

export function distanceMetres(a: GeoPoint, b: GeoPoint) {
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const lat1 = rad(a.latitude)
  const lat2 = rad(b.latitude)
  const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`
}

export function normaliseAngle(value: number) {
  return ((Math.round(value) % 360) + 360) % 360
}

export function compassLabel(value: number) {
  const labels = ['N','NE','E','SE','S','SW','W','NW']
  return labels[Math.round(normaliseAngle(value) / 45) % 8]
}

export function shortestTurn(current: number, target: number) {
  const difference = ((normaliseAngle(target) - normaliseAngle(current) + 540) % 360) - 180
  const abs = Math.abs(difference)
  if (abs <= 5) return { difference, amount: abs, direction: 'Aligned' as const }
  return { difference, amount: abs, direction: difference > 0 ? 'Right' as const : 'Left' as const }
}
