import { NextResponse } from "next/server";

/**
 * GET /api/usage
 * Contract — the real backend should return:
 * {
 *   user: { email: string } | null,
 *   plan: { name: string; pagesUsed: number; pagesLimit: number } | null
 * }
 */
export async function GET() {
  return NextResponse.json({ user: null, plan: null });
}
