export async function fetchAdminLogs() {
  const res = await fetch("/api/admin/logs");

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
}