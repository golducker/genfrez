/*
 * Splits text into words at render time, so headings can rise word by word (data-split) or light up
 * as you scroll (data-scrub) without touching the DOM after hydration. Screen readers still read
 * the sentence normally: the spaces stay as text between the word spans.
 */
export default function Split({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={`split-w ${className}`}>
            <span className="split-i">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
