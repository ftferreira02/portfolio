import { DiagramPanel } from "./panel";

/** Compact ingestion overview used on the home page. */
export function MemoriaPipeline({ caption }: { caption?: string }) {
  return (
    <DiagramPanel caption={caption}>
      <svg viewBox="0 0 440 250" width="100%" role="img" aria-labelledby="mp-title mp-desc">
        <title id="mp-title">How a photo moves through MEMORIA</title>
        <desc id="mp-desc">
          An uploaded photo goes to the Django API and becomes searchable straight away. Celery jobs then add
          Days, Trips and faces in the background.
        </desc>
        <rect className="d-box" x="8" y="20" width="110" height="48" rx="10" />
        <rect className="d-box" x="165" y="20" width="110" height="48" rx="10" />
        <rect className="d-box-accent" x="322" y="20" width="110" height="48" rx="10" />
        <rect className="d-box" x="165" y="160" width="110" height="48" rx="10" />
        <rect className="d-box" x="322" y="160" width="110" height="48" rx="10" />
        <path className="d-flow" d="M118 44H165M275 44H322M220 68V160M275 184H322" />
        <g textAnchor="middle">
          <text className="d-text" x="63" y="49">Upload</text>
          <text className="d-text" x="220" y="49">Django</text>
          <text className="d-text" x="377" y="49">Searchable</text>
          <text className="d-text" x="220" y="181">Celery jobs</text>
          <text className="d-small" x="220" y="199">background work</text>
          <text className="d-text" x="377" y="181">Enriched</text>
          <text className="d-small" x="377" y="199">Days, Trips, faces</text>
        </g>
        <text className="d-note" x="8" y="240">Photos are searchable before enrichment finishes.</text>
      </svg>
    </DiagramPanel>
  );
}
