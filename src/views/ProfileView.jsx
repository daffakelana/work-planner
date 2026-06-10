import { MapPin, Award, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import StatChip from "../components/StatChip";
import { TYPES } from "../data/types";
import { C, FONT_DISPLAY } from "../theme";

const AVATAR = "https://i.pravatar.cc/120?img=12";

// Profile tab: runner identity, stats and monthly goal.
export default function ProfileView({ totalKm }) {
  const { user, signOut } = useAuth();
  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <div className="flex flex-col items-center" style={{ paddingTop: 8, marginBottom: 22 }}>
        <img
          src={AVATAR}
          alt=""
          style={{ width: 84, height: 84, borderRadius: 999, objectFit: "cover" }}
        />
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, color: C.ink, marginTop: 12 }}>
          Jonathan
        </div>
        <div className="flex items-center" style={{ gap: 5, color: C.sub, fontSize: 13, marginTop: 3 }}>
          <MapPin size={13} /> Jakarta, Indonesia
        </div>
      </div>

      <div className="flex" style={{ gap: 11, marginBottom: 18 }}>
        <StatChip value={`${totalKm}`} label="km minggu ini" accent={C.accent} />
        <StatChip value="12" label="hari beruntun" accent={TYPES.strength.fg} />
        <StatChip value="148" label="total lari" accent={TYPES.easy.fg} />
      </div>

      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: 18 }}>
        <div className="flex items-center" style={{ gap: 9, marginBottom: 12 }}>
          <Award size={18} color={C.accent} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>
            Target bulanan
          </span>
        </div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: C.sub }}>120 / 160 km</span>
          <span style={{ color: C.ink, fontWeight: 700 }}>75%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: C.hair, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "75%", background: C.accent, borderRadius: 999 }} />
        </div>
      </div>

      <button onClick={signOut} className="flex items-center justify-center"
        style={{ gap: 8, width: "100%", height: 46, borderRadius: 14, marginTop: 16,
          background: C.card, border: `1px solid ${C.hair}`, color: C.ink,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        <LogOut size={17} /> Keluar{user?.email ? ` (${user.email})` : ""}
      </button>
    </div>
  );
}
