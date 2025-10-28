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

  const fetchProjects = async () => {
    const res = await fetch(`${API_URL}/`);
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async (formData) => {
    const res = await fetch(`${API_URL}/`, { method: "POST", body: formData });
    const newProject = await res.json();
    setProjects([...projects, newProject]);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setProjects(projects.filter(p => p.id !== id));
  };

  let filtered = projects.filter(p =>
    (p.name?.toLowerCase().includes(search.toLowerCase()) ||
     p.technologies?.toLowerCase().includes(search.toLowerCase())) &&
    (industryFilter === "" || p.industry === industryFilter) &&
    (statusFilter === "" || p.status === statusFilter)
  );

  if (sort === "date_desc") filtered.sort((a,b) => new Date(b.start_date) - new Date(a.start_date));
  if (sort === "date_asc") filtered.sort((a,b) => new Date(a.start_date) - new Date(b.start_date));

  return (
    <div>
      <h2>Special Projects</h2>
      <ProjectForm addProject={addProject} />

      {/* Search + Filter + Sort */}
      <div style={{display:"flex", gap:"10px", margin:"12px 0"}}>
        <input
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={industryFilter} onChange={e=>setIndustryFilter(e.target.value)}>
          <option value="">All Industries</option>
          {[...new Set(projects.map(p => p.industry))].map(ind => (
            <option key={ind}>{ind}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>

        <select value={sort} onChange={e=>setSort(e.target.value)}>
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
