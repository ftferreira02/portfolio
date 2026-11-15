import { Arrowhead, DiagramPanel } from "./panel";
import { PhoneBox, PhoneStack, PhoneStep } from "./phone";

const stages = [
  {
    title: "1. Receive",
    where: "in the upload request",
    steps: ["file type check", "duplicate check (hash)", "date from EXIF", "place from GPS", "thumbnail, Day"],
  },
  {
    title: "2. Index",
    where: "GPU worker",
    steps: ["upright copy", "CLIP embedding", "stored in Milvus", "with owner, date, place"],
    note: "searchable here",
  },
  {
    title: "3. Enrich",
    where: "GPU, separate jobs",
    steps: ["two captioners", "OCR text", "objects, scene", "full-text index", "faces (if enabled)"],
  },
  {
    title: "4. Organise",
    where: "CPU, after uploads",
    steps: ["Moments in each Day", "Trips recomputed", "owner edits kept"],
  },
];

const searchNote = "Search works after stage 2; stages 3 and 4 make results richer over time.";

/** The four stages an added photo goes through, from thesis figure 4.3. */
export function PhotoPath() {
  const w = 152;
  const gap = 14;
  return (
    <DiagramPanel caption="Every stage is a persistent job in PostgreSQL with owner, state, attempts and progress. A recovery sweep reschedules work interrupted by a restart.">
      <div data-diagram-phone className="sm:hidden">
        <PhoneStack>
          {stages.map((stage, i) => <PhoneStep key={stage.title} first={i === 0}>
            <PhoneBox title={stage.title} lines={[stage.where]} accent={Boolean(stage.note)}>
              <ul role="list" className="mt-3 list-none space-y-1 text-[13px] text-muted">
                {stage.steps.map((step) => <li key={step}>{step}</li>)}
              </ul>
              {stage.note && <p className="mt-3 text-[13px] font-medium text-accent">{stage.note}</p>}
            </PhoneBox>
          </PhoneStep>)}
        </PhoneStack>
        <p className="mt-3 text-[13px] font-medium text-accent">{searchNote}</p>
      </div>
      <svg className="hidden sm:block" viewBox={`0 0 ${4 * w + 3 * gap + 4} 300`} width="100%" role="img" aria-labelledby="pp-title pp-desc">
        <title id="pp-title">The path of an added photo</title>
        <desc id="pp-desc">
          Four stages. Receive: file checks, duplicate detection, date, place, thumbnail and Day. Index: a CLIP
          embedding is stored in Milvus, and the photo becomes searchable. Enrich: captions, OCR, objects, scenes,
          a full-text index and, if enabled, faces. Organise: Moments and Trips are recomputed once uploads settle,
          keeping the owner&apos;s edits.
        </desc>
        <Arrowhead id="pp-arrow" />
        {stages.map((stage, i) => {
          const x = 2 + i * (w + gap);
          return (
            <g key={stage.title}>
              <rect className={stage.note ? "d-box-accent" : "d-box"} x={x} y="10" width={w} height="250" rx="12" />
              <text className="d-text" x={x + 14} y="38" fontWeight="700">
                {stage.title}
              </text>
              <text className="d-small" x={x + 14} y="58">
                {stage.where}
              </text>
              {stage.steps.map((step, j) => (
                <text key={step} className="d-small" x={x + 14} y={92 + j * 26}>
                  {step}
                </text>
              ))}
              {stage.note ? (
                <text className="d-note" x={x + 14} y="244">
                  {stage.note}
                </text>
              ) : null}
              {i < stages.length - 1 ? (
                <path className="d-line" markerEnd="url(#pp-arrow)" d={`M${x + w + 1} 135H${x + w + gap - 2}`} />
              ) : null}
            </g>
          );
        })}
        <text className="d-note" x="2" y="290">
          {searchNote}
        </text>
      </svg>
    </DiagramPanel>
  );
}
