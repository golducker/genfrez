"use client";

import { useRef, useState } from "react";
import { play } from "@/lib/sfx";

/** Launch video with a cinematic cover: poster, title and a pulsing play button. Native controls take over once it plays. */
export default function DemoVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    play("whoosh");
    void video.current?.play().catch(() => {});
  }

  return (
    <div className="video-shell" data-reveal="scale">
      <video ref={video} className="absolute inset-0 h-full w-full object-cover" controls={started} preload="metadata" playsInline poster={poster} title={title}>
        <source src={src} type="video/mp4" />
      </video>
      {!started && (
        <button type="button" onClick={start} data-sfx="own" data-cursor="Play" className="video-cover" aria-label={`Play: ${title}`}>
          <span className="play-btn" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
            </svg>
          </span>
          <span className="video-chip">Watch the launch film</span>
        </button>
      )}
    </div>
  );
}
