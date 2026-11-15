import { Arrowhead, DiagramPanel } from "./panel";

/** How a search message becomes constraints, after thesis figure 4.10. */
export function MessageUnderstanding() {
  return (
    <DiagramPanel caption="Deterministic steps surround the language model. Each step can end with a question back to the owner instead of a search.">
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-labelledby="mu-title mu-desc">
        <title id="mu-title">Understanding a search message</title>
        <desc id="mu-desc">
          The message &ldquo;beach with Rita last September&rdquo; is first matched against the owner&apos;s Trips,
          Albums and people. A local language model then proposes what to search for and which constraints apply.
          The proposal is grounded and validated, and the result is shown as editable constraints: what, beach;
          who, Rita; when, September 2025.
        </desc>
        <Arrowhead id="mu-arrow" />
        <rect className="d-box" x="10" y="14" width="380" height="44" rx="22" />
        <text x="30" y="42" fontSize="15" fill="var(--text)">
          beach with Rita last September
        </text>
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
          <text className="d-text" x="24" y="120">Match first</text>
          <text className="d-small" x="24" y="142">Trips, Albums, people</text>
          <text className="d-text" x="244" y="120">Local LLM</text>
          <text className="d-small" x="244" y="142">proposes query + filters</text>
          <text className="d-text" x="464" y="120">Ground, validate</text>
          <text className="d-small" x="464" y="142">names, dates, places</text>
        </g>
        <g>
          <rect className="d-chip" x="250" y="202" width="112" height="32" rx="16" />
          <text className="d-chip-text" x="266" y="223">what: beach</text>
          <rect className="d-chip" x="372" y="202" width="100" height="32" rx="16" />
          <text className="d-chip-text" x="388" y="223">who: Rita</text>
          <rect className="d-chip" x="482" y="202" width="148" height="32" rx="16" />
          <text className="d-chip-text" x="498" y="223">when: Sep 2025</text>
        </g>
        <text className="d-note" x="250" y="268">
          Shown to the owner, editable, and enforced before ranking.
        </text>
        <text className="d-small" x="10" y="223">
          If the model is unavailable,
        </text>
        <text className="d-small" x="10" y="241">
          rules handle the message.
        </text>
      </svg>
    </DiagramPanel>
  );
}
