import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "@/lib/api/admin/users";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    staleTime: 1000 * 60 * 2,
  });
}