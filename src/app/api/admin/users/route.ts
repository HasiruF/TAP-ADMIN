import { NextResponse } from 'next/server'
import { mockUsers } from '@/data_mock/users'

export async function GET() {
  return NextResponse.json(mockUsers)
}
