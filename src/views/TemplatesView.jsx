import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, X, Check, ArrowLeft } from "lucide-react";
import { useWorkouts } from "../store/workouts";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";

const field = {
  width: "100%", height: 40, borderRadius: 11, border: `1px solid ${C.hair}`,
  background: C.bg, padding: "0 11px", fontSize: 13.5, color: C.ink, fontFamily: FONT_BODY, outline: "none",
};
const Label = ({ children }) => (
  <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, marginBottom: 5, display: "block" }}>{children}</span>
);
const emptyForm = { kind: "warmup", name: "", value: "", steps: "" };

export default function TemplatesView() {
  const { blocks, addBlock, updateBlock, removeBlock } = useWorkouts();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (b) => {
    setForm({ kind: b.kind, name: b.name, value: b.value || "", steps: (b.steps || []).join("\n") });
    setEditingId(b.id); setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };
  const save = () => {
    if (!form.name.trim()) return;
    const payload = {
      kind: form.kind, name: form.name.trim(), value: form.value.trim(),
      steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) updateBlock(editingId, payload); else addBlock(payload);
    cancel();
  };

  const group = (kind, title) => {
    const list = blocks.filter((b) => b.kind === kind);
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: C.sub, marginBottom: 8 }}>{title}</div>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {list.length === 0 && <p style={{ color: C.faint, fontSize: 12.5 }}>Belum ada blok.</p>}
          {list.map((b) => (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.hair}`, borderRadius: 18, padding: "12px 14px" }}>
              <div className="flex items-center justify-between">
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14.5, color: C.ink }}>{b.name}</span>
                  {b.value && <span style={{ color: C.faint, fontSize: 12, marginLeft: 8 }}>{b.value}</span>}
                </div>
                <div className="flex items-center" style={{ gap: 4 }}>
                  <button onClick={() => openEdit(b)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Pencil size={16} color={C.sub} /></button>
                  <button onClick={() => window.confirm("Hapus blok ini?") && removeBlock(b.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><Trash2 size={16} color="#FF5A3C" /></button>
                </div>
              </div>
              {b.steps?.length > 0 && (
                <ul style={{ margin: "6px 0 0", paddingLeft: 16, color: C.sub, fontSize: 12.5, lineHeight: 1.5 }}>
                  {b.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <button onClick={() => navigate("/manage")} className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 12, background: C.card, border: `1px solid ${C.hair}`, cursor: "pointer" }}>
            <ArrowLeft size={18} color={C.ink} />
          </button>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>Blok Warm Up & Cool Down</h2>
            <span style={{ color: C.sub, fontSize: 12.5 }}>Dipakai ulang di sesi lari</span>
          </div>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 13, background: C.ink, border: "none", cursor: "pointer" }}>
            <Plus size={21} color="#fff" strokeWidth={2.4} />
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: 16, marginBottom: 18, animation: "rp-rise .3s ease both" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>{editingId ? "Edit Blok" : "Blok Baru"}</span>
            <button onClick={cancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={C.faint} /></button>
          </div>

          <div className="flex" style={{ gap: 6, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 14 }}>
            {[["warmup", "Warm Up"], ["cooldown", "Cool Down"]].map(([k, label]) => (
              <button key={k} onClick={() => setForm((f) => ({ ...f, kind: k }))} style={{
                flex: 1, height: 34, borderRadius: 9, border: "none", cursor: "pointer", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13,
                background: form.kind === k ? C.ink : "transparent", color: form.kind === k ? "#fff" : C.sub,
              }}>{label}</button>
            ))}
          </div>

          <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><Label>Nama</Label><input value={form.name} onChange={set("name")} placeholder="Easy jog + drills" style={field} /></div>
            <div style={{ width: 120 }}><Label>Durasi/jarak</Label><input value={form.value} onChange={set("value")} placeholder="10 menit" style={field} /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Label>Langkah (satu per baris)</Label>
            <textarea value={form.steps} onChange={set("steps")} rows={4} placeholder={"Jog ringan 5 menit\nDynamic stretch\nStrides 4 × 100 m"} style={{ ...field, height: "auto", padding: "9px 11px", resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div className="flex" style={{ gap: 10 }}>
            <button onClick={cancel} style={{ flex: 1, height: 44, borderRadius: 13, border: `1px solid ${C.hair}`, background: C.bg, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Batal</button>
            <button onClick={save} className="flex items-center justify-center" style={{ flex: 1, gap: 7, height: 44, borderRadius: 13, border: "none", background: C.ink, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              <Check size={16} strokeWidth={3} /> Simpan
            </button>
          </div>
        </div>
      )}

      {group("warmup", "WARM UP")}
      {group("cooldown", "COOL DOWN")}
    </div>
  );
}
