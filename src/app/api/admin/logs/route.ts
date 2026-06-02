import { NextResponse } from 'next/server'
import { activityLogsMock } from '@/data_mock/activityLogs'

export async function GET() {
  return NextResponse.json(activityLogsMock)
}
