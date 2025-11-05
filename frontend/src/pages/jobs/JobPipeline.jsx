import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import JobCard from "./JobCard";

export default function JobPipeline({ stage, jobs, onView, onEdit, onDelete, activeId }) {
  const stageColors = {
    "Interested": "#9e9e9e",
    "Applied": "#2196f3",
    "Screening": "#ff9800",
    "Interview": "#ff5722",
    "Offer": "#4caf50",
    "Rejected": "#f44336"
  };

  const stageEmojis = {
    "Interested": "🤔",
    "Applied": "📤",
    "Screening": "📞",
    "Interview": "💼",
    "Offer": "🎉",
    "Rejected": "❌"
  };

  const { setNodeRef: droppableRef, isOver } = useDroppable({ 
    id: `droppable-${stage}` 
  });

  const color = stageColors[stage] || "#666";
  const emoji = stageEmojis[stage] || "📋";

  return (
    <div style={{
      padding: "12px",
      border: "2px solid #ddd",
      borderRadius: "8px",
      minHeight: "300px",
      display: "flex",
      flexDirection: "column",
      background: "#f9f9f9"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "12px",
        paddingBottom: "8px",
        borderBottom: `3px solid ${color}`
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "16px", 
          color: color,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "20px" }}>{emoji}</span>
          {stage}
        </h3>
        <span style={{
          background: color,
          color: "white",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "bold"
        }}>
          {jobs.length}
        </span>
      </div>

      <SortableContext 
        items={jobs.map(j => j.id)} 
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={droppableRef}
          style={{ 
            padding: "8px", 
            margin: 0,
            listStyle: "none", 
            minHeight: "200px",
            backgroundColor: isOver ? "#e8f4f8" : (jobs.length === 0 ? "#f8f8f8" : "transparent"),
            borderRadius: "4px",
            transition: "background-color 0.2s",
            border: isOver ? "2px dashed #4f8ef7" : "2px dashed transparent",
            flexGrow: 1,
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <li style={{ 
              padding: "40px 20px", 
              color: "#999", 
              textAlign: "center",
              pointerEvents: "none",
              listStyle: "none",
              fontSize: "14px"
            }}>
              {isOver ? "Drop here to move job" : "No jobs in this stage"}
            </li>
          )}
        </ul>
      </SortableContext>
    </div>
  );
}