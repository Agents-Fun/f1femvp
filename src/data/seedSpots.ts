import type { PhotographySpot, PhotographyType, RecommendedTime, CameraAngle } from '../types'

const createdAt = 1726000000000
const photoCredits: Record<string,{author:string,license:string,sourceUrl:string}> = {
  'seed-001':{author:'Robert Linsdell',license:'CC BY 2.0',sourceUrl:"https://commons.wikimedia.org/wiki/File:Mrs_Macquarie%27s_Chair,_Mrs_Macquaries_Point,_Sydney_(483345)_(9442941632).jpg"},
  'seed-002':{author:'MDRX',license:'CC BY-SA 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Observatory_Hill_Sydney.jpg'},
  'seed-003':{author:'Cloh4153',license:'CC BY-SA 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Sydney_Harbour_Bridge_from_Blues_Point_Reserve.jpg'},
  'seed-004':{author:'Quincepaste',license:'CC BY-SA 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Bradleys_Head,_Sydney_Harbour_National_Park.jpg'},
  'seed-005':{author:'Dicklyon',license:'CC BY-SA 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Barangaroo_Reserve_pano.jpg'},
  'seed-006':{author:'Sardaka',license:'CC BY 3.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:(1)Bondi_Beach_sunset.jpg'},
  'seed-007':{author:'Dion Hinchcliffe',license:'CC BY-SA 2.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Dawn_in_Coogee_Beach.jpg'},
  'seed-008':{author:'Adam.J.W.C.',license:'CC BY-SA 2.5',sourceUrl:'https://commons.wikimedia.org/wiki/File:Bare_island_fort_La_Perouse.jpg'},
  'seed-009':{author:'Sardaka',license:'CC BY-SA 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Afternoon_light_Centennial_Park_001.jpg'},
  'seed-010':{author:'Fletcher Arrastia',license:'CC BY-SA 4.0',sourceUrl:"https://commons.wikimedia.org/wiki/File:Sunset_at_Sydney%27s_North_Head.jpg"},
  'seed-011':{author:'Dicklyon',license:'CC BY 4.0',sourceUrl:"https://commons.wikimedia.org/wiki/File:Wendy_Whiteley%27s_Secret_Garden_pano.jpg"},
  'seed-012':{author:'Alasdair Dougall',license:'Public domain',sourceUrl:'https://commons.wikimedia.org/wiki/File:Sydney_harbour_bridge_from_milsons_point.jpg'},
}
const image = (id: string, name: string) => {
  const credit=photoCredits[id]
  return [{ id: `${id}-photo-1`, url: `${import.meta.env.BASE_URL}images/${id}.webp`, alt: `${name} photography view`, attribution:`Photo: ${credit.author} · ${credit.license}`, sourceUrl:credit.sourceUrl }]
}

type SeedInput = Omit<PhotographySpot, 'photos' | 'isSeed' | 'createdAt'>

const make = (spot: SeedInput): PhotographySpot => ({ ...spot, photos: image(spot.id, spot.name), isSeed: true, createdAt })

export const seedSpots: PhotographySpot[] = [
  make({ id:'seed-001', name:"Mrs Macquarie's Chair", latitude:-33.8597, longitude:151.2227, photographyTypes:['Landscape','Architecture'], recommendedTimes:['Sunrise'], recommendedConditions:['Clear','Light cloud'], shootingBearing:305, focalLength:'24–70 mm', cameraAngle:'Eye level', compositionTip:'Frame the Opera House and Harbour Bridge together.', shootingTip:'Keep enough foreground space to separate the harbour landmarks.' }),
  make({ id:'seed-002', name:'Observatory Hill', latitude:-33.8599, longitude:151.2048, photographyTypes:['Landscape','Architecture'], recommendedTimes:['Golden Hour','Sunset'], recommendedConditions:['Clear','Partly cloudy'], shootingBearing:345, focalLength:'24–50 mm', cameraAngle:'Eye level', compositionTip:'Use the open foreground to frame the Harbour Bridge.', shootingTip:'Keep the skyline clear from foreground overlap.' }),
  make({ id:'seed-003', name:'Blues Point Reserve', latitude:-33.8484, longitude:151.2033, photographyTypes:['Landscape','Night'], recommendedTimes:['Blue Hour','Night'], recommendedConditions:['Clear'], shootingBearing:115, focalLength:'35–85 mm', cameraAngle:'Eye level', compositionTip:'Use the harbour foreground to separate the skyline.', shootingTip:'A longer focal length can emphasise city structures.' }),
  make({ id:'seed-004', name:'Bradleys Head', latitude:-33.8537, longitude:151.2466, photographyTypes:['Landscape'], recommendedTimes:['Golden Hour','Sunset'], recommendedConditions:['Clear','Light cloud'], shootingBearing:255, focalLength:'70–200 mm', cameraAngle:'Eye level', compositionTip:'Compress harbour landmarks using a longer focal length.', shootingTip:'Check foreground vegetation before choosing the final position.' }),
  make({ id:'seed-005', name:'Barangaroo Reserve', latitude:-33.8570, longitude:151.2013, photographyTypes:['Architecture','Landscape'], recommendedTimes:['Golden Hour'], recommendedConditions:['Clear','Partly cloudy'], shootingBearing:100, focalLength:'24–50 mm', cameraAngle:'Slightly upward', compositionTip:'Combine sandstone foreground with the city skyline.', shootingTip:'Keep vertical architectural lines visually clean.' }),
  make({ id:'seed-006', name:'Bondi Beach', latitude:-33.8915, longitude:151.2767, photographyTypes:['Landscape','Street'], recommendedTimes:['Sunrise'], recommendedConditions:['Clear','Breaking cloud'], shootingBearing:105, focalLength:'24–70 mm', cameraAngle:'Eye level', compositionTip:'Use coastline curves as a natural leading line.', shootingTip:'Allow enough space for people or surfers moving through the frame.' }),
  make({ id:'seed-007', name:'Coogee Beach', latitude:-33.9205, longitude:151.2588, photographyTypes:['Landscape','Nature'], recommendedTimes:['Sunrise'], recommendedConditions:['Clear','Partly cloudy'], shootingBearing:95, focalLength:'24–50 mm', cameraAngle:'Eye level', compositionTip:'Use the coastline as a foreground leading line.', shootingTip:'Watch the horizon carefully.' }),
  make({ id:'seed-008', name:'Bare Island — La Perouse', latitude:-33.9911, longitude:151.2316, photographyTypes:['Landscape','Architecture'], recommendedTimes:['Golden Hour'], recommendedConditions:['Clear','Light cloud'], shootingBearing:160, focalLength:'35–85 mm', cameraAngle:'Slightly downward', compositionTip:'Use the bridge as a leading line toward the island.', shootingTip:'Keep the island visually separated from nearby shoreline elements.' }),
  make({ id:'seed-009', name:'Centennial Park', latitude:-33.8978, longitude:151.2338, photographyTypes:['Nature','Portrait'], recommendedTimes:['Morning','Golden Hour'], recommendedConditions:['Clear','Soft cloud'], shootingBearing:75, focalLength:'50–85 mm', cameraAngle:'Eye level', compositionTip:'Use tree lines and backlight to create depth.', shootingTip:'Look for clean background separation behind the subject.' }),
  make({ id:'seed-010', name:'North Head', latitude:-33.8147, longitude:151.2995, photographyTypes:['Landscape','Nature'], recommendedTimes:['Sunrise','Morning'], recommendedConditions:['Clear'], shootingBearing:120, focalLength:'24–70 mm', cameraAngle:'Eye level', compositionTip:'Use cliff edges and the horizon to show scale.', shootingTip:'Keep the horizon level.' }),
  make({ id:'seed-011', name:"Wendy Whiteley's Secret Garden", latitude:-33.8434, longitude:151.2059, photographyTypes:['Nature','Portrait'], recommendedTimes:['Morning'], recommendedConditions:['Soft light','Cloudy'], shootingBearing:210, focalLength:'35–85 mm', cameraAngle:'Eye level', compositionTip:'Use vegetation layers to create foreground depth.', shootingTip:'Avoid visually busy backgrounds behind the subject.' }),
  make({ id:'seed-012', name:'Milsons Point Harbour Foreshore', latitude:-33.8474, longitude:151.2108, photographyTypes:['Architecture','Night'], recommendedTimes:['Blue Hour','Night'], recommendedConditions:['Clear'], shootingBearing:160, focalLength:'24–50 mm', cameraAngle:'Slightly upward', compositionTip:'Use the Harbour Bridge structure to frame the city.', shootingTip:'Maintain clean architectural lines.' }),
]

export const photographyTypes = ['Landscape','Architecture','Street','Portrait','Night','Nature'] as PhotographyType[]
export const recommendedTimes = ['Sunrise','Morning','Daytime','Golden Hour','Sunset','Blue Hour','Night'] as RecommendedTime[]
export const cameraAngles = ['Low angle','Eye level','Slightly upward','Slightly downward','High angle'] as CameraAngle[]
