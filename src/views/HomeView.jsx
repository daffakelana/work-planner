import WeekSwitcher from "../components/WeekSwitcher";
import StatChip from "../components/StatChip";
import DayCard from "../components/DayCard";
import { TYPES } from "../data/types";
import { C, FONT_DISPLAY } from "../theme";

// The main weekly menu: week switcher, summary, distance progress, day cards.
export default function HomeView({
  days,
  weekInfo,
  weekIndex,
  weeksCount,
  setWeekIndex,
  summary,
  isOpen,
  isDone,
  onToggleOpen,
  onToggleDone,
}) {
  const doneKm = days.reduce((s, d) => s + (isDone(d.id) ? (d.distanceKm || 0) : 0), 0);
  const pct = summary.totalKm ? Math.min(100, Math.round((doneKm / summary.totalKm) * 100)) : 0;
  const remaining = Math.max(0, summary.totalKm - doneKm);

  return (
    <div>
      <div style={{ padding: "4px 18px 6px" }}>
        <WeekSwitcher
          week={weekInfo}
          weekIndex={weekIndex}
          total={weeksCount}
          onPrev={() => setWeekIndex((i) => Math.max(0, i - 1))}
          onNext={() => setWeekIndex((i) => Math.min(weeksCount - 1, i + 1))}
        />

        <div className="flex" style={{ gap: 10, marginBottom: 6 }}>
          <StatChip value={`${summary.sessions}`} label="Sesi latihan" accent={TYPES.easy.fg} />
          <StatChip value={`${summary.doneCount}/${summary.sessions}`} label="Selesai" accent={TYPES.long.fg} />
        </div>

        {/* weekly distance progress */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.hair}`, padding: "14px 16px", marginTop: 12 }}>
          <div className="flex items-end justify-between" style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink }}>Jarak minggu ini</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 17, color: C.accent, lineHeight: 1 }}>
              {doneKm}
              <span style={{ color: C.faint, fontWeight: 600, fontSize: 13 }}> / {summary.totalKm} km</span>
            </span>
          </div>
          <div style={{ height: 12, borderRadius: 999, background: C.hair, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.accent, borderRadius: 999, transition: "width .6s cubic-bezier(.2,.8,.2,1)" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.sub }}>
            {pct >= 100 ? "Target jarak minggu ini tercapai! 🎉" : `${remaining} km lagi menuju target minggu ini`}
          </div>
        </div>
      </div>

      <div key={weekIndex} className="flex flex-col" style={{ gap: 14, padding: "10px 18px 24px" }}>
        {days.length === 0 && (
          <p style={{ color: C.sub, fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>
            Belum ada latihan di minggu ini. Tap + untuk menambah atau import dari Excel.
          </p>
        )}
        {days.map((d, i) => (
          <DayCard
            key={d.id}
            d={d}
            index={i}
            open={isOpen(d.id)}
            done={isDone(d.id)}
            onToggle={() => onToggleOpen(d.id)}
            onDone={() => onToggleDone(d.id)}
          />
        ))}
      </div>
    </div>
  );
}
