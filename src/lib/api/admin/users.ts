export async function fetchAdminUsers() {
  const res = await fetch("/api/admin/users");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}