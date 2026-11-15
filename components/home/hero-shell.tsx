import { HeroField } from "@/components/home/hero-field";

/** The top of the home page: text only, over the field that reacts to the pointer. */
export function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    // Pulled up under the (transparent) header so the field runs to the top of the page.
    <section className="relative -mt-16 overflow-hidden pt-16">
      <HeroField />
      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12">
        <div className="hero-large max-w-[38rem]">{children}</div>
      </div>
    </section>
  );
}
