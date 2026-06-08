# RunPlanner 🏃

Aplikasi web perencana lari mingguan. Dibangun dengan **React + Vite + Tailwind CSS**.

## Fitur
- Menu mingguan dengan kartu latihan yang bisa di-expand (Easy Run, Interval, Strength, Long Run, Rest, Tempo)
- Tandai latihan selesai ✓ dengan ringkasan otomatis
- Navigasi antar-minggu
- Tab **Progress** (grafik jarak harian + persentase penyelesaian)
- Tab **Program** dan **Profil**
- Responsif: tampil sebagai device frame di desktop, layar penuh di HP

## Cara menjalankan
```bash
npm install
npm run dev      # mode pengembangan
npm run build    # build untuk produksi
npm run preview  # pratinjau hasil build
```

## Struktur
```
src/
├── App.jsx              # root: state + layout
├── main.jsx            # entry point
├── index.css           # Tailwind + keyframes
├── theme.js            # token warna & font
├── data/
│   ├── types.js        # metadata jenis latihan
│   ├── weeks.js        # jadwal lari  ← ganti dengan jadwalmu
│   └── plans.js        # katalog program
├── components/
│   ├── Header.jsx
│   ├── BottomNav.jsx
│   ├── WeekSwitcher.jsx
│   ├── DayCard.jsx
│   ├── DayDetail.jsx
│   ├── TypeIcon.jsx
│   ├── Row.jsx
│   └── StatChip.jsx
└── views/
    ├── HomeView.jsx
    ├── ProgressView.jsx
    ├── PlansView.jsx
    └── ProfileView.jsx
```

Untuk memakai jadwalmu sendiri, cukup ubah `src/data/weeks.js`.
