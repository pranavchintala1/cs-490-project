import React, { useState, useEffect } from "react";
import JobsAPI from "../../api/jobs";

export default function JobForm({ addJob, editJob, cancelEdit }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [importUrl, setImportUrl] = useState("");
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
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [companyImageFile, setCompanyImageFile] = useState(null);

  useEffect(() => {
    if (editJob) {
      setTitle(editJob.title || "");
      setCompany(editJob.company || "");
      setCompanyData(editJob.companyData || null);
      setLocation(editJob.location || "");
      setSalary(editJob.salary || "");
      setUrl(editJob.url || "");
      setDeadline(editJob.deadline || "");
      setIndustry(editJob.industry || "");
      setJobType(editJob.job_type || editJob.jobType || "");
      setDescription(editJob.description || "");
      setStatus(editJob.status || "Interested");
      setNotes(editJob.notes || "");
      setContacts(editJob.contacts || "");
      setSalaryNotes(editJob.salary_notes || editJob.salaryNotes || "");
      setInterviewNotes(editJob.interview_notes || editJob.interviewNotes || "");
      setId(editJob.id);
    }
  }, [editJob]);

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setCompanyData(null);
    setLocation("");
    setSalary("");
    setUrl("");
    setImportUrl("");
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
    setScrapeError("");
    setCompanyImageFile(null);
  };

  const validateUrl = (urlString) => {
    if (!urlString || urlString.trim() === "") return true;
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleScrapeUrl = async () => {
    if (!importUrl.trim()) {
      setScrapeError("Please enter a URL first");
      return;
    }

    if (!validateUrl(importUrl.trim())) {
      setScrapeError("Please enter a valid URL");
      return;
    }

    setIsScrapingUrl(true);
    setScrapeError("");

    try {
      const response = await JobsAPI.importFromUrl(importUrl.trim());
      const data = response.data;
      
      console.log("Scraped data:", data);

      // Set basic job fields - company is a STRING, company_data is an OBJECT
      if (data.title) setTitle(data.title);
      if (data.company) setCompany(data.company); // This is the company NAME string
      if (data.location) setLocation(data.location);
      if (data.salary) setSalary(data.salary);
      
      // Set job type
      if (data.job_type) {
        const normalizedType = data.job_type.toLowerCase();
        if (normalizedType.includes("full")) setJobType("Full-Time");
        else if (normalizedType.includes("part")) setJobType("Part-Time");
        else if (normalizedType.includes("intern")) setJobType("Internship");
        else if (normalizedType.includes("contract")) setJobType("Contract");
        else if (normalizedType.includes("freelance")) setJobType("Freelance");
        else setJobType("Full-Time");
      }
      
      // Set industry - prioritize from main data, fallback to company_data
      if (data.industry) {
        setIndustry(data.industry);
      } else if (data.company_data?.industry) {
        setIndustry(data.company_data.industry);
      }
      
      if (data.description) setDescription(data.description.substring(0, 2000));
      
      // Store the company_data object (with size, location, website, etc.)
      if (data.company_data) {
        setCompanyData(data.company_data);
      }
   
      setUrl(importUrl.trim());
      setScrapeError("");
      alert("Job imported successfully! Company information has been loaded.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to scrape URL. Please enter details manually.";
      setScrapeError(errorMessage);
      console.error("Scraping error:", error);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) return alert("Job title is required");
    if (!company.trim()) return alert("Company name is required");
    if (!location.trim()) return alert("Location is required");
    if (!industry) return alert("Industry is required");
    if (!jobType) return alert("Job type is required");
    if (!deadline) return alert("Application deadline is required");

    if (url.trim() && !validateUrl(url.trim())) {
      return alert("Please enter a valid Job Posting URL starting with http:// or https://");
    }

    const now = new Date().toISOString();

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary.trim() || undefined,
      url: url.trim() || undefined,
      deadline: deadline,
      industry: industry,
      job_type: jobType,
      description: description.trim() || undefined,
      status: status,
      notes: notes.trim() || undefined,
      contacts: contacts.trim() || undefined,
      salary_notes: salaryNotes.trim() || undefined,
      interview_notes: interviewNotes.trim() || undefined,
      company_data: companyData || undefined,
    };

    try {
      if (editJob) {
        jobData.id = id;
        const statusChanged = editJob.status !== status;
        if (statusChanged) {
          jobData.status_history = [
            ...(editJob.status_history || []),
            [status, now],
          ];
        }
        
        await editJob.submit(jobData);
        
        // Upload company image if there's a new file and we have company data with image
        if (companyImageFile && id) {
          try {
            await JobsAPI.uploadCompanyImage(id, companyImageFile);
          } catch (err) {
            console.error("Failed to upload company image:", err);
          }
        }
      } else {
        jobData.status_history = [[status, now]];
        
        // Add job first to get the job ID
        const result = await addJob(jobData);
        
        // If we have a company image from scraping, upload it
        if (companyData?.image && result?.id) {
          try {
            // Convert base64 to blob
            const base64Data = companyData.image;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            const file = new File([blob], `${company}_logo.png`, { type: 'image/png' });
            
            await JobsAPI.uploadCompanyImage(result.id, file);
          } catch (err) {
            console.error("Failed to upload scraped company image:", err);
          }
        }
      }

      resetForm();
      cancelEdit && cancelEdit();
    } catch (error) {
      console.error("Failed to submit job:", error);
      alert(error.response?.data?.detail || "Failed to save job. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#333",
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "16px",
    background: "#f9f9f9",
    borderRadius: "6px",
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#333" }}>
        {editJob ? "Edit Job" : "Add New Job"}
      </h2>

      {/* URL Import Section */}
      <div
        style={{
          ...sectionStyle,
          background: "#e8f4fd",
          border: "2px dashed #4f8ef7",
        }}
      >
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
          🔗 Quick Import from URL
        </h3>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
          Paste a job posting URL from Indeed to auto-fill the form (includes company info!)
        </p>

        <label style={labelStyle}>Import URL</label>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              style={{
                ...inputStyle,
                marginBottom: 0,
                border:
                  importUrl.trim() && !validateUrl(importUrl.trim())
                    ? "2px solid #f44336"
                    : "1px solid #ccc",
              }}
              type="url"
              placeholder="https://www.indeed.com/viewjob?jk=..."
              value={importUrl}
              onChange={(e) => {
                setImportUrl(e.target.value);
                setScrapeError("");
              }}
            />
            {importUrl.trim() && !validateUrl(importUrl.trim()) && (
              <div
                style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}
              >
                Please enter a valid URL starting with http:// or https://
              </div>
            )}
            {scrapeError && (
              <div
                style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}
              >
                {scrapeError}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleScrapeUrl}
            disabled={
              isScrapingUrl ||
              !importUrl.trim() ||
              !validateUrl(importUrl.trim())
            }
            style={{
              padding: "10px 20px",
              background: isScrapingUrl ? "#ccc" : "#4f8ef7",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                isScrapingUrl || !importUrl.trim() ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            {isScrapingUrl ? "⏳ Importing..." : "📥 Import"}
          </button>
        </div>
      </div>

      {/* Company Info Preview (if scraped) */}
      {companyData && (
        <div
          style={{
            ...sectionStyle,
            background: "#f0f7ff",
            border: "2px solid #4f8ef7",
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#1976d2" }}>
            🏢 Company Information (Imported)
          </h3>
          
          {companyData.image && (
            <div style={{ marginBottom: "12px", textAlign: "center" }}>
              <img 
                src={`data:image/png;base64,${companyData.image}`}
                alt="Company logo"
                style={{ maxWidth: "150px", maxHeight: "80px", objectFit: "contain", borderRadius: "4px" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          
          <div style={{ fontSize: "14px", color: "#333" }}>
            {companyData.size && <p style={{ margin: "4px 0" }}><strong>👥 Size:</strong> {companyData.size}</p>}
            {companyData.industry && <p style={{ margin: "4px 0" }}><strong>🏭 Industry:</strong> {companyData.industry}</p>}
            {companyData.location && <p style={{ margin: "4px 0" }}><strong>📍 HQ:</strong> {companyData.location}</p>}
            {companyData.website && (
              <p style={{ margin: "4px 0" }}>
                <strong>🌐 Website:</strong> <a href={companyData.website} target="_blank" rel="noopener noreferrer" style={{ color: "#4f8ef7" }}>{companyData.website}</a>
              </p>
            )}
            {companyData.description && (
              <p style={{ margin: "8px 0 4px 0", fontSize: "13px", color: "#555" }}>
                <strong>About:</strong> {companyData.description.substring(0, 200)}{companyData.description.length > 200 ? "..." : ""}
              </p>
            )}
          </div>
          
          <p style={{ fontSize: "12px", color: "#666", marginTop: "12px", marginBottom: 0 }}>
            💡 This company information will be saved with your job application
          </p>
        </div>
      )}

      {/* Basic Information */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
          📋 Basic Information
        </h3>

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
            <label style={labelStyle}>Location *</label>
            <input
              style={inputStyle}
              placeholder="e.g., Remote or New York, NY"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
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
          style={{
            ...inputStyle,
            border:
              url.trim() && !validateUrl(url.trim())
                ? "2px solid #f44336"
                : "1px solid #ccc",
          }}
          type="url"
          placeholder="https://example.com/job-posting"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {url.trim() && !validateUrl(url.trim()) && (
          <div
            style={{
              color: "#f44336",
              fontSize: "12px",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            Please enter a valid URL starting with http:// or https://
          </div>
        )}
      </div>

      {/* Job Details */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
          🔍 Job Details
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Industry *</label>
            <select
              style={inputStyle}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            >
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
          </div>

          <div>
            <label style={labelStyle}>Job Type *</label>
            <select
              style={inputStyle}
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Type
              </option>
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

        <label style={labelStyle}>Application Deadline *</label>
        <input
          style={inputStyle}
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <label style={labelStyle}>Job Description (2000 char limit)</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: "120px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Paste or type the job description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value.substring(0, 2000))}
          maxLength={2000}
        />
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "-8px",
            marginBottom: "12px",
          }}
        >
          {description.length}/2000 characters
        </div>
      </div>

      {/* Personal Notes */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
          📝 Personal Notes & Tracking
        </h3>

        <label style={labelStyle}>General Notes</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: "80px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Your personal observations, thoughts, pros/cons..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <label style={labelStyle}>Contact Information</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: "60px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Recruiter name, hiring manager, email, phone..."
          value={contacts}
          onChange={(e) => setContacts(e.target.value)}
        />

        <label style={labelStyle}>Salary Negotiation Notes</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: "60px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Salary expectations, negotiation points, benefits..."
          value={salaryNotes}
          onChange={(e) => setSalaryNotes(e.target.value)}
        />

        <label style={labelStyle}>Interview Notes & Feedback</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: "80px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Interview questions asked, your answers, feedback received..."
          value={interviewNotes}
          onChange={(e) => setInterviewNotes(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => {
            resetForm();
            cancelEdit && cancelEdit();
          }}
          style={{
            padding: "12px 24px",
            background: "#999",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
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
            fontWeight: "600",
          }}
        >
          {editJob ? "💾 Save Changes" : "➕ Add Job"}
        </button>
      </div>
    </div>
  );
}