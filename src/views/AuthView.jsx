import { useState } from "react";
import { Footprints } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";

const field = {
  width: "100%", height: 46, borderRadius: 13, border: `1px solid ${C.hair}`,
  background: C.card, padding: "0 14px", fontSize: 14, color: C.ink, fontFamily: FONT_BODY, outline: "none",
};

export default function AuthView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        if (!data.session) setMsg("Akun dibuat. Cek email untuk konfirmasi, lalu login.");
      }
    } catch (e2) {
      setErr(e2.message || "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        fontFamily: FONT_BODY, minHeight: "100dvh", padding: 24, color: C.ink,
        background:
          "radial-gradient(900px 600px at 15% -10%, #FFE7E0 0%, transparent 55%)," +
          "radial-gradient(800px 600px at 110% 10%, #E6F0FF 0%, transparent 55%)," + C.bg,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="flex items-center justify-center" style={{ gap: 10, marginBottom: 22 }}>
          <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 14, background: C.ink }}>
            <Footprints size={22} color="#fff" />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink }}>RunPlanner</span>
        </div>

        <div style={{ background: C.card, borderRadius: 24, border: `1px solid ${C.hair}`, padding: 22, boxShadow: "0 24px 60px -30px rgba(20,20,40,0.3)" }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
            {mode === "login" ? "Masuk" : "Buat akun"}
          </h1>
          <p style={{ color: C.sub, fontSize: 13.5, marginBottom: 18 }}>
            {mode === "login" ? "Lanjutkan rencana larimu." : "Mulai rencana larimu hari ini."}
          </p>

          <form onSubmit={submit} className="flex flex-col" style={{ gap: 11 }}>
            {mode === "signup" && (
              <input placeholder="Nama" value={fullName} onChange={(e) => setFullName(e.target.value)} style={field} />
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={field} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={field} />

            {err && <div style={{ color: "#FF5A3C", fontSize: 12.5 }}>{err}</div>}
            {msg && <div style={{ color: C.sub, fontSize: 12.5 }}>{msg}</div>}

            <button type="submit" disabled={busy} className="flex items-center justify-center"
              style={{ height: 46, borderRadius: 13, border: "none", background: C.ink, color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginTop: 4, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.sub }}>
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(null); setMsg(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontWeight: 700, fontSize: 13 }}>
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
