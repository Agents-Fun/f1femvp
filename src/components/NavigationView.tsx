import { ArrowLeft, Footprints, LocateFixed, Navigation2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { GeoPoint, PhotographySpot } from '../types'
import { distanceMetres, formatDistance } from '../utils/geo'
import { getWalkingRoute, type RouteResult } from '../services/routing'
import { MapCanvas } from './MapCanvas'

export function NavigationView({ heading, enableCompass, spot, position, geoMessage, startLocation, onBack, onArrive }: { heading:number|null, enableCompass:()=>Promise<void>, spot:PhotographySpot, position:GeoPoint|null, geoMessage:string, startLocation:()=>void, onBack:()=>void, onArrive:()=>void }) {
  const [route, setRoute] = useState<RouteResult|null>(null)
  const [routeState, setRouteState] = useState<'idle'|'loading'|'success'|'fallback'>('idle')
  const [routeMessage, setRouteMessage] = useState('')
  const target = useMemo(()=>({latitude:spot.latitude,longitude:spot.longitude}),[spot])
  const remaining = position ? distanceMetres(position,target) : null

  useEffect(()=>{ startLocation() },[startLocation])
  useEffect(()=>{
    if (!position || routeState!=='idle') return
    setRouteState('loading'); setRouteMessage('Finding walking route...')
    getWalkingRoute(position,target).then(value=>{setRoute(value);setRouteState('success');setRouteMessage('')}).catch(error=>{setRouteState('fallback');setRouteMessage(error.message)})
  },[position,target,routeState])

  const finalGap = route && distanceMetres(route.routeEnd,target) > 2 ? [[route.routeEnd.latitude,route.routeEnd.longitude],[target.latitude,target.longitude]] as [number,number][] : undefined
  const direct = routeState==='fallback' && position ? [[position.latitude,position.longitude],[target.latitude,target.longitude]] as [number,number][] : finalGap
  const minutes = route ? Math.max(1,Math.round(route.duration/60)) : remaining ? Math.max(1,Math.round(remaining/80)) : null
  const arrived = remaining !== null && remaining <= 10

  return <div className="page navigation-page">
    <header className="page-bar overlay"><button className="icon-button" onClick={onBack} aria-label="Back"><ArrowLeft/></button><div><span className="bar-kicker">NAVIGATING TO</span><strong>{spot.name}</strong></div><button className="icon-button" onClick={startLocation} aria-label="Refresh location"><LocateFixed/></button></header>
    <MapCanvas heading={heading} userPosition={position} target={target} route={route?.coordinates} directLine={direct} center={position||target} zoom={14} />
    <section className="navigation-card">
      {arrived && <div className="arrival-banner">You have reached the shooting position.</div>}
      {routeMessage && <p className={routeState==='fallback'?'notice warning':'notice'}>{routeMessage}</p>}
      {geoMessage && <p className="notice warning">{geoMessage}</p>}
      <button className="secondary-button" onClick={enableCompass}>{heading===null?'Enable Compass':`Heading ${heading}°`}</button><div className="route-summary"><div><span>REMAINING</span><strong>{remaining===null?'Waiting for GPS':formatDistance(remaining)}</strong></div><div><span>ESTIMATED</span><strong>{minutes?`${minutes} min walk`:'—'}</strong></div></div>
      <div className="maneuver"><Navigation2/><span>{route?.instruction || (position?'Continue toward the exact shooting position.':'Enable location to begin live navigation.')}</span></div>
      {position?.accuracy && <p className="accuracy">GPS accuracy: ±{Math.round(position.accuracy)} m</p>}
      <button className="primary-button wide" onClick={onArrive}><Footprints/>I've Arrived</button>
    </section>
  </div>
}
