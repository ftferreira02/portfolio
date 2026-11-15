import { HeroField } from "@/components/home/hero-field";

/** The top of the home page: text only, over the field that reacts to the pointer. */
export function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    // Pulled up under the (transparent) header so the field runs to the top of the page.
    <section className="relative -mt-16 overflow-hidden pt-16">
      <HeroField />
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="hero-large max-w-[38rem]">{children}</div>
        <p className="absolute right-4 bottom-6 hidden text-[0.85rem] text-muted sm:right-6 md:block">Move your cursor.</p>
      </div>
    </section>
  );
}
