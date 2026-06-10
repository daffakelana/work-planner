// Static seed plan in the new session schema. Edit to use your own program.
export const WEEKS = [
  {
    days: [
      {
        day: "Mon", category: "running", subtype: "easy",
        distanceKm: 8, durationMin: 45, paceMin: "6:30", paceMax: "6:50", rpe: 3, zone: "Z2",
        goal: "Jaga base aerobik", note: "Santai, harusnya masih bisa ngobrol sambil lari.",
      },
      {
        day: "Tue", category: "running", subtype: "interval",
        distanceKm: 8, durationMin: 50, rpe: 8, zone: "Z5",
        warmUpId: "wu-1", coolDownId: "cd-1",
        goal: "Tingkatkan VO2max", note: "Jaga pace, jangan kebablasan di set awal.",
        structure: [
          {
            label: "Interval utama", sets: 10,
            work: { value: "400 m" }, targetPace: "4:45–4:50",
            recovery: { type: "jog", value: "200 m" },
          },
        ],
      },
      {
        day: "Wed", category: "strength", focus: "full", durationMin: 45,
        goal: "Kekuatan & cegah cedera", note: "Fokus form, istirahat maks 90 detik.",
        exercises: [
          { name: "Deadlift",       sets: 3, reps: 6,  loadKg: 50, restSec: 90 },
          { name: "Dumbbell Squat", sets: 3, reps: 20, loadKg: 10, restSec: 60 },
          { name: "Barbell Row",    sets: 3, reps: 12, loadKg: 20, restSec: 60 },
          { name: "Bench Press",    sets: 3, reps: 8,  loadKg: 30, restSec: 90 },
          { name: "Plank",          sets: 3, reps: 1,  loadKg: 0,  restSec: 45 },
        ],
      },
      { day: "Thu", category: "rest", note: "Cross training ringan atau jalan kaki." },
      {
        day: "Fri", category: "running", subtype: "easy",
        distanceKm: 8, durationMin: 45, paceMin: "6:30", paceMax: "6:50", rpe: 3, zone: "Z2",
        goal: "Jaga volume mingguan", note: "Napas nyaman sepanjang lari.",
      },
      {
        day: "Sat", category: "running", subtype: "long",
        distanceKm: 16, durationMin: 100, paceMin: "6:10", paceMax: "6:41", rpe: 4, zone: "Z2",
        warmUpId: "wu-2", coolDownId: "cd-1",
        goal: "Bangun endurance", note: "Pelan tapi konsisten, jaga hidrasi.",
      },
      { day: "Sun", category: "rest", note: "Active recovery atau yoga." },
    ],
  },
  {
    days: [
      {
        day: "Mon", category: "running", subtype: "easy",
        distanceKm: 6, durationMin: 40, paceMin: "6:30", paceMax: "6:50", rpe: 3, zone: "Z2",
        goal: "Mulai minggu santai", note: "Effort ringan.",
      },
      {
        day: "Tue", category: "running", subtype: "tempo",
        distanceKm: 9, durationMin: 55, paceMin: "5:20", paceMax: "5:35", rpe: 6, zone: "Z3",
        warmUpId: "wu-1", coolDownId: "cd-1",
        goal: "Latih ambang laktat", note: "Tahan di zona nyaman-keras, jangan all-out.",
        structure: [
          { label: "Tempo", sets: 1, work: { value: "6 km" }, targetPace: "5:20–5:35", recovery: { type: "rest", value: "-" } },
        ],
      },
      { day: "Wed", category: "rest", note: "Cross training atau jalan kaki." },
      {
        day: "Thu", category: "running", subtype: "interval",
        distanceKm: 8, durationMin: 52, rpe: 8, zone: "Z5",
        warmUpId: "wu-1", coolDownId: "cd-1",
        goal: "VO2max", note: "Interval lebih panjang minggu ini.",
        structure: [
          { label: "Interval utama", sets: 6, work: { value: "800 m" }, targetPace: "4:40–4:50", recovery: { type: "jog", value: "400 m" } },
        ],
      },
      {
        day: "Fri", category: "running", subtype: "easy",
        distanceKm: 7, durationMin: 45, paceMin: "6:30", paceMax: "6:50", rpe: 3, zone: "Z2",
        goal: "Recovery run", note: "Sebelum long run besok.",
      },
      {
        day: "Sat", category: "running", subtype: "long",
        distanceKm: 18, durationMin: 115, paceMin: "6:05", paceMax: "6:35", rpe: 4, zone: "Z2",
        warmUpId: "wu-2", coolDownId: "cd-1",
        goal: "Naikkan jarak bertahap", note: "Fueling tiap 45 menit.",
      },
      { day: "Sun", category: "rest", note: "Active recovery atau yoga." },
    ],
  },
];
