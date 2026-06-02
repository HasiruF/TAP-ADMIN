import { NextResponse } from 'next/server'
import { artists } from '@/data_mock/artists'

export async function GET() {
  return NextResponse.json(artists)
}
