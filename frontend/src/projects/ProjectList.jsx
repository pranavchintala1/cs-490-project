import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";

const API_URL = process.env.REACT_APP_API_URL + "/projects";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");

  // Fetch projects
  const fetchProjects = async () => {
    const res = await fetch(`${API_URL}/`);
    const data = await res.json();
    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Add project
  const addProject = async (formData) => {
  // Convert FormData to JSON object
  const payload = {
    user_id: "temp_user",
    name: formData.get("name"),
    description: formData.get("description"),
    role: formData.get("role"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || null,
    skills_used: formData.get("skills_used") ? formData.get("skills_used").split(",") : [],
    team_size: formData.get("team_size") ? Number(formData.get("team_size")) : null,
    details: formData.get("details") || null,
    outcomes: formData.get("outcomes") || null,
    industry_type: formData.get("industry_type") || null,
    media_urls: formData.get("media_urls") ? formData.get("media_urls").split(",") : [],
    status: formData.get("status") || "Planned"
  };

  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const newProject = await res.json();
  setProjects([...projects, newProject]);
};

  // Delete project
  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`${API_URL}/${id}/?user_id=temp_user`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Filtered + sorted projects
  const filtered = projects
    .filter((p) =>
      (p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.skills_used?.join(" ").toLowerCase().includes(search.toLowerCase())) &&
      (industryFilter === "" || p.industry_type === industryFilter) &&
      (statusFilter === "" || p.status === statusFilter)
    )
    .sort((a, b) => {
      if (sort === "date_desc") return new Date(b.start_date) - new Date(a.start_date);
      if (sort === "date_asc") return new Date(a.start_date) - new Date(b.start_date);
      return 0;
    });

  return (
    <div>
      <h2>Special Projects</h2>
      <ProjectForm addProject={addProject} />

      {/* Search + Filter + Sort */}
      <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
        <input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="">All Industries</option>
          {[...new Set(projects.map((p) => p.industry_type))].map((ind) => (
            <option key={ind}>{ind}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort…</option>
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
        </select>

        <button onClick={() => window.print()}>🖨 Print</button>
      </div>

      {filtered.length === 0 && <p>No projects found</p>}

      <div className="project-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} deleteProject={deleteProject} />
        ))}
      </div>
    </div>
  );
}
