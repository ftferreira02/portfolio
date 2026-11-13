import { Arrowhead, DiagramPanel } from "./panel";

/** The three-step academic-record import and the batch monitor. */
export function EdufiableImport() {
  return (
    <DiagramPanel caption="Every row is checked in the browser and against the database before anything is written. A record is identified by the student's tax number, diploma title and diploma date.">
      <svg viewBox="0 0 640 310" width="100%" role="img" aria-labelledby="ei-title ei-desc">
        <title id="ei-title">Academic-record import</title>
        <desc id="ei-desc">
          Step one, upload a CSV or JSON file. Step two, preview the file. Step three, review each line: it is either
          valid, will update an existing record, or has an error such as a bad payload or a duplicate inside the
          file. Existing records are checked in chunks of 200. Importing upserts the rows, reporting how many were
          created and updated, and the batch monitor shows the batch as completed, partial or failed, with
          per-row errors.
        </desc>
        <Arrowhead id="ei-arrow" />
        <rect className="d-box" x="10" y="20" width="180" height="72" rx="10" />
        <rect className="d-box" x="230" y="20" width="180" height="72" rx="10" />
        <rect className="d-box-accent" x="450" y="20" width="180" height="72" rx="10" />
        <g className="d-line" markerEnd="url(#ei-arrow)">
          <path d="M190 56H226" />
          <path d="M410 56H446" />
          <path d="M540 92V138" />
          <path d="M450 230H414" />
        </g>
        <text className="d-text" x="24" y="48">1. Upload</text>
        <text className="d-small" x="24" y="70">CSV or JSON file</text>
        <text className="d-text" x="244" y="48">2. Preview</text>
        <text className="d-small" x="244" y="70">parsed rows, headers</text>
        <text className="d-text" x="464" y="48">3. Review lines</text>
        <text className="d-small" x="464" y="70">every row gets a status</text>

        <rect className="d-box" x="450" y="142" width="180" height="128" rx="10" />
        <circle cx="472" cy="172" r="6" fill="#4ade80" />
        <text className="d-small" x="486" y="177">valid</text>
        <circle cx="472" cy="200" r="6" fill="#f9c65d" />
        <text className="d-small" x="486" y="205">will update existing</text>
        <circle cx="472" cy="228" r="6" fill="#f87171" />
        <text className="d-small" x="486" y="233">error: bad data or</text>
        <text className="d-small" x="486" y="251">duplicate in file</text>

        <rect className="d-box" x="230" y="190" width="180" height="80" rx="10" />
        <text className="d-text" x="244" y="218">Import (upsert)</text>
        <text className="d-small" x="244" y="240">created and updated</text>
        <text className="d-small" x="244" y="258">counts reported</text>
        <path className="d-line" markerEnd="url(#ei-arrow)" d="M230 230H194" />
        <rect className="d-box" x="10" y="190" width="180" height="80" rx="10" />
        <text className="d-text" x="24" y="218">Batch monitor</text>
        <text className="d-small" x="24" y="240">completed, partial, failed</text>
        <text className="d-small" x="24" y="258">search + per-row errors</text>

        <text className="d-note" x="10" y="300">
          Bad rows stop at review, not at issuance.
        </text>
      </svg>
    </DiagramPanel>
  );
}
