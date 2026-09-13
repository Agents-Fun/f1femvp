import Dexie, { type EntityTable } from 'dexie'
import type { PhotographySpot } from '../types'
import { seedSpots } from '../data/seedSpots'

const SEED_VERSION = 1

class F1FEDatabase extends Dexie {
  spots!: EntityTable<PhotographySpot, 'id'>

  constructor() {
    super('F1FEMVPDatabase')
    this.version(1).stores({ spots: 'id, isSeed, createdAt, updatedAt, name' })
  }
}

export const db = new F1FEDatabase()

export async function initialiseDatabase() {
  const version = Number(localStorage.getItem('f1feSeedVersion') || 0)
  const seedCount = (await db.spots.toArray()).filter(spot => spot.isSeed).length
  if (version !== SEED_VERSION || seedCount !== seedSpots.length) {
    await db.transaction('rw', db.spots, async () => {
      await Promise.all((await db.spots.toArray()).filter(spot => spot.isSeed).map(spot => db.spots.delete(spot.id)))
      await db.spots.bulkPut(seedSpots)
    })
    localStorage.setItem('f1feSeedVersion', String(SEED_VERSION))
  }
}

export async function loadSpots() {
  return db.spots.orderBy('createdAt').toArray()
}

export async function saveSpot(spot: PhotographySpot) {
  await db.spots.put(spot)
}

export async function deleteSpot(id: string) {
  const spot = await db.spots.get(id)
  if (!spot || spot.isSeed) throw new Error('Seed photography spots cannot be deleted.')
  await db.spots.delete(id)
}

export async function resetDemoData() {
  await Promise.all((await db.spots.toArray()).filter(spot => !spot.isSeed).map(spot => db.spots.delete(spot.id)))
  await db.spots.bulkPut(seedSpots)
  localStorage.removeItem('f1feFilters')
}
