import { Arrowhead, DiagramPanel } from "./panel";
import { PhoneBox, PhoneBranches, PhoneStack, PhoneStep } from "./phone";

const labels = {
  browser: "Browser",
  browserNote: "Next.js client",
  caddy: "Caddy",
  caddyNote: "reverse proxy",
  django: "Django API",
  djangoNote: "REST + WebSockets",
  ollama: "Ollama",
  ollamaNote: "local LLM",
  postgres: "PostgreSQL",
  postgresNote: "PostGIS, jobs, text",
  redis: "Redis",
  redisNote: "task queue",
  milvus: "Milvus",
  milvusNote: "CLIP vectors",
  celery: "Celery workers (GPU and CPU)",
  celeryNote: "CLIP, captions, OCR, objects, scenes, faces, Trips",
} as const;

/** Main deployment components, simplified from thesis figure 4.1. */
export function MemoriaArchitecture() {
  return (
    <DiagramPanel caption="Main components of the deployment, simplified from the thesis. Everything runs on one server, so no photo leaves it.">
      <div data-diagram-phone className="sm:hidden">
        <PhoneStack>
          <PhoneStep first><PhoneBox title={labels.browser} lines={[labels.browserNote]} /></PhoneStep>
          <PhoneStep><PhoneBox title={labels.caddy} lines={[labels.caddyNote]} /></PhoneStep>
          <PhoneStep><PhoneBox title={labels.django} lines={[labels.djangoNote]} accent /></PhoneStep>
          <PhoneStep>
            <PhoneBranches>
              <li><PhoneBox title={labels.postgres} lines={[labels.postgresNote]} /></li>
              <li><PhoneBox title={labels.milvus} lines={[labels.milvusNote]} /></li>
              <li><PhoneBox title={labels.ollama} lines={[labels.ollamaNote]} /></li>
              <li><PhoneBox title={labels.redis} lines={[labels.redisNote]} /></li>
              <li className="col-span-2">
                <div aria-hidden="true" className="py-1 text-center text-muted">↓ from Redis</div>
                <PhoneBox title={labels.celery} lines={[labels.celeryNote]} />
              </li>
            </PhoneBranches>
          </PhoneStep>
        </PhoneStack>
      </div>
      <svg className="hidden sm:block" viewBox="0 0 640 330" width="100%" role="img" aria-labelledby="ma-title ma-desc">
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
          <text className="d-text" x="75" y="44">{labels.browser}</text>
          <text className="d-small" x="75" y="62">{labels.browserNote}</text>
          <text className="d-text" x="255" y="44">{labels.caddy}</text>
          <text className="d-small" x="255" y="62">{labels.caddyNote}</text>
          <text className="d-text" x="435" y="44">{labels.django}</text>
          <text className="d-small" x="435" y="62">{labels.djangoNote}</text>
          <text className="d-text" x="585" y="44">{labels.ollama}</text>
          <text className="d-small" x="585" y="62">{labels.ollamaNote}</text>
          <text className="d-text" x="255" y="164">{labels.postgres}</text>
          <text className="d-small" x="255" y="182">{labels.postgresNote}</text>
          <text className="d-text" x="435" y="164">{labels.redis}</text>
          <text className="d-small" x="435" y="182">{labels.redisNote}</text>
          <text className="d-text" x="585" y="164">{labels.milvus}</text>
          <text className="d-small" x="585" y="182">{labels.milvusNote}</text>
          <text className="d-text" x="345" y="279">{labels.celery}</text>
          <text className="d-small" x="345" y="297">{labels.celeryNote}</text>
        </g>
      </svg>
    </DiagramPanel>
  );
}
