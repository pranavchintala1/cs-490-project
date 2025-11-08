import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import JobForm from "./JobForm";
import JobPipeline from "./JobPipeline";
import JobCard from "./JobCard";
import { DeadlineWidget, DeadlineCalendar, DeadlineReminderModal } from "./DeadlineComponents";
import { apiRequest } from "../../api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState("pipeline");
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [reminderJob, setReminderJob] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const uuid = localStorage.getItem('uuid') || '';

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [salaryFilter, setSalaryFilter] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");

  const sensors = useSensors(useSensor(PointerSensor));
  const stages = ["Interested", "Applied", "Screening", "Interview", "Offer", "Rejected"];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/jobs/me?uuid=", uuid);
      
      const transformedJobs = (data || []).map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        url: job.url,
        deadline: job.deadline,
        industry: job.industry,
        job_type: job.job_type,
        jobType: job.job_type,
        description: job.description,
        status: job.status,
        createdAt: job.date_created || job.createdAt,
        updatedAt: job.date_updated || job.updatedAt,
        status_history: job.status_history || [],
        statusHistory: (job.status_history || []).map(([status, timestamp]) => ({ 
          status, 
          timestamp 
        })),
        notes: job.notes,
        contacts: job.contacts,
        salary_notes: job.salary_notes,
        salaryNotes: job.salary_notes,
        interview_notes: job.interview_notes,
        interviewNotes: job.interview_notes,
        archived: job.archived || false,
        archiveReason: job.archive_reason
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData) => {
    try {
      const response = await apiRequest("/api/jobs?uuid=", uuid, {
        method: "POST",
        body: JSON.stringify(jobData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.job_id) {
        const newJob = {
          id: response.job_id,
          ...jobData,
          jobType: jobData.job_type,
          salaryNotes: jobData.salary_notes,
          interviewNotes: jobData.interview_notes,
          statusHistory: (jobData.status_history || []).map(([status, timestamp]) => ({ status, timestamp })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setJobs(prev => [...prev, newJob]);
        setView("pipeline");
      }
    } catch (error) {
      console.error("Failed to add job:", error);
      alert("Failed to add job. Please try again.");
    }
  };

  const updateJob = async (jobData) => {
    try {
      const { id, createdAt, updatedAt, statusHistory, jobType, salaryNotes, interviewNotes, ...backendData } = jobData;
      
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, uuid, {
        method: "PUT",
        body: JSON.stringify(backendData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setJobs(prev => prev.map(job => {
        if (job.id === id) {
          return {
            ...job,
            ...jobData,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      }));

      setView("pipeline");
      setEditingJob(null);
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job. Please try again.");
      loadJobs();
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, uuid, {
        method: "DELETE"
      });

      setJobs(jobs.filter((j) => j.id !== id));
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const archiveJob = async (id, reason = "") => {
    try {
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, uuid, {
        method: "PUT",
        body: JSON.stringify({
          archived: true,
          archive_reason: reason
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setJobs(jobs.map(j => j.id === id ? { ...j, archived: true, archiveReason: reason } : j));
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to archive job:", error);
      alert("Failed to archive job. Please try again.");
    }
  };

  const restoreJob = async (id) => {
    try {
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, uuid, {
        method: "PUT",
        body: JSON.stringify({
          archived: false,
          archive_reason: null
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setJobs(jobs.map(j => j.id === id ? { ...j, archived: false, archiveReason: null } : j));
    } catch (error) {
      console.error("Failed to restore job:", error);
      alert("Failed to restore job. Please try again.");
    }
  };

  const bulkArchive = async (jobIds, reason = "") => {
    if (!window.confirm(`Archive ${jobIds.length} jobs?`)) return;

    for (const id of jobIds) {
      await archiveJob(id, reason);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!active || !over) return;

    const activeJob = jobs.find((j) => j.id === active.id);
    if (!activeJob) return;

    let newStatus = activeJob.status;

    if (over.id.toString().startsWith("droppable-")) {
      newStatus = over.id.toString().replace("droppable-", "");
    } else {
      const overJob = jobs.find((j) => j.id === over.id);
      if (overJob) {
        newStatus = overJob.status;
      }
    }

    if (activeJob.status !== newStatus) {
      const now = new Date().toISOString();
      const updatedStatusHistory = [...activeJob.status_history, [newStatus, now]];
      
      const updatedJob = {
        ...activeJob,
        status: newStatus,
        updatedAt: now,
        status_history: updatedStatusHistory,
        statusHistory: updatedStatusHistory.map(([status, timestamp]) => ({ status, timestamp }))
      };
      
      setJobs(jobs.map((j) => (j.id === activeJob.id ? updatedJob : j)));

      try {
        await apiRequest(`/api/jobs?job_id=${activeJob.id}&uuid=`, uuid, {
          method: "PUT",
          body: JSON.stringify({
            status: newStatus,
            status_history: updatedStatusHistory
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error("Failed to update job status:", error);
        loadJobs();
      }
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (showArchived && !job.archived) return false;
    if (!showArchived && job.archived) return false;

    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const matchesIndustry = industryFilter === "All" || job.industry === industryFilter;
    const matchesLocation = !locationFilter || (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesJobType = jobTypeFilter === "All" || job.jobType === jobTypeFilter;

    let matchesSalary = true;
    if (salaryFilter) {
      const minSalary = parseInt(salaryFilter, 10);
      if (!isNaN(minSalary) && job.salary) {
        const salaryNumbers = job.salary.match(/\d+/g);
        if (salaryNumbers && salaryNumbers.length > 0) {
          const jobMinSalary = parseInt(salaryNumbers[0], 10) * (job.salary.includes("k") ? 1000 : 1);
          matchesSalary = jobMinSalary >= minSalary;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesIndustry && matchesLocation && matchesJobType && matchesSalary;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      case "company":
        return a.company.localeCompare(b.company);
      case "title":
        return a.title.localeCompare(b.title);
      case "dateAdded":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const groupedJobs = stages.reduce((acc, stage) => {
    acc[stage] = sortedJobs.filter((job) => job.status === stage);
    return acc;
  }, {});

  const activeJob = jobs.find((j) => j.id === activeId);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setIndustryFilter("All");
    setLocationFilter("");
    setJobTypeFilter("All");
    setSalaryFilter("");
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "100%", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "#333" }}>Job Opportunities Tracker</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "100%", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h1 style={{ margin: 0, color: "#333" }}>Job Opportunities Tracker</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {view === "pipeline" && !showArchived && (
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              style={{
                padding: "12px 24px",
                background: showCalendar ? "#ff9800" : "#9c27b0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              {showCalendar ? "📋 Hide Calendar" : "📅 Show Calendar"}
            </button>
          )}
          {view === "pipeline" && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                padding: "12px 24px",
                background: showArchived ? "#ff5722" : "#607d8b",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              {showArchived ? "📂 Show Active" : "🗄️ Show Archived"}
            </button>
          )}
          <button
            onClick={() => {
              setView(view === "pipeline" ? "form" : "pipeline");
              setEditingJob(null);
            }}
            style={{
              padding: "12px 24px",
              background: "#4f8ef7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            {view === "pipeline" ? "+ Add New Job" : "← Back to Pipeline"}
          </button>
        </div>
      </div>

      {/* Deadline Widget and Calendar - show only in pipeline view for active jobs */}
      {view === "pipeline" && !showArchived && (
        <>
          <DeadlineWidget jobs={jobs.filter(j => !j.archived)} onJobClick={(job) => setSelectedJob(job)} />
          {showCalendar && <DeadlineCalendar jobs={jobs.filter(j => !j.archived)} />}
        </>
      )}

      {view === "pipeline" && (
        <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>🔍 Search & Filters</h3>
            <button
              onClick={clearAllFilters}
              style={{
                padding: "6px 12px",
                background: "#ff3b30",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Clear All
            </button>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
              <option value="All">All Statuses</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={inputStyle}>
              <option value="All">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={inputStyle}
            />

            <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} style={inputStyle}>
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>

            <input
              type="text"
              placeholder="Min salary..."
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
              style={inputStyle}
            />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
              <option value="dateAdded">Sort: Date Added</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="company">Sort: Company</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>
      )}

      {view === "form" && (
        <JobForm
          addJob={addJob}
          editJob={editingJob ? { ...editingJob, submit: updateJob } : null}
          cancelEdit={() => {
            setView("pipeline");
            setEditingJob(null);
          }}
        />
      )}

      {view === "pipeline" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
            <div
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "20px",
              }}
            >
              {stages
                .filter(stage => statusFilter === "All" || stage === statusFilter)
                .map((stage) => (
                  <div key={stage} style={{ minWidth: "320px", maxWidth: "320px" }}>
                    <JobPipeline
                      stage={stage}
                      jobs={groupedJobs[stage]}
                      onView={(job) => setSelectedJob(job)}
                      onEdit={(job) => {
                        setEditingJob(job);
                        setView("form");
                      }}
                      onDelete={deleteJob}
                      onArchive={archiveJob}
                      activeId={activeId}
                    />
                  </div>
                ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeJob && (
              <div style={{ cursor: "grabbing", width: "300px" }}>
                <JobCard job={activeJob} onView={() => {}} onEdit={() => {}} onDelete={() => {}} isOverlay={true} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {selectedJob && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "8px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#333" }}>{selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: "16px", color: "#000" }}>
              <strong>Company:</strong> {selectedJob.company}
            </div>
            
            <div style={{ marginBottom: "16px", color: "#000" }}>
              <strong>Status:</strong> <span style={{ 
                padding: "4px 12px", 
                borderRadius: "12px", 
                background: "#e3f2fd",
                fontSize: "14px",
                color: "#000"
              }}>{selectedJob.status}</span>
            </div>
            
            {selectedJob.location && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Location:</strong> {selectedJob.location}
              </div>
            )}
            
            {selectedJob.salary && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Salary:</strong> {selectedJob.salary}
              </div>
            )}
            
            {selectedJob.jobType && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Job Type:</strong> {selectedJob.jobType}
              </div>
            )}
            
            {selectedJob.industry && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Industry:</strong> {selectedJob.industry}
              </div>
            )}
            
            {selectedJob.deadline && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}
                <button
                  onClick={() => setReminderJob(selectedJob)}
                  style={{
                    marginLeft: "12px",
                    padding: "6px 12px",
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  ⏰ Set Reminder
                </button>
              </div>
            )}
            
            {selectedJob.url && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Link:</strong> <a 
                  href={selectedJob.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#4f8ef7", textDecoration: "underline" }}
                >
                  View Job Posting →
                </a>
              </div>
            )}
            
            {selectedJob.description && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Description:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px", color: "#000", background: "#f9f9f9", padding: "12px", borderRadius: "4px" }}>
                  {selectedJob.description}
                </div>
              </div>
            )}
            
            {selectedJob.contacts && (
              <div style={{ marginBottom: "16px", background: "#e3f2fd", padding: "12px", borderRadius: "4px", color: "#000" }}>
                <strong>Contacts:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
                  {selectedJob.contacts}
                </div>
              </div>
            )}
            
            {selectedJob.salaryNotes && (
              <div style={{ marginBottom: "16px", background: "#f3e5f5", padding: "12px", borderRadius: "4px", color: "#000" }}>
                <strong>Salary Notes:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
                  {selectedJob.salaryNotes}
                </div>
              </div>
            )}
            
            {selectedJob.interviewNotes && (
              <div style={{ marginBottom: "16px", background: "#e8f5e9", padding: "12px", borderRadius: "4px", color: "#000" }}>
                <strong>Interview Notes:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
                  {selectedJob.interviewNotes}
                </div>
              </div>
            )}
            
            {selectedJob.notes && (
              <div style={{ marginBottom: "16px", background: "#fffbea", padding: "12px", borderRadius: "4px", color: "#000" }}>
                <strong>Notes:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
                  {selectedJob.notes}
                </div>
              </div>
            )}
            
            {selectedJob.statusHistory && selectedJob.statusHistory.length > 0 && (
              <div style={{ marginBottom: "16px", color: "#000" }}>
                <strong>Status History:</strong>
                <div style={{ marginTop: "8px" }}>
                  {selectedJob.statusHistory.map((history, idx) => (
                    <div key={idx} style={{ fontSize: "13px", color: "#000", marginBottom: "4px" }}>
                      • {history.status} - {new Date(history.timestamp).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedJob.archived && (
              <div style={{ marginBottom: "16px", background: "#ffebee", padding: "12px", borderRadius: "4px", color: "#000" }}>
                <strong>Archived</strong>
                {selectedJob.archiveReason && <div style={{ marginTop: "4px", fontSize: "13px" }}>Reason: {selectedJob.archiveReason}</div>}
              </div>
            )}
            
            <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setEditingJob(selectedJob);
                  setView("form");
                  setSelectedJob(null);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#34c759",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                ✏️ Edit Job
              </button>
              
              {selectedJob.archived ? (
                <button
                  onClick={() => {
                    restoreJob(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  ♻️ Restore Job
                </button>
              ) : (
                <button
                  onClick={() => {
                    const reason = prompt("Reason for archiving (optional):");
                    if (reason !== null) {
                      archiveJob(selectedJob.id, reason);
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#607d8b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  🗄️ Archive Job
                </button>
              )}
              
              <button
                onClick={() => {
                  deleteJob(selectedJob.id);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#ff3b30",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                🗑️ Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
      
      {reminderJob && (
        <DeadlineReminderModal
          job={reminderJob}
          onClose={() => setReminderJob(null)}
          onSave={(updatedJob) => {
            updateJob(updatedJob);
            setReminderJob(null);
          }}
        />
      )}
    </div>
  );
}