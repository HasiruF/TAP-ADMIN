import { NextResponse } from "next/server";
import { moderationData } from "@/data_mock/moderation";

export async function GET() {
  return NextResponse.json(moderationData);
}