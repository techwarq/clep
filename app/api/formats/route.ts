import { NextResponse } from "next/server";

/**
 * GET /api/formats
 * Contract — the real backend should return:
 * { formats: Array<{ name: string; cols: string }> }
 *
 * POST /api/formats
 * Accepts JSON { name: string; cols?: string } → 201 { ok: true }.
 */
export async function GET() {
  return NextResponse.json({ formats: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — connect the backend." },
    { status: 501 }
  );
}
