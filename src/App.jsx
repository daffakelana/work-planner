import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Plus, Wifi, BatteryFull, SignalHigh } from "lucide-react";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeView from "./views/HomeView";

import { useWorkouts, groupByWeek, weekLabel, DAY_ORDER } from "./store/workouts";
import { kindOf, summaryOf, kmOf } from "./data/types";
import { useAuth } from "./auth/AuthProvider";
import AuthView from "./views/AuthView";
import { weekMeta } from "./utils/dates";
import { C, FONT_BODY } from "./theme";

// Lazy-loaded routes — each chunk loads only when its page is opened,
// keeping the initial bundle small (ManageView pulls in the heavy xlsx lib).
const ProgressView = lazy(() => import("./views/ProgressView"));
const PlansView = lazy(() => import("./views/PlansView"));
const ProfileView = lazy(() => import("./views/ProfileView"));
const ManageView = lazy(() => import("./views/ManageView"));
const TemplatesView = lazy(() => import("./views/TemplatesView"));

const TITLE_BY_PATH = {
  "/": "Menu Mingguan",
  "/progress": "Statistik Lari",
  "/plans": "Program",
  "/profile": "Profil",
  "/manage": "Kelola Latihan",
  "/templates": "Blok Latihan",
};

export default function App() {
  const { session, loading: authLoading } = useAuth();
  const { items } = useWorkouts();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [wide, setWide] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);
  const [open, setOpen] = useState(() => new Set());
  const [done, setDone] = useState(() => new Set());

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const weeks = useMemo(() => groupByWeek(items), [items]);
  const weeksCount = Math.max(1, weeks.length);
  const safeIndex = Math.min(weekIndex, weeksCount - 1);
  const meta = useMemo(() => weekMeta(safeIndex), [safeIndex]);

  const days = useMemo(() => {
    const list = weeks[safeIndex] || [];
    return list.map((it) => {
      const wd = DAY_ORDER[it.day] ?? 0;
      const md = meta.days[wd];
      return { ...it, kind: kindOf(it), summary: summaryOf(it), date: md.date, month: md.month, today: md.isToday };
    });
  }, [weeks, safeIndex, meta]);

  const weekInfo = { label: weekLabel(safeIndex), range: meta.range };

  const summary = useMemo(() => {
    const totalKm = days.reduce((s, d) => s + kmOf(d), 0);
    const sessions = days.filter((d) => d.category !== "rest").length;
    const doneCount = days.filter((d) => done.has(d.id)).length;
    return { totalKm, sessions, doneCount };
  }, [days, done]);

  const isOpen = (id) => open.has(id);
  const isDone = (id) => done.has(id);
  const toggle = (setter) => (id) =>
    setter((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleOpen = toggle(setOpen);
  const toggleDone = toggle(setDone);

  const title = TITLE_BY_PATH[pathname] || "Menu Mingguan";
  const isHome = pathname === "/";

  if (authLoading)
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100dvh", background: C.bg, color: C.sub, fontFamily: FONT_BODY }}>
        Memuat…
      </div>
    );
  if (!session) return <AuthView />;

  const appStyle = wide
    ? {
        width: 442,
        height: "min(880px, 94vh)",
        borderRadius: 38,
        boxShadow: "0 50px 90px -40px rgba(20,20,40,0.45), 0 0 0 1px rgba(20,20,40,0.05)",
      }
    : { width: "100%", height: "100dvh", borderRadius: 0 };

  const home = (
    <HomeView
      days={days}
      weekInfo={weekInfo}
      weekIndex={safeIndex}
      weeksCount={weeksCount}
      setWeekIndex={setWeekIndex}
      summary={summary}
      isOpen={isOpen}
      isDone={isDone}
      onToggleOpen={toggleOpen}
      onToggleDone={toggleDone}
    />
  );

  return (
    <div
      className="flex items-center justify-center"
      style={{
        fontFamily: FONT_BODY,
        minHeight: "100vh",
        background:
          "radial-gradient(900px 600px at 15% -10%, #FFE7E0 0%, transparent 55%)," +
          "radial-gradient(800px 600px at 110% 10%, #E6F0FF 0%, transparent 55%)," +
          C.bg,
        padding: wide ? 24 : 0,
        color: C.ink,
      }}
    >
      <div
        className="flex flex-col"
        style={{ ...appStyle, background: C.bg, overflow: "hidden", position: "relative" }}
      >
        {wide && (
          <div
            className="flex-none flex items-center justify-between"
            style={{ padding: "14px 26px 2px", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 14 }}
          >
            <span>9:41</span>
            <div className="flex items-center" style={{ gap: 6 }}>
              <SignalHigh size={16} />
              <Wifi size={16} />
              <BatteryFull size={18} />
            </div>
          </div>
        )}

        <div className="flex-1" style={{ overflowY: "auto" }}>
          <Header title={title} />
          <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: C.sub, fontSize: 13 }}>Memuat…</div>}>
            <Routes>
              <Route path="/" element={home} />
              <Route path="/progress" element={<ProgressView week={{ ...weekInfo, days }} isDone={isDone} />} />
              <Route path="/plans" element={<PlansView />} />
              <Route path="/profile" element={<ProfileView totalKm={summary.totalKm} />} />
              <Route path="/manage" element={<ManageView />} />
              <Route path="/templates" element={<TemplatesView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>

        {isHome && (
          <button
            onClick={() => navigate("/manage")}
            className="flex items-center justify-center"
            style={{
              position: "absolute",
              right: 18,
              bottom: 84,
              width: 52,
              height: 52,
              borderRadius: 999,
              background: C.ink,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 14px 30px -10px rgba(20,20,40,0.5)",
            }}
          >
            <Plus size={24} color="#fff" strokeWidth={2.4} />
          </button>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
