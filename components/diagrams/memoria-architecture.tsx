import { Arrowhead, DiagramPanel } from "./panel";

/** Main deployment components, simplified from thesis figure 4.1. */
export function MemoriaArchitecture() {
  return (
    <DiagramPanel caption="Main components of the deployment, simplified from the thesis. Everything runs on one server, so no photo leaves it.">
      <svg viewBox="0 0 640 330" width="100%" role="img" aria-labelledby="ma-title ma-desc">
        <title id="ma-title">MEMORIA architecture</title>
        <desc id="ma-desc">
          The browser loads the Next.js client and reaches the Django API through Caddy, over REST and WebSockets.
          Django keeps data in PostgreSQL with PostGIS and image embeddings in Milvus, and queues work in Redis.
          Celery workers run the models and write results back. A local Ollama server runs the language model used
          by search.
        </desc>
        <Arrowhead id="ma-arrow" />
        <rect className="d-box" x="10" y="20" width="130" height="56" rx="10" />
        <rect className="d-box" x="190" y="20" width="130" height="56" rx="10" />
        <rect className="d-box-accent" x="370" y="20" width="130" height="56" rx="10" />
        <rect className="d-box" x="540" y="20" width="90" height="56" rx="10" />
        <rect className="d-box" x="190" y="140" width="130" height="56" rx="10" />
        <rect className="d-box" x="370" y="140" width="130" height="56" rx="10" />
        <rect className="d-box" x="540" y="140" width="90" height="56" rx="10" />
        <rect className="d-box" x="190" y="255" width="310" height="56" rx="10" />
        <g className="d-line" markerEnd="url(#ma-arrow)">
          <path d="M140 48H186" />
          <path d="M320 48H366" />
          <path d="M500 48H536" />
          <path d="M435 76V136" />
          <path d="M405 76C405 110 300 110 280 136" />
          <path d="M470 76C500 110 560 110 575 136" />
          <path d="M435 196V251" />
        </g>
        <g textAnchor="middle">
          <text className="d-text" x="75" y="44">Browser</text>
          <text className="d-small" x="75" y="62">Next.js client</text>
          <text className="d-text" x="255" y="44">Caddy</text>
          <text className="d-small" x="255" y="62">reverse proxy</text>
          <text className="d-text" x="435" y="44">Django API</text>
          <text className="d-small" x="435" y="62">REST + WebSockets</text>
          <text className="d-text" x="585" y="44">Ollama</text>
          <text className="d-small" x="585" y="62">local LLM</text>
          <text className="d-text" x="255" y="164">PostgreSQL</text>
          <text className="d-small" x="255" y="182">PostGIS, jobs, text</text>
          <text className="d-text" x="435" y="164">Redis</text>
          <text className="d-small" x="435" y="182">task queue</text>
          <text className="d-text" x="585" y="164">Milvus</text>
          <text className="d-small" x="585" y="182">CLIP vectors</text>
          <text className="d-text" x="345" y="279">Celery workers (GPU and CPU)</text>
          <text className="d-small" x="345" y="297">CLIP, captions, OCR, objects, scenes, faces, Trips</text>
        </g>
      </svg>
    </DiagramPanel>
  );
}
