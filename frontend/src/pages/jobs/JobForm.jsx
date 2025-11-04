import React, { useState } from "react";

export default function JobForm({ addJob }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobType, setJobType] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setUrl("");
    setDeadline("");
    setIndustry("");
    setJobType("");
    setDescription("");
    setStatus("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Job title is required");
    if (!company.trim()) return alert("Company name is required");
    if (!jobType) return alert("Please select a job type");
    if (!status) return alert("Please select a job status");

    addJob({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary.trim(),
      url: url.trim(),
      deadline,
      industry: industry.trim(),
      jobType,
      description: description.trim(),
      status,
    });

    resetForm();
    setSuccessMsg("Job added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="job-form" style={{ marginBottom: 20 }}>
      {successMsg && <div style={{ color: "green", marginBottom: "10px" }}>{successMsg}</div>}
      
      <div><input placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div><input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required /></div>
      <div><input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      <div><input placeholder="Salary / Pay Range (optional)" value={salary} onChange={(e) => setSalary(e.target.value)} /></div>
      <div><input placeholder="Job URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} /></div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Application Deadline:
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ marginLeft: "8px" }}
          />
        </label>
        <label>
          Industry:
          <input
            placeholder="e.g. Tech, Finance"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>

      <div>
        <label>Job Type: </label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} required>
          <option value="" disabled>Select Job Type</option>
          <option>Full-Time</option>
          <option>Part-Time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>
      </div>

      <div>
        <label>Status: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="" disabled>Select Status</option>
          <option>Interested</option>
          <option>Applied</option>
          <option>Phone Screen</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </div>

      <div>
        <textarea
          placeholder="Job Description / Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button type="submit">Add Job</button>
        <button type="button" onClick={resetForm}>Cancel</button>
      </div>
    </form>
  );
}
