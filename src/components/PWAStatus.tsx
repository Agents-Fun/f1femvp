import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
export function PWAStatus(){
 const {needRefresh:[needsUpdate], updateServiceWorker}=useRegisterSW()
 const [dismissed,setDismissed]=useState(false)
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)
 const standalone=window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & {standalone?:boolean}).standalone
 if(needsUpdate)return <aside className="pwa-notice">An update is ready. Finish sharing your spot before reloading.<button onClick={()=>updateServiceWorker(true)}>Reload</button></aside>
 if(!ios||standalone||dismissed)return null
 return <aside className="pwa-notice">Install: Safari → Share → Add to Home Screen → Add.<button onClick={()=>setDismissed(true)}>Dismiss</button></aside>
}
