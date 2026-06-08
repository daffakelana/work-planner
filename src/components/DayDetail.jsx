import Row from "./Row";
import { C } from "../theme";

function Note({ children }) {
  return (
    <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>
      {children}
    </p>
  );
}

// Renders the expanded detail for a day, depending on its workout type.
export default function DayDetail({ d }) {
  const det = d.detail;

  if (det.segments) {
    return (
      <div>
        {det.segments.map((s, i) => (
          <Row key={i} left={s.label} mid={s.dist} right={s.pace} />
        ))}
        <Note>{det.note}</Note>
      </div>
    );
  }

  if (d.type === "strength") {
    return (
      <div>
        {det.exercises.map((e, i) => (
          <Row key={i} left={e.name} mid={e.load} right={e.reps} />
        ))}
        <Note>{det.note}</Note>
      </div>
    );
  }

  if (d.type === "long" || d.type === "tempo") {
    return (
      <div>
        <Row left="Jarak" right={det.dist} />
        <Row left="Target pace" right={det.pace} />
        <Note>{det.note}</Note>
      </div>
    );
  }

  if (d.type === "easy") {
    return (
      <div>
        <Row left="Durasi" right={det.duration} />
        <Row left="Effort" right={det.effort} />
        <Note>{det.note}</Note>
      </div>
    );
  }

  // rest day
  return (
    <div>
      <Row left="Aktivitas" mid={det.activity} right="" />
      <Note>{det.note}</Note>
    </div>
  );
}
