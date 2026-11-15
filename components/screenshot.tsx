import Image from "next/image";

type Shot = { src: string; width: number; height: number; alt: string };

function Shot({ shot, sizes }: { shot: Shot; sizes: string }) {
  return (
    <a href={shot.src} target="_blank" rel="noopener" className="block rounded-xl">
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        sizes={sizes}
        className="h-auto w-full rounded-xl border border-line"
      />
    </a>
  );
}

/** A screenshot with a plain caption; the image links to the full-size file. */
export function Screenshot({ caption, narrow = false, ...shot }: Shot & { caption: string; narrow?: boolean }) {
  const figure = (
    <figure className={`m-0 ${narrow ? "max-w-[24rem]" : ""}`}>
      <Shot shot={shot} sizes={narrow ? "384px" : "(min-width: 960px) 896px, 100vw"} />
      <figcaption className="mt-2.5 text-[0.92rem] text-muted">{caption}</figcaption>
    </figure>
  );
  // In the text column, .prose sets the width of its direct children, so a narrow figure needs a wrapper.
  return narrow ? <div>{figure}</div> : figure;
}

/** Two phone screenshots side by side, one caption for both. */
export function ScreenshotPair({ shots, caption }: { shots: [Shot, Shot]; caption: string }) {
  return (
    <figure className="m-0 max-w-[36rem]">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {shots.map((s) => (
          <Shot key={s.src} shot={s} sizes="(min-width: 640px) 280px, 45vw" />
        ))}
      </div>
      <figcaption className="mt-2.5 text-[0.92rem] text-muted">{caption}</figcaption>
    </figure>
  );
}
