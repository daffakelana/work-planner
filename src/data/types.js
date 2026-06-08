import { Timer, Zap, Dumbbell, Coffee, Droplets, Wind } from "lucide-react";

// Metadata for every workout type: label, icon component, and colors.
export const TYPES = {
  easy:     { label: "Easy Run",          icon: Timer,    fg: "#6E5CF0", tint: "#EEEBFE" },
  interval: { label: "Interval Run",      icon: Zap,      fg: "#FF5A3C", tint: "#FFE7E0" },
  strength: { label: "Strength Training", icon: Dumbbell, fg: "#F39A1B", tint: "#FFF1D9" },
  rest:     { label: "Rest Day",          icon: Coffee,   fg: "#9AA0A8", tint: "#ECEEF1" },
  long:     { label: "Long Run",          icon: Droplets, fg: "#17B26A", tint: "#DCF4E7" },
  tempo:    { label: "Tempo Run",         icon: Wind,     fg: "#0EA5C4", tint: "#DAF1F8" },
};
