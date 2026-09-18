import { NextResponse } from "next/server";

const UPSTREAM = process.env.NEXT_PUBLIC_CLEP_API_URL ?? "https://api.clep.abstraklabs.com/v1";

export async function POST(req: Request) {
  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json({ error: "Tell us your name" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  try {
    const res = await fetch(`${UPSTREAM}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Invite service unreachable — try again" }, { status: 502 });
  }
}
