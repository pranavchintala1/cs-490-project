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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.title.trim()) return setErr("Title is required.");
    if (!f.start_date) return setErr("Start date is required.");

    setSaving(true);
    try {
      await onAdded?.({
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
    } catch (e) {
      setErr(e.message || "Failed to add employment");
    } finally {
      setSaving(false);
    }
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
          />
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

      <button disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
