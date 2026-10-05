/*
 * Splits text into words at render time, so headings can rise word by word (data-split) or light up
 * as you scroll (data-scrub) without touching the DOM after hydration. Screen readers get the
 * sentence once, as plain text; the animated word spans are hidden from them, so VoiceOver does not
 * step through it word by word.
 */
export default function Split({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className={`split-w ${className}`}>
              <span className="split-i">{w}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}
