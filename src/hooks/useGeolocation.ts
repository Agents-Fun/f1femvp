import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoPoint, GeoStatus } from '../types'

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPoint | null>(null)
  const [status, setStatus] = useState<GeoStatus>('idle')
  const [message, setMessage] = useState('')
  const watchRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    watchRef.current = null
  }, [])

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      setMessage('Current location unavailable.')
      return
    }
    stop()
    setStatus('loading')
    setMessage('Finding your location...')
    watchRef.current = navigator.geolocation.watchPosition(
      value => {
        setPosition({ latitude: value.coords.latitude, longitude: value.coords.longitude, accuracy: value.coords.accuracy })
        setStatus('granted')
        setMessage('')
      },
      error => {
        const denied = error.code === error.PERMISSION_DENIED
        setStatus(denied ? 'denied' : 'unavailable')
        setMessage(denied ? 'Location access is required for live navigation.' : 'Current location unavailable.')
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    )
  }, [stop])

  useEffect(() => stop, [stop])
  return { position, status, message, start, stop }
}
