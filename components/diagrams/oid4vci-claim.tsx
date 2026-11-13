import { Arrowhead, DiagramPanel } from "./panel";

const actors = [
  { x: 70, label: "Student" },
  { x: 250, label: "Edufiable" },
  { x: 430, label: "Wallet provider" },
  { x: 580, label: "Wallet" },
];

const messages = [
  { from: 70, to: 250, y: 84, text: "claim credential, choose wallet provider" },
  { from: 250, to: 430, y: 124, text: "create credential offer" },
  { from: 250, to: 70, y: 164, text: "offer as QR code or link" },
  { from: 70, to: 580, y: 204, text: "scan offer" },
  { from: 580, to: 430, y: 244, text: "token + credential (OID4VCI)" },
  { from: 250, to: 430, y: 284, text: "poll status: claimed or expired" },
];

/** OID4VCI claim sequence as wired in Edufiable. */
export function Oid4vciClaim() {
  return (
    <DiagramPanel caption="Wallet providers sit behind one interface, so a student can claim with Triveria or TechMinho. Offers that are not claimed in time are marked as expired.">
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-labelledby="oc-title oc-desc">
        <title id="oc-title">Claiming a credential with OID4VCI</title>
        <desc id="oc-desc">
          The student asks to claim a credential and chooses a wallet provider. Edufiable asks the provider to create
          a credential offer and shows it to the student as a QR code or link. The student scans it with their
          wallet, which redeems the offer for a token and the credential. Edufiable polls the provider until the
          offer is claimed or expires.
        </desc>
        <Arrowhead id="oc-arrow" />
        {actors.map((a) => (
          <g key={a.label}>
            <text className="d-text" x={a.x} y="24" textAnchor="middle" fontWeight="700">
              {a.label}
            </text>
            <path className="d-life" d={`M${a.x} 40V306`} />
          </g>
        ))}
        {messages.map((m) => {
          const dir = m.to > m.from ? 1 : -1;
          const labelX = Math.min(m.from, m.to) + 8;
          return (
            <g key={m.text}>
              <path className="d-line" markerEnd="url(#oc-arrow)" d={`M${m.from} ${m.y}H${m.to - dir * 4}`} />
              <text className="d-small" x={labelX} y={m.y - 8}>
                {m.text}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramPanel>
  );
}
