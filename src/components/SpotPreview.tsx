import { ArrowRight, Clock3, MapPin, X } from 'lucide-react'
import type { PhotographySpot } from '../types'
import { Photo } from './Photo'

export function SpotPreview({ spot, distance, onClose, onView }: { spot:PhotographySpot, distance:string, onClose:()=>void, onView:()=>void }) {
  return <article className="spot-preview">
    <Photo photo={spot.photos[0]} />
    <div className="preview-body">
      <button className="icon-button close-preview" onClick={onClose} aria-label="Close preview"><X /></button>
      <span className="eyebrow">{spot.photographyTypes.join(' / ')}</span>
      <h2>{spot.name}</h2>
      <div className="preview-meta"><span><MapPin />{distance}</span><span><Clock3 />Best: {spot.recommendedTimes.join(', ')}</span></div>
      <button className="primary-button" onClick={onView}>View Spot <ArrowRight /></button>
    </div>
  </article>
}
