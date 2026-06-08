import { C, FONT_DISPLAY } from "../theme";

// Small stat card used in summaries and views.
export default function StatChip({ value, label, accent }) {
  return (
    <div
      className="flex-1"
      style={{
        background: C.card,
        borderRadius: 18,
        padding: "13px 14px",
        border: `1px solid ${C.hair}`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 22,
          color: accent || C.ink,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: C.sub, marginTop: 5 }}>{label}</div>
    </div>
  );
}
