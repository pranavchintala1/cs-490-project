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
    }
  }, [editJob]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Job title is required");
    if (!company.trim()) return alert("Company name is required");

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
      statusHistory: editJob?.statusHistory || [{ status, timestamp: now }]
    };

    if (editJob) {
      editJob.submit(jobData);
    } else {
      addJob(jobData);
    }

    resetForm();
    cancelEdit && cancelEdit();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#333"
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "16px",
    background: "#f9f9f9",
    borderRadius: "6px"
  };

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto",
      padding: "20px",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginTop: 0, color: "#333" }}>{editJob ? "Edit Job" : "Add New Job"}</h2>

      {/* Basic Information */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>📋 Basic Information</h3>
        
        <label style={labelStyle}>Job Title *</label>
        <input 
          style={inputStyle}
          placeholder="e.g., Senior Frontend Developer"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />

        <label style={labelStyle}>Company Name *</label>
        <input 
          style={inputStyle}
          placeholder="e.g., TechCorp Inc."
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          required 
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Location</label>
            <input 
              style={inputStyle}
              placeholder="e.g., Remote or New York, NY"
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
            />
          </div>
          <div>
            <label style={labelStyle}>Salary Range</label>
            <input 
              style={inputStyle}
              placeholder="e.g., $80k-$120k"
              value={salary} 
              onChange={(e) => setSalary(e.target.value)} 
            />
          </div>
        </div>

        <label style={labelStyle}>Job Posting URL</label>
        <input 
          style={inputStyle}
          type="url"
          placeholder="https://..."
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
        />
      </div>

      {/* Job Details */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>🔍 Job Details</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Industry</label>
            <select 
              style={inputStyle}
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Select Industry</option>
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
          </div>

          <div>
            <label style={labelStyle}>Job Type</label>
            <select 
              style={inputStyle}
              value={jobType} 
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select 
              style={inputStyle}
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Interested">Interested</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <label style={labelStyle}>Application Deadline</label>
        <input 
          style={inputStyle}
          type="date"
          value={deadline} 
          onChange={(e) => setDeadline(e.target.value)} 
        />

        <label style={labelStyle}>Job Description (2000 char limit)</label>
        <textarea 
          style={{ ...inputStyle, minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Paste or type the job description here..."
          value={description} 
          onChange={(e) => setDescription(e.target.value.substring(0, 2000))}
          maxLength={2000}
        />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "-8px", marginBottom: "12px" }}>
          {description.length}/2000 characters
        </div>
      </div>

      {/* Personal Notes */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>📝 Personal Notes & Tracking</h3>
        
        <label style={labelStyle}>General Notes</label>
        <textarea 
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Your personal observations, thoughts, pros/cons..."
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
        />

        <label style={labelStyle}>Contact Information</label>
        <textarea 
          style={{ ...inputStyle, minHeight: "60px", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Recruiter name, hiring manager, email, phone..."
          value={contacts} 
          onChange={(e) => setContacts(e.target.value)}
        />

        <label style={labelStyle}>Salary Negotiation Notes</label>
        <textarea 
          style={{ ...inputStyle, minHeight: "60px", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Salary expectations, negotiation points, benefits..."
          value={salaryNotes} 
          onChange={(e) => setSalaryNotes(e.target.value)}
        />

        <label style={labelStyle}>Interview Notes & Feedback</label>
        <textarea 
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Interview questions asked, your answers, feedback received..."
          value={interviewNotes} 
          onChange={(e) => setInterviewNotes(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button 
          type="button" 
          onClick={() => { resetForm(); cancelEdit && cancelEdit(); }}
          style={{
            padding: "12px 24px",
            background: "#999",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          style={{
            padding: "12px 24px",
            background: "#4f8ef7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          {editJob ? "💾 Save Changes" : "➕ Add Job"}
        </button>
      </div>
    </div>
  );
}