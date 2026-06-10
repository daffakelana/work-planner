import Row from "./Row";
import { useWorkouts } from "../store/workouts";
import { FOCUS, ZONES, RECOVERY_TYPES, TYPES, kindOf } from "../data/types";
import { C, FONT_DISPLAY } from "../theme";

function Note({ children }) {
  return <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>{children}</p>;
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 12.5, color: C.ink, marginTop: 14, marginBottom: 2, letterSpacing: ".02em" }}>
      {children}
    </div>
  );
}

function BlockView({ block, label }) {
  if (!block) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>
        {label}: {block.name} <span style={{ color: C.faint, fontWeight: 600 }}>· {block.value}</span>
      </div>
      {block.steps?.length > 0 && (
        <ul style={{ margin: "4px 0 0", paddingLeft: 16, color: C.sub, fontSize: 12.5, lineHeight: 1.5 }}>
          {block.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function DayDetail({ d }) {
  const { blocks } = useWorkouts();
  const byId = (id) => blocks.find((b) => b.id === id);

  const goal = d.goal ? (
    <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 6 }}>🎯 {d.goal}</div>
  ) : null;

  const actual =
    d.completedAt || d.actualDistanceKm || d.actualDurationMin || d.actualNote ? (
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${C.hair}` }}>
        <SectionTitle>Hasil aktual</SectionTitle>
        {d.actualDistanceKm && <Row left="Jarak" right={`${d.actualDistanceKm} km`} />}
        {d.actualDurationMin && <Row left="Durasi" right={`${d.actualDurationMin} menit`} />}
        {d.actualPaceAvg && <Row left="Pace rata-rata" right={`${d.actualPaceAvg} /km`} />}
        {d.actualRpe && <Row left="RPE" right={`${d.actualRpe}/10`} />}
        {d.actualHrAvg && <Row left="HR rata-rata" right={`${d.actualHrAvg} bpm`} />}
        {d.actualNote && <Note>{d.actualNote}</Note>}
      </div>
    ) : null;

  if (d.category === "rest") {
    return (
      <div>
        {goal}
        <Note>{d.note || "Hari pemulihan. Gerak ringan boleh, tapi jangan dipaksa."}</Note>
        {actual}
      </div>
    );
  }

  if (d.category === "strength") {
    return (
      <div>
        {goal}
        <Row left="Fokus" right={FOCUS[d.focus] || "Full Body"} />
        {d.durationMin && <Row left="Estimasi durasi" right={`${d.durationMin} menit`} />}
        <SectionTitle>Gerakan</SectionTitle>
        {(d.exercises || []).map((e, i) => (
          <Row key={i} left={e.name} mid={e.loadKg ? `${e.loadKg} kg` : "Bodyweight"} right={`${e.sets} × ${e.reps}`} />
        ))}
        {d.note && <Note>{d.note}</Note>}
        {actual}
      </div>
    );
  }

  // running
  const pace = d.paceMin && d.paceMax ? `${d.paceMin}–${d.paceMax} /km` : d.paceMin || d.paceMax;
  const hr = d.hrMin && d.hrMax ? `${d.hrMin}–${d.hrMax} bpm` : d.hrMin || d.hrMax;
  return (
    <div>
      {goal}
      {d.distanceKm ? <Row left="Jarak" right={`${d.distanceKm} km`} /> : null}
      {d.durationMin ? <Row left="Target durasi" right={`${d.durationMin} menit`} /> : null}
      {pace ? <Row left="Rentang pace" right={pace} /> : null}
      {d.rpe ? <Row left="Effort (RPE)" right={`${d.rpe}/10`} /> : null}
      {d.zone ? <Row left="Zona" right={ZONES[d.zone] || d.zone} /> : null}
      {hr ? <Row left="Target HR" right={hr} /> : null}

      <BlockView block={byId(d.warmUpId)} label="Warm Up" />

      {(d.structure || []).length > 0 && (
        <>
          <SectionTitle>Struktur</SectionTitle>
          {d.structure.map((s, i) => (
            <div key={i}>
              <Row
                left={s.label || "Set"}
                mid={`${s.sets > 1 ? s.sets + " × " : ""}${s.work?.value || ""}`}
                right={s.targetPace || ""}
              />
              {s.recovery?.value && s.recovery.value !== "-" && (
                <div style={{ fontSize: 11.5, color: C.faint, padding: "0 0 6px" }}>
                  Recovery: {RECOVERY_TYPES[s.recovery.type] || s.recovery.type} {s.recovery.value}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <BlockView block={byId(d.coolDownId)} label="Cool Down" />

      {d.note && <Note>{d.note}</Note>}
      {actual}
    </div>
  );
}
