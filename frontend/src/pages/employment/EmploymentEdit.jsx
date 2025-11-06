import { useState } from "react";

export default function EmploymentEdit({ item, onSave, onCancel }) {
  const [f, setF] = useState({
    title: item.title || "",
    company: item.company || "",
    location: item.location || "",
    start_date: item.start_date || "",
    end_date: item.end_date || "",
    description: item.description || "",
    ongoing: !item.end_date,
  });
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };


  const rangeCheck = !f.ongoing && f.start_date && f.end_date && new Date(f.end_date) < new Date(f.start_date);

  const save = () => {
    if (!f.title.trim()) return setMsg("Title is required.");
    if (!f.start_date) return setMsg("Start date is required.");
    if (rangeCheck) return setMsg("Can't have an end date before the start date!");

    const patch = {
      title: f.title.trim(),
      company: f.company || "",
      location: f.location || "",
      start_date: f.start_date,
      end_date: f.ongoing ? null : f.end_date || "",
      description: f.description || "",
    };

    onSave?.(patch);
  };

  return (
    <div style={{ border: "1px dashed #bbb", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input name="title" value={f.title} onChange={onChange} required />
        </Field>
        <Field label="Company">
          <input name="company" value={f.company} onChange={onChange} />
        </Field>
        <Field label="Location">
          <input name="location" value={f.location} onChange={onChange} />
        </Field>
        <Field label="Start Date">
          <input type="date" name="start_date" value={f.start_date} onChange={onChange} />
        </Field>
        <Field label="End Date">
          <input
            type="date"
            name="end_date"
            value={f.end_date}
            onChange={onChange}
            disabled={f.ongoing}
            min={f.start_date || undefined}
          />
          {rangeCheck && !f.ongoing && (
            <div style={{color: "crimson", marginTop: 4}} role="alert">End Date can't be before the Start Date!</div>
            )}
        </Field>
        <Field label="Ongoing">
          <input type="checkbox" name="ongoing" checked={f.ongoing} onChange={onChange} />
        </Field>
        <Field label="Description">
          <textarea name="description" rows={3} value={f.description} onChange={onChange} />
        </Field>
      </div>

      {msg && <div style={{ color: "crimson", marginTop: 6 }}>{msg}</div>}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <button onClick={save} disabled={rangeCheck}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
