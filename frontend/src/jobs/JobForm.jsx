// src/jobs/JobForm.jsx
import { useState } from "react";
import { createJob } from "../api";

export default function JobForm({ userId = "temp_user", onAdded }) {
  const [f, setF] = useState({
    job_title: "", company_name: "", location: "",
    start_date: "", end_date: "", current: false, description: ""
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF({ ...f, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const payload = {
        user_id: userId,
        job_title: f.job_title,
        company_name: f.company_name,
        location: f.location,
        start_date: f.start_date || null,
        end_date: f.current ? null : (f.end_date || null),
        current: !!f.current,
        description: f.description || "",
      };
      await createJob(payload);             // POST /jobs/
      setF({ job_title:"", company_name:"", location:"", start_date:"", end_date:"", current:false, description:"" });
      onAdded?.();
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to add.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label>Job Title<input name="job_title" value={f.job_title} onChange={onChange} /></label>
        <label>Company<input name="company_name" value={f.company_name} onChange={onChange} /></label>
        <label>Location<input name="location" value={f.location} onChange={onChange} /></label>
        <label>Start Date<input type="date" name="start_date" value={f.start_date} onChange={onChange} /></label>
        <label>End Date<input type="date" name="end_date" value={f.end_date} onChange={onChange} disabled={f.current} /></label>
        <label style={{ alignSelf: "end" }}>
          <input type="checkbox" name="current" checked={f.current} onChange={onChange} /> Current
        </label>
      </div>
      <label style={{ display: "block", marginTop: 12 }}>
        Description
        <textarea name="description" value={f.description} onChange={onChange} />
      </label>
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
      <button disabled={saving} style={{ marginTop: 8 }}>{saving ? "Adding..." : "Add"}</button>
    </form>
  );
}
