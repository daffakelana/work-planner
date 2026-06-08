import { TYPES } from "../data/types";

// Colored round icon for a workout type.
export default function TypeIcon({ type, size = 44 }) {
  const t = TYPES[type];
  const Icon = t.icon;
  return (
    <div
      className="flex items-center justify-center rounded-full flex-none"
      style={{ width: size, height: size, background: t.tint }}
    >
      <Icon size={size * 0.45} color={t.fg} strokeWidth={2.2} />
    </div>
  );
}
