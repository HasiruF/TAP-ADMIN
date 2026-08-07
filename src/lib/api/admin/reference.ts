import { api } from '@/lib/api/client'

export interface City {
  id: string
  name: string
  slug: string
  countryId: string
  isActive: boolean
  sortOrder: number
}

export interface Region {
  id: string
  name: string
  slug: string
  cityId: string
  isActive: boolean
  sortOrder: number
}

export async function getAllCities(): Promise<City[]> {
  return api('/reference/cities')
}

export async function getRegionsByCity(cityId: string): Promise<Region[]> {
  return api(`/reference/cities/${cityId}/regions`)
}
