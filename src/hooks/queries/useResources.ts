import { useQuery } from "@tanstack/react-query"
import { fetchResources } from "@/lib/api/admin/resources"

export function useResources() {
  return useQuery({
    queryKey: ["admin-resources"],
    queryFn: fetchResources,
  })
}