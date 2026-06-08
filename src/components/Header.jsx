import { Bell } from "lucide-react";
import { C, FONT_DISPLAY } from "../theme";

const AVATAR = "https://i.pravatar.cc/100?img=12";

// Top header with avatar, greeting, dynamic title and notification bell.
export default function Header({ title }) {
  return (
    <div style={{ padding: "16px 18px 12px" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <img
            src={AVATAR}
            alt=""
            style={{ width: 44, height: 44, borderRadius: 999, objectFit: "cover" }}
          />
          <div>
            <div style={{ color: C.sub, fontSize: 13 }}>Hi, Jonathan 👋</div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 21,
                lineHeight: 1.1,
                color: C.ink,
              }}
            >
              {title}
            </div>
          </div>
        </div>
        <button
          className="relative flex items-center justify-center"
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            background: C.card,
            border: `1px solid ${C.hair}`,
            cursor: "pointer",
          }}
        >
          <Bell size={19} color={C.ink} />
          <span
            style={{
              position: "absolute",
              top: 11,
              right: 12,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: C.accent,
              border: "2px solid #fff",
            }}
          />
        </button>
      </div>
    </div>
  );
}
