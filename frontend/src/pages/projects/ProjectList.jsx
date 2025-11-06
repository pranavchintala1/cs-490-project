import React, { useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";

// Import images normally in CRA
import test1 from "./test1.png";
import test2 from "./test2.png";

export default function ProjectsList() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Sprint 1",
      status: "Completed",
      industry: "Software",
      role: "Developer",
      start_date: "2025-09-01",
      end_date: "2025-09-30",
      description: "Initial project planning and design for CS490.",
      technologies: ["React", "FastAPI", "MongoDB"],
      project_url:
        "https://github.com/njit-prof-bill/njit-prof-bill-cs490-project-fall-2025/blob/main/Sprint1PRD.md",
      team_size: 3,
      achievements: "Created initial PRD",
      media_files: [
        { filename: "test1.png", url: test1 },
        { filename: "test2.png", url: test2 },
      ],
    },
    {
      id: 2,
      name: "Other Project",
      status: "Ongoing",
      industry: "AI",
      role: "Lead Engineer",
      start_date: "2025-10-01",
      description: "Building an AI demo app.",
      technologies: ["Python", "TensorFlow"],
      team_size: 2,
      achievements: "Implemented initial ML model",
      media_files: [],
    },
  ]);

  const [search, setSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const addProject = (formData) => {
    const newProject = { id: Date.now(), ...Object.fromEntries(formData.entries()) };
    setProjects([...projects, newProject]);
    setShowForm(false);
    alert("✅ Project added successfully!");
  };

  const submitEdit = (formData) => {
    const updatedProject = { ...editProject, ...Object.fromEntries(formData.entries()) };
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditProject(null);
    setShowForm(false);
    alert("✅ Project updated successfully!");
  };

  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects(projects.filter((p) => p.id !== id));
    alert("✅ Project deleted successfully!");
  };

  const filteredProjects = projects
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(s) ||
        p.role?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        (Array.isArray(p.technologies) && p.technologies.some((t) => t.toLowerCase().includes(s)))
      );
    })
    .filter((p) =>
      industrySearch
        ? p.industry?.toLowerCase().includes(industrySearch.toLowerCase())
        : true
    )
    .filter((p) => (statusFilter ? p.status === statusFilter : true))
    .sort((a, b) => {
      if (sort === "date_desc") return new Date(b.start_date) - new Date(a.start_date);
      if (sort === "date_asc") return new Date(a.start_date) - new Date(b.start_date);
      return 0;
    });

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ margin: 0, color: "#333" }}>🚀 Special Projects</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditProject(null);
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
          {showForm ? "← Cancel" : "+ Add Project"}
        </button>
      </div>

      {showForm && (
        <ProjectForm
          addProject={addProject}
          editProject={editProject ? { ...editProject, submit: submitEdit } : null}
          cancelEdit={() => {
            setEditProject(null);
            setShowForm(false);
          }}
        />
      )}

      <div style={{
        background: "#f9f9f9",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: "12px",
          alignItems: "center"
        }}>
          <input
            placeholder="🔍 Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <input
            placeholder="Industry..."
            value={industrySearch}
            onChange={(e) => setIndustrySearch(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            <option value="">All Status</option>
            <option value="Planned">Planned</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            <option value="">Sort By...</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
          <button
            onClick={() => window.print()}
            style={{
              padding: "10px 16px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{
          background: "#f9f9f9",
          padding: "40px",
          borderRadius: "8px",
          textAlign: "center",
          color: "#999"
        }}>
          <p style={{ fontSize: "16px" }}>
            {search || industrySearch || statusFilter
              ? "No projects match your filters"
              : "No projects yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px"
        }}>
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              deleteProject={deleteProject}
              onEdit={(id) => {
                const proj = projects.find(p => p.id === id);
                setEditProject(proj);
                setShowForm(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}