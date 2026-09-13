import { useCallback, useEffect, useRef, useState } from 'react'
import { normaliseAngle } from '../utils/geo'

type IOSDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function circularMean(values: number[]) {
  const radians = values.map(value => value * Math.PI / 180)
  const x = radians.reduce((sum, value) => sum + Math.cos(value), 0)
  const y = radians.reduce((sum, value) => sum + Math.sin(value), 0)
  return normaliseAngle(Math.atan2(y, x) * 180 / Math.PI)
}

export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle'|'loading'|'active'|'denied'|'unavailable'>('idle')
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const samples = useRef<number[]>([])

  const onOrientation = useCallback((event: DeviceOrientationEvent) => {
    const iosHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
    const raw = typeof iosHeading === 'number' && Number.isFinite(iosHeading) && iosHeading >= 0 ? iosHeading : event.absolute && typeof event.alpha === 'number' ? 360 - event.alpha : null
    if (raw === null) return
    if (timeout.current) clearTimeout(timeout.current)
    samples.current = [...samples.current.slice(-4), normaliseAngle(raw)]
    setHeading(circularMean(samples.current))
    setStatus('active')
  }, [])

  const enable = useCallback(async () => {
    if (!('DeviceOrientationEvent' in window)) {
      setStatus('unavailable')
      return
    }
    try {
      const orientation = DeviceOrientationEvent as IOSDeviceOrientationEvent
      if (typeof orientation.requestPermission === 'function') {
        const result = await orientation.requestPermission()
        if (result !== 'granted') {
          setStatus('denied')
          return
        }
      }
      window.removeEventListener('deviceorientation', onOrientation, true)
      window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener, true)
      window.addEventListener('deviceorientation', onOrientation, true)
      window.addEventListener('deviceorientationabsolute', onOrientation as EventListener, true)
      setStatus('loading')
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current=setTimeout(()=>{setHeading(null);setStatus('unavailable')},5000)
    } catch {
      setStatus('denied')
    }
  }, [onOrientation])

  useEffect(() => () => { window.removeEventListener('deviceorientation', onOrientation, true); window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener, true); if(timeout.current)clearTimeout(timeout.current) }, [onOrientation])
  return { heading, status, enable }
}
