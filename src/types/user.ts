export interface User {
  id: string
  name: string
  email: string
  role: 'artist' | 'venue'
  joined: string
  lastlogin: string
  status: 'active' | 'not-approved' | 'suspended' | 'banned'
}
