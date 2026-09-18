"use client";

import { FormEvent, useState } from "react";

type State = { status: "idle" } | { status: "sending" } | { status: "sent"; id: string } | { status: "error"; message: string };

export default function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as { ok: boolean; id?: string; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setState({ status: "sent", id: json.id ?? "" });
      form.reset();
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  const busy = state.status === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-8" noValidate={false}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="t-label">Name</label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className="field mt-2" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="t-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field mt-2" placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label htmlFor="organisation" className="t-label">Organisation <span className="text-text-disabled">· optional</span></label>
        <input id="organisation" name="organisation" autoComplete="organization" className="field mt-2" placeholder="Company, university, fund" />
      </div>
      <div>
        <label htmlFor="message" className="t-label">Message</label>
        <textarea id="message" name="message" required minLength={10} rows={5} className="field mt-2 resize-y" placeholder="Tell us what you have in mind." />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "[ SENDING ]" : "Send message"}
        </button>
        <p className="t-caption" aria-live="polite">
          {state.status === "sent" && <span className="text-success">[SENT] Thanks. We reply within two working days.</span>}
          {state.status === "error" && <span className="text-accent">[ERROR: {state.message}]</span>}
        </p>
      </div>
    </form>
  );
}
