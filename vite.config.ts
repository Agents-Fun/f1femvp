import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig(({mode}) => {
 const base=loadEnv(mode,'.','').VITE_BASE_PATH || '/'
 return {
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    manifest: { id:base, name:'F1FEMVP', short_name:'F1FEMVP', start_url:base, scope:base, display:'standalone', orientation:'portrait', theme_color:'#1768e5', background_color:'#ffffff', icons:[{src:base+'icon-192.png',sizes:'192x192',type:'image/png'},{src:base+'icon-512.png',sizes:'512x512',type:'image/png'}] },
    workbox: { globPatterns:['**/*.{js,css,html,svg,png,webp}'], navigateFallback:null, cleanupOutdatedCaches:true },
  })],
  server:{host:'0.0.0.0',allowedHosts:['terminal.local']},
  build:{target:'es2020'},
}})
