import type { Metadata } from 'next'
import VendorsClient from './VendorsClient'

export const metadata: Metadata = {
  title: 'Vendor Management — TAP Admin',
}

export default function VendorsPage() {
  return <VendorsClient />
}
