import { ChevronDown, Check } from "lucide-react";
import TypeIcon from "./TypeIcon";
import DayDetail from "./DayDetail";
import { TYPES } from "../data/types";
import { C, FONT_DISPLAY } from "../theme";

// An expandable card representing one day of the plan, with a "mark done" action.
export default function DayCard({ d, index, open, onToggle, done, onDone }) {
  const t = TYPES[d.kind] || TYPES.easy;

  return (
    <div
      style={{
        animation: "rp-rise .5s cubic-bezier(.2,.8,.2,1) both",
        animationDelay: `${index * 55}ms`,
      }}
    >
      <div className="flex" style={{ gap: 14 }}>
        {/* date rail */}
        <div className="flex-none text-center pt-3" style={{ width: 46 }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 17,
              color: d.today ? C.accent : C.ink,
              lineHeight: 1,
            }}
          >
            {d.day}
          </div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 5, letterSpacing: ".06em" }}>
            {d.date} {d.month || "MAR"}
          </div>
          {d.today && (
            <div
              style={{
                marginTop: 8,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: "#fff",
                background: C.accent,
                borderRadius: 999,
                padding: "3px 0",
                lineHeight: 1,
              }}
            >
              TODAY
            </div>
          )}
        </div>

        {/* card */}
        <div
          className="flex-1"
          style={{
            background: C.card,
            borderRadius: 22,
            border: `1px solid ${open ? "rgba(20,20,30,0.09)" : C.hair}`,
            boxShadow: open
              ? "0 18px 40px -22px rgba(20,20,40,0.28)"
              : "0 6px 18px -14px rgba(20,20,40,0.20)",
            transition: "box-shadow .3s ease, border-color .3s ease",
            overflow: "hidden",
          }}
        >
          {/* header (clickable) */}
          <button
            onClick={onToggle}
            className="w-full flex items-center text-left"
            style={{
              gap: 13,
              padding: "13px 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <TypeIcon type={d.kind} />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="flex items-center" style={{ gap: 7 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15.5, color: C.ink }}>
                  {t.label}
                </span>
                {done && <Check size={14} color={TYPES.long.fg} strokeWidth={3} />}
              </div>
              <div
                style={{
                  color: C.sub,
                  fontSize: 12.5,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: done ? 0.5 : 1,
                }}
              >
                {d.summary}
              </div>
            </div>
            <ChevronDown
              size={19}
              color={C.faint}
              style={{
                transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
                transform: open ? "rotate(180deg)" : "none",
              }}
            />
          </button>

          {/* expanding body */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: open ? "1fr" : "0fr",
              transition: "grid-template-rows .38s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <div style={{ padding: "2px 16px 14px" }}>
                <DayDetail d={d} />
                <button
                  onClick={onDone}
                  className="w-full flex items-center justify-center"
                  style={{
                    marginTop: 14,
                    gap: 8,
                    height: 42,
                    borderRadius: 13,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 13.5,
                    border: "none",
                    cursor: "pointer",
                    background: done ? TYPES.long.tint : C.ink,
                    color: done ? TYPES.long.fg : "#fff",
                    transition: "all .25s ease",
                  }}
                >
                  {done ? (
                    <>
                      <Check size={16} strokeWidth={3} /> Selesai
                    </>
                  ) : (
                    "Tandai selesai"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
