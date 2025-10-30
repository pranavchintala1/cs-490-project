import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";

const API_URL = process.env.REACT_APP_API_URL + "/projects";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${API_URL}/?user_id=temp_user`);
    const data = await res.json();
    setProjects(data || []);
  };

  const addProject = async (formData) => {
    formData.append("user_id", "temp_user");
    const res = await fetch(`${API_URL}/`, { method: "POST", body: formData });
    const newProject = await res.json();
    setProjects([...projects, newProject]);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`${API_URL}/${id}/?user_id=temp_user`, { method: "DELETE" });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const filteredProjects = projects
    .filter(p => {
      const s = search.toLowerCase();
      return p.name?.toLowerCase().includes(s) ||
             p.role?.toLowerCase().includes(s) ||
             p.description?.toLowerCase().includes(s) ||
             p.technologies?.some(t => t.toLowerCase().includes(s));
    })
    .filter(p => industrySearch ? p.industry?.toLowerCase().includes(industrySearch.toLowerCase()) : true)
    .filter(p => statusFilter ? p.status === statusFilter : true)
    .sort((a, b) => {
      if (sort === "date_desc") return new Date(b.start_date) - new Date(a.start_date);
      if (sort === "date_asc") return new Date(a.start_date) - new Date(b.start_date);
      return 0;
    });

  return (
    <div>
      <h2>Special Projects</h2>
      <ProjectForm addProject={addProject} />

      <div style={{ display:"flex", gap:"10px", margin:"12px 0", flexWrap:"wrap" }}>
        <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Search by Industry..." value={industrySearch} onChange={e => setIndustrySearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Sort…</option>
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
        </select>
        <button onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:"16px" }}>
        {filteredProjects.length === 0 && <p>No projects found.</p>}
        {filteredProjects.map(p => <ProjectCard key={p.id} project={p} deleteProject={deleteProject} />)}
      </div>
    </div>
  );
}
