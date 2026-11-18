import { HeroCourt } from "@/components/home/hero-court";

/** The top of the home page: the introduction, next to the court that opens the padel match. */
export function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-10 px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
        <div className="hero-large max-w-[38rem]">{children}</div>
        <HeroCourt />
      </div>
    </section>
  );
}
