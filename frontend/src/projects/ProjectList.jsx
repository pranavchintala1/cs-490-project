import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";

const API_URL = "http://127.0.0.1:8000/projects";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setProjects(data);
  };

  useEffect(()=>{ fetchProjects(); }, []);

  const addProject = async (formData) => {
    // For now, just add locally
    const newProject = Object.fromEntries(formData.entries());
    setProjects([...projects, newProject]);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects(projects.filter(p=>p.id !== id));
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.technologies?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Special Projects</h2>
      <ProjectForm addProject={addProject} />
      <input placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)} />
      {filtered.length === 0 && <p>No projects found</p>}
      <div className="project-grid">
        {filtered.map((p, idx)=><ProjectCard key={idx} project={p} deleteProject={deleteProject} />)}
      </div>
    </div>
  );
}
