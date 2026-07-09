// src/app/admin/users/page.tsx
import type { Metadata } from 'next'
import UsersClient from './UsersClient'

export const metadata: Metadata = {
  title: 'User Management — TAP Admin',
}

export default function UserManagementPage() {
  return <UsersClient />
}
