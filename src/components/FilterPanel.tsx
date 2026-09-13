import { X } from 'lucide-react'
import { photographyTypes, recommendedTimes } from '../data/seedSpots'
import type { PhotographyType, RecommendedTime } from '../types'

export interface Filters {
  distances: string[]
  types: PhotographyType[]
  times: RecommendedTime[]
}

const distanceOptions = ['< 1 km','1–3 km','3–5 km','5+ km']

export function FilterPanel({ value, gpsAvailable, onChange, onClose, onClear }: { value:Filters, gpsAvailable:boolean, onChange:(filters:Filters)=>void, onClose:()=>void, onClear:()=>void }) {
  const toggle = <T extends string>(list:T[], item:T) => list.includes(item) ? list.filter(value=>value!==item) : [...list,item]
  return <aside className="side-panel filter-panel" aria-label="Photography spot filters">
    <div className="panel-heading"><div><span className="eyebrow">REFINE MAP</span><h2>Filters</h2></div><button className="icon-button" onClick={onClose} aria-label="Close filters"><X /></button></div>
    <section><h3>Distance</h3>{!gpsAvailable && <p className="help-text">Enable location to filter by distance.</p>}<div className="chip-grid">{distanceOptions.map(option=><button disabled={!gpsAvailable} className={value.distances.includes(option)?'chip active':'chip'} key={option} onClick={()=>onChange({...value,distances:toggle(value.distances,option)})}>{option}</button>)}</div></section>
    <section><h3>Photography type</h3><div className="chip-grid">{photographyTypes.map(option=><button className={value.types.includes(option)?'chip active':'chip'} key={option} onClick={()=>onChange({...value,types:toggle(value.types,option)})}>{option}</button>)}</div></section>
    <section><h3>Recommended time</h3><div className="chip-grid">{recommendedTimes.map(option=><button className={value.times.includes(option)?'chip active':'chip'} key={option} onClick={()=>onChange({...value,times:toggle(value.times,option)})}>{option}</button>)}</div></section>
    <button className="secondary-button full" onClick={onClear}>Clear Filters</button>
  </aside>
}
