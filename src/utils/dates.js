// Computes real calendar dates for a Monday-based week, `offset` weeks from now.
// offset 0 = minggu ini, 1 = minggu depan, dst.

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

export function weekMeta(offset = 0) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mondayIndex = (today.getDay() + 6) % 7; // Senin = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayIndex + offset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: String(d.getDate()).padStart(2, "0"),
      month: MONTHS[d.getMonth()],
      isToday: d.getTime() === today.getTime(),
    });
  }

  const range = `${days[0].date} ${days[0].month} — ${days[6].date} ${days[6].month}`;
  return { days, range };
}
