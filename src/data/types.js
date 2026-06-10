import { Timer, Droplets, Zap, Wind, Footprints, Shuffle, Dumbbell, Coffee } from "lucide-react";

// Display "kind" → icon, colors, label. kind = subtype for running,
// or the category itself for strength/rest.
export const TYPES = {
  easy:     { label: "Easy Run",     icon: Timer,      fg: "#6E5CF0", tint: "#EEEBFE" },
  long:     { label: "Long Run",     icon: Droplets,   fg: "#17B26A", tint: "#DCF4E7" },
  interval: { label: "Interval Run", icon: Zap,        fg: "#FF5A3C", tint: "#FFE7E0" },
  tempo:    { label: "Tempo Run",    icon: Wind,       fg: "#0EA5C4", tint: "#DAF1F8" },
  recovery: { label: "Recovery Run", icon: Footprints, fg: "#3BA7DB", tint: "#DEF1FA" },
  fartlek:  { label: "Fartlek",      icon: Shuffle,    fg: "#E8893B", tint: "#FCEBDC" },
  strength: { label: "Strength",     icon: Dumbbell,   fg: "#F39A1B", tint: "#FFF1D9" },
  rest:     { label: "Rest Day",     icon: Coffee,     fg: "#9AA0A8", tint: "#ECEEF1" },
};

export const CATEGORIES = { running: "Running", strength: "Strength", rest: "Rest" };

export const RUN_SUBTYPES = ["easy", "long", "interval", "tempo", "recovery", "fartlek"];

export const FOCUS = { full: "Full Body", lower: "Lower Body", upper: "Upper Body", core: "Core" };

export const ZONES = {
  Z1: "Z1 · Recovery",
  Z2: "Z2 · Easy",
  Z3: "Z3 · Tempo",
  Z4: "Z4 · Threshold",
  Z5: "Z5 · VO2max",
};

export const RECOVERY_TYPES = { jog: "Jog", walk: "Jalan", rest: "Diam" };

// the display kind for icon/label
export function kindOf(it) {
  if (it.category === "strength") return "strength";
  if (it.category === "rest") return "rest";
  return it.subtype || "easy";
}

const truncate = (s, n = 44) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

// auto-generated collapsed summary, derived from the fields
export function summaryOf(it) {
  if (it.category === "rest") return it.note ? truncate(it.note) : "Istirahat / pemulihan";
  if (it.category === "strength") {
    const n = (it.exercises || []).length;
    return `${FOCUS[it.focus] || "Full Body"} • ${n} gerakan`;
  }
  // running
  const mainSet = (it.structure || []).find((s) => Number(s.sets) > 1);
  if (mainSet && (it.subtype === "interval" || it.subtype === "fartlek")) {
    return `${mainSet.sets} × ${mainSet.work?.value || ""}`.trim();
  }
  const pace = it.paceMin && it.paceMax ? `${it.paceMin}–${it.paceMax}` : it.paceMin || it.paceMax;
  if (it.distanceKm && pace) return `${it.distanceKm} km • ${pace}`;
  if (it.distanceKm) return `${it.distanceKm} km`;
  if (it.durationMin) return `${it.durationMin} menit`;
  return TYPES[kindOf(it)].label;
}

export const kmOf = (it) => Number(it.distanceKm) || 0;
