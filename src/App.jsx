import { useState, useEffect, useMemo } from "react";
import { Plus, Wifi, BatteryFull, SignalHigh } from "lucide-react";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeView from "./views/HomeView";
import ProgressView from "./views/ProgressView";
import PlansView from "./views/PlansView";
import ProfileView from "./views/ProfileView";

import { WEEKS } from "./data/weeks";
import { C, FONT_BODY } from "./theme";

const TITLES = {
  home: "Menu Mingguan",
  progress: "Statistik Lari",
  plans: "Program",
  profile: "Profil",
};

export default function App() {
  const [wide, setWide] = useState(false);
  const [tab, setTab] = useState("home");
  const [weekIndex, setWeekIndex] = useState(0);
  const [open, setOpen] = useState(() => new Set(["0-2"])); // today's strength open
  const [done, setDone] = useState(() => new Set(["0-0", "0-1"]));

  // Switch to a device-frame layout on wide screens.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const week = WEEKS[weekIndex];

  const summary = useMemo(() => {
    const totalKm = week.days.reduce((s, d) => s + d.km, 0);
    const sessions = week.days.filter((d) => d.type !== "rest").length;
    const doneCount = week.days.filter((_, i) => done.has(`${weekIndex}-${i}`)).length;
    return { totalKm, sessions, doneCount };
  }, [week, done, weekIndex]);

  const isOpen = (i) => open.has(`${weekIndex}-${i}`);
  const isDone = (i) => done.has(`${weekIndex}-${i}`);

  const toggle = (setter) => (i) => {
    const k = `${weekIndex}-${i}`;
    setter((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };
  const toggleOpen = toggle(setOpen);
  const toggleDone = toggle(setDone);

  const appStyle = wide
    ? {
        width: 442,
        height: "min(880px, 94vh)",
        borderRadius: 38,
        boxShadow:
          "0 50px 90px -40px rgba(20,20,40,0.45), 0 0 0 1px rgba(20,20,40,0.05)",
      }
    : { width: "100%", minHeight: "100vh", borderRadius: 0 };

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
        {/* status bar (device frame only) */}
        {wide && (
          <div
            className="flex-none flex items-center justify-between"
            style={{
              padding: "14px 26px 2px",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <span>9:41</span>
            <div className="flex items-center" style={{ gap: 6 }}>
              <SignalHigh size={16} />
              <Wifi size={16} />
              <BatteryFull size={18} />
            </div>
          </div>
        )}

        {/* scroll area */}
        <div className="flex-1" style={{ overflowY: "auto" }}>
          <Header title={TITLES[tab]} />

          {tab === "home" && (
            <HomeView
              week={week}
              weekIndex={weekIndex}
              weeksCount={WEEKS.length}
              setWeekIndex={setWeekIndex}
              summary={summary}
              isOpen={isOpen}
              isDone={isDone}
              onToggleOpen={toggleOpen}
              onToggleDone={toggleDone}
            />
          )}
          {tab === "progress" && <ProgressView week={week} isDone={isDone} />}
          {tab === "plans" && <PlansView />}
          {tab === "profile" && <ProfileView totalKm={summary.totalKm} />}
        </div>

        {/* floating add button on home */}
        {tab === "home" && (
          <button
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

        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
