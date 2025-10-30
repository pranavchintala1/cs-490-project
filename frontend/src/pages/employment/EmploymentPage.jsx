import { useMemo, useState } from "react";
import EmploymentForm from "./EmploymentForm";
import EmploymentList from "./EmploymentList";

export default function EmploymentPage() {
  //dummy
  const [items, setItems] = useState([
    {
      id: 1,
      title: "SWE intern",
      company: "NJIT",
      location: "Newark, NJ",
      start_date: "2024-06-01",
      end_date: "2025-08-31",
      description: "Did stuff",
    },
    {
      id: 2,
      title: "Assistant",
      company: "NJIT",
      location: "Newark, NJ",
      start_date: "2025-09-01",
      end_date: null, 
      description: "Grade homeworks",
    },
  ]);

 
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(""); 
  const [onlyCurrent, setOnlyCurrent] = useState(false);

  const addItem = (job) => setItems((prev) => [...prev, { ...job, id: Date.now() }]);
  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const deleteItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

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

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Employment</h1>

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
