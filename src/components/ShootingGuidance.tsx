import { ArrowLeft, Camera, Check, Compass } from 'lucide-react'
import type { PhotographySpot } from '../types'
import { useCompass } from '../hooks/useCompass'
import { compassLabel, shortestTurn } from '../utils/geo'
import { Photo } from './Photo'

export function ShootingGuidance({ spot, onBack, onDone }: { spot:PhotographySpot,onBack:()=>void,onDone:()=>void }) {
  const { heading, status, enable } = useCompass()
  const turn = heading===null ? null : shortestTurn(heading,spot.shootingBearing)
  return <div className="page guidance-page">
    <header className="page-bar"><button className="icon-button" onClick={onBack} aria-label="Back"><ArrowLeft/></button><span>Shooting guidance</span><span></span></header>
    <main className="guidance-content">
      <Photo photo={spot.photos[0]} className="guidance-photo"/>
      <section className={turn?.direction==='Aligned'?'compass-card aligned':'compass-card'}>
        <span className="eyebrow">SHOOTING DIRECTION</span>
        <div className="compass-dial"><div className="north">N</div><div className="bearing-arrow" style={{transform:`rotate(${spot.shootingBearing}deg)`}}>↑</div><div className="dial-center"></div></div>
        <div className="target-bearing">{spot.shootingBearing}° <span>{compassLabel(spot.shootingBearing)}</span></div>
        <div className="heading-grid"><div><span>TARGET</span><strong>{spot.shootingBearing}° {compassLabel(spot.shootingBearing)}</strong></div><div><span>CURRENT</span><strong>{heading===null?'—':`${Math.round(heading)}°`}</strong></div><div><span>TURN</span><strong>{turn ? turn.direction==='Aligned' ? 'Aligned' : `${Math.round(turn.amount)}° ${turn.direction}` : '—'}</strong></div></div>
        {turn?.direction==='Aligned' && <div className="aligned-message"><Check/>Direction aligned</div>}
        {(status==='idle'||status==='loading'||status==='unavailable') && <button className="secondary-button" onClick={enable}><Compass/>Enable Compass</button>}
        {status==='denied' && <p className="notice warning">Compass permission was denied.</p>}
        {status==='unavailable' && <p className="notice warning">Live compass unavailable on this device.</p>}
      </section>
      <section className="parameter-list">
        <Parameter label="Shooting direction" value={`${spot.shootingBearing}° ${compassLabel(spot.shootingBearing)}`}/>
        <Parameter label="Lens / focal length" value={spot.focalLength||'Not provided'}/>
        <Parameter label="Camera angle" value={spot.cameraAngle||'Not provided'}/>
        <Parameter label="Recommended time" value={spot.recommendedTimes.join(' · ')}/>
        <Parameter label="Recommended conditions" value={spot.recommendedConditions.join(' / ')||'Not provided'}/>
        <Parameter label="Shooting tip" value={spot.shootingTip||'Not provided'}/>
      </section>
      <button className="primary-button wide" onClick={onDone}><Camera/>Done — Return to Map</button>
    </main>
  </div>
}

function Parameter({label,value}:{label:string,value:string}){return <div><span>{label}</span><strong>{value}</strong></div>}
