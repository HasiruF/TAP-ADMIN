import { useQuery } from "@tanstack/react-query";
import { fetchAdminMessages } from "@/lib/api/admin/messages";
import { Conversation } from "@/types/conversation";

export function useAdminMessages() {
  return useQuery<Conversation[]>({
    queryKey: ["admin-messages"],
    queryFn: fetchAdminMessages,
  });
}