import { site } from "@/lib/site";

export default function PhoneFrame() {
  return (
    <div className="mx-auto w-[300px] sm:w-[340px]">
      <div className="rounded-[40px] bg-[#0d2440] p-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
        <div className="rounded-[30px] overflow-hidden bg-black" style={{ aspectRatio: "9 / 19" }}>
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
        <a href={site.demoUrl} target="_blank" rel="noreferrer" className="font-semibold text-text-display hover:text-accent-text">
          open full screen ↗
        </a>
      </p>
    </div>
  );
}
