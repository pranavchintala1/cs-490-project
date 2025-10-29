// src/jobs/JobsList.jsx
import { deleteJob } from "../api";

export default function JobsList({ userId = "temp_user", jobs = [], reload }) {
  const remove = async (id) => {
    try {
      await deleteJob(userId, id);
      await reload?.();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete job.");
    }
  };

  if (!jobs.length) return <div>No jobs yet.</div>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {jobs.map((j) => (
        <li key={j.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <div><b>{j.job_title}</b> — {j.company_name}</div>
          <div style={{ fontSize: 13, color: "#555" }}>
            {j.location || ""} {j.start_date ? `• ${j.start_date}` : ""} {j.current ? "• Current" : (j.end_date ? `• ${j.end_date}` : "")}
          </div>
          <div style={{ marginTop: 6 }}>{j.description}</div>
          <button style={{ marginTop: 6 }} onClick={() => remove(j.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
