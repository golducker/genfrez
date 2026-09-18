import { site } from "@/lib/site";

export default function PhoneFrame() {
  return (
    <div className="mx-auto w-[300px] sm:w-[340px]">
      <div className="rounded-[28px] border border-border-visible bg-surface p-2">
        <div className="rounded-[20px] overflow-hidden bg-black border border-border" style={{ aspectRatio: "9 / 19" }}>
          <iframe
            src={site.demoUrl}
            title="GenFreZ Zalo Mini App demo"
            loading="lazy"
            className="w-full h-full"
            style={{ border: 0, background: "#fff" }}
          />
        </div>
      </div>
      <p className="t-caption mt-3 text-center">
        Live demo ·{" "}
        <a href={site.demoUrl} target="_blank" rel="noreferrer" className="text-text-primary hover:text-text-display">
          open full screen ↗
        </a>
      </p>
    </div>
  );
}
