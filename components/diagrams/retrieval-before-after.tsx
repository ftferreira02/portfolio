import { Arrowhead, DiagramPanel } from "./panel";
import { PhoneBox, PhoneBranches, PhoneStack, PhoneStep } from "./phone";

const labels = {
  before: "Before",
  clip: "CLIP in Milvus",
  clipBefore: "global top 100, unfiltered",
  fullText: "Full-text",
  fullTextBefore: "filters applied here only",
  merge: "Merge",
  after: "After",
  owner: "Owner + filters",
  ownerNote: "owner's photos only",
  ownerFilters: "dates, places, people,",
  ownerFilters2: "Trips, Albums",
  recheck: "Re-check",
  recheckNote: "every photo",
  rrf: "RRF",
  rrfNote: "fuse by rank",
} as const;

/** Retrieval in the inherited system versus this work, after thesis figure 4.11. */
export function RetrievalBeforeAfter() {
  return (
    <DiagramPanel caption="Before, filters applied only to the full-text side and visual search returned the global top 100 with no ownership filter. Now both sides are restricted first, then fused by rank.">
      <div data-diagram-phone className="space-y-6 sm:hidden">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{labels.before}</p>
          <PhoneStack>
            <PhoneStep first><PhoneBranches>
              <li><PhoneBox title={labels.clip} lines={[labels.clipBefore]} /></li>
              <li><PhoneBox title={labels.fullText} lines={[labels.fullTextBefore]} /></li>
            </PhoneBranches></PhoneStep>
            <PhoneStep><PhoneBox title={labels.merge} /></PhoneStep>
          </PhoneStack>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted">{labels.after}</p>
          <PhoneStack>
            <PhoneStep first><PhoneBox title={labels.owner} lines={[labels.ownerNote, labels.ownerFilters, labels.ownerFilters2]} accent /></PhoneStep>
            <PhoneStep><PhoneBranches>
              <li><PhoneBox title={labels.clip} /></li>
              <li><PhoneBox title={labels.fullText} /></li>
            </PhoneBranches></PhoneStep>
            <PhoneStep><PhoneBox title={labels.recheck} lines={[labels.recheckNote]} /></PhoneStep>
            <PhoneStep><PhoneBox title={labels.rrf} lines={[labels.rrfNote]} accent /></PhoneStep>
          </PhoneStack>
        </div>
      </div>
      <svg className="hidden sm:block" viewBox="0 0 640 300" width="100%" role="img" aria-labelledby="rb-title rb-desc">
        <title id="rb-title">Retrieval before and after</title>
        <desc id="rb-desc">
          Before: the CLIP search in Milvus returned a global top 100 without owner or constraint filters, and only
          the full-text results were filtered. After: both the Milvus search and the PostgreSQL full-text search are
          restricted to the owner and the constraints, every photo is checked again, and the two lists are merged
          with reciprocal rank fusion.
        </desc>
        <Arrowhead id="rb-arrow" />
        <text className="d-small" x="10" y="22">{labels.before}</text>
        <rect className="d-box" x="10" y="34" width="180" height="48" rx="10" />
        <rect className="d-box" x="10" y="94" width="180" height="48" rx="10" />
        <text className="d-text" x="24" y="56">{labels.clip}</text>
        <text className="d-small" x="24" y="73">{labels.clipBefore}</text>
        <text className="d-text" x="24" y="116">{labels.fullText}</text>
        <text className="d-small" x="24" y="133">{labels.fullTextBefore}</text>
        <rect className="d-box" x="230" y="64" width="90" height="48" rx="10" />
        <text className="d-text" x="246" y="93">{labels.merge}</text>
        <g className="d-line" markerEnd="url(#rb-arrow)">
          <path d="M190 58C210 58 210 80 226 82" />
          <path d="M190 118C210 118 210 96 226 94" />
        </g>

        <text className="d-small" x="10" y="176">{labels.after}</text>
        <rect className="d-box-accent" x="10" y="188" width="150" height="96" rx="10" />
        <text className="d-text" x="24" y="214">{labels.owner}</text>
        <text className="d-small" x="24" y="234">{labels.ownerNote}</text>
        <text className="d-small" x="24" y="252">{labels.ownerFilters}</text>
        <text className="d-small" x="24" y="270">{labels.ownerFilters2}</text>
        <rect className="d-box" x="200" y="188" width="150" height="40" rx="10" />
        <rect className="d-box" x="200" y="244" width="150" height="40" rx="10" />
        <text className="d-text" x="214" y="213">{labels.clip}</text>
        <text className="d-text" x="214" y="269">{labels.fullText}</text>
        <rect className="d-box" x="390" y="214" width="110" height="48" rx="10" />
        <text className="d-text" x="404" y="236">{labels.recheck}</text>
        <text className="d-small" x="404" y="253">{labels.recheckNote}</text>
        <rect className="d-box-accent" x="530" y="214" width="100" height="48" rx="10" />
        <text className="d-text" x="544" y="236">{labels.rrf}</text>
        <text className="d-small" x="544" y="253">{labels.rrfNote}</text>
        <g className="d-line" markerEnd="url(#rb-arrow)">
          <path d="M160 222H196" />
          <path d="M160 258H196" />
          <path d="M350 208C370 208 370 232 386 234" />
          <path d="M350 264C370 264 370 244 386 242" />
          <path d="M500 238H526" />
        </g>
      </svg>
    </DiagramPanel>
  );
}
