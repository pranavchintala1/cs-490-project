import { useState } from "react";

export default function EmploymentForm({ onAdded }) {
  const [f, setF] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [ongoing, setOngoing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setF((prev) => ({ ...prev, [name]: value }));
  };
  //add range check upon entry
  const rangeCheck = !ongoing && f.start_date && f.end_date && new Date(f.end_date) < new Date(f.start_date);
  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!f.title.trim()) return setErr("Title is required.");
    if (!f.start_date) return setErr("Start date is required.");
    if (!rangeCheck) return setErr("End date cannot be before start date!");

    setSaving(true);
    onAdded?.({
      title: f.title.trim(),
      company: f.company || "",
      location: f.location || "",
      start_date: f.start_date,
      end_date: ongoing ? null : f.end_date || "",
      description: f.description || "",
    });

    setF({
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
    });
    setOngoing(false);
    setSaving(false);
  };

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label>
          <div style={{ fontWeight: 600 }}>Title</div>
          <input name="title" value={f.title} onChange={onChange} required />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Company</div>
          <input name="company" value={f.company} onChange={onChange} />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Location</div>
          <input name="location" value={f.location} onChange={onChange} />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Start Date</div>
          <input type="date" name="start_date" value={f.start_date} onChange={onChange} required />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>End Date</div>
          <input
            type="date"
            name="end_date"
            value={f.end_date}
            onChange={onChange}
            disabled={ongoing}
            min = {f.start_date || undefined}
          />
          {rangeCheck && !ongoing && (
            <div style={{color: "crimson", marginTop: 4}}>End Date can't be before the Start Date!</div>
            )}
        </label>
        <label style={{ alignSelf: "end" }}>
          <input
            type="checkbox"
            checked={ongoing}
            onChange={(e) => setOngoing(e.target.checked)}
          />{" "}
          Ongoing
        </label>
      </div>

      <label style={{ display: "block", marginTop: 12 }}>
        <div style={{ fontWeight: 600 }}>Description</div>
        <textarea name="description" value={f.description} onChange={onChange} rows={3} />
      </label>

      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

      <button disabled={saving || rangeCheck} style={{ marginTop: 8 }}>
        {saving ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
