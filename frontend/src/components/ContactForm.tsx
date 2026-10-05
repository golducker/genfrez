"use client";

import { FormEvent, useRef, useState } from "react";
import { burst } from "./ClickFx";
import { play } from "@/lib/sfx";

type State = { status: "idle" } | { status: "sending" } | { status: "sent"; id: string } | { status: "error"; message: string };

export default function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const btn = useRef<HTMLButtonElement>(null);

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
      play("levelup");
      const b = btn.current?.getBoundingClientRect();
      if (b) {
        burst(b.left + b.width / 2, b.top + b.height / 2, 28, 1.6);
        setTimeout(() => burst(b.left + b.width / 2, b.top - 20, 18, 1.2), 180);
      }
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  const busy = state.status === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-8" noValidate={false}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="field-wrap">
          <label htmlFor="name" className="t-label">Name</label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className="field mt-2" placeholder="Your name" />
        </div>
        <div className="field-wrap">
          <label htmlFor="email" className="t-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field mt-2" placeholder="you@example.com" />
        </div>
      </div>
      <div className="field-wrap">
        <label htmlFor="organisation" className="t-label">Organisation <span className="normal-case tracking-normal font-medium text-text-disabled">· optional</span></label>
        <input id="organisation" name="organisation" autoComplete="organization" className="field mt-2" placeholder="Company, university, fund" />
      </div>
      <div className="field-wrap">
        <label htmlFor="message" className="t-label">Message</label>
        <textarea id="message" name="message" required minLength={10} rows={5} className="field mt-2 resize-y" placeholder="Tell us what you have in mind." />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button ref={btn} type="submit" className={`btn btn-primary btn-lg ${busy ? "btn-busy" : ""}`} disabled={busy}>
          <span>{busy ? "Sending…" : state.status === "sent" ? "Sent. Send another?" : "Send message"}</span>
        </button>
        <p className="t-caption" aria-live="polite">
          {state.status === "sent" && <span className="font-semibold text-success">Sent. We reply within two working days.</span>}
          {state.status === "error" && <span className="font-semibold text-[#d6452f]">Something went wrong on our side. Try again in a minute. ({state.message})</span>}
        </p>
      </div>
    </form>
  );
}
