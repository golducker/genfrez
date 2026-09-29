import Link from "next/link";
import Mascot from "@/components/Mascot";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-24 sm:py-32 text-center grid justify-items-center gap-6">
      <Mascot name="fluffy-scared" scale={1.6} className="bob" />
      <p className="t-label">404</p>
      <h1 className="t-display text-[40px] sm:text-[64px]">This page took a wrong turn.</h1>
      <p className="text-[18px] text-text-secondary">The link may be old, or the page moved.</p>
      <Link href="/" className="btn btn-primary btn-lg">Back to home</Link>
    </section>
  );
}
