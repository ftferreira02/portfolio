import { DiagramPanel } from "./panel";

/** Records to wallet overview used on the home page. */
export function EdufiableOverview({ caption }: { caption?: string }) {
  return (
    <DiagramPanel caption={caption}>
      <svg viewBox="0 0 440 200" width="100%" role="img" aria-labelledby="eo-title eo-desc">
        <title id="eo-title">From academic records to a credential in a wallet</title>
        <desc id="eo-desc">
          Records arrive as CSV or JSON, are validated with duplicates flagged, and become credentials that a
          student claims into their wallet.
        </desc>
        <rect className="d-box" x="8" y="60" width="120" height="60" rx="10" />
        <rect className="d-box" x="160" y="60" width="120" height="60" rx="10" />
        <rect className="d-box-accent" x="312" y="60" width="120" height="60" rx="10" />
        <path className="d-flow" d="M128 90H160M280 90H312" />
        <g textAnchor="middle">
          <text className="d-text" x="68" y="86">CSV / JSON</text>
          <text className="d-small" x="68" y="104">records</text>
          <text className="d-text" x="220" y="86">Validated</text>
          <text className="d-small" x="220" y="104">duplicates flagged</text>
          <text className="d-text" x="372" y="86">Wallet</text>
          <text className="d-small" x="372" y="104">claimed credential</text>
        </g>
        <text className="d-note" x="8" y="170">Bad rows stop at review, not at issuance.</text>
      </svg>
    </DiagramPanel>
  );
}
