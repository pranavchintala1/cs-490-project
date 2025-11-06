import React, { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";
import { apiRequest } from "../../api";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/projects/me?uuid=", "");
      
      const transformedProjects = (data || []).map(project => ({
        id: project._id,
        name: project.name,
        status: project.status,
        industry: project.industry,
        role: project.role,
        start_date: project.start_date,
        end_date: project.end_date,
        description: project.description,
        technologies: project.technologies,
        project_url: project.project_url,
        team_size: project.team_size,
        achievements: project.achievements,
        media_files: project.media_files || []
      }));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (formData) => {
    try {
      const projectData = Object.fromEntries(formData.entries());
      
      const response = await apiRequest("/api/projects?uuid=", "", {
        method: "POST",
        body: JSON.stringify(projectData)
      });

      if (response && response.project_id) {
        const newProject = { ...projectData, id: response.project_id };
        setProjects([...projects, newProject]);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add project:", error);
      alert("Failed to add project. Please try again.");
    }
  };

  const submitEdit = async (formData) => {
    try {
      const projectData = Object.fromEntries(formData.entries());
      
      await apiRequest(`/api/projects?project_id=${editProject.id}&uuid=`, "", {
        method: "PUT",
        body: JSON.stringify(projectData)
      });

      const updatedProject = { ...editProject, ...projectData };
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setEditProject(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    
    try {
      await apiRequest(`/api/projects?project_id=${id}&uuid=`, "", {
        method: "DELETE"
      });

      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
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

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "#333" }}>🚀 Special Projects</h1>
        <p>Loading projects...</p>
      </div>
    );
  }

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

      {/* Only show filters and projects if form is not shown */}
      {!showForm && (
        <>
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
        </>
      )}
    </div>
  );
}