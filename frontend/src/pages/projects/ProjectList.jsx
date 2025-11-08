import React, { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";
import { apiRequest } from "../../api";
import { useLocation } from "react-router-dom";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const location = useLocation();
  // 👇 Check for navigation state (if user came from a special link)
  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/projects/me?uuid=", "");
      
      const transformedProjects = await Promise.all((data || []).map(async project => {
        // Fetch associated media for each project
        let mediaFiles = [];
        
        try {
          const mediaIdsResponse = await apiRequest(`/api/projects/media/ids?parent_id=${project._id}&uuid=`, "");
          const mediaIds = mediaIdsResponse.media_id_list || [];
          
          // Fetch each media file's metadata
          if (mediaIds.length > 0) {
            const uuid = localStorage.getItem('uuid') || '';
            const token = localStorage.getItem('session') || '';
            const baseURL = 'http://localhost:8000';
            
            // First, get all media metadata from the database
            const mediaMetadata = await Promise.all(
              mediaIds.map(async (mediaId) => {
                try {
                  // Fetch media metadata directly from the API
                  const metaResponse = await fetch(
                    `${baseURL}/api/projects/media?media_id=${mediaId}&uuid=${uuid}`,
                    {
                      headers: {
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                      }
                    }
                  );
                  
                  if (metaResponse.ok) {
                    const contentType = metaResponse.headers.get('Content-Type');
                    const blob = await metaResponse.blob();
                    const url = URL.createObjectURL(blob);
                    
                    // Try to extract filename from Content-Disposition
                    let filename = `file_${mediaId}`;
                    const contentDisposition = metaResponse.headers.get('Content-Disposition');
                    
                    if (contentDisposition) {
                      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                      if (match && match[1]) {
                        filename = match[1].replace(/['"]/g, '').trim();
                      }
                    }
                    
                    // If still no filename, try to guess from content type
                    if (filename === `file_${mediaId}` && contentType) {
                      const ext = contentType.split('/')[1];
                      if (ext) {
                        filename = `image_${mediaId}.${ext}`;
                      }
                    }
                    
                    console.log('Loaded media:', filename, 'Type:', contentType, 'Blob type:', blob.type);
                    
                    return {
                      media_id: mediaId,
                      filename: filename,
                      url: url,
                      content_type: contentType || blob.type
                    };
                  }
                } catch (error) {
                  console.error(`Error fetching media ${mediaId}:`, error);
                }
                return null;
              })
            );
            
            mediaFiles = mediaMetadata.filter(f => f !== null);
          }
        } catch (error) {
          console.error("Error fetching media for project:", project._id, error);
        }

        return {
          id: project._id,
          project_name: project.project_name,
          description: project.description,
          role: project.role,
          start_date: project.start_date,
          end_date: project.end_date,
          skills: project.skills || [],
          team_size: project.team_size,
          details: project.details,
          achievements: project.achievements,
          industry: project.industry,
          status: project.status,
          project_url: project.project_url,
          thumbnail_id: project.thumbnail_id,
          media_files: mediaFiles
        };
      }));
      
      console.log('Transformed projects:', transformedProjects.map(p => ({
        name: p.project_name,
        thumbnail_id: p.thumbnail_id,
        media_files: p.media_files?.map(f => f.filename)
      })));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const sortProjects = (projectArray) => {
    return projectArray
      .map((p) => ({ ...p }))
      .sort((a, b) => {
        if (sort === "date_desc") return new Date(b.start_date) - new Date(a.start_date);
        if (sort === "date_asc") return new Date(a.start_date) - new Date(b.start_date);
        return 0;
      });
  };

  const addProject = async (projectData, mediaFiles) => {
    try {
      const response = await apiRequest("/api/projects?uuid=", "", {
        method: "POST",
        body: JSON.stringify(projectData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.project_id) {
        const projectId = response.project_id;
        
        // Upload media files if any
        if (mediaFiles && mediaFiles.length > 0) {
          const uuid = localStorage.getItem('uuid') || '';
          const token = localStorage.getItem('session') || '';
          const baseURL = 'http://localhost:8000';
          
          for (const file of mediaFiles) {
            const uploadFormData = new FormData();
            uploadFormData.append('media', file);
            
            try {
              const uploadResponse = await fetch(
                `${baseURL}/api/projects/media?parent_id=${projectId}&uuid=${uuid}`,
                {
                  method: "POST",
                  headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                  },
                  body: uploadFormData
                }
              );
              
              if (!uploadResponse.ok) {
                console.error("Failed to upload file:", file.name);
              }
            } catch (error) {
              console.error("Error uploading file:", file.name, error);
            }
          }
        }
        
        await loadProjects();
      }
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add project:", error);
      alert("Failed to add project. Please try again.");
    }
  };

  const submitEdit = async (projectData, mediaFiles) => {
    try {
      await apiRequest(`/api/projects?project_id=${editProject.id}&uuid=`, "", {
        method: "PUT",
        body: JSON.stringify(projectData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Upload new media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        const uuid = localStorage.getItem('uuid') || '';
        const token = localStorage.getItem('session') || '';
        const baseURL = 'http://localhost:8000';
        
        for (const file of mediaFiles) {
          const uploadFormData = new FormData();
          uploadFormData.append('media', file);
          
          try {
            const uploadResponse = await fetch(
              `${baseURL}/api/projects/media?parent_id=${editProject.id}&uuid=${uuid}`,
              {
                method: "POST",
                headers: {
                  ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: uploadFormData
              }
            );
            
            if (!uploadResponse.ok) {
              console.error("Failed to upload file:", file.name);
            }
          } catch (error) {
            console.error("Error uploading file:", file.name, error);
          }
        }
      }

      await loadProjects();
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
      if (expandedCardId === id) {
        setExpandedCardId(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleCardToggle = (projectId) => {
    setExpandedCardId(expandedCardId === projectId ? null : projectId);
  };

  const filteredProjects = sortProjects(
    projects
      .filter((p) => {
        const s = search.toLowerCase();
        return (
          p.project_name?.toLowerCase().includes(s) ||
          p.role?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.details?.toLowerCase().includes(s) ||
          (Array.isArray(p.skills) && p.skills.some((t) => t.toLowerCase().includes(s)))
        );
      })
      .filter((p) =>
        industrySearch
          ? p.industry?.toLowerCase().includes(industrySearch.toLowerCase())
          : true
      )
      .filter((p) => (statusFilter ? p.status === statusFilter : true))
  );

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
              gap: "16px",
              alignItems: "start"
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
                  expanded={expandedCardId === p.id}
                  onToggle={handleCardToggle}
                  onMediaDelete={loadProjects}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}