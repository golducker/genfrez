"use client";

import { useEffect, useRef, useState } from "react";

/** A number that glides to each new value instead of jumping. Formats with en-US grouping. */
export default function RollingNumber({ value, decimals = 0, duration = 600 }: { value: number; decimals?: number; duration?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const shownRef = useRef(value);

  useEffect(() => {
    from.current = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 4);
      const v = from.current + (value - from.current) * e;
      shownRef.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{shown.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}
