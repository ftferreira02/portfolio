import { site } from "@/content/site";

/** Hero band: positioning on the left, one card per project on the right. */
export function Hero() {
  return (
    <section className="on-dark border-b border-line bg-surface text-on-surface" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
        <div>
          <h1 id="hero-title" className="font-display text-[clamp(2.75rem,6.2vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.02em] text-white">
            {site.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-on-surface-muted">{site.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-highlight px-4 py-2 text-[0.95rem] font-bold text-[#22252e]">
              {site.availability}
            </span>
            <a
              href={site.cv}
              className="rounded-full border border-on-surface-muted/60 px-4 py-2 text-[0.95rem] font-bold text-white transition-colors hover:border-white"
            >
              Download CV
            </a>
          </div>
        </div>
        <Collage />
      </div>
    </section>
  );
}

function Collage() {
  return (
    <div
      className="mx-auto h-[335px] w-[350px] sm:h-[440px] sm:w-[460px]"
      role="img"
      aria-label="Three cards, one per project: a photo from the MEMORIA app, a digital diploma from Edufiable and a booking page from KBAI."
    >
      <div className="relative h-[440px] w-[460px] origin-top-left max-sm:scale-[0.76]">
      <Print className="left-0 top-[30px] w-[205px] -rotate-6" label="MEMORIA · thesis">
        <div className="grid h-[160px] grid-cols-3 gap-1.5 bg-white p-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{ background: i === 4 ? "#1849ed" : i % 3 === 0 ? "#c3c9d6" : i % 2 ? "#dfe4ee" : "#9aaeff" }}
            />
          ))}
        </div>
      </Print>
      <Print className="left-[235px] top-0 w-[200px] rotate-[4deg]" label="Edufiable · IT">
        <div className="relative h-[150px] bg-white p-3.5 text-[12px] text-[#646b7d]">
          Verifiable credential
          <b className="mt-1.5 block font-display text-[22px] font-semibold text-[#22252e]">MSc diploma</b>
          <span className="mt-2 block h-2 w-24 rounded bg-[#eef1f7]" />
          <span className="mt-1.5 block h-2 w-16 rounded bg-[#eef1f7]" />
          <i className="absolute bottom-3.5 right-3.5 size-11 rounded-full border-2 border-highlight" />
        </div>
      </Print>
      <Print className="left-[40px] top-[252px] w-[220px] -rotate-1" label="Booking apps · KBAI">
        <div className="grid h-[130px] content-start gap-2 bg-white p-3.5">
          <b className="text-[15px] text-[#22252e]">Book a tour</b>
          <span className="h-2.5 rounded bg-[#eef1f7]" />
          <span className="h-2.5 w-3/4 rounded bg-[#eef1f7]" />
          <span className="mt-1 justify-self-start rounded-full bg-[#22252e] px-3 py-1 text-[12px] text-white">Pay now</span>
        </div>
      </Print>
      <div className="absolute right-0 top-[280px] w-[180px] rounded-2xl bg-white px-4 py-3 text-[15px] text-[#22252e] shadow-[0_20px_40px_-24px_#000]">
        <span className="block text-xs font-medium text-[#646b7d]">Day to day</span>
        {site.dayToDay.join(" · ")}
      </div>
      </div>
    </div>
  );
}

function Print({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  return (
    <div className={`absolute rounded bg-[var(--print)] p-3 pb-9 shadow-[0_30px_50px_-30px_#000] ${className}`}>
      {children}
      <span className="absolute bottom-2.5 left-3.5 font-display text-sm italic text-[#22252e]">{label}</span>
    </div>
  );
}
