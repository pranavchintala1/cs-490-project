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

  const addProject = (formData) => {
    // For demo, just append a new project with an ID
    const newProject = { id: Date.now(), ...formData };
    setProjects([...projects, newProject]);
  };

  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects(projects.filter((p) => p.id !== id));
  };

  const filteredProjects = projects
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(s) ||
        p.role?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.technologies?.some((t) => t.toLowerCase().includes(s))
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
    <div>
      <h2>Special Projects</h2>
      <ProjectForm addProject={addProject} />

      <div style={{ display: "flex", gap: "10px", margin: "12px 0", flexWrap: "wrap" }}>
        <input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Search by Industry..." value={industrySearch} onChange={(e) => setIndustrySearch(e.target.value)} />
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: "16px" }}>
        {filteredProjects.length === 0 && <p>No projects found.</p>}
        {filteredProjects.map((p) => (
          <ProjectCard key={p.id} project={p} deleteProject={deleteProject} />
        ))}
      </div>
    </div>
  );
}
