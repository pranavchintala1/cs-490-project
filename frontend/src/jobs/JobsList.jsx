
import React, { useEffect, useMemo, useState } from "react";
import JobForm from "./JobForm";
import JobEdit from "./JobEdit";

const USER_ID = "temp_user"; // when we merge with auth we gots to change :D

export default function JobsList() {
  const API = useMemo(() => process.env.REACT_APP_API_URL || "http://localhost:8000", []);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch(`${API}/jobs?user_id=${encodeURIComponent(USER_ID)}`);
      const data = await r.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>Employment</h2>

      <JobForm API={API} userId={USER_ID} onCreated={load} />

      {loading ? <p>Loading…</p> : (
        jobs.length === 0 ? <p>No jobs yet.</p> : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
            {jobs.map(j => (
              <JobRow key={j.job_id} job={j} API={API} onChanged={load} />
            ))}
          </ul>
        )
      )}
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
    </div>
  );
}

function JobRow({ job, API, onChanged }) {
  const [editing, setEditing] = useState(false);

  const del = async () => {
    if (!window.confirm("Delete this job?")) return;
    await fetch(`${API}/jobs/${job.job_id}?user_id=${encodeURIComponent("temp_user")}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <li style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
        <div style={{ fontWeight: 700 }}>
          {job.job_title} — {job.company_name}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditing(v => !v)}>{editing ? "Cancel" : "Edit"}</button>
          <button onClick={del} style={{ color: "crimson" }}>Delete</button>
        </div>
      </div>
      <div style={{ color: "#555", marginTop: 4 }}>{job.location}</div>
      <div style={{ color: "#555" }}>
        {job.start_date}{job.current ? " — Present" : (job.end_date ? ` — ${job.end_date}` : "")}
      </div>
      {job.description && <p style={{ marginTop: 8 }}>{job.description}</p>}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <JobEdit API={API} userId={"temp_user"} job={job} onSaved={() => { setEditing(false); onChanged(); }} />
        </div>
      )}
    </li>
  );
}
