import React from "react";

export default function ProjectCard({ project, deleteProject }) {
  return (
    <div className="project-card" style={{border:"1px solid #ccc", padding:"10px", margin:"8px", borderRadius:"5px"}}>
      <strong>{project.name}</strong> ({project.status})<br/>
      <em>{project.role}</em> | {project.industry} | Team: {project.team_size}<br/>
      {project.start_date} - {project.end_date || "Present"}<br/>
      <p>{project.description}</p>
      <p>Technologies: {project.technologies}</p>
      {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer">Project Link</a>}<br/>
      {project.achievements && <p>Achievements: {project.achievements}</p>}
      {project.media_files && project.media_files.length > 0 && (
        <div>
          Media: {project.media_files.map((file, idx)=><span key={idx}>{file.name || file} </span>)}
        </div>
      )}
      <button onClick={()=>deleteProject(project.id)}>🗑 Delete</button>
    </div>
  );
}
