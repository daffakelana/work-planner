import { Target, ChevronRight } from "lucide-react";
import { PLANS } from "../data/plans";
import { C, FONT_DISPLAY } from "../theme";

// Plans tab: a catalogue of training programs.
export default function PlansView() {
  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, marginBottom: 4 }}>
        Program Latihan
      </h2>
      <p style={{ color: C.sub, fontSize: 13.5, marginBottom: 18 }}>
        Pilih target, kami susun jadwalnya.
      </p>
      <div className="flex flex-col" style={{ gap: 12 }}>
        {PLANS.map((p, i) => (
          <button
            key={i}
            className="w-full text-left flex items-center"
            style={{
              gap: 14,
              background: C.card,
              border: `1px solid ${C.hair}`,
              borderRadius: 20,
              padding: 15,
              cursor: "pointer",
              animation: "rp-rise .5s ease both",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full flex-none"
              style={{ width: 48, height: 48, background: `${p.color}1a` }}
            >
              <Target size={22} color={p.color} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>
                {p.weeks} • {p.level}
              </div>
            </div>
            <ChevronRight size={20} color={C.faint} />
          </button>
        ))}
      </div>
    </div>
  );
}
