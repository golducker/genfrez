import { NextResponse } from "next/server";

/**
 * Contact endpoint. If BACKEND_URL is set, the request is proxied to the
 * Express backend (../../backend). Otherwise it is validated and logged here so
 * the form still works on a frontend-only deployment.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }

  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    } catch (err) {
      console.error("[contact] backend unreachable", err);
      return NextResponse.json({ ok: false, error: "Backend unreachable. Try again shortly." }, { status: 502 });
    }
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const message = String(b.message ?? "").trim();
  if (name.length < 2) return NextResponse.json({ ok: false, error: "Name is too short." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Email address looks invalid." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ ok: false, error: "Message must be at least 10 characters." }, { status: 400 });

  const id = Math.random().toString(36).slice(2, 10);
  console.log("[contact]", JSON.stringify({ id, name, email, organisation: b.organisation, message, receivedAt: new Date().toISOString() }));
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
