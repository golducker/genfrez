import express from "express";
import cors from "cors";

export type ContactPayload = {
  name: string;
  email: string;
  organisation?: string;
  message: string;
};

type StoredMessage = ContactPayload & { id: string; receivedAt: string };

// In-memory store. Vercel functions are stateless, so on the deployed API this
// only lasts for the life of a warm instance. Set CONTACT_WEBHOOK_URL to forward
// every submission somewhere durable (Slack, Discord, Zapier, Make, ...).
const inbox: StoredMessage[] = [];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(body: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be JSON." };
  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const organisation = String(b.organisation ?? "").trim();
  const message = String(b.message ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Name is too short." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Email address looks invalid." };
  if (message.length < 10) return { ok: false, error: "Message must be at least 10 characters." };
  if (message.length > 4000) return { ok: false, error: "Message is too long." };
  return { ok: true, data: { name, email, organisation: organisation || undefined, message } };
}

// Figures from the GenFreZ business model canvas (Hanoi, 2026).
export const STATS = {
  zaloMonthlyActiveUsers: 76_500_000,
  zaloPopulationShare: 0.765,
  genZPopulationShare: 0.25,
  motorbikeBaselineGCo2PerKm: 95,
  electricMotorbikeGCo2PerKm: 30,
  busMarginalGCo2PerKm: 0,
  gramsPerPoint: 25,
  vndPerPoint: 100,
  year1: { mauExit: 12_000, revenueMillionVnd: 429.1, costMillionVnd: 1705, registrations: 30_000 },
  exitRunRateMillionVnd: 926.4,
  verificationTiers: [
    { tier: "A-1", source: "Partner webhook", confidence: 1.0 },
    { tier: "A-2", source: "Hanoi e-ticket tap-in/out", confidence: 1.0 },
    { tier: "B", source: "Mini App GPS + dynamic QR", confidence: 0.7 },
    { tier: "C", source: "Self-report with photo", confidence: 0.2 },
  ],
};

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/", (_req, res) => res.json({ service: "genfrez-api", ok: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  app.get("/api/stats", (_req, res) => res.json(STATS));

  // Points calculator: mirrors the BMC scoring formula.
  // points = avoided g CO2 / 25 * confidence * additionality * budget
  app.get("/api/points", (req, res) => {
    const km = Number(req.query.km ?? 5);
    const mode = String(req.query.mode ?? "ebike");
    const tier = String(req.query.tier ?? "A-1");
    const replacement = mode === "bus" ? STATS.busMarginalGCo2PerKm : mode === "ebike" ? STATS.electricMotorbikeGCo2PerKm : mode === "bicycle" ? 0 : STATS.motorbikeBaselineGCo2PerKm;
    const confidence = STATS.verificationTiers.find((t) => t.tier === tier)?.confidence ?? 0.7;
    const budget = 0.3;
    const avoidedG = Math.max(0, km) * (STATS.motorbikeBaselineGCo2PerKm - replacement);
    const points = Math.round((avoidedG / STATS.gramsPerPoint) * confidence * 1 * budget);
    res.json({ km, mode, tier, avoidedGramsCo2: avoidedG, confidence, budgetCoefficient: budget, points, voucherValueVnd: points * STATS.vndPerPoint });
  });

  app.post("/api/contact", async (req, res) => {
    const v = validateContact(req.body);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });
    const stored: StoredMessage = { ...v.data, id: Math.random().toString(36).slice(2, 10), receivedAt: new Date().toISOString() };
    inbox.push(stored);
    console.log("[contact]", JSON.stringify(stored));
    const hook = process.env.CONTACT_WEBHOOK_URL;
    if (hook) {
      try {
        await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: `New GenFreZ contact from ${stored.name} <${stored.email}>${stored.organisation ? " (" + stored.organisation + ")" : ""}:\n${stored.message}` }) });
      } catch (err) {
        console.error("[contact] webhook failed", err);
      }
    }
    return res.status(201).json({ ok: true, id: stored.id });
  });

  return app;
}
