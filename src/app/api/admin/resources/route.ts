import { NextResponse } from "next/server"
import { resourcesMock } from "@/data_mock/resources"

export async function GET() {
  return NextResponse.json(resourcesMock)
}