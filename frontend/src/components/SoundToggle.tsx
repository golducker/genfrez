"use client";

import { useSyncExternalStore } from "react";
import { isMuted, play, setMuted, subscribeSound } from "@/lib/sfx";

/** Mute switch with a little live equalizer. The choice is kept in localStorage. */
export default function SoundToggle({ className = "inline-flex" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeSound, isMuted, () => false);
  function toggle() {
    setMuted(!muted);
    if (muted) play("toggle");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      data-sfx="own"
      aria-pressed={!muted}
      aria-label={muted ? "Sound off. Turn sounds on" : "Sound on. Turn sounds off"}
      className={`items-center gap-2 rounded-full border-2 border-border px-3 h-9 text-[13px] font-semibold text-text-secondary hover:text-text-display hover:border-border-visible transition-colors ${className}`}
    >
      <span className={`eq ${muted ? "eq-off" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {muted ? "Off" : "Sound"}
    </button>
  );
}
