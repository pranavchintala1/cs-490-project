// frontend/src/jobs/JobForm.jsx
import React, { useState } from "react";

export default function JobForm({ API, userId, onCreated }) {
  const [f, setF] = useState({
    job_title: "",
    company_name: "",
    location: "",
    start_date: "",
    end_date: "",
    current: false,
    description: ""
  });
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async () => {
    setMsg("Saving…");
    const payload = { ...f, end_date: f.current ? null : (f.end_date || null) };
    try {
      const r = await fetch(`${API}/jobs?user_id=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      setMsg("Added!");
      setF({ job_title: "", company_name: "", location: "", start_date: "", end_date: "", current: false, description: "" });
      onCreated?.();
    } catch (e) {
      console.error(e);
      setMsg("Failed to add.");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0 }}>Add Job</h3>
      <Grid>
        <L label="Job Title"><input name="job_title" value={f.job_title} onChange={onChange} /></L>
        <L label="Company"><input name="company_name" value={f.company_name} onChange={onChange} /></L>
        <L label="Location"><input name="location" value={f.location} onChange={onChange} /></L>
        <L label="Start Date"><input type="date" name="start_date" value={f.start_date} onChange={onChange} /></L>
        <L label="End Date"><input type="date" name="end_date" value={f.end_date} onChange={onChange} disabled={f.current} /></L>
        <L label="Current"><input type="checkbox" name="current" checked={f.current} onChange={onChange} /></L>
        <L label="Description"><textarea name="description" rows={3} value={f.description} onChange={onChange} /></L>
      </Grid>
      <button onClick={submit}>Add</button> <span style={{ color: "#555" }}>{msg}</span>
    </div>
  );
}

function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function L({ label, children }) {
  return <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 600 }}>{label}</span>{children}</label>;
}
