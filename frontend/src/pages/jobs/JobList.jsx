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
import { apiRequest } from "../../api";

// Deadline Widget Component
function DeadlineWidget({ jobs, onJobClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const jobsWithDeadlines = jobs
    .filter(job => job.deadline)
    .map(job => {
      const deadlineDate = new Date(job.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
      return { ...job, daysUntil, deadlineDate };
    })
    .sort((a, b) => a.deadlineDate - b.deadlineDate)
    .slice(0, 5);

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil < 0) return "#f44336";
    if (daysUntil <= 3) return "#ff5722";
    if (daysUntil <= 7) return "#ff9800";
    if (daysUntil <= 14) return "#ffc107";
    return "#4caf50";
  };

  const getUrgencyLabel = (daysUntil) => {
    if (daysUntil < 0) return "OVERDUE";
    if (daysUntil === 0) return "TODAY";
    if (daysUntil === 1) return "TOMORROW";
    if (daysUntil <= 7) return "THIS WEEK";
    return `${daysUntil} DAYS`;
  };

  if (jobsWithDeadlines.length === 0) return null;

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
        ⏰ Upcoming Deadlines
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {jobsWithDeadlines.map(job => (
          <div
            key={job.id}
            onClick={() => onJobClick && onJobClick(job)}
            style={{
              padding: "12px",
              background: "#f9f9f9",
              borderRadius: "6px",
              border: `2px solid ${getUrgencyColor(job.daysUntil)}`,
              cursor: onJobClick ? "pointer" : "default",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333", marginBottom: "4px" }}>
                  {job.title}
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                  {job.company}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  📅 {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{
                background: getUrgencyColor(job.daysUntil),
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: "80px"
              }}>
                {getUrgencyLabel(job.daysUntil)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState("pipeline");
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const data = await apiRequest("/api/jobs/me?uuid=", "");
      
      // Transform backend snake_case to frontend camelCase
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
        interviewNotes: job.interview_notes
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
      const response = await apiRequest("/api/jobs?uuid=", "", {
        method: "POST",
        body: JSON.stringify(jobData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.job_id) {
        // Optimistically add the job with the returned ID instead of reloading
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
      
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, "", {
        method: "PUT",
        body: JSON.stringify(backendData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Optimistically update the job in state
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
      // Reload on error to ensure consistency
      loadJobs();
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await apiRequest(`/api/jobs?job_id=${id}&uuid=`, "", {
        method: "DELETE"
      });

      setJobs(jobs.filter((j) => j.id !== id));
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
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

      // Update in backend
      try {
        await apiRequest(`/api/jobs?job_id=${activeJob.id}&uuid=`, "", {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#333" }}>Job Opportunities Tracker</h1>
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

      {/* Deadline Widget - show only in pipeline view */}
      {view === "pipeline" && <DeadlineWidget jobs={jobs} onJobClick={(job) => setSelectedJob(job)} />}

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
            <div style={{ marginBottom: "16px" }}>
              <strong>Company:</strong> {selectedJob.company}
            </div>
            {selectedJob.location && (
              <div style={{ marginBottom: "16px" }}>
                <strong>Location:</strong> {selectedJob.location}
              </div>
            )}
            {selectedJob.salary && (
              <div style={{ marginBottom: "16px" }}>
                <strong>Salary:</strong> {selectedJob.salary}
              </div>
            )}
            {selectedJob.deadline && (
              <div style={{ marginBottom: "16px" }}>
                <strong>Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}
              </div>
            )}
            {selectedJob.description && (
              <div style={{ marginBottom: "16px" }}>
                <strong>Description:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px", color: "#555" }}>
                  {selectedJob.description}
                </div>
              </div>
            )}
            {selectedJob.notes && (
              <div style={{ marginBottom: "16px", background: "#fffbea", padding: "12px", borderRadius: "4px" }}>
                <strong>Notes:</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
                  {selectedJob.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}