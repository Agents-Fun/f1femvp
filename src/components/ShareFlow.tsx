import { ArrowLeft, ArrowRight, Camera, Check, Compass, ImagePlus, LocateFixed, MapPin, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cameraAngles, photographyTypes, recommendedTimes } from '../data/seedSpots'
import { useCompass } from '../hooks/useCompass'
import type { GeoPoint, PhotographySpot, ShareDraft, StoredPhoto } from '../types'
import { compassLabel, normaliseAngle } from '../utils/geo'
import { compressImage } from '../utils/images'
import { MapCanvas } from './MapCanvas'
import { Photo } from './Photo'

const emptyDraft: ShareDraft = { photos:[], name:'', photographyTypes:[], recommendedTimes:[], recommendedConditions:[], focalLength:'', compositionTip:'', shootingTip:'', description:'' }
const steps = ['Photo','Position','Direction','Information','Preview']

function spotToDraft(spot:PhotographySpot):ShareDraft {
  return { id:spot.id, photos:spot.photos, name:spot.name, latitude:spot.latitude, longitude:spot.longitude, shootingBearing:spot.shootingBearing, photographyTypes:spot.photographyTypes, recommendedTimes:spot.recommendedTimes, recommendedConditions:spot.recommendedConditions, focalLength:spot.focalLength||'', cameraAngle:spot.cameraAngle, compositionTip:spot.compositionTip||'', shootingTip:spot.shootingTip||'', description:spot.description||'' }
}

export function ShareFlow({ position, requestLocation, editing, onCancel, onPublish }: { position:GeoPoint|null, requestLocation:()=>void, editing?:PhotographySpot|null, onCancel:()=>void, onPublish:(draft:ShareDraft)=>Promise<void> }) {
  const [step,setStep]=useState(editing?3:0)
  const [draft,setDraft]=useState<ShareDraft>(editing?spotToDraft(editing):emptyDraft)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [captureLocation,setCaptureLocation]=useState(false)
  const [captureDirection,setCaptureDirection]=useState(false)
  const {heading,status:compassStatus,enable}=useCompass()
  const set = (value:Partial<ShareDraft>)=>setDraft(current=>({...current,...value}))
  const chosenPoint = draft.latitude!==undefined&&draft.longitude!==undefined?{latitude:draft.latitude,longitude:draft.longitude}:undefined


  useEffect(()=>{if(captureLocation&&position){set({latitude:position.latitude,longitude:position.longitude});setCaptureLocation(false)}},[captureLocation,position])
  useEffect(()=>{if(captureDirection&&heading!==null){set({shootingBearing:Math.round(heading)});setCaptureDirection(false)}},[captureDirection,heading])

  async function addPhotos(files:FileList|null){
    if(!files) return
    setError('')
    const selected=Array.from(files).slice(0,3-draft.photos.length)
    try{
      setBusy(true)
      const photos:StoredPhoto[]=[]
      for(const file of selected){
        if(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type)){throw new Error('Use JPEG, PNG, WebP or a browser-supported HEIC image.')}
        const blob=await compressImage(file)
        photos.push({id:crypto.randomUUID?.()||`${Date.now()}-${photos.length}`,blob,alt:file.name})
      }
      set({photos:[...draft.photos,...photos]})
    }catch(e){setError(e instanceof Error?e.message:'Image upload failed.')}
    finally{setBusy(false)}
  }

  const canContinue = useMemo(()=> step===0?draft.photos.length>=1:step===1?chosenPoint!==undefined:step===2?draft.shootingBearing!==undefined:true,[step,draft.photos.length,draft.shootingBearing,chosenPoint])
  const allValid=draft.photos.length>0&&draft.name.trim()&&chosenPoint&&draft.shootingBearing!==undefined&&draft.photographyTypes.length>0&&draft.recommendedTimes.length>0

  function next(){ if(!canContinue){setError('Complete this required step before continuing.');return} setError('');setStep(value=>Math.min(4,value+1)) }
  const toggle=<T extends string>(list:T[],item:T)=>list.includes(item)?list.filter(v=>v!==item):[...list,item]

  async function publish(){
    if(!allValid){setError('Add a name, photo, position, direction, photography type and recommended time.');return}
    setBusy(true);setError('')
    try{await onPublish(draft)}catch(e){setError(e instanceof Error?e.message:'Local database write failed.');setBusy(false)}
  }

  return <div className="page share-page">
    <header className="page-bar"><button className="icon-button" onClick={step?()=>setStep(step-1):onCancel} aria-label="Back"><ArrowLeft/></button><div><span className="bar-kicker">{editing?'EDIT SPOT':'SHARE A SPOT'}</span><strong>{steps[step]}</strong></div><button className="icon-button" onClick={onCancel} aria-label="Cancel"><X/></button></header>
    <div className="stepper" aria-label={`Step ${step+1} of 5`}>{steps.map((label,index)=><span key={label} className={index<=step?'active':''}><i>{index<step?<Check/>:index+1}</i><b>{label}</b></span>)}</div>
    <main className="share-content">
      {step===0&&<section className="share-step"><span className="eyebrow">STEP 1 OF 5</span><h1>Add your reference photo</h1><p>Upload one to three photos. Large images are compressed before local storage.</p><label className="upload-box"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={event=>addPhotos(event.target.files)}/><ImagePlus/><strong>{busy?'Compressing images...':'Choose Photos'}</strong><span>Photo library or camera where supported</span></label><div className="photo-grid">{draft.photos.map(photo=><div key={photo.id}><Photo photo={photo}/><button onClick={()=>set({photos:draft.photos.filter(item=>item.id!==photo.id)})}>Remove</button></div>)}</div><p className="counter">{draft.photos.length} / 3 photos</p></section>}
      {step===1&&<section className="share-step position-step"><span className="eyebrow">STEP 2 OF 5</span><h1>Set the exact shooting position</h1><p>Use your current GPS location or tap and drag the marker on the map.</p><button className="secondary-button" onClick={()=>{setCaptureLocation(true);requestLocation()}}><LocateFixed/>{captureLocation?'Finding your location...':'Use Current Location'}</button><div className="position-map"><MapCanvas center={chosenPoint||position||undefined} zoom={15} editablePoint={chosenPoint} onPointChange={point=>set({latitude:point.latitude,longitude:point.longitude})}/></div>{chosenPoint?<div className="coordinate-card"><MapPin/><span>Latitude: {chosenPoint.latitude.toFixed(6)}<br/>Longitude: {chosenPoint.longitude.toFixed(6)}</span></div>:<p className="notice">Tap the map to place the shooting position.</p>}</section>}
      {step===2&&<section className="share-step direction-step"><span className="eyebrow">STEP 3 OF 5</span><h1>Set the shooting direction</h1><p>Which direction should the photographer face after reaching this position?</p><div className="manual-compass"><div className="compass-dial"><div className="north">N</div><div className="bearing-arrow" style={{transform:`rotate(${draft.shootingBearing||0}deg)`}}>↑</div><div className="dial-center"></div></div><strong>{draft.shootingBearing===undefined?'—':`${draft.shootingBearing}° ${compassLabel(draft.shootingBearing)}`}</strong></div><label className="range-label">Manual direction<input type="range" min="0" max="359" value={draft.shootingBearing??0} onChange={event=>set({shootingBearing:Number(event.target.value)})}/></label><div className="bearing-input"><input type="number" min="0" max="359" value={draft.shootingBearing??''} placeholder="0–359" onChange={event=>set({shootingBearing:event.target.value===''?undefined:normaliseAngle(Number(event.target.value))})}/><span>degrees</span></div><button className="secondary-button" onClick={async()=>{setCaptureDirection(true);await enable()}}><Compass/>{captureDirection?'Reading Compass...':'Use Current Direction'}</button>{compassStatus==='denied'&&<p className="notice warning">Compass permission was denied.</p>}{compassStatus==='unavailable'&&<p className="notice warning">Live compass unavailable. Use the manual control.</p>}</section>}
      {step===3&&<section className="share-step info-step"><span className="eyebrow">STEP 4 OF 5</span><h1>Add shooting information</h1><div className="form-grid"><label className="wide">Spot name *<input value={draft.name} onChange={e=>set({name:e.target.value})} placeholder="e.g. Harbour bridge frame"/></label><fieldset className="wide"><legend>Photography type *</legend><div className="chip-grid">{photographyTypes.map(item=><button type="button" key={item} className={draft.photographyTypes.includes(item)?'chip active':'chip'} onClick={()=>set({photographyTypes:toggle(draft.photographyTypes,item)})}>{item}</button>)}</div></fieldset><fieldset className="wide"><legend>Recommended time *</legend><div className="chip-grid">{recommendedTimes.map(item=><button type="button" key={item} className={draft.recommendedTimes.includes(item)?'chip active':'chip'} onClick={()=>set({recommendedTimes:toggle(draft.recommendedTimes,item)})}>{item}</button>)}</div></fieldset><label>Conditions<input value={draft.recommendedConditions.join(', ')} onChange={e=>set({recommendedConditions:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})} placeholder="Clear, light cloud"/></label><label>Lens / focal length<input value={draft.focalLength} onChange={e=>set({focalLength:e.target.value})} placeholder="24–70 mm"/></label><label>Camera angle<select value={draft.cameraAngle||''} onChange={e=>set({cameraAngle:e.target.value?e.target.value as ShareDraft['cameraAngle']:undefined})}><option value="">Not provided</option>{cameraAngles.map(item=><option key={item}>{item}</option>)}</select></label><label className="wide">Composition tip<textarea value={draft.compositionTip} onChange={e=>set({compositionTip:e.target.value})} placeholder="Describe how to frame the scene."/></label><label className="wide">Shooting tip<textarea value={draft.shootingTip} onChange={e=>set({shootingTip:e.target.value})} placeholder="Add a practical tip."/></label><label className="wide">Description<textarea value={draft.description} onChange={e=>set({description:e.target.value})} placeholder="Optional context about this position."/></label></div></section>}
      {step===4&&<section className="share-step preview-step"><span className="eyebrow">STEP 5 OF 5</span><h1>Preview your spot</h1><div className="preview-gallery">{draft.photos.map(photo=><Photo key={photo.id} photo={photo}/>)}</div><div className="preview-record"><span className="eyebrow">{draft.photographyTypes.join(' / ')||'TYPE REQUIRED'}</span><h2>{draft.name||'Untitled spot'}</h2><div className="preview-record-grid"><div><span>Position</span><strong>{chosenPoint?`${chosenPoint.latitude.toFixed(6)}, ${chosenPoint.longitude.toFixed(6)}`:'Required'}</strong></div><div><span>Direction</span><strong>{draft.shootingBearing===undefined?'Required':`${draft.shootingBearing}° ${compassLabel(draft.shootingBearing)}`}</strong></div><div><span>Recommended time</span><strong>{draft.recommendedTimes.join(' · ')||'Required'}</strong></div><div><span>Conditions</span><strong>{draft.recommendedConditions.join(' / ')||'Not provided'}</strong></div><div><span>Lens</span><strong>{draft.focalLength||'Not provided'}</strong></div><div><span>Camera angle</span><strong>{draft.cameraAngle||'Not provided'}</strong></div></div>{draft.compositionTip&&<p><b>Composition:</b> {draft.compositionTip}</p>}{draft.shootingTip&&<p><b>Shooting tip:</b> {draft.shootingTip}</p>}</div><div className="preview-actions"><button className="secondary-button" onClick={()=>setStep(3)}>Edit</button><button className="primary-button" disabled={busy||!allValid} onClick={publish}><Upload/>{busy?'Publishing...':editing?'Save Changes':'Publish'}</button></div></section>}
      {error&&<p className="notice error">{error}</p>}
    </main>
    {step<4&&<footer className="sticky-action"><button className="primary-button wide" disabled={!canContinue||busy} onClick={next}>Continue <ArrowRight/></button></footer>}
  </div>
}
