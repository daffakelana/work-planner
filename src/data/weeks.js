// The weekly running plan. Edit this to use your own schedule.
export const WEEKS = [
  {
    label: "Minggu Ini",
    range: "02 — 08 Mar",
    days: [
      {
        day: "Mon", date: "02", type: "easy", km: 8,
        summary: "45 menit • Effort ringan",
        detail: {
          duration: "45 menit",
          effort: "Effort ringan",
          note: "Jaga ritme santai — harusnya masih bisa ngobrol sambil lari.",
        },
      },
      {
        day: "Tue", date: "03", type: "interval", km: 8,
        summary: "Warm up • Interval • Cool Down",
        detail: {
          segments: [
            { label: "Warm up",   dist: "2 km",       pace: "6:30 – 6:41" },
            { label: "Interval",  dist: "10 × 400 m", pace: "4:45 – 4:50" },
            { label: "Cool Down", dist: "2 km",       pace: "6:30 – 6:41" },
          ],
          note: "Jaga pace, jangan kebablasan. Warm up juga jangan terlalu cepat biar hasil intervalnya optimal.",
        },
      },
      {
        day: "Wed", date: "04", type: "strength", km: 0, today: true,
        summary: "Deadlift, Squat, Bench Press…",
        detail: {
          exercises: [
            { name: "Deadlift",          load: "50 kg", reps: "6 reps × 3"  },
            { name: "Dumbbell Squat",    load: "10 kg", reps: "20 reps × 3" },
            { name: "Barbell Leg Raise", load: "30 kg", reps: "12 reps × 3" },
            { name: "Barbell Row",       load: "20 kg", reps: "12 reps × 3" },
            { name: "Bench Press",       load: "30 kg", reps: "8 reps × 3"  },
            { name: "Dumbbell Squat",    load: "20 kg", reps: "12 reps × 3" },
          ],
          note: "Santai aja, fokus ke form biar nggak cedera. Istirahat maksimal 30 detik tiap set.",
        },
      },
      {
        day: "Thu", date: "05", type: "rest", km: 0,
        summary: "Cross Training atau jalan kaki",
        detail: {
          activity: "Cross Training atau jalan kaki",
          note: "Hari pemulihan. Gerak ringan boleh, tapi jangan dipaksa.",
        },
      },
      {
        day: "Fri", date: "06", type: "easy", km: 8,
        summary: "45 menit • Effort ringan",
        detail: {
          duration: "45 menit",
          effort: "Effort ringan",
          note: "Pertahankan napas yang nyaman. Ini cuma buat jaga volume mingguan.",
        },
      },
      {
        day: "Sat", date: "07", type: "long", km: 16,
        summary: "16 km • 6:10 – 6:41",
        detail: {
          dist: "16 km",
          pace: "6:10 – 6:41",
          note: "Pelan tapi konsisten. Bawa air dan jaga hidrasi di sepanjang rute.",
        },
      },
      {
        day: "Sun", date: "08", type: "rest", km: 0,
        summary: "Active recovery • Yoga",
        detail: {
          activity: "Active recovery atau Yoga",
          note: "Stretching dan mobility ringan. Siapkan badan buat minggu depan.",
        },
      },
    ],
  },
  {
    label: "Minggu Depan",
    range: "09 — 15 Mar",
    days: [
      {
        day: "Mon", date: "09", type: "easy", km: 6,
        summary: "40 menit • Effort ringan",
        detail: { duration: "40 menit", effort: "Effort ringan", note: "Mulai minggu dengan santai." },
      },
      {
        day: "Tue", date: "10", type: "tempo", km: 9,
        summary: "9 km • 5:20 – 5:35",
        detail: { dist: "9 km", pace: "5:20 – 5:35", note: "Tahan di zona nyaman-keras. Jangan all-out." },
      },
      {
        day: "Wed", date: "11", type: "rest", km: 0,
        summary: "Cross Training atau jalan kaki",
        detail: { activity: "Cross Training atau jalan kaki", note: "Recovery aktif." },
      },
      {
        day: "Thu", date: "12", type: "interval", km: 8,
        summary: "Warm up • Interval • Cool Down",
        detail: {
          segments: [
            { label: "Warm up",   dist: "2 km",      pace: "6:30 – 6:41" },
            { label: "Interval",  dist: "6 × 800 m", pace: "4:40 – 4:50" },
            { label: "Cool Down", dist: "2 km",      pace: "6:30 – 6:41" },
          ],
          note: "Interval lebih panjang minggu ini, jaga konsistensi pace.",
        },
      },
      {
        day: "Fri", date: "13", type: "easy", km: 7,
        summary: "45 menit • Effort ringan",
        detail: { duration: "45 menit", effort: "Effort ringan", note: "Recovery run sebelum long run." },
      },
      {
        day: "Sat", date: "14", type: "long", km: 18,
        summary: "18 km • 6:05 – 6:35",
        detail: { dist: "18 km", pace: "6:05 – 6:35", note: "Naikkan jarak bertahap. Fueling tiap 45 menit." },
      },
      {
        day: "Sun", date: "15", type: "rest", km: 0,
        summary: "Active recovery • Yoga",
        detail: { activity: "Active recovery atau Yoga", note: "Pemulihan total." },
      },
    ],
  },
];
