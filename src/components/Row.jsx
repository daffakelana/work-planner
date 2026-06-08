import { C } from "../theme";

// A single detail line: label on the left, optional middle value, value on the right.
export default function Row({ left, mid, right }) {
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderTop: `1px solid ${C.hair}` }}
    >
      <span style={{ color: C.ink, fontWeight: 600, fontSize: 14 }}>{left}</span>
      <div className="flex items-center" style={{ gap: 14 }}>
        {mid && <span style={{ color: C.sub, fontSize: 13 }}>{mid}</span>}
        <span style={{ color: C.faint, fontSize: 13, minWidth: 86, textAlign: "right" }}>
          {right}
        </span>
      </div>
    </div>
  );
}
