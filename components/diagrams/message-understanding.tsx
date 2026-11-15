import { Arrowhead, DiagramPanel } from "./panel";
import { PhoneBox, PhoneStack, PhoneStep } from "./phone";

const labels = {
  message: "beach with Rita last September",
  match: "Match first",
  matchNote: "Trips, Albums, people",
  llm: "Local LLM",
  llmNote: "proposes query + filters",
  ground: "Ground, validate",
  groundNote: "names, dates, places",
  what: "what: beach",
  who: "who: Rita",
  when: "when: Sep 2025",
  shown: "Shown to the owner, editable, and enforced before ranking.",
  fallback1: "If the model is unavailable,",
  fallback2: "rules handle the message.",
} as const;

/** How a search message becomes constraints, after thesis figure 4.10. */
export function MessageUnderstanding() {
  return (
    <DiagramPanel caption="Deterministic steps surround the language model. Each step can end with a question back to the owner instead of a search.">
      <div data-diagram-phone className="sm:hidden">
        <PhoneStack>
          <PhoneStep first>
            <div className="rounded-full border border-line bg-bg px-4 py-2.5 text-text">{labels.message}</div>
          </PhoneStep>
          <PhoneStep><PhoneBox title={labels.match} lines={[labels.matchNote]} /></PhoneStep>
          <PhoneStep><PhoneBox title={labels.llm} lines={[labels.llmNote]} />
            <p className="mt-2 text-[13px] text-muted">{labels.fallback1} {labels.fallback2}</p>
          </PhoneStep>
          <PhoneStep><PhoneBox title={labels.ground} lines={[labels.groundNote]} /></PhoneStep>
          <PhoneStep>
            <ul role="list" className="flex list-none flex-wrap gap-2">
              {[labels.what, labels.who, labels.when].map((label) => (
                <li key={label} className="rounded-full bg-accent px-3.5 py-1.5 text-[14px] font-bold text-on-accent">
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] font-medium text-accent">{labels.shown}</p>
          </PhoneStep>
        </PhoneStack>
      </div>
      <svg className="hidden sm:block" viewBox="0 0 640 300" width="100%" role="img" aria-labelledby="mu-title mu-desc">
        <title id="mu-title">Understanding a search message</title>
        <desc id="mu-desc">
          The message &ldquo;beach with Rita last September&rdquo; is first matched against the owner&apos;s Trips,
          Albums and people. A local language model then proposes what to search for and which constraints apply.
          The proposal is grounded and validated, and the result is shown as editable constraints: what, beach;
          who, Rita; when, September 2025.
        </desc>
        <Arrowhead id="mu-arrow" />
        <rect className="d-box" x="10" y="14" width="380" height="44" rx="22" />
        <text x="30" y="42" fontSize="15" fill="var(--text)">{labels.message}</text>
        <rect className="d-box" x="10" y="92" width="180" height="70" rx="10" />
        <rect className="d-box" x="230" y="92" width="180" height="70" rx="10" />
        <rect className="d-box" x="450" y="92" width="180" height="70" rx="10" />
        <g className="d-line" markerEnd="url(#mu-arrow)">
          <path d="M100 58V88" />
          <path d="M190 127H226" />
          <path d="M410 127H446" />
          <path d="M540 162V196" />
        </g>
        <g>
          <text className="d-text" x="24" y="120">{labels.match}</text>
          <text className="d-small" x="24" y="142">{labels.matchNote}</text>
          <text className="d-text" x="244" y="120">{labels.llm}</text>
          <text className="d-small" x="244" y="142">{labels.llmNote}</text>
          <text className="d-text" x="464" y="120">{labels.ground}</text>
          <text className="d-small" x="464" y="142">{labels.groundNote}</text>
        </g>
        <g>
          <rect className="d-chip" x="250" y="202" width="112" height="32" rx="16" />
          <text className="d-chip-text" x="266" y="223">{labels.what}</text>
          <rect className="d-chip" x="372" y="202" width="100" height="32" rx="16" />
          <text className="d-chip-text" x="388" y="223">{labels.who}</text>
          <rect className="d-chip" x="482" y="202" width="148" height="32" rx="16" />
          <text className="d-chip-text" x="498" y="223">{labels.when}</text>
        </g>
        <text className="d-note" x="250" y="268">{labels.shown}</text>
        <text className="d-small" x="10" y="223">{labels.fallback1}</text>
        <text className="d-small" x="10" y="241">{labels.fallback2}</text>
      </svg>
    </DiagramPanel>
  );
}
