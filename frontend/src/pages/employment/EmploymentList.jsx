import { useState } from "react";
import EmploymentEdit from "./EmploymentEdit";

export default function EmploymentList({ items = [], onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (!items.length) return <div>No employment entries yet.</div>;

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it) => (
        <li key={it.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
          {editingId === it.id ? (
            <EmploymentEdit
              item={it}
              onCancel={() => setEditingId(null)}
              onSave={(patch) => {
                onUpdate?.(it.id, patch);
                setEditingId(null);
              }}
            />
          ) : (
            <>
              <div>
                <b>{it.title}</b>
                {it.company ? ` — ${it.company}` : ""}
              </div>

              <div style={{ fontSize: 13, color: "#555" }}>
                {it.location || ""}
                {it.start_date ? ` • ${it.start_date}` : ""}
                {` • ${it.end_date || "Present"}`}
              </div>

              {it.description && <div style={{ marginTop: 6 }}>{it.description}</div>}

              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={() => setEditingId(it.id)}>Edit</button>
                <button onClick={() => onDelete?.(it.id)}>Delete</button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
