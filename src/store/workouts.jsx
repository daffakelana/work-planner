import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import { listWorkouts, createWorkout, updateWorkout, deleteWorkout, createWorkouts } from "../api/workouts";
import { listBlocks, saveBlock, deleteBlock } from "../api/blocks";
import { DEFAULT_BLOCKS } from "../data/blocks";

export const DAY_ORDER = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
export const weekLabel = (w) => (w === 0 ? "Minggu Ini" : w === 1 ? "Minggu Depan" : `Minggu ${w + 1}`);

const Ctx = createContext(null);

export function WorkoutsProvider({ children }) {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [w, b] = await Promise.all([listWorkouts(), listBlocks()]);
    setItems(w);
    setBlocks(b);
  }, []);

  useEffect(() => {
    let active = true;
    if (!session) {
      setItems([]); setBlocks([]); setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        let b = await listBlocks();
        if (b.length === 0) {
          // akun baru: isi blok Warm Up / Cool Down default sekali
          for (const blk of DEFAULT_BLOCKS) await saveBlock(null, blk);
          b = await listBlocks();
        }
        const w = await listWorkouts();
        if (active) { setItems(w); setBlocks(b); }
      } catch (e) {
        console.error("Gagal memuat data:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [session]);

  // sessions
  const add = async (item) => { await createWorkout(item); await refresh(); };
  const update = async (id, patch) => { await updateWorkout(id, patch); await refresh(); };
  const remove = async (id) => { await deleteWorkout(id); await refresh(); };
  const clear = async () => { for (const it of items) await deleteWorkout(it.id); await refresh(); };
  const importItems = async (rows) => { await createWorkouts(rows); await refresh(); };

  // blocks
  const addBlock = async (b) => { await saveBlock(null, b); await refresh(); };
  const updateBlock = async (id, patch) => { await saveBlock(id, patch); await refresh(); };
  const removeBlock = async (id) => { await deleteBlock(id); await refresh(); };

  return (
    <Ctx.Provider value={{ items, blocks, loading, add, update, remove, clear, importItems, addBlock, updateBlock, removeBlock, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWorkouts = () => useContext(Ctx);

export function groupByWeek(items) {
  const max = items.reduce((m, it) => Math.max(m, it.week || 0), 0);
  const out = [];
  for (let w = 0; w <= max; w++) {
    out.push(
      items
        .filter((it) => (it.week || 0) === w)
        .sort((a, b) => (DAY_ORDER[a.day] ?? 7) - (DAY_ORDER[b.day] ?? 7))
    );
  }
  return out;
}
