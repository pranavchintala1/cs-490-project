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
import JobsAPI from "../../api/jobs";
import ProfilesAPI from "../../api/profiles";

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
  
  // NEW: User email for reminders
  const [userEmail, setUserEmail] = useState("");
  
  // Bulk selection states
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Auto-archive settings
  const [autoArchiveDays, setAutoArchiveDays] = useState(
    parseInt(localStorage.getItem('autoArchiveDays')) || 90
  );
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(
    localStorage.getItem('autoArchiveEnabled') === 'true'
  );
  const [showSettings, setShowSettings] = useState(false);
  
  // Undo state
  const [undoStack, setUndoStack] = useState([]);

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

  // NEW: Fetch user email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await ProfilesAPI.get();
        
        if (response && response.data && response.data.email) {
          setUserEmail(response.data.email);
          console.log("User email loaded:", response.data.email);
        } else {
          console.warn("No email found in user profile");
        }
      } catch (error) {
        console.error("Failed to fetch user email:", error);
      }
    };
    
    fetchUserEmail();
  }, []);

  // Auto-archive check on load and periodically
  useEffect(() => {
    if (autoArchiveEnabled) {
      checkAutoArchive();
    }
  }, [jobs, autoArchiveEnabled, autoArchiveDays]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await JobsAPI.getAll();
      
      const transformedJobs = (res.data || []).map(job => ({
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
        archiveReason: job.archive_reason,
        archiveDate: job.archive_date,
        // NEW: Email reminder fields
        reminderDays: job.reminderDays || 3,
        emailReminder: job.emailReminder !== false,
        reminderEmail: job.reminderEmail
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-archive function
  const checkAutoArchive = async () => {
    const today = new Date();
    const jobsToArchive = jobs.filter(job => {
      if (job.archived) return false;
      if (!job.updatedAt && !job.createdAt) return false;
      
      const lastUpdate = new Date(job.updatedAt || job.createdAt);
      const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
      
      return daysSinceUpdate >= autoArchiveDays;
    });

    if (jobsToArchive.length > 0) {
      const shouldArchive = window.confirm(
        `${jobsToArchive.length} job(s) haven't been updated in ${autoArchiveDays}+ days. Auto-archive them now?`
      );
      
      if (shouldArchive) {
        for (const job of jobsToArchive) {
          await archiveJob(job.id, `Auto-archived after ${autoArchiveDays} days of inactivity`, true);
        }
      }
    }
  };

  const addJob = async (jobData) => {
    try {
      const res = await JobsAPI.add(jobData);

      if (res && res.data.job_id) {
        const newJob = {
          id: res.data.job_id,
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
      alert(error.response?.data?.detail || "Failed to add job. Please try again.");
    }
  };

  const updateJob = async (jobData) => {
    try {
      const { id, createdAt, updatedAt, statusHistory, jobType, salaryNotes, interviewNotes, ...backendData } = jobData;
      
      await JobsAPI.update(id, backendData);

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
      alert(error.response?.data?.detail || "Failed to update job. Please try again.");
      loadJobs();
    }
  };

  const restoreDeletedJob = async (job) => {
    try {
      const res = await JobsAPI.add({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        url: job.url,
        deadline: job.deadline,
        industry: job.industry,
        job_type: job.jobType || job.job_type,
        description: job.description,
        status: job.status,
        status_history: job.status_history,
        notes: job.notes,
        contacts: job.contacts,
        salary_notes: job.salaryNotes || job.salary_notes,
        interview_notes: job.interviewNotes || job.interview_notes
      });

      if (res && res.data.job_id) {
        const restoredJob = {
          ...job,
          id: res.data.job_id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setJobs(prev => [...prev, restoredJob]);
        
        // Remove from undo stack
        setUndoStack(prev => prev.filter(item => item.job?.id !== job.id));
        
        alert(`✅ Job "${job.title}" restored successfully`);
      }
    } catch (error) {
      console.error("Failed to restore deleted job:", error);
      alert("Failed to restore job. Please try again.");
    }
  };

  const deleteJob = async (id, silent = false) => {
    if (!silent && !window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      const jobToDelete = jobs.find(j => j.id === id);
      
      await JobsAPI.delete(id);
      setJobs(jobs.filter((j) => j.id !== id));
      setSelectedJob(null);
      setSelectedJobIds(prev => prev.filter(jid => jid !== id));
      
      // Add to undo stack
      if (!silent) {
        setUndoStack(prev => [...prev, {
          type: 'delete',
          job: jobToDelete,
          timestamp: Date.now()
        }]);
        
        // Show notification with option to undo
        setTimeout(() => {
          if (!window.confirm(`✅ Job "${jobToDelete.title}" deleted.\n\nClick OK to continue\nClick Cancel to UNDO`)) {
            restoreDeletedJob(jobToDelete);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert(error.response?.data?.detail || "Failed to delete job. Please try again.");
    }
  };

  // Archive with undo capability
  const archiveJob = async (id, reason = "", silent = false) => {
    try {
      const jobToArchive = jobs.find(j => j.id === id);
      const archiveDate = new Date().toISOString();
      
      await JobsAPI.update(id, {
        archived: true, 
        archive_reason: reason,
        archive_date: archiveDate
      });
      
      setJobs(jobs.map(j => j.id === id ? { 
        ...j, 
        archived: true, 
        archiveReason: reason,
        archiveDate: archiveDate
      } : j));
      
      setSelectedJob(null);
      setSelectedJobIds(prev => prev.filter(jid => jid !== id));
      
      // Add to undo stack
      if (!silent) {
        setUndoStack(prev => [...prev, {
          type: 'archive',
          job: jobToArchive,
          timestamp: Date.now()
        }]);
        
        // Show notification with option to undo
        setTimeout(() => {
          if (!window.confirm(`✅ Job "${jobToArchive.title}" archived.\n\nClick OK to continue\nClick Cancel to UNDO`)) {
            restoreJob(id);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to archive job:", error);
      alert(error.response?.data?.detail || "Failed to archive job. Please try again.");
    }
  };

  const restoreJob = async (id) => {
    try {
      await JobsAPI.update(id, {
        archived: false, 
        archive_reason: null,
        archive_date: null
      });
      
      setJobs(jobs.map(j => j.id === id ? { 
        ...j, 
        archived: false, 
        archiveReason: null,
        archiveDate: null
      } : j));
      
      // Remove from undo stack if exists
      setUndoStack(prev => prev.filter(item => item.job?.id !== id));
    } catch (error) {
      console.error("Failed to restore job:", error);
      alert(error.response?.data?.detail || "Failed to restore job. Please try again.");
    }
  };

  // Bulk archive operations
  const bulkArchive = async () => {
    if (selectedJobIds.length === 0) {
      alert("Please select jobs to archive");
      return;
    }
    
    const reason = prompt(`Archive ${selectedJobIds.length} job(s)?\n\nOptional reason:`);
    if (reason === null) return; // User cancelled
    
    try {
      for (const id of selectedJobIds) {
        await archiveJob(id, reason, true);
      }
      
      alert(`✅ Successfully archived ${selectedJobIds.length} job(s)`);
      setSelectedJobIds([]);
      setShowBulkActions(false);
      loadJobs();
    } catch (error) {
      alert("Some jobs failed to archive. Please try again.");
    }
  };

  // Bulk delete operations
  const bulkDelete = async () => {
    if (selectedJobIds.length === 0) {
      alert("Please select jobs to delete");
      return;
    }
    
    if (!window.confirm(`Permanently delete ${selectedJobIds.length} job(s)? This cannot be undone!`)) {
      return;
    }
    
    try {
      for (const id of selectedJobIds) {
        await JobsAPI.delete(id);
      }
      
      setJobs(jobs.filter(j => !selectedJobIds.includes(j.id)));
      alert(`✅ Successfully deleted ${selectedJobIds.length} job(s)`);
      setSelectedJobIds([]);
      setShowBulkActions(false);
    } catch (error) {
      alert("Some jobs failed to delete. Please try again.");
    }
  };

  // NEW: Bulk deadline management
  const bulkSetDeadline = async () => {
    if (selectedJobIds.length === 0) {
      alert("Please select jobs to set deadline");
      return;
    }
    
    const newDeadline = prompt(`Set deadline for ${selectedJobIds.length} selected job(s) (YYYY-MM-DD):`);
    if (!newDeadline) return;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDeadline)) {
      alert("Invalid date format. Please use YYYY-MM-DD");
      return;
    }
    
    try {
      for (const id of selectedJobIds) {
        const job = jobs.find(j => j.id === id);
        if (job) {
          await JobsAPI.update(id, { deadline: newDeadline });
        }
      }
      
      // Update local state
      setJobs(jobs.map(j => 
        selectedJobIds.includes(j.id) ? { ...j, deadline: newDeadline } : j
      ));
      
      alert(`✅ Deadline updated for ${selectedJobIds.length} job(s)`);
      setSelectedJobIds([]);
    } catch (error) {
      console.error("Failed to set bulk deadline:", error);
      alert("Some jobs failed to update. Please try again.");
    }
  };

  // Toggle job selection
  const toggleJobSelection = (id) => {
    setSelectedJobIds(prev => 
      prev.includes(id) 
        ? prev.filter(jid => jid !== id)
        : [...prev, id]
    );
  };

  // Select all visible jobs
  const selectAllVisible = () => {
    const visibleIds = sortedJobs.map(j => j.id);
    setSelectedJobIds(visibleIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedJobIds([]);
  };

  // Save auto-archive settings
  const saveAutoArchiveSettings = () => {
    localStorage.setItem('autoArchiveDays', autoArchiveDays.toString());
    localStorage.setItem('autoArchiveEnabled', autoArchiveEnabled.toString());
    setShowSettings(false);
    alert('✅ Auto-archive settings saved');
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
        await JobsAPI.update(activeJob.id, {status: newStatus, status_history: updatedStatusHistory});
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
      case "archiveDate":
        if (!a.archiveDate) return 1;
        if (!b.archiveDate) return -1;
        return new Date(b.archiveDate) - new Date(a.archiveDate);
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
          <h1
            style={{
            margin: 0,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '2.5rem',
            fontFamily: '"Playfair Display", serif',
            WebkitTextFillColor: '#ffffff', // ensures true white text, overrides Bootstrap
            }}
          >
          Job Opportunities Tracker
          </h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
          }}
      >
    {/* Group title + underline together */}
      <div style={{ display: "inline-block", textAlign: "center" }}>
        <h1
          style={{
          margin: 0,
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "2.5rem",
          fontFamily: '"Playfair Display", serif',
          WebkitTextFillColor: "#ffffff",
          }}
        >
        Job Opportunities Tracker
        </h1>

      {/* underline centered under text */}
        <div
          style={{
          width: "90px",
          height: "4px",
          margin: "6px auto 0",
          borderRadius: "2px",
          background: "linear-gradient(90deg, #00c28a, #005e9e)",
          }}
        />
        </div>
        
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
            <>
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
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  padding: "12px 24px",
                  background: "#795548",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}
              >
                ⚙️ Settings
              </button>
            </>
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

      {/* Settings Modal */}
      {showSettings && (
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
            zIndex: 2000,
            padding: "20px"
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px"
            }}
          >
            <h2 style={{ marginTop: 0, color: "#333" }}>⚙️ Auto-Archive Settings</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "16px" }}>
                <input 
                  type="checkbox" 
                  checked={autoArchiveEnabled} 
                  onChange={(e) => setAutoArchiveEnabled(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Enable automatic archiving</span>
              </label>
              
              {autoArchiveEnabled && (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
                    Auto-archive jobs after (days):
                  </label>
                  <input 
                    type="number" 
                    value={autoArchiveDays}
                    onChange={(e) => setAutoArchiveDays(parseInt(e.target.value) || 90)}
                    min="1"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    Jobs inactive for {autoArchiveDays} days will be suggested for archiving
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowSettings(false)}
                style={{
                  padding: "10px 20px",
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
                onClick={saveAutoArchiveSettings}
                style={{
                  padding: "10px 20px",
                  background: "#4f8ef7",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Widget and Calendar - show only in pipeline view for active jobs */}
      {view === "pipeline" && !showArchived && (
        <>
          <DeadlineWidget jobs={jobs.filter(j => !j.archived)} onJobClick={(job) => setSelectedJob(job)} />
          {showCalendar && <DeadlineCalendar jobs={jobs.filter(j => !j.archived)} />}
        </>
      )}
      {/* Bulk Actions Bar */}
      {view === "pipeline" && selectedJobIds.length > 0 && (
        <div style={{
          background: "#4f8ef7",
          color: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {selectedJobIds.length} job(s) selected
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={bulkSetDeadline}
              style={{
                padding: "8px 16px",
                background: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              📅 Set Deadline
            </button>
            <button
              onClick={bulkArchive}
              style={{
                padding: "8px 16px",
                background: "#607d8b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              🗄️ Archive Selected
            </button>
            <button
              onClick={bulkDelete}
              style={{
                padding: "8px 16px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              🗑️ Delete Selected
            </button>
            <button
              onClick={clearSelection}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid white",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {view === "pipeline" && !showCalendar && (
        <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>🔍 Search & Filters</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              {!showArchived && (
                <button
                  onClick={selectAllVisible}
                  style={{
                    padding: "6px 12px",
                    background: "#4f8ef7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ☑️ Select All Visible
                </button>
              )}
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
              {showArchived && <option value="archiveDate">Sort: Archive Date</option>}
            </select>
          </div>
          
          {showArchived && (
            <div style={{ 
              marginTop: "12px", 
              padding: "12px", 
              background: "#fff3cd", 
              borderRadius: "4px",
              fontSize: "14px",
              color: "#856404"
            }}>
              📦 Viewing archived jobs ({sortedJobs.length} total)
            </div>
          )}
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

      {view === "pipeline" && !showCalendar && (
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
                      onRestore={restoreJob}
                      activeId={activeId}
                      onSelect={!showArchived ? toggleJobSelection : null}
                      selectedJobIds={selectedJobIds}
                    />
                  </div>
                ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeJob && (
              <div style={{ cursor: "grabbing", width: "300px" }}>
                <JobCard 
                  job={activeJob} 
                  onView={() => {}} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                  isOverlay={true} 
                />
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
                <button
                  onClick={() => {
                    const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):", selectedJob.deadline);
                    if (newDeadline) {
                      // Validate date format
                      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                      if (dateRegex.test(newDeadline)) {
                        updateJob({ ...selectedJob, deadline: newDeadline });
                      } else {
                        alert("Invalid date format. Please use YYYY-MM-DD");
                      }
                    }
                  }}
                  style={{
                    marginLeft: "8px",
                    padding: "6px 12px",
                    background: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  📅 Extend Deadline
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
                <strong>📦 Archived</strong>
                {selectedJob.archiveDate && (
                  <div style={{ marginTop: "4px", fontSize: "13px" }}>
                    Date: {new Date(selectedJob.archiveDate).toLocaleDateString()}
                  </div>
                )}
                {selectedJob.archiveReason && (
                  <div style={{ marginTop: "4px", fontSize: "13px" }}>
                    Reason: {selectedJob.archiveReason}
                  </div>
                )}
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
          userEmail={userEmail}
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