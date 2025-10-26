import React, { useState } from "react";

export default function ProjectForm({ addProject }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [achievements, setAchievements] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("Planned");
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("role", role);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("technologies", technologies);
    formData.append("project_url", projectUrl);
    formData.append("team_size", teamSize);
    formData.append("achievements", achievements);
    formData.append("industry", industry);
    formData.append("status", status);

    // Append multiple media files
    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append("media_files", mediaFiles[i]);
    }

    addProject(formData);

    // Reset form
    setName(""); setDescription(""); setRole(""); setStartDate("");
    setEndDate(""); setTechnologies(""); setProjectUrl(""); setTeamSize("");
    setAchievements(""); setIndustry(""); setStatus("Planned"); setMediaFiles([]);
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div><input placeholder="Project Name" value={name} onChange={e=>setName(e.target.value)} required /></div>
      <div><textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required /></div>
      <div><input placeholder="Role" value={role} onChange={e=>setRole(e.target.value)} required /></div>
      <div>
        Start: <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} required />
        End: <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
      </div>
      <div><input placeholder="Technologies/Skills Used (comma separated)" value={technologies} onChange={e=>setTechnologies(e.target.value)} /></div>
      <div><input placeholder="Project URL (optional)" value={projectUrl} onChange={e=>setProjectUrl(e.target.value)} /></div>
      <div><input placeholder="Team Size" value={teamSize} onChange={e=>setTeamSize(e.target.value)} /></div>
      <div><input placeholder="Achievements / Outcomes" value={achievements} onChange={e=>setAchievements(e.target.value)} /></div>
      <div>
        <input placeholder="Industry / Project Type" value={industry} onChange={e=>setIndustry(e.target.value)} />
      </div>
      <div>
        Status: 
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
      </div>
      <div>
        Media Upload:
        <input type="file" multiple onChange={e=>setMediaFiles([...e.target.files])} />
      </div>
      <button type="submit">Add Project</button>
    </form>
  );
}
