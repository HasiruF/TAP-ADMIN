import { NextResponse } from "next/server";
import { venues } from "@/data_mock/venues";

export async function GET() {
  return NextResponse.json(venues);
}