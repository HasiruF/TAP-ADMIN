import { User } from '@/types/user'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Luna Reverie',
    email: 'Luna@gmail.com',
    role: 'artist',
    joined: 'Jan 14, 2026',
    lastLogin: 'Jan 14, 2026',
    status: 'active',
  },
  {
    id: '2',
    name: 'Velvet Hall',
    role: 'venue',
    email: 'velvet@gmail.com',
    joined: 'Feb 02, 2026',
    lastLogin: 'Jan 14, 2026',
    status: 'suspended',
  },
  {
    id: '3',
    name: 'Echo Ritual',
    role: 'artist',
    email: 'echo@gmail.com',
    joined: 'Mar 08, 2026',
    lastLogin: 'Aug 14, 2026',
    status: 'not-approved',
  },
  {
    id: '4',
    name: 'Noir Stage',
    role: 'venue',
    email: 'noirt@gmail.com',
    joined: 'Apr 19, 2026',
    lastLogin: 'Dec 14, 2026',
    status: 'not-approved',
  },
  {
    id: '5',
    name: 'Blanche Stage',
    role: 'venue',
    email: 'fft@gmail.com',
    joined: 'Apr 19, 2026',
    lastLogin: 'Jun 14, 2026',
    status: 'not-approved',
  },
]
