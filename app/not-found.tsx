import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 sm:px-6">
      <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-medium leading-none tracking-[-0.02em]">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-xl text-muted">The link may be old or mistyped. The home page has everything on this site.</p>
      <Link href="/" className="link-underline mt-8 inline-block font-bold">
        Go to the home page
      </Link>
    </section>
  );
}
