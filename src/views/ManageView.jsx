import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Plus, Pencil, Trash2, X, Check, Upload, Layers } from "lucide-react";
import TypeIcon from "../components/TypeIcon";
import { TYPES, CATEGORIES, RUN_SUBTYPES, FOCUS, ZONES, RECOVERY_TYPES, kindOf, summaryOf, kmOf } from "../data/types";
import { useWorkouts, weekLabel } from "../store/workouts";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_OPTS = [0, 1, 2, 3, 4, 5];

const field = {
  width: "100%", height: 40, borderRadius: 11, border: `1px solid ${C.hair}`,
  background: C.bg, padding: "0 11px", fontSize: 13.5, color: C.ink, fontFamily: FONT_BODY, outline: "none",
};
const Label = ({ children }) => (
  <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, marginBottom: 5, display: "block" }}>{children}</span>
);
const num = (v) => (v === "" || v == null ? undefined : Number(v));

const emptyForm = {
  week: 0, day: "Mon", category: "running", subtype: "easy",
  distanceKm: "", durationMin: "", paceMin: "", paceMax: "", rpe: "", zone: "", hrMin: "", hrMax: "",
  warmUpId: "", coolDownId: "", focus: "full", goal: "", note: "",
  structure: [], exercises: [],
  logOpen: false,
  actualDistanceKm: "", actualDurationMin: "", actualPaceAvg: "", actualRpe: "", actualHrAvg: "", actualNote: "",
};

function loadForm(it) {
  return {
    ...emptyForm,
    week: it.week ?? 0, day: it.day || "Mon", category: it.category || "running",
    subtype: it.subtype || "easy",
    distanceKm: it.distanceKm ?? "", durationMin: it.durationMin ?? "",
    paceMin: it.paceMin || "", paceMax: it.paceMax || "", rpe: it.rpe ?? "", zone: it.zone || "",
    hrMin: it.hrMin ?? "", hrMax: it.hrMax ?? "", warmUpId: it.warmUpId || "", coolDownId: it.coolDownId || "",
    focus: it.focus || "full", goal: it.goal || "", note: it.note || "",
    structure: (it.structure || []).map((s) => ({
      label: s.label || "", sets: s.sets ?? 1, work: { value: s.work?.value || "" },
      targetPace: s.targetPace || "", recovery: { type: s.recovery?.type || "jog", value: s.recovery?.value || "" },
    })),
    exercises: (it.exercises || []).map((e) => ({ ...e })),
    logOpen: !!it.completedAt,
    actualDistanceKm: it.actualDistanceKm ?? "", actualDurationMin: it.actualDurationMin ?? "",
    actualPaceAvg: it.actualPaceAvg || "", actualRpe: it.actualRpe ?? "", actualHrAvg: it.actualHrAvg ?? "",
    actualNote: it.actualNote || "",
  };
}

function buildItem(f) {
  const base = { week: Number(f.week) || 0, day: f.day, category: f.category, goal: f.goal.trim(), note: f.note.trim() };
  const hasActual = f.actualDistanceKm || f.actualDurationMin || f.actualPaceAvg || f.actualRpe || f.actualHrAvg || f.actualNote;
  const actual = {};
  if (hasActual) {
    actual.actualDistanceKm = num(f.actualDistanceKm);
    actual.actualDurationMin = num(f.actualDurationMin);
    actual.actualPaceAvg = f.actualPaceAvg.trim() || undefined;
    actual.actualRpe = num(f.actualRpe);
    actual.actualHrAvg = num(f.actualHrAvg);
    actual.actualNote = f.actualNote.trim() || undefined;
    actual.completedAt = new Date().toISOString().slice(0, 10);
    base.status = "done";
  }
  if (f.category === "rest") return { ...base };
  if (f.category === "strength")
    return {
      ...base, focus: f.focus, durationMin: num(f.durationMin),
      exercises: f.exercises.filter((e) => (e.name || "").trim()).map((e) => ({
        name: e.name.trim(), sets: num(e.sets) || 0, reps: num(e.reps) || 0, loadKg: num(e.loadKg) || 0, restSec: num(e.restSec) || 0,
      })),
      ...actual,
    };
  return {
    ...base, subtype: f.subtype, distanceKm: num(f.distanceKm), durationMin: num(f.durationMin),
    paceMin: f.paceMin.trim() || undefined, paceMax: f.paceMax.trim() || undefined,
    rpe: num(f.rpe), zone: f.zone || undefined, hrMin: num(f.hrMin), hrMax: num(f.hrMax),
    warmUpId: f.warmUpId || undefined, coolDownId: f.coolDownId || undefined,
    structure: f.structure.filter((s) => s.label || s.work?.value).map((s) => ({
      label: s.label || "Set", sets: num(s.sets) || 1, work: { value: (s.work?.value || "").trim() },
      targetPace: (s.targetPace || "").trim(), recovery: { type: s.recovery?.type || "jog", value: (s.recovery?.value || "").trim() },
    })),
    ...actual,
  };
}

/* ---- import (tolerant) ---- */
const TYPE_TO_CAT = { strength: "strength", rest: "rest", easy: "running", long: "running", interval: "running", tempo: "running", recovery: "running", fartlek: "running" };
const DAY_MAP = { mon: "Mon", senin: "Mon", tue: "Tue", selasa: "Tue", wed: "Wed", rabu: "Wed", thu: "Thu", kamis: "Thu", fri: "Fri", jumat: "Fri", sat: "Sat", sabtu: "Sat", sun: "Sun", minggu: "Sun" };
const normDay = (v) => { const k = String(v || "").trim().toLowerCase(); return DAY_MAP[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1, 3) : "Mon"); };
function rowsToItems(rows) {
  return rows.map((raw) => {
    const r = {}; Object.keys(raw).forEach((k) => { r[String(k).trim().toLowerCase()] = raw[k]; });
    const get = (...ns) => { for (const n of ns) if (r[n] !== undefined && r[n] !== "") return r[n]; return ""; };
    const j = String(get("jenis", "type")).trim().toLowerCase();
    const cat = TYPE_TO_CAT[j] || "running";
    const minggu = Number(get("minggu", "week"));
    const item = {
      week: minggu > 0 ? minggu - 1 : 0, day: normDay(get("hari", "day")), category: cat, note: String(get("catatan", "note")).trim(),
    };
    if (cat === "running") { item.subtype = RUN_SUBTYPES.includes(j) ? j : "easy"; item.distanceKm = Number(get("km", "jarak")) || undefined; }
    if (cat === "strength") { item.focus = "full"; item.exercises = []; }
    return item;
  }).filter((it) => it.distanceKm || it.note || it.category === "strength");
}

export default function ManageView() {
  const { items, blocks, add, update, remove, clear, importItems } = useWorkouts();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef(null);

  const warmups = blocks.filter((b) => b.kind === "warmup");
  const cooldowns = blocks.filter((b) => b.kind === "cooldown");
  const sorted = [...items].sort((a, b) => a.week - b.week);
  const isRun = form.category === "running";
  const isStr = form.category === "strength";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (it) => { setForm(loadForm(it)); setEditingId(it.id); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };
  const save = () => {
    const item = buildItem(form);
    if (editingId) update(editingId, item); else add(item);
    cancel();
  };

  // structure helpers
  const addSeg = () => setForm((f) => ({ ...f, structure: [...f.structure, { label: "", sets: 1, work: { value: "" }, targetPace: "", recovery: { type: "jog", value: "" } }] }));
  const updSeg = (i, patch) => setForm((f) => ({ ...f, structure: f.structure.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const rmSeg = (i) => setForm((f) => ({ ...f, structure: f.structure.filter((_, j) => j !== i) }));
  // exercise helpers
  const addEx = () => setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: 10, loadKg: 0, restSec: 60 }] }));
  const updEx = (i, patch) => setForm((f) => ({ ...f, exercises: f.exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const rmEx = (i) => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, j) => j !== i) }));

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const name = wb.SheetNames.includes("Latihan") ? "Latihan" : wb.SheetNames[0];
        const imported = rowsToItems(XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" }));
        if (!imported.length) { window.alert("Tidak ada data terbaca."); return; }
        importItems(imported); window.alert(`${imported.length} latihan diimport.`);
      } catch (_) { window.alert("Gagal membaca file. Pastikan .xlsx sesuai template."); }
    };
    reader.readAsArrayBuffer(file); e.target.value = "";
  };

  return (
    <div style={{ padding: "4px 18px 24px", animation: "rp-rise .45s ease both" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink }}>Kelola Latihan</h2>
          <div className="flex items-center" style={{ gap: 10, marginTop: 2 }}>
            <span style={{ color: C.sub, fontSize: 13 }}>{items.length} latihan</span>
            <button onClick={() => navigate("/templates")} className="flex items-center" style={{ gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, color: C.ink, fontSize: 12.5, fontWeight: 600 }}>
              <Layers size={13} /> Blok WU/CD
            </button>
            {items.length > 0 && (
              <button onClick={() => window.confirm("Kosongkan daftar?") && clear()} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: TYPES.interval.fg, fontSize: 12.5, fontWeight: 600 }}>
                Kosongkan
              </button>
            )}
          </div>
        </div>
        {!showForm && (
          <div className="flex items-center" style={{ gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} title="Import Excel" className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 13, background: C.card, border: `1px solid ${C.hair}`, cursor: "pointer" }}>
              <Upload size={19} color={C.ink} />
            </button>
            <button onClick={openCreate} className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 13, background: C.ink, border: "none", cursor: "pointer" }}>
              <Plus size={21} color="#fff" strokeWidth={2.4} />
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onFile} style={{ display: "none" }} />
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.hair}`, padding: 16, marginBottom: 18, animation: "rp-rise .3s ease both" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>{editingId ? "Edit Latihan" : "Latihan Baru"}</span>
            <button onClick={cancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={C.faint} /></button>
          </div>

          {/* category tabs */}
          <div className="flex" style={{ gap: 6, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 14 }}>
            {Object.entries(CATEGORIES).map(([k, label]) => (
              <button key={k} onClick={() => setForm((f) => ({ ...f, category: k }))} style={{
                flex: 1, height: 34, borderRadius: 9, border: "none", cursor: "pointer", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13,
                background: form.category === k ? C.ink : "transparent", color: form.category === k ? "#fff" : C.sub,
              }}>{label}</button>
            ))}
          </div>

          <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><Label>Minggu</Label>
              <select value={form.week} onChange={set("week")} style={field}>{WEEK_OPTS.map((w) => <option key={w} value={w}>{weekLabel(w)}</option>)}</select>
            </div>
            <div style={{ width: 100 }}><Label>Hari</Label>
              <select value={form.day} onChange={set("day")} style={field}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            </div>
          </div>

          {isRun && (
            <>
              <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><Label>Jenis lari</Label>
                  <select value={form.subtype} onChange={set("subtype")} style={field}>{RUN_SUBTYPES.map((s) => <option key={s} value={s}>{TYPES[s].label}</option>)}</select>
                </div>
                <div style={{ width: 100 }}><Label>Jarak (km)</Label>
                  <input type="number" min="0" value={form.distanceKm} onChange={set("distanceKm")} style={field} />
                </div>
              </div>
              <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><Label>Durasi (menit)</Label><input type="number" min="0" value={form.durationMin} onChange={set("durationMin")} style={field} /></div>
                <div style={{ flex: 1 }}><Label>Pace min</Label><input placeholder="6:30" value={form.paceMin} onChange={set("paceMin")} style={field} /></div>
                <div style={{ flex: 1 }}><Label>Pace max</Label><input placeholder="6:50" value={form.paceMax} onChange={set("paceMax")} style={field} /></div>
              </div>
              <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
                <div style={{ width: 80 }}><Label>RPE</Label><input type="number" min="1" max="10" value={form.rpe} onChange={set("rpe")} style={field} /></div>
                <div style={{ flex: 1 }}><Label>Zona</Label>
                  <select value={form.zone} onChange={set("zone")} style={field}><option value="">—</option>{Object.entries(ZONES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </div>
                <div style={{ width: 70 }}><Label>HR min</Label><input type="number" value={form.hrMin} onChange={set("hrMin")} style={field} /></div>
                <div style={{ width: 70 }}><Label>HR max</Label><input type="number" value={form.hrMax} onChange={set("hrMax")} style={field} /></div>
              </div>
              <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><Label>Warm Up</Label>
                  <select value={form.warmUpId} onChange={set("warmUpId")} style={field}><option value="">—</option>{warmups.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                </div>
                <div style={{ flex: 1 }}><Label>Cool Down</Label>
                  <select value={form.coolDownId} onChange={set("coolDownId")} style={field}><option value="">—</option>{cooldowns.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                </div>
              </div>

              {/* structure editor */}
              <Label>Struktur repetisi</Label>
              {form.structure.map((s, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 10, marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                    <input placeholder="Label (mis. Interval)" value={s.label} onChange={(e) => updSeg(i, { label: e.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <button onClick={() => rmSeg(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={15} color={TYPES.interval.fg} /></button>
                  </div>
                  <div className="flex" style={{ gap: 8, marginBottom: 8 }}>
                    <input type="number" placeholder="Set" value={s.sets} onChange={(e) => updSeg(i, { sets: e.target.value })} style={{ ...field, width: 64, height: 36, background: C.card }} />
                    <input placeholder="Kerja (400 m)" value={s.work.value} onChange={(e) => updSeg(i, { work: { value: e.target.value } })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <input placeholder="Pace (4:45)" value={s.targetPace} onChange={(e) => updSeg(i, { targetPace: e.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <select value={s.recovery.type} onChange={(e) => updSeg(i, { recovery: { ...s.recovery, type: e.target.value } })} style={{ ...field, width: 90, height: 36, background: C.card }}>
                      {Object.entries(RECOVERY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input placeholder="Recovery (200 m)" value={s.recovery.value} onChange={(e) => updSeg(i, { recovery: { ...s.recovery, value: e.target.value } })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                  </div>
                </div>
              ))}
              <button onClick={addSeg} className="flex items-center justify-center" style={{ gap: 6, width: "100%", height: 38, borderRadius: 11, border: `1px dashed ${C.hair}`, background: "transparent", color: C.sub, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                <Plus size={15} /> Tambah segmen
              </button>
            </>
          )}

          {isStr && (
            <>
              <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><Label>Fokus</Label>
                  <select value={form.focus} onChange={set("focus")} style={field}>{Object.entries(FOCUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </div>
                <div style={{ width: 120 }}><Label>Durasi (menit)</Label><input type="number" min="0" value={form.durationMin} onChange={set("durationMin")} style={field} /></div>
              </div>
              <Label>Gerakan</Label>
              {form.exercises.map((e, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 10, marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                    <input placeholder="Nama gerakan" value={e.name} onChange={(ev) => updEx(i, { name: ev.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <button onClick={() => rmEx(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={15} color={TYPES.interval.fg} /></button>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <input type="number" placeholder="Set" value={e.sets} onChange={(ev) => updEx(i, { sets: ev.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <input type="number" placeholder="Reps" value={e.reps} onChange={(ev) => updEx(i, { reps: ev.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <input type="number" placeholder="kg" value={e.loadKg} onChange={(ev) => updEx(i, { loadKg: ev.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                    <input type="number" placeholder="Rest s" value={e.restSec} onChange={(ev) => updEx(i, { restSec: ev.target.value })} style={{ ...field, flex: 1, height: 36, background: C.card }} />
                  </div>
                </div>
              ))}
              <button onClick={addEx} className="flex items-center justify-center" style={{ gap: 6, width: "100%", height: 38, borderRadius: 11, border: `1px dashed ${C.hair}`, background: "transparent", color: C.sub, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                <Plus size={15} /> Tambah gerakan
              </button>
            </>
          )}

          <div style={{ marginBottom: 12 }}><Label>Tujuan sesi</Label><input value={form.goal} onChange={set("goal")} placeholder="Bangun base aerobik" style={field} /></div>
          <div style={{ marginBottom: 14 }}><Label>Catatan</Label>
            <textarea value={form.note} onChange={set("note")} rows={2} placeholder="Tips latihan…" style={{ ...field, height: "auto", padding: "9px 11px", resize: "vertical", lineHeight: 1.5 }} />
          </div>

          {/* actual log */}
          {form.category !== "rest" && (
            <div style={{ marginBottom: 14 }}>
              <button onClick={() => setForm((f) => ({ ...f, logOpen: !f.logOpen }))} className="flex items-center" style={{ gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, color: C.ink, fontSize: 13, fontWeight: 700 }}>
                <Plus size={14} /> Catat hasil aktual
              </button>
              {form.logOpen && (
                <div style={{ marginTop: 10 }}>
                  <div className="flex" style={{ gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}><Label>Jarak aktual (km)</Label><input type="number" value={form.actualDistanceKm} onChange={set("actualDistanceKm")} style={field} /></div>
                    <div style={{ flex: 1 }}><Label>Durasi aktual (mnt)</Label><input type="number" value={form.actualDurationMin} onChange={set("actualDurationMin")} style={field} /></div>
                  </div>
                  <div className="flex" style={{ gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}><Label>Pace rata2</Label><input placeholder="5:40" value={form.actualPaceAvg} onChange={set("actualPaceAvg")} style={field} /></div>
                    <div style={{ width: 70 }}><Label>RPE</Label><input type="number" value={form.actualRpe} onChange={set("actualRpe")} style={field} /></div>
                    <div style={{ width: 80 }}><Label>HR rata2</Label><input type="number" value={form.actualHrAvg} onChange={set("actualHrAvg")} style={field} /></div>
                  </div>
                  <Label>Catatan hasil</Label>
                  <textarea value={form.actualNote} onChange={set("actualNote")} rows={2} placeholder="Rasanya gimana?" style={{ ...field, height: "auto", padding: "9px 11px", resize: "vertical", lineHeight: 1.5 }} />
                </div>
              )}
            </div>
          )}

          <div className="flex" style={{ gap: 10 }}>
            <button onClick={cancel} style={{ flex: 1, height: 44, borderRadius: 13, border: `1px solid ${C.hair}`, background: C.bg, color: C.ink, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Batal</button>
            <button onClick={save} className="flex items-center justify-center" style={{ flex: 1, gap: 7, height: 44, borderRadius: 13, border: "none", background: C.ink, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              <Check size={16} strokeWidth={3} /> Simpan
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 12 }}>
        {items.length === 0 && <p style={{ color: C.sub, fontSize: 13.5, textAlign: "center", padding: "24px 0" }}>Belum ada latihan. Tap + atau import dari Excel.</p>}
        {sorted.map((item, i) => {
          const kind = kindOf(item); const t = TYPES[kind];
          return (
            <div key={item.id} className="flex items-center" style={{ gap: 13, background: C.card, border: `1px solid ${C.hair}`, borderRadius: 20, padding: "12px 14px", animation: "rp-rise .4s ease both", animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <TypeIcon type={kind} size={42} />
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{t.label}</span>
                  {kmOf(item) > 0 && <span style={{ fontSize: 11, color: t.fg, fontWeight: 700 }}>{kmOf(item)} km</span>}
                  {item.completedAt && <Check size={13} color={TYPES.long.fg} strokeWidth={3} />}
                </div>
                <div style={{ color: C.sub, fontSize: 12.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.day} · {weekLabel(item.week)} — {summaryOf(item)}
                </div>
              </div>
              <button onClick={() => openEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", padding: 7 }}><Pencil size={17} color={C.sub} /></button>
              <button onClick={() => window.confirm("Hapus latihan ini?") && remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 7 }}><Trash2 size={17} color={TYPES.interval.fg} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
