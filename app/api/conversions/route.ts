import { NextResponse } from "next/server";

/**
 * GET /api/conversions
 * Contract — the real backend should return:
 * {
 *   conversions: Array<{
 *     id: string | number;
 *     name: string;
 *     type: string;            // e.g. "Bank Statement" | "Invoice" | "Receipt"
 *     out: string;             // e.g. "Excel" | "CSV" | "JSON"
 *     status: "done" | "review" | "processing";
 *     flagged?: number;        // rows needing review
 *     date: string;            // display string, e.g. "31m ago"
 *     progress?: number;       // 0-100 while processing
 *     downloadUrl?: string;    // file download for completed conversions
 *   }>
 * }
 *
 * POST /api/conversions
 * Accepts multipart FormData: { file: File; format: string; instructions?: string; preset?: string }
 * Should return 201 { id, status: "processing" }.
 */
export async function GET() {
  return NextResponse.json({ conversions: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — connect the extraction backend." },
    { status: 501 }
  );
}
