import { Home, BarChart3, Compass, User } from "lucide-react";
import { C } from "../theme";

const TABS = [
  { id: "home",     icon: Home },
  { id: "progress", icon: BarChart3 },
  { id: "plans",    icon: Compass },
  { id: "profile",  icon: User },
];

// Fixed bottom tab bar.
export default function BottomNav({ tab, setTab }) {
  return (
    <div
      className="flex-none flex items-center justify-around"
      style={{
        height: 68,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: `1px solid ${C.hair}`,
      }}
    >
      {TABS.map(({ id, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center justify-center"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 12 }}
          >
            <Icon size={23} strokeWidth={active ? 2.6 : 2} color={active ? C.ink : C.faint} />
          </button>
        );
      })}
    </div>
  );
}
