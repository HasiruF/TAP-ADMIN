import { NextResponse } from 'next/server'

// Lightweight liveness probe for the ALB target group / ECS container health
// check. Must never require auth and must never touch the backend, so an
// unhealthy upstream can't take this container out of rotation. Force dynamic
// so it isn't statically cached at build time.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
