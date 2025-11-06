import React, { useState, useRef, useEffect } from "react";

export default function ProjectForm({ addProject, editProject, cancelEdit }) {
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
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState([]);
  const [id, setId] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    if (editProject) {
      setName(editProject.name || "");
      setDescription(editProject.description || "");
      setRole(editProject.role || "");
      setStartDate(editProject.start_date || "");
      setEndDate(editProject.end_date || "");
      setNoEndDate(!editProject.end_date);
      setTechnologies(editProject.technologies || "");
      setProjectUrl(editProject.project_url || "");
      setTeamSize(editProject.team_size || "");
      setAchievements(editProject.achievements || "");
      setIndustry(editProject.industry || "");
      setStatus(editProject.status || "");
      setId(editProject.id);
    }
  }, [editProject]);

  const resetForm = () => {
    setName(""); setDescription(""); setRole(""); setStartDate(""); setEndDate(""); setNoEndDate(false);
    setTechnologies(""); setProjectUrl(""); setTeamSize(""); setAchievements(""); setIndustry(""); setStatus(""); setFiles([]); setId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Project Name is required");
    if (!role.trim()) return alert("Role is required");
    if (!startDate) return alert("Start Date is required");
    if (!teamSize || isNaN(teamSize) || parseInt(teamSize) <= 0) return alert("Team Size must be positive");
    if (!status) return alert("Please select a project status");

    const formData = new FormData();
    formData.append("id", id || `proj${Date.now()}`);
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("role", role.trim());
    formData.append("start_date", startDate);
    if (!noEndDate && endDate) formData.append("end_date", endDate);
    formData.append("technologies", technologies.trim());
    formData.append("project_url", projectUrl.trim());
    formData.append("team_size", parseInt(teamSize));
    formData.append("achievements", achievements.trim());
    formData.append("industry", industry.trim());
    formData.append("status", status);

    files.forEach(f => formData.append("media_files", f));

    if (editProject) {
      editProject.submit(formData);
    } else {
      addProject(formData);
    }

    resetForm();
    cancelEdit && cancelEdit();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#333"
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "16px",
    background: "#f9f9f9",
    borderRadius: "6px"
  };

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      marginBottom: "24px"
    }}>
      <h2 style={{ marginTop: 0, color: "#333" }}>
        {editProject ? "✏️ Edit Project" : "🚀 Add Project"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
            📋 Basic Information
          </h3>
          
          <label style={labelStyle}>Project Name *</label>
          <input
            style={inputStyle}
            placeholder="e.g., E-Commerce Platform Redesign"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <label style={labelStyle}>Your Role *</label>
          <input
            style={inputStyle}
            placeholder="e.g., Lead Developer, Project Manager"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Industry / Type</label>
              <input
                style={inputStyle}
                placeholder="e.g., Healthcare, FinTech"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Status *</label>
              <select
                style={inputStyle}
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              >
                <option value="" disabled>Select Status</option>
                <option value="Planned">📅 Planned</option>
                <option value="Ongoing">🔄 Ongoing</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Description</label>
          <textarea
            style={{ 
              ...inputStyle, 
              minHeight: "100px", 
              resize: "vertical", 
              fontFamily: "inherit" 
            }}
            placeholder="Describe the project, its goals, and your contributions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Timeline & Team */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
            📅 Timeline & Team
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input
                style={inputStyle}
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                style={inputStyle}
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                disabled={noEndDate}
              />
            </div>
          </div>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: "#333"
          }}>
            <input
              type="checkbox"
              checked={noEndDate}
              onChange={e => setNoEndDate(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            Ongoing / Continuous Project
          </label>

          <label style={labelStyle}>Team Size *</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="e.g., 5"
            value={teamSize}
            onChange={e => setTeamSize(e.target.value)}
            min="1"
            required
          />
        </div>

        {/* Technical Details */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
            💻 Technical Details
          </h3>

          <label style={labelStyle}>Technologies / Skills</label>
          <input
            style={inputStyle}
            placeholder="e.g., React, Python, AWS, Docker"
            value={technologies}
            onChange={e => setTechnologies(e.target.value)}
          />

          <label style={labelStyle}>Project URL</label>
          <input
            style={inputStyle}
            type="url"
            placeholder="https://github.com/yourusername/project"
            value={projectUrl}
            onChange={e => setProjectUrl(e.target.value)}
          />

          <label style={labelStyle}>Achievements / Outcomes</label>
          <textarea
            style={{ 
              ...inputStyle, 
              minHeight: "80px", 
              resize: "vertical", 
              fontFamily: "inherit" 
            }}
            placeholder="e.g., Increased performance by 40%, Reduced costs by $50k..."
            value={achievements}
            onChange={e => setAchievements(e.target.value)}
          />
        </div>

        {/* Media Files */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#4f8ef7" }}>
            📸 Media Files (Optional)
          </h3>

          <label style={labelStyle}>Upload Screenshots, Diagrams, or Documents</label>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={e => setFiles([...e.target.files])}
            style={{
              ...inputStyle,
              padding: "8px",
              cursor: "pointer"
            }}
          />
          {files.length > 0 && (
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              {files.length} file(s) selected
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => {
              resetForm();
              cancelEdit && cancelEdit();
            }}
            style={{
              padding: "12px 24px",
              background: "#999",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              background: "#4f8ef7",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {editProject ? "💾 Save Changes" : "➕ Add Project"}
          </button>
        </div>
      </form>
    </div>
  );
}