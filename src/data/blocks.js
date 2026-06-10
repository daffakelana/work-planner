// Reusable Warm Up / Cool Down blocks. Sessions reference these by id.
export const DEFAULT_BLOCKS = [
  {
    id: "wu-1",
    kind: "warmup",
    name: "Easy jog + drills",
    value: "10 menit",
    steps: ["Jog ringan 5 menit", "Dynamic stretch (leg swing, lunge)", "Strides 4 × 100 m"],
  },
  {
    id: "wu-2",
    kind: "warmup",
    name: "Mobility ringan",
    value: "8 menit",
    steps: ["Hip & ankle mobility", "Aktivasi glute", "Jog ringan 3 menit"],
  },
  {
    id: "cd-1",
    kind: "cooldown",
    name: "Jog ringan + stretch",
    value: "10 menit",
    steps: ["Jog sangat ringan 5 menit", "Static stretch betis & hamstring", "Napas dalam"],
  },
  {
    id: "cd-2",
    kind: "cooldown",
    name: "Walk + foam roll",
    value: "8 menit",
    steps: ["Jalan kaki 4 menit", "Foam roll quads & calves"],
  },
];
