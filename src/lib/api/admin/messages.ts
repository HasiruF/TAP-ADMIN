export async function fetchAdminMessages() {
  const res = await fetch("/api/admin/messages");

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}