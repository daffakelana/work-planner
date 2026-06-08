import { ChevronLeft, ChevronRight } from "lucide-react";
import { C, FONT_DISPLAY } from "../theme";

// Week label with prev/next navigation buttons.
export default function WeekSwitcher({ week, weekIndex, total, onPrev, onNext }) {
  const atStart = weekIndex === 0;
  const atEnd = weekIndex === total - 1;

  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: C.card,
        borderRadius: 18,
        border: `1px solid ${C.hair}`,
        padding: "8px 8px 8px 16px",
        marginBottom: 14,
      }}
    >
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>
          {week.label}
        </div>
        <div style={{ fontSize: 12, color: C.sub }}>{week.range}</div>
      </div>
      <div className="flex items-center" style={{ gap: 6 }}>
        <button
          onClick={onPrev}
          disabled={atStart}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "none",
            cursor: atStart ? "default" : "pointer",
            background: C.bg,
            opacity: atStart ? 0.35 : 1,
          }}
        >
          <ChevronLeft size={18} color={C.ink} />
        </button>
        <button
          onClick={onNext}
          disabled={atEnd}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "none",
            cursor: atEnd ? "default" : "pointer",
            background: C.bg,
            opacity: atEnd ? 0.35 : 1,
          }}
        >
          <ChevronRight size={18} color={C.ink} />
        </button>
      </div>
    </div>
  );
}
