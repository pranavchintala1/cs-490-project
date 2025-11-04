import React, { useState } from "react";

export default function JobCard({ job, deleteJob, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className="job-card">
      <div className="job-header" onClick={toggleExpand}>
        <div>
          <h4>{job.title}</h4>
          <p>{job.company}</p>
        </div>
        <p className="job-status">{job.status}</p>
      </div>

      {expanded && (
        <div className="job-details">
          <p><strong>Location:</strong> {job.location || "—"}</p>
          <p><strong>Salary:</strong> {job.salary || "—"}</p>
          <p><strong>Deadline:</strong> {job.deadline || "—"}</p>
          <p><strong>Industry:</strong> {job.industry || "—"}</p>
          <p><strong>Job Type:</strong> {job.jobType || "—"}</p>
          {job.url && <p><a href={job.url} target="_blank" rel="noreferrer">View Posting</a></p>}
          <p><strong>Description:</strong> {job.description || "No description"}</p>

          <button onClick={() => onEdit(job.id)}>✏ Edit</button>
          <button onClick={() => deleteJob(job.id)} className="delete-btn">Delete</button>
        </div>
      )}
    </div>
  );
}
