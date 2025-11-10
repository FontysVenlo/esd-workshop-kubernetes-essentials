// App.tsx
import { useEffect, useState } from "react";
import { api } from "./api"; // assumes you export axios.create({ baseURL }) from ./api

type Item = { id: number; name: string };
type Status = { ok: boolean; version?: string; uptime?: number;[k: string]: unknown };

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState<string>("");
  const [ms, setMs] = useState<number>(200);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchItems() {
    try {
      setError(null);
      const { data } = await api.get<Item[]>("/items");
      setItems(data);
    } catch (e: any) {
      setError(`Failed to load items: ${e?.message ?? "unknown error"}`);
    }
  }

  async function fetchStatus() {
    try {
      const { data } = await api.get<Status>("/status");
      setStatus(data);
    } catch (error) {
      console.log(error);
      setStatus({ ok: false});
    }
  }

  async function addItem() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post("/items", { name });
      setName("");
      await fetchItems();
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: number) {
    setLoading(true);
    try {
      await api.delete(`/items/${id}`);
      await fetchItems();
    } finally {
      setLoading(false);
    }
  }

  async function triggerWork() {
    setLoading(true);
    try {
      await api.post("/work", null, { params: { ms } });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    fetchStatus();
  }, []);

  const BASE = api.defaults.baseURL ?? "(relative /api)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>K8s Demo App</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>API: {BASE}</p>

      <section>
        <h2>Status</h2>
        {!status ? (
          "Loading status…"
        ) : (
          <div style={{ background: "black", padding: 8, borderRadius: 8 }}>
            <div>
              <strong>OK:</strong> {String(status.ok)}
            </div>
            <div>
              <strong>Version:</strong> {status.version ?? "n/a"}
            </div>
            <div>
              <strong>Uptime:</strong> {status.uptime ?? "n/a"}
            </div>
            {/* If you still want the raw blob visible too: */}
            <pre style={{ marginTop: 8 }}>{JSON.stringify(status, null, 2)}</pre>
          </div>
        )}
      </section>

      <section>
        <h2>Add Item</h2>
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 8, padding: 6 }}
        />
        <button onClick={addItem} disabled={loading || !name.trim()}>
          {loading ? "Working..." : "Add"}
        </button>
      </section>

      <section style={{display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center"}}>
        <h2>Items</h2>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        
          {Array.isArray(items) && items.length
            ? items.map((it) => (
              <div style={{marginTop: "1rem", width: "100%", display:"flex", justifyContent: "space-between", alignItems:"center"}} key={it.id} >
                {it.name}{" "}
                <button style={{marginLeft: "2rem"}} onClick={() => deleteItem(it.id)} disabled={loading}>
                  Delete
                </button>
              </div>
            ))
            : <li>No items yet</li>}
      </section>

      <section>
        <h2>CPU Load</h2>
        <input
          type="number"
          min={1}
          value={ms}
          onChange={(e) => setMs(Number(e.target.value))}
          style={{ marginRight: 8, padding: 6, width: 120 }}
        />
        <button onClick={triggerWork} disabled={loading || ms <= 0}>
          Trigger /work
        </button>
      </section>
    </div>
  );
}
