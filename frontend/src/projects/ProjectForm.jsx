import React, { useState, useRef } from "react";

export default function ProjectForm({ addProject }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noEndDate, setNoEndDate] = useState(false);
  const [technologies, setTechnologies] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [achievements, setAchievements] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState(""); // empty by default
  const [files, setFiles] = useState([]);

  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Project Name is required");
    if (!role.trim()) return alert("Role is required");
    if (!startDate) return alert("Start Date is required");
    if (!teamSize || isNaN(teamSize) || parseInt(teamSize) <= 0) return alert("Team Size must be a positive number");
    if (!status) return alert("Please select a project status");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim() || "");
    formData.append("role", role.trim());
    formData.append("start_date", startDate);
    if (!noEndDate && endDate) formData.append("end_date", endDate);
    formData.append("technologies", technologies.trim() || "");
    if (projectUrl) formData.append("project_url", projectUrl.trim());
    formData.append("team_size", parseInt(teamSize));
    formData.append("achievements", achievements.trim() || "");
    if (industry.trim()) formData.append("industry", industry.trim());
    formData.append("status", status);

    files.forEach(f => formData.append("media_files", f));

    addProject(formData);

    // Reset form
    setName(""); setDescription(""); setRole(""); setStartDate(""); setEndDate(""); setNoEndDate(false);
    setTechnologies(""); setProjectUrl(""); setTeamSize(""); setAchievements(""); setIndustry(""); setStatus(""); setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div><input placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div><input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} required /></div>
      <div>
        Start: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        {!noEndDate && <span> End: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></span>}
        <label style={{ marginLeft: "10px" }}>
          <input type="checkbox" checked={noEndDate} onChange={e => setNoEndDate(e.target.checked)} /> Ongoing / Continuous
        </label>
      </div>
      <div><input placeholder="Technologies/Skills (optional, comma separated)" value={technologies} onChange={e => setTechnologies(e.target.value)} /></div>
      <div><input placeholder="Project URL (optional)" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} /></div>
      <div><input placeholder="Team Size" type="number" value={teamSize} onChange={e => setTeamSize(e.target.value)} required min="1" /></div>
      <div>
  <textarea
    placeholder="Achievements / Outcomes (optional)"
    value={achievements}
    onChange={e => setAchievements(e.target.value)}
  />
</div>
      <div><input placeholder="Industry / Project Type (optional)" value={industry} onChange={e => setIndustry(e.target.value)} /></div>
      <div>
        Status:
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="" disabled>Select Status</option> {/* disabled placeholder */}
          <option>Planned</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
      </div>
      <div>
        Media Upload (optional):
        <input type="file" multiple ref={fileRef} onChange={e => setFiles([...e.target.files])} />
      </div>
      <div><button type="submit">Add Project</button></div>
    </form>
  );
}
