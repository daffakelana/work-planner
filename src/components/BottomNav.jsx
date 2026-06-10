import { NavLink } from "react-router-dom";
import { Home, BarChart3, Compass, User } from "lucide-react";
import { C } from "../theme";

const TABS = [
  { to: "/",         icon: Home },
  { to: "/progress", icon: BarChart3 },
  { to: "/plans",    icon: Compass },
  { to: "/profile",  icon: User },
];

// Fixed bottom tab bar driven by the router.
export default function BottomNav() {
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
      {TABS.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className="flex items-center justify-center"
          style={{ textDecoration: "none", padding: 12 }}
        >
          {({ isActive }) => (
            <Icon size={23} strokeWidth={isActive ? 2.6 : 2} color={isActive ? C.ink : C.faint} />
          )}
        </NavLink>
      ))}
    </div>
  );
}
