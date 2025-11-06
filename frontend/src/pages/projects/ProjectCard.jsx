import React, { useState } from "react";

const statusColors = {
  Planned: "#2196f3",
  Ongoing: "#ff9800",
  Completed: "#4caf50"
};

const statusEmojis = {
  Planned: "📅",
  Ongoing: "🔄",
  Completed: "✅"
};

export default function ProjectCard({ project, deleteProject, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const isImage = (filename) => /\.(png|jpe?g|gif|webp)$/i.test(filename);
  const statusColor = statusColors[project.status] || "#666";
  const statusEmoji = statusEmojis[project.status] || "📋";

  return (
    <>
      <div
        style={{
          border: "2px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s",
          cursor: "pointer",
          position: "relative"
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: statusColor,
          color: "white",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          <span>{statusEmoji}</span>
          {project.status}
        </div>

        <div style={{ paddingRight: "100px" }}>
          <h3 style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            color: "#333"
          }}>
            {project.name}
          </h3>

          {project.industry && (
            <div style={{
              display: "inline-block",
              background: "#e3f2fd",
              color: "#1976d2",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              {project.industry}
            </div>
          )}

          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
            <strong style={{ color: "#333" }}>Role:</strong> {project.role}
          </div>

          <div style={{ fontSize: "14px", color: "#666" }}>
            <strong style={{ color: "#333" }}>Timeline:</strong>{" "}
            {new Date(project.start_date).toLocaleDateString()} -{" "}
            {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Present"}
          </div>
        </div>

        {expanded && (
          <div
            style={{ marginTop: "16px", paddingTop: "16px", borderTop: "2px solid #eee" }}
            onClick={(e) => e.stopPropagation()}
          >
            {project.description && (
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#333", fontSize: "14px" }}>Description:</strong>
                <p style={{ margin: "6px 0", color: "#555", fontSize: "13px", lineHeight: "1.6" }}>
                  {project.description}
                </p>
              </div>
            )}

            {project.technologies && (
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#333", fontSize: "14px" }}>Technologies:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {(Array.isArray(project.technologies) 
                    ? project.technologies 
                    : project.technologies.split(',').map(t => t.trim())
                  ).map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#f0f0f0",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#333"
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.team_size && (
              <div style={{ marginBottom: "12px", fontSize: "13px", color: "#666" }}>
                <strong style={{ color: "#333" }}>Team Size:</strong> {project.team_size} people
              </div>
            )}

            {project.project_url && (
              <div style={{ marginBottom: "12px", fontSize: "13px" }}>
                <strong style={{ color: "#333" }}>Project URL:</strong>{" "}
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2196f3", textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Project →
                </a>
              </div>
            )}

            {project.achievements && (
              <div style={{
                marginBottom: "12px",
                padding: "12px",
                background: "#fffbea",
                borderRadius: "6px",
                borderLeft: "3px solid #ffc107"
              }}>
                <strong style={{ color: "#333", fontSize: "14px" }}>🏆 Achievements:</strong>
                <p style={{ margin: "6px 0 0 0", color: "#555", fontSize: "13px", lineHeight: "1.6" }}>
                  {project.achievements}
                </p>
              </div>
            )}

            {project.media_files?.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#333", fontSize: "14px", display: "block", marginBottom: "8px" }}>
                  📸 Media Files:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {project.media_files.map((file, idx) =>
                    isImage(file.filename) ? (
                      <img
                        key={idx}
                        src={file.url}
                        alt={file.filename}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "zoom-in",
                          border: "2px solid #ddd"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImage(file.url);
                        }}
                      />
                    ) : (
                      <div
                        key={idx}
                        style={{
                          padding: "8px 12px",
                          background: "#f0f0f0",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        📎 {file.filename}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div style={{
              display: "flex",
              gap: "10px",
              paddingTop: "12px",
              borderTop: "1px solid #eee"
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project.id);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#34c759",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#ff3b30",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            cursor: "zoom-out"
          }}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      )}
    </>
  );
}