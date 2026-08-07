import { useQuery } from '@tanstack/react-query'
import { getAllCities, getRegionsByCity } from '@/lib/api/admin/reference'

export function useAllCities() {
  return useQuery({
    queryKey: ['ref', 'cities'],
    queryFn: getAllCities,
    staleTime: Infinity,
    select: (data) => data.filter((c) => c.isActive),
  })
}

export function useRegionsByCity(cityId: string | undefined) {
  return useQuery({
    queryKey: ['ref', 'regions', cityId ?? ''],
    queryFn: () => getRegionsByCity(cityId!),
    staleTime: Infinity,
    enabled: !!cityId,
    select: (data) => data.filter((r) => r.isActive),
  })
}
