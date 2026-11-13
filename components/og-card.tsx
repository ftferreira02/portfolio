/** Shared layout for generated Open Graph images (rendered by next/og, so inline styles only). */
export function OgCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#22252e",
        color: "#eef1f7",
        padding: "72px 80px",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#c3c9d6" }}>Francisco Ferreira · Software Engineer</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, lineHeight: 1.05, color: "#ffffff", maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#c3c9d6", maxWidth: 980 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 12, borderRadius: 6, background: "#f9c65d" }} />
        <div style={{ width: 120, height: 12, borderRadius: 6, background: "#1849ed" }} />
      </div>
    </div>
  );
}
