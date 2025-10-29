// src/jobs/JobsPage.jsx
import { useCallback, useEffect, useState } from "react";
import JobForm from "./JobForm";
import JobsList from "./JobsList";
import { listJobs } from "../api";

export default function JobsPage({ userId = "temp_user" }) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await listJobs(userId);
      setJobs(data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load jobs.");
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Employment</h1>
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Add Job</h3>
        <JobForm userId={userId} onAdded={load} />
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
      <JobsList userId={userId} jobs={jobs} reload={load} />
    </div>
  );
}
