import React, { useState, useEffect } from "react";

export default function JobForm({ addJob, editJob, cancelEdit }) {
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
  const [id, setId] = useState(null);

  useEffect(() => {
    if (editJob) {
      setTitle(editJob.title || "");
      setCompany(editJob.company || "");
      setLocation(editJob.location || "");
      setSalary(editJob.salary || "");
      setUrl(editJob.url || "");
      setDeadline(editJob.deadline || "");
      setIndustry(editJob.industry || "");
      setJobType(editJob.jobType || "");
      setDescription(editJob.description || "");
      setStatus(editJob.status || "");
      setId(editJob.id);
    }
  }, [editJob]);

  const resetForm = () => {
    setTitle(""); setCompany(""); setLocation(""); setSalary(""); setUrl("");
    setDeadline(""); setIndustry(""); setJobType(""); setDescription(""); setStatus(""); setId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Job title is required");
    if (!company.trim()) return alert("Company name is required");
    if (!jobType) return alert("Please select a job type");
    if (!status) return alert("Please select a job status");

    const jobData = { id: id || `job${Date.now()}`, title, company, location, salary, url, deadline, industry, jobType, description, status };

    if (editJob) {
      editJob.submit(jobData);
    } else {
      addJob(jobData);
    }

    resetForm();
    cancelEdit && cancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="job-form" style={{ marginBottom: 20 }}>
      <h3>{editJob ? "Edit Job" : "Add Job"}</h3>
      <input placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required />
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
      <input placeholder="Salary / Pay Range" value={salary} onChange={e => setSalary(e.target.value)} />
      <input placeholder="Job URL" value={url} onChange={e => setUrl(e.target.value)} />
      <label>Application Deadline: <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label>
      <input placeholder="Industry" value={industry} onChange={e => setIndustry(e.target.value)} />
      <label>Job Type:
        <select value={jobType} onChange={e => setJobType(e.target.value)} required>
          <option value="" disabled>Select Job Type</option>
          <option>Full-Time</option>
          <option>Part-Time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>
      </label>
      <label>Status:
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="" disabled>Select Status</option>
          <option>Interested</option>
          <option>Applied</option>
          <option>Phone Screen</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </label>
      <textarea placeholder="Job Description / Notes" value={description} onChange={e => setDescription(e.target.value)} />
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button type="submit">{editJob ? "Save" : "Add Job"}</button>
        <button type="button" onClick={() => { resetForm(); cancelEdit && cancelEdit(); }}>Cancel</button>
      </div>
    </form>
  );
}
