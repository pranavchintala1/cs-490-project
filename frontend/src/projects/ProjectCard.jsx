import React, { useState } from "react";

export default function ProjectCard({ project, deleteProject }) {
  const [expanded, setExpanded] = useState(false);
  const isImage = (filename) => /\.(png|jpe?g|gif|webp)$/i.test(filename);

  return (
    <div className="project-card" style={{ border: "1px solid #ccc", padding: 10, margin: 8 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <strong>{project.name}</strong> — {project.status}<br />
        <em>{project.industry}</em><br /> {/* ✅ Industry on top */}
        <em>{project.role}</em><br />
        {project.start_date} - {project.end_date || "Present"}
      </div>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          <p>{project.description}</p>

          {project.technologies?.length > 0 && (
            <p><strong>Technologies / Skills:</strong> {project.technologies.join(", ")}</p>
          )}
          {project.project_url && <p><strong>Project URL:</strong> <a href={project.project_url}>{project.project_url}</a></p>}
          {project.team_size && <p><strong>Team Size:</strong> {project.team_size}</p>}
          {project.achievements && <p><strong>Outcomes / Achievements:</strong> {project.achievements}</p>}

          {project.media_files?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {project.media_files.map((file, idx) =>
                isImage(file.filename) ? (
                  <img
                    key={idx}
                    src={`data:${file.content_type};base64,${file.data}`}
                    alt={file.filename}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                ) : (
                  <span key={idx} style={{ display: "block" }}>📎 {file.filename}</span>
                )
              )}
            </div>
          )}
        </div>
      )}

      <button style={{ marginTop: 6 }} onClick={() => deleteProject(project.id)}>
        🗑 Delete
      </button>
    </div>
  );
}
