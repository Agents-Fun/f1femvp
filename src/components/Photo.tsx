import { useEffect, useMemo } from 'react'
import type { StoredPhoto } from '../types'

export function Photo({ photo, className = '' }: { photo: StoredPhoto, className?: string }) {
  const source = useMemo(() => photo.blob ? URL.createObjectURL(photo.blob) : photo.url || '', [photo])
  useEffect(() => () => { if (photo.blob && source) URL.revokeObjectURL(source) }, [photo.blob, source])
  return <figure className={`photo-wrap ${className}`}>
    <img src={source} alt={photo.alt} onError={event => { event.currentTarget.src = `${import.meta.env.BASE_URL}images/seed-001.webp` }} />
    {photo.attribution && <figcaption><a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.attribution}</a></figcaption>}
  </figure>
}
