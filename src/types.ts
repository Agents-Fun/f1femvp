export const PHOTOGRAPHY_TYPES = ['Landscape', 'Architecture', 'Street', 'Portrait', 'Night', 'Nature'] as const
export const RECOMMENDED_TIMES = ['Sunrise', 'Morning', 'Daytime', 'Golden Hour', 'Sunset', 'Blue Hour', 'Night'] as const
export const CAMERA_ANGLES = ['Low angle', 'Eye level', 'Slightly upward', 'Slightly downward', 'High angle'] as const

export type PhotographyType = typeof PHOTOGRAPHY_TYPES[number]
export type RecommendedTime = typeof RECOMMENDED_TIMES[number]
export type CameraAngle = typeof CAMERA_ANGLES[number]

export interface StoredPhoto {
  id: string
  url?: string
  blob?: Blob
  alt: string
  attribution?: string
  sourceUrl?: string
}

export interface PhotographySpot {
  id: string
  name: string
  latitude: number
  longitude: number
  photos: StoredPhoto[]
  photographyTypes: PhotographyType[]
  recommendedTimes: RecommendedTime[]
  recommendedConditions: string[]
  shootingBearing: number
  focalLength?: string
  cameraAngle?: CameraAngle
  compositionTip?: string
  shootingTip?: string
  description?: string
  isSeed: boolean
  createdAt: number
  updatedAt?: number
}

export interface GeoPoint {
  latitude: number
  longitude: number
  accuracy?: number
}

export type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

export interface ShareDraft {
  id?: string
  photos: StoredPhoto[]
  name: string
  latitude?: number
  longitude?: number
  shootingBearing?: number
  photographyTypes: PhotographyType[]
  recommendedTimes: RecommendedTime[]
  recommendedConditions: string[]
  focalLength: string
  cameraAngle?: CameraAngle
  compositionTip: string
  shootingTip: string
  description: string
}

export type AppView = 'map' | 'detail' | 'navigation' | 'guidance' | 'share' | 'settings'
