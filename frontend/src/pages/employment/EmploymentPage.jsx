import { useMemo, useState, useEffect } from "react";
import EmploymentForm from "./EmploymentForm";
import EmploymentList from "./EmploymentList";
import { listEmployment, createEmployment, updateEmployment, deleteEmployment } from "../../tools/api";

export default function EmploymentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");
  const [onlyCurrent, setOnlyCurrent] = useState(false);

  // Load employment data on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listEmployment();
        setItems(data || []);
      } catch (e) {
        setErr(e.message || "Failed to load employment data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addItem = async (job) => {
    try {
      await createEmployment(job);
      // Refetch the list after creation
      const data = await listEmployment();
      setItems(data || []);
    } catch (e) {
      setErr(e.message || "Failed to add employment");
    }
  };

  const updateItem = async (id, patch) => {
    try {
      await updateEmployment(id, patch);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    } catch (e) {
      setErr(e.message || "Failed to update employment");
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteEmployment(id);
      // Filter by both id and _id since backend returns _id
      setItems((prev) => prev.filter((it) => (it.id || it._id) !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete employment");
    }
  };

  const filtered = useMemo(() => {
    let r = items;

    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter(
        (it) =>
          it.title?.toLowerCase().includes(s) ||
          it.company?.toLowerCase().includes(s) ||
          it.location?.toLowerCase().includes(s) ||
          it.description?.toLowerCase().includes(s)
      );
    }

    if (onlyCurrent) r = r.filter((it) => !it.end_date);

    if (sort === "date_desc") {
      r = [...r].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    } else if (sort === "date_asc") {
      r = [...r].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }

    return r;
  }, [items, q, sort, onlyCurrent]);

  if (loading) return <div style={{ padding: 24 }}>Loading employment data…</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Employment</h1>

      {err && <div style={{ color: "crimson", marginBottom: 16 }}>{err}</div>}

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add Employment</h3>
        <EmploymentForm onAdded={addItem} />
      </section>

      <div style={{ display: "flex", gap: 10, margin: "12px 0", flexWrap: "wrap" }}>
        <input
          placeholder="Search (title/company/location/desc)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort…</option>
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
        </select>
        <label style={{ alignSelf: "center" }}>
          <input
            type="checkbox"
            checked={onlyCurrent}
            onChange={(e) => setOnlyCurrent(e.target.checked)}
          />{" "}
          Current only
        </label>
      </div>

      <EmploymentList
        items={filtered}
        onDelete={deleteItem}
        onUpdate={updateItem}
      />
    </div>
  );
}
