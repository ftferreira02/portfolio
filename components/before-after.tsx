import Image from "next/image";

/** The inherited competition client next to MEMORIA's search page, one above the other, each with a plain caption. */
export function BeforeAfter() {
  return (
    <div className="grid gap-8">
      <figure className="m-0">
        <a href="/images/memoria/memoria-before.webp" target="_blank" rel="noopener" className="block rounded-xl">
          <Image
            src="/images/memoria/memoria-before.webp"
            width={1585}
            height={719}
            sizes="(min-width: 960px) 896px, 100vw"
            alt="The inherited competition interface: a search box, the query split into word buttons, toggles for LLM and Milvus, and a dense grid of photo results."
            className="h-auto w-full rounded-xl border border-line"
          />
        </a>
        <figcaption className="mt-2.5 text-[0.92rem] text-muted">
          Before: the competition client I inherited, searching for &ldquo;coffee in the beach&rdquo;. Built for trained
          operators: the query is split into words and the controls are about the engine.
        </figcaption>
      </figure>
      <figure className="m-0">
        <a href="/images/memoria/memoria-search-history.webp" target="_blank" rel="noopener" className="block rounded-xl">
          <Image
            src="/images/memoria/memoria-search-history.webp"
            width={1280}
            height={800}
            sizes="(min-width: 960px) 896px, 100vw"
            alt="MEMORIA's search page: a search for food returns 24 photos, the understood filter is a removable chip, and earlier searches are listed by date."
            className="h-auto w-full rounded-xl border border-line"
          />
        </a>
        <figcaption className="mt-2.5 text-[0.92rem] text-muted">
          After: MEMORIA, searching for &ldquo;food&rdquo;. What it understood is a chip you can remove, and earlier
          searches stay on the side. Faces and friends&apos; names are blurred.
        </figcaption>
      </figure>
    </div>
  );
}
