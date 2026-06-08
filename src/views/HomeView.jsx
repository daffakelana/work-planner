import WeekSwitcher from "../components/WeekSwitcher";
import StatChip from "../components/StatChip";
import DayCard from "../components/DayCard";
import { TYPES } from "../data/types";
import { C } from "../theme";

// The main weekly menu: week switcher, summary chips and the list of day cards.
export default function HomeView({
  week,
  weekIndex,
  weeksCount,
  setWeekIndex,
  summary,
  isOpen,
  isDone,
  onToggleOpen,
  onToggleDone,
}) {
  return (
    <div>
      <div style={{ padding: "4px 18px 6px" }}>
        <WeekSwitcher
          week={week}
          weekIndex={weekIndex}
          total={weeksCount}
          onPrev={() => setWeekIndex((i) => Math.max(0, i - 1))}
          onNext={() => setWeekIndex((i) => Math.min(weeksCount - 1, i + 1))}
        />

        <div className="flex" style={{ gap: 10, marginBottom: 6 }}>
          <StatChip value={`${summary.totalKm} km`} label="Total minggu ini" accent={C.accent} />
          <StatChip value={`${summary.sessions}`} label="Sesi latihan" accent={TYPES.easy.fg} />
          <StatChip
            value={`${summary.doneCount}/${summary.sessions}`}
            label="Selesai"
            accent={TYPES.long.fg}
          />
        </div>
      </div>

      <div key={weekIndex} className="flex flex-col" style={{ gap: 14, padding: "10px 18px 24px" }}>
        {week.days.map((d, i) => (
          <DayCard
            key={i}
            d={d}
            index={i}
            open={isOpen(i)}
            done={isDone(i)}
            onToggle={() => onToggleOpen(i)}
            onDone={() => onToggleDone(i)}
          />
        ))}
      </div>
    </div>
  );
}
