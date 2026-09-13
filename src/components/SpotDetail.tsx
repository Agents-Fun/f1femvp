import { ArrowLeft, Clock3, Compass, Edit3, MapPin, Navigation, Trash2 } from 'lucide-react'
import type { PhotographySpot } from '../types'
import { compassLabel } from '../utils/geo'
import { Photo } from './Photo'

export function SpotDetail({ spot, onBack, onNavigate, onEdit, onDelete }: { spot:PhotographySpot, onBack:()=>void, onNavigate:()=>void, onEdit:()=>void, onDelete:()=>void }) {
  return <div className="page detail-page">
    <header className="page-bar"><button className="icon-button" onClick={onBack} aria-label="Back to map"><ArrowLeft /></button><span>Spot details</span><div className="bar-actions">{!spot.isSeed && <><button className="icon-button" onClick={onEdit} aria-label="Edit spot"><Edit3 /></button><button className="icon-button danger" onClick={onDelete} aria-label="Delete spot"><Trash2 /></button></>}</div></header>
    <main className="detail-content">
      <div className="gallery">{spot.photos.map(photo=><Photo key={photo.id} photo={photo}/>)}</div>
      <div className="detail-copy">
        <span className="eyebrow">{spot.photographyTypes.join(' / ')}</span><h1>{spot.name}</h1>
        {spot.description && <p className="lead">{spot.description}</p>}
        <section className="key-facts">
          <div><MapPin/><span>Exact shooting position<strong>{spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}</strong></span></div>
          <div><Compass/><span>Shooting direction<strong>{spot.shootingBearing}° {compassLabel(spot.shootingBearing)}</strong></span></div>
          <div><Clock3/><span>Recommended time<strong>{spot.recommendedTimes.join(' · ')}</strong></span></div>
        </section>
        <section className="detail-grid">
          <Info label="Recommended conditions" value={spot.recommendedConditions.join(' / ') || 'Not provided'} />
          <Info label="Lens / focal length" value={spot.focalLength || 'Not provided'} />
          <Info label="Camera angle" value={spot.cameraAngle || 'Not provided'} />
          <Info label="Composition tip" value={spot.compositionTip || 'Not provided'} wide />
          <Info label="Shooting tip" value={spot.shootingTip || 'Not provided'} wide />
        </section>
      </div>
    </main>
    <footer className="sticky-action"><button className="primary-button wide" onClick={onNavigate}><Navigation/>Navigate to Shooting Position</button></footer>
  </div>
}

function Info({ label, value, wide=false }: {label:string,value:string,wide?:boolean}) {
  return <div className={`info-card ${wide?'wide':''}`}><span>{label}</span><strong>{value}</strong></div>
}
