import { useCallback, useEffect, useMemo, useState } from 'react'
import { Camera, CheckCircle2, Filter, LocateFixed, Map, RotateCcw, Settings, SlidersHorizontal } from 'lucide-react'
import type { AppView, PhotographySpot, ShareDraft } from './types'
import { useCompass } from './hooks/useCompass'
import { PWAStatus } from './components/PWAStatus'
import { useGeolocation } from './hooks/useGeolocation'
import { deleteSpot, initialiseDatabase, loadSpots, resetDemoData, saveSpot } from './db/database'
import { distanceMetres, formatDistance } from './utils/geo'
import { MapCanvas } from './components/MapCanvas'
import { FilterPanel, type Filters } from './components/FilterPanel'
import { SpotPreview } from './components/SpotPreview'
import { SpotDetail } from './components/SpotDetail'
import { NavigationView } from './components/NavigationView'
import { ShootingGuidance } from './components/ShootingGuidance'
import { ShareFlow } from './components/ShareFlow'

const emptyFilters:Filters={distances:[],types:[],times:[]}

function storedFilters():Filters {
  try{return {...emptyFilters,...JSON.parse(localStorage.getItem('f1feFilters')||'{}')}}catch{return emptyFilters}
}

export default function App(){
  const [spots,setSpots]=useState<PhotographySpot[]>([])
  const [view,setView]=useState<AppView>('map')
  const [selected,setSelected]=useState<PhotographySpot|null>(null)
  const [filters,setFilters]=useState<Filters>(storedFilters)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [editing,setEditing]=useState<PhotographySpot|null>(null)
  const [statusMessage,setStatusMessage]=useState('Loading map...')
  const [success,setSuccess]=useState('')
  const geo=useGeolocation()
  const compass=useCompass()
  const [centerRequest,setCenterRequest]=useState(false)
  const [mapCenter,setMapCenter]=useState<import('./types').GeoPoint>()
  useEffect(()=>{if(centerRequest&&geo.position){setMapCenter({...geo.position});setCenterRequest(false)}},[centerRequest,geo.position])
  function locate(){setCenterRequest(true);geo.start()}

  const refresh=useCallback(async()=>{const values=await loadSpots();setSpots(values);setStatusMessage('')},[])
  useEffect(()=>{initialiseDatabase().then(refresh).catch(()=>setStatusMessage('Local database unavailable.'))},[refresh])
  useEffect(()=>{localStorage.setItem('f1feFilters',JSON.stringify(filters))},[filters])

  const visible=useMemo(()=>spots.filter(spot=>{
    if(filters.types.length&&!spot.photographyTypes.some(type=>filters.types.includes(type)))return false
    if(filters.times.length&&!spot.recommendedTimes.some(time=>filters.times.includes(time)))return false
    if(filters.distances.length&&geo.position){
      const km=distanceMetres(geo.position,{latitude:spot.latitude,longitude:spot.longitude})/1000
      const match=filters.distances.some(value=>value==='< 1 km'?km<1:value==='1–3 km'?km>=1&&km<3:value==='3–5 km'?km>=3&&km<5:km>=5)
      if(!match)return false
    }
    return true
  }),[spots,filters,geo.position])

  function openSpot(spot:PhotographySpot){setSelected(spot);setSuccess('')}
  function show(viewName:AppView){setView(viewName);window.scrollTo(0,0)}
  function backToMap(){setView('map');setEditing(null);window.scrollTo(0,0)}

  useEffect(()=>{
    const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:{signal?:AbortSignal})=>void|Promise<void>}}).modelContext
    if(!context?.registerTool)return
    const lifecycle=new AbortController()
    const register=(tool:unknown)=>Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>undefined)
    void register({name:'list_photography_spots',title:'List photography spots',description:'List the photography spots currently visible under the active filters.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({spots:visible.map(spot=>({id:spot.id,name:spot.name,types:spot.photographyTypes,times:spot.recommendedTimes}))})})
    void register({name:'open_photography_spot',title:'Open photography spot',description:'Open the detail view for an existing photography spot by its stable id.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:{id?:string})=>{const spot=spots.find(item=>item.id===input?.id);if(!spot)throw new Error('Photography spot not found.');setSelected(spot);setView('detail');return{id:spot.id,name:spot.name,view:'detail'}}})
    void register({name:'start_sharing_photography_spot',title:'Start sharing a spot',description:'Open the visible share flow for creating a photography spot.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>{setEditing(null);setView('share');return{view:'share',step:'photo'}}})
    return()=>lifecycle.abort()
  },[spots,visible])

  async function publish(draft:ShareDraft){
    if(draft.latitude===undefined||draft.longitude===undefined||draft.shootingBearing===undefined)throw new Error('Required spot information is missing.')
    const now=Date.now()
    const existing=draft.id?spots.find(spot=>spot.id===draft.id):undefined
    const spot:PhotographySpot={id:draft.id||(crypto.randomUUID?.()||`spot-${now}`),name:draft.name.trim(),latitude:draft.latitude,longitude:draft.longitude,photos:draft.photos,photographyTypes:draft.photographyTypes,recommendedTimes:draft.recommendedTimes,recommendedConditions:draft.recommendedConditions,shootingBearing:draft.shootingBearing,focalLength:draft.focalLength||undefined,cameraAngle:draft.cameraAngle,compositionTip:draft.compositionTip||undefined,shootingTip:draft.shootingTip||undefined,description:draft.description||undefined,isSeed:false,createdAt:existing?.createdAt||now,updatedAt:existing?now:undefined}
    await saveSpot(spot);await refresh();setSelected(spot);setEditing(null);setSuccess(existing?'Spot updated.':'Spot published — it is now visible on the map.');setView('map')
  }

  async function removeSelected(){
    if(!selected||selected.isSeed)return
    if(!window.confirm('Delete this photography spot?'))return
    try{await deleteSpot(selected.id);await refresh();setSelected(null);setView('map');setSuccess('Photography spot deleted.')}catch(error){setStatusMessage(error instanceof Error?error.message:'Delete failed.')}
  }

  async function reset(){
    if(!window.confirm('Reset demo data? All user-created spots will be deleted.'))return
    try{await resetDemoData();setFilters(emptyFilters);setSelected(null);await refresh();setSuccess('Demo data reset. Only the 12 seed spots remain.');setView('map')}catch{setStatusMessage('Reset failed. Try again.')}
  }

  if(view==='detail'&&selected)return <SpotDetail spot={selected} onBack={backToMap} onNavigate={()=>show('navigation')} onEdit={()=>{setEditing(selected);show('share')}} onDelete={removeSelected}/>
  if(view==='navigation'&&selected)return <NavigationView heading={compass.heading} enableCompass={compass.enable} spot={selected} position={geo.position} geoMessage={geo.message} startLocation={geo.start} onBack={()=>show('detail')} onArrive={()=>show('guidance')}/>
  if(view==='guidance'&&selected)return <ShootingGuidance spot={selected} onBack={()=>show('navigation')} onDone={backToMap}/>
  if(view==='share')return <ShareFlow position={geo.position} requestLocation={geo.start} editing={editing} onCancel={editing&&selected?()=>show('detail'):backToMap} onPublish={publish}/>
  if(view==='settings')return <div className="page settings-page"><header className="page-bar"><button className="icon-button" onClick={backToMap} aria-label="Back"><Map/></button><span>Settings</span><span></span></header><main><div className="settings-card"><RotateCcw/><div><h1>Reset Demo Data</h1><p>Delete all user-created spots and restore the original 12 Sydney photography spots.</p><button className="danger-button" onClick={reset}>Reset Demo Data</button></div></div><div className="settings-card"><Camera/><div><h2>Demo Photographer</h2><p>This MVP stores uploaded spots and compressed photos locally on this device. No account or cloud synchronisation is used.</p></div></div></main></div>

  return <div className="map-page">
    <MapCanvas heading={compass.heading} center={mapCenter} zoom={mapCenter?16:11} spots={visible} userPosition={geo.position} selectedId={selected?.id} onSelect={openSpot}/>
    <header className="map-header"><div className="brand-mark"><Camera/><span><strong>F1FE</strong><b>MVP</b></span></div><div className="map-actions"><button className={filters.types.length||filters.times.length||filters.distances.length?'toolbar-button active':'toolbar-button'} onClick={()=>setFiltersOpen(true)}><Filter/>Filters</button><button className="toolbar-button" onClick={locate} aria-label="My Location"><LocateFixed/>My Location</button><button className="icon-button settings-button" onClick={()=>show('settings')} aria-label="Settings"><Settings/></button></div></header>
    <div className="compass-control"><button className="secondary-button" onClick={compass.enable}> {compass.heading===null?'Enable Compass':`${compass.heading}°`}</button>{(compass.status==='unavailable'||compass.status==='denied')&&<small>Live compass unavailable. Location still works.</small>}</div>
    <PWAStatus/>
    <div className="spot-count"><SlidersHorizontal/><span>{visible.length} photography {visible.length===1?'spot':'spots'}</span></div>
    <button className="share-fab" onClick={()=>{setEditing(null);show('share')}}><Camera/>+ Share Spot</button>
    {filtersOpen&&<FilterPanel value={filters} gpsAvailable={!!geo.position} onChange={setFilters} onClose={()=>setFiltersOpen(false)} onClear={()=>setFilters(emptyFilters)}/>} 
    {selected&&<SpotPreview spot={selected} distance={geo.position?`${formatDistance(distanceMetres(geo.position,{latitude:selected.latitude,longitude:selected.longitude}))} away`:'Distance unavailable'} onClose={()=>setSelected(null)} onView={()=>show('detail')}/>} 
    {!visible.length&&!statusMessage&&<div className="empty-state"><h2>No photography spots match these filters.</h2><button className="secondary-button" onClick={()=>setFilters(emptyFilters)}>Clear Filters</button></div>}
    {geo.message&&view==='map'&&<div className="map-notice">{geo.message}</div>}
    {statusMessage&&<div className="map-notice">{statusMessage}</div>}
    {success&&<div className="toast"><CheckCircle2/>{success}<button onClick={()=>setSuccess('')}>×</button></div>}
  </div>
}
