/*
 * Opening curtain, shown once per browser session. Pure CSS (see .intro in globals.css), so it plays
 * from the first paint without waiting for JavaScript. The inline script in layout.tsx adds
 * .no-intro to <html> on repeat visits and for reduced motion, which removes it entirely.
 */
export default function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-panel intro-panel-leaf" />
      <div className="intro-panel intro-panel-navy">
        <div className="intro-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark, must paint before hydration */}
          <img src="/logo.png" alt="" width={112} height={112} className="intro-logo" />
          <p className="intro-word">
            {"GenFreZ".split("").map((c, i) => (
              <span key={i} className={c === "Z" ? "z" : ""} style={{ "--i": i } as React.CSSProperties}>
                {c}
              </span>
            ))}
          </p>
          <p className="intro-tag">Turn Green into Gains</p>
        </div>
      </div>
    </div>
  );
}
