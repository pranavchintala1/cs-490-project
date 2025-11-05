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
  const [status, setStatus] = useState("Interested");
  const [notes, setNotes] = useState("");
  const [contacts, setContacts] = useState("");
  const [salaryNotes, setSalaryNotes] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [id, setId] = useState(null);

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
    setStatus("Interested");
    setNotes("");
    setContacts("");
    setSalaryNotes("");
    setInterviewNotes("");
    setId(null);
  };

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
      setStatus(editJob.status || "Interested");
      setNotes(editJob.notes || "");
      setContacts(editJob.contacts || "");
      setSalaryNotes(editJob.salaryNotes || "");
      setInterviewNotes(editJob.interviewNotes || "");
      setId(editJob.id);
    } else {
      resetForm();
    }
  }, [editJob]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      return alert("Job title and company are required.");
    }

    const now = new Date().toISOString();
    const jobData = {
      id: id || `job${Date.now()}`,
      title,
      company,
      location,
      salary,
      url,
      deadline,
      industry,
      jobType,
      description,
      status,
      notes,
      contacts,
      salaryNotes,
      interviewNotes,
      createdAt: editJob?.createdAt || now,
      updatedAt: now,
      statusHistory: editJob?.statusHistory || [{ status, timestamp: now }],
    };

    if (editJob) {
      editJob.submit(jobData);
    } else {
      addJob(jobData);
    }

    resetForm();
    cancelEdit && cancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
      <h3>{editJob ? "Edit Job" : "Add Job"}</h3>

      <input
        placeholder="Job Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        placeholder="Company *"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        required
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        placeholder="Salary Range"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
      />
      <input
        type="url"
        placeholder="Job Posting URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
  <option value="" disabled>
    Select Industry
  </option>
  <option value="Technology">Technology</option>
  <option value="Finance">Finance</option>
  <option value="Healthcare">Healthcare</option>
  <option value="Education">Education</option>
  <option value="Marketing">Marketing</option>
  <option value="Design">Design</option>
  <option value="Consulting">Consulting</option>
  <option value="Manufacturing">Manufacturing</option>
  <option value="Retail">Retail</option>
  <option value="Other">Other</option>
</select>

<select value={jobType} onChange={(e) => setJobType(e.target.value)}>
  <option value="" disabled>
    Select Job Type
  </option>
  <option value="Full-Time">Full-Time</option>
  <option value="Part-Time">Part-Time</option>
  <option value="Internship">Internship</option>
  <option value="Contract">Contract</option>
  <option value="Freelance">Freelance</option>
</select>

<select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="" disabled>
    Select Status
  </option>
  <option value="Interested">Interested</option>
  <option value="Applied">Applied</option>
  <option value="Screening">Screening</option>
  <option value="Interview">Interview</option>
  <option value="Offer">Offer</option>
  <option value="Rejected">Rejected</option>
</select>

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <textarea
        placeholder="Job Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <textarea
        placeholder="General Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <textarea
        placeholder="Contact Information"
        value={contacts}
        onChange={(e) => setContacts(e.target.value)}
      />
      <textarea
        placeholder="Salary Notes"
        value={salaryNotes}
        onChange={(e) => setSalaryNotes(e.target.value)}
      />
      <textarea
        placeholder="Interview Notes"
        value={interviewNotes}
        onChange={(e) => setInterviewNotes(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button type="submit">{editJob ? "Save" : "Add"}</button>
        <button
          type="button"
          onClick={() => {
            cancelEdit && cancelEdit();
            resetForm();
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
