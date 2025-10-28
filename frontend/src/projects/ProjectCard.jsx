import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function ProjectCard({ project, deleteProject }) {
  const [expanded, setExpanded] = useState(false);

  const isImage = (file) =>
    /\.(png|jpe?g|gif|webp)$/i.test(file);

  const fileUrl = (file) => `${API_URL}/projects/download/${file}`;

  return (
    <div className="project-card" style={{border:"1px solid #ccc", padding:"10px", margin:"8px", borderRadius:"5px"}}>
      <div onClick={() => setExpanded(!expanded)} style={{cursor:"pointer"}}>
        <strong>{project.name}</strong> — {project.status}<br/>
        <em>{project.role}</em><br/>
        {project.start_date} - {project.end_date || "Present"}<br/>
      </div>

      {expanded && (
        <>
          <p>{project.description}</p>
          <p><strong>Technologies:</strong> {project.technologies}</p>
          <p><strong>Team Size:</strong> {project.team_size}</p>
          <p><strong>Achievements:</strong> {project.achievements}</p>
          <p><strong>Industry:</strong> {project.industry}</p>

          <a
          href={project.project_url.startsWith("http") ? project.project_url : "https://" + project.project_url}
          target="_blank"
          rel="noreferrer"
          >
          Project Link
          </a>
          <br/>

          {project.media_files?.length > 0 && (
            <div>
              {project.media_files.map((file, idx) => (
                isImage(file) ? (
                  <img
                    key={idx}
                    src={fileUrl(file)}
                    alt=""
                    style={{
                      width:"80px", height:"80px",
                      objectFit:"cover", margin:"4px",
                      borderRadius:"5px"
                    }}
                  />
                ) : (
                  <a key={idx} href={fileUrl(file)} download>{file}</a>
                )
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ marginTop:"6px" }}>
        <button onClick={() => deleteProject(project.id)}>🗑 Delete</button>
      </div>
    </div>
  );
}
