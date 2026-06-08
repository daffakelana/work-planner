import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Plus, Pencil, Trash2, X, Check, Upload } from "lucide-react";
import TypeIcon from "../components/TypeIcon";
import { TYPES } from "../data/types";
import { WEEKS } from "../data/weeks";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";

const STORAGE_KEY = "runplanner_items";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---- import helpers (tolerant to ID/EN spelling) ---- */
const DAY_MAP = {
  mon: "Mon", senin: "Mon", monday: "Mon",
  tue: "Tue", selasa: "Tue", tuesday: "Tue",
  wed: "Wed", rabu: "Wed", wednesday: "Wed",
  thu: "Thu", kamis: "Thu", thursday: "Thu",
  fri: "Fri", jumat: "Fri", "jum'at": "Fri", friday: "Fri",
  sat: "Sat", sabtu: "Sat", saturday: "Sat",
  sun: "Sun", minggu: "Sun", ahad: "Sun", sunday: "Sun",
};
const TYPE_ALIASES = {
  easy: "easy", "easy run": "easy", "lari ringan": "easy", santai: "easy",
  interval: "interval", "interval run": "interval",
  strength: "strength", "strength training": "strength", kekuatan: "strength", gym: "strength",
  rest: "rest", "rest day": "rest", istirahat: "rest", libur: "rest",
  long: "long", "long run": "long", "lari jauh": "long",
  tempo: "tempo", "tempo run": "tempo",
};
const normDay = (v) => {
  const k = String(v || "").trim().toLowerCase();
  return DAY_MAP[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1, 3) : "Mon");
};
const normType = (v) => {
  const k = String(v || "").trim().toLowerCase();
  const t = TYPE_ALIASES[k];
  if (t) return t;
  return TYPES[k] ? k : "easy";
};

function rowsToItems(rows) {
  return rows
    .map((raw, i) => {
      const r = {};
      Object.keys(raw).forEach((k) => { r[String(k).trim().toLowerCase()] = raw[k]; });
      const get = (...names) => {
        for (const n of names) if (r[n] !== undefined && r[n] !== "") return r[n];
        return "";
      };
      return {
        id: (crypto.randomUUID && crypto.randomUUID()) || `imp-${Date.now()}-${i}`,
        week: get("minggu", "week"),
        day: normDay(get("hari", "day")),
        date: String(get("tanggal", "date")).trim(),
        type: normType(get("jenis", "type")),
        km: Number(get("km", "jarak")) || 0,
        summary: String(get("ringkasan", "summary")).trim(),
        note: String(get("catatan", "note", "notes")).trim(),
      };
    })
    .filter((it) => it.date || it.summary); // skip empty rows
}

/* ---- persistence ---- */
function seed() {
  return WEEKS[0].days.map((d, i) => ({
    id: `seed-${i}`, day: d.day, date: d.date, type: d.type,
    summary: d.summary, km: d.km, note: d.detail.note || "",
  }));
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return seed();
}

const emptyForm = { day: "Mon", date: "", type: "easy", summary: "", km: 0, note: "" };
const field = {
  width: "100%", height: 42, borderRadius: 12, border: `1px solid ${C.hair}`,
  background: C.bg, padding: "0 12px", fontSize: 14, color: C.ink, fontFamily: FONT_BODY, outline: "none",
};
function Label({ children }) {
  return <span style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>{children}</span>;
}

export default function ManageView() {
  const [items, setItems] = useState(load);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const set = (k) => (e) => {
    const v = k === "km" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (item) => {
    setForm({ day: item.day, date: item.date, type: item.type, summary: item.summary, km: item.km, note: item.note });
    setEditingId(item.id); setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };
  const save = () => {
    if (!form.date.trim() || !form.summary.trim()) return;
    if (editingId) setItems((l) => l.map((it) => (it.id === editingId ? { ...it, ...form } : it)));
    else {
      const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
      setItems((l) => [...l, { id, ...form }]);
    }
    cancel();
  };
  const remove = (id) => { if (window.confirm("Hapus latihan ini?")) setItems((l) => l.filter((it) => it.id !== id)); };
  const clearAll = () => { if (window.confirm("Kosongkan seluruh daftar?")) setItems([]); };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const name = wb.SheetNames.includes("Latihan") ? "Latihan" : wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
        const imported = rowsToItems(rows);
        if (imported.length === 0) { window.alert("Tidak ada data yang terbaca dari file."); return; }
        setItems((prev) => [...prev, ...imported]);
        window.alert(`${imported.length} latihan berhasil diimport.`);
      } catch (_) {
        window.alert("Gagal membaca file. Pastikan formatnya .xlsx sesuai template.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink }}>Kelola Latihan</h2>
          <div className="flex items-center" style={{ gap: 10, marginTop: 2 }}>
            <span style={{ color: C.sub, fontSize: 13.5 }}>{items.length} latihan tersimpan</span>
            {items.length > 0 && (
              <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: TYPES.interval.fg, fontSize: 12.5, fontWeight: 600 }}>
                Kosongkan
              </button>
            )}
          </div>
        </div>
        {!showForm && (
          <div className="flex items-center" style={{ gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} title="Import Excel"
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: 14, background: C.card, border: `1px solid ${C.hair}`, cursor: "pointer" }}>
              <Upload size={20} color={C.ink} />
            </button>
            <button onClick={openCreate}
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: 14, background: C.ink, border: "none", cursor: "pointer" }}>
              <Plus size={22} color="#fff" strokeWidth={2.4} />
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onFile} style={{ display: "none" }} />
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: 18, marginBottom: 18, animation: "rp-rise .3s ease both" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>
              {editingId ? "Edit Latihan" : "Latihan Baru"}
            </span>
            <button onClick={cancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <X size={20} color={C.faint} />
            </button>
          </div>

          <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Label>Hari</Label>
              <select value={form.day} onChange={set("day")} style={field}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ width: 88 }}>
              <Label>Tanggal</Label>
              <input value={form.date} onChange={set("date")} placeholder="02" style={field} />
            </div>
          </div>

          <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <Label>Jenis</Label>
              <select value={form.type} onChange={set("type")} style={field}>
                {Object.entries(TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ width: 88 }}>
              <Label>Jarak (km)</Label>
              <input type="number" min="0" value={form.km} onChange={set("km")} style={field} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Label>Ringkasan</Label>
            <input value={form.summary} onChange={set("summary")} placeholder="45 menit • Effort ringan" style={field} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>Catatan</Label>
            <textarea value={form.note} onChange={set("note")} rows={3} placeholder="Tips latihan…"
              style={{ ...field, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }} />
          </div>

          <div className="flex" style={{ gap: 10 }}>
            <button onClick={cancel} style={{ flex: 1, height: 44, borderRadius: 13, border: `1px solid ${C.hair}`, background: C.bg, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Batal
            </button>
            <button onClick={save} className="flex items-center justify-center"
              style={{ flex: 1, gap: 7, height: 44, borderRadius: 13, border: "none", background: C.ink, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              <Check size={16} strokeWidth={3} /> Simpan
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 12 }}>
        {items.length === 0 && (
          <p style={{ color: C.sub, fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>
            Belum ada latihan. Tap + untuk menambah, atau import dari Excel.
          </p>
        )}
        {items.map((item, i) => {
          const t = TYPES[item.type];
          return (
            <div key={item.id} className="flex items-center"
              style={{ gap: 13, background: C.card, border: `1px solid ${C.hair}`, borderRadius: 20, padding: "12px 14px", animation: "rp-rise .4s ease both", animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <TypeIcon type={item.type} size={42} />
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{t.label}</span>
                  <span style={{ fontSize: 11, color: C.faint }}>{item.day} {item.date}</span>
                  {item.km > 0 && <span style={{ fontSize: 11, color: t.fg, fontWeight: 700 }}>{item.km} km</span>}
                </div>
                <div style={{ color: C.sub, fontSize: 12.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.summary}
                </div>
              </div>
              <button onClick={() => openEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", padding: 7 }}>
                <Pencil size={17} color={C.sub} />
              </button>
              <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 7 }}>
                <Trash2 size={17} color={TYPES.interval.fg} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}