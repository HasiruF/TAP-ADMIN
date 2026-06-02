import { NextResponse } from 'next/server'
import { conversationsMock } from '@/data_mock/conversations'

export async function GET() {
  return NextResponse.json(conversationsMock)
}
