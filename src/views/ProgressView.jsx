import StatChip from "../components/StatChip";
import { TYPES } from "../data/types";
import { C, FONT_DISPLAY } from "../theme";

// Progress tab: daily distance bar chart, key stats and completion bar.
export default function ProgressView({ week, isDone }) {
  const maxKm = Math.max(...week.days.map((d) => d.km), 1);
  const totalKm = week.days.reduce((s, d) => s + d.km, 0);
  const sessions = week.days.filter((d) => d.type !== "rest").length;
  const doneCount = week.days.filter((_, i) => isDone(i)).length;
  const longest = Math.max(...week.days.map((d) => d.km));
  const pct = Math.round((doneCount / sessions) * 100) || 0;

  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, marginBottom: 4 }}>
        Progress
      </h2>
      <p style={{ color: C.sub, fontSize: 13.5, marginBottom: 18 }}>
        {week.label} • {week.range}
      </p>

      <div className="flex" style={{ gap: 11, marginBottom: 22 }}>
        <StatChip value={`${totalKm}`} label="Total km" accent={C.accent} />
        <StatChip value={`${doneCount}/${sessions}`} label="Sesi selesai" accent={TYPES.long.fg} />
        <StatChip value={`${longest}`} label="Lari terpanjang" accent={TYPES.easy.fg} />
      </div>

      {/* bar chart */}
      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: "18px 16px 12px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink }}>
            Jarak harian
          </span>
          <span style={{ fontSize: 12, color: C.faint }}>km</span>
        </div>
        <div className="flex items-end" style={{ gap: 8, height: 130 }}>
          {week.days.map((d, i) => {
            const h = d.km === 0 ? 4 : Math.round((d.km / maxKm) * 110);
            const t = TYPES[d.type];
            return (
              <div key={i} className="flex-1 flex flex-col items-center" style={{ gap: 7 }}>
                <span style={{ fontSize: 10, color: C.faint, height: 12 }}>{d.km || ""}</span>
                <div
                  style={{
                    width: "100%",
                    height: h,
                    borderRadius: 7,
                    background: d.km === 0 ? C.hair : t.fg,
                    transition: "height .5s cubic-bezier(.2,.8,.2,1)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10.5,
                    color: d.today ? C.accent : C.sub,
                    fontWeight: d.today ? 700 : 500,
                  }}
                >
                  {d.day[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* completion */}
      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: 16, marginTop: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink }}>
            Penyelesaian minggu ini
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, color: TYPES.long.fg }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: C.hair, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: TYPES.long.fg,
              borderRadius: 999,
              transition: "width .5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
