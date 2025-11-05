import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Category color + emoji mapping
const categoryMeta = {
  Technical: { color: "#4f8ef7", emoji: "💻" },
  "Soft Skills": { color: "#34c759", emoji: "🗣️" },
  Languages: { color: "#ff9500", emoji: "🈯" },
  "Industry-Specific": { color: "#af52de", emoji: "🏭" }
};

export default function SkillItem({ skill, updateSkill, removeSkill }) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: skill.id });

  const meta = categoryMeta[skill.category] || { color: "#ccc", emoji: "" };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    listStyle: "none",
    marginBottom: "6px",
    width: "100%",
  };

  const itemStyle = {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    padding: "6px 8px",
    borderRadius: "6px",
    backgroundColor: meta.color + "33",
    border: isDragging ? `2px solid ${meta.color}` : "2px solid transparent",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
    opacity: isDragging ? 0.5 : 1,
    transition: "box-shadow 0.2s, border 0.2s",
    boxSizing: "border-box",
  };

  const dragHandleStyle = {
    cursor: "grab",
    fontSize: "14px",
    color: "#666",
    userSelect: "none",
    padding: "0 2px",
    flexShrink: 0,
  };

  const nameStyle = {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    userSelect: "none",
    cursor: "grab",
    minWidth: 0,
    fontSize: "13px",
    wordBreak: "break-word",
  };

  const selectStyle = {
    padding: "3px 6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "11px",
    flexShrink: 0,
  };

  const buttonStyle = {
    padding: "2px 6px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#ff3b30",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s",
    flexShrink: 0,
    lineHeight: 1,
  };

  const handleSelectChange = (e) => {
    e.stopPropagation();
    updateSkill(skill.id, { ...skill, proficiency: e.target.value });
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    removeSkill(skill.id);
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={itemStyle}>
        {/* Drag handle visual indicator */}
        <span style={dragHandleStyle}>
          ⋮⋮
        </span>
        
        {/* Skill name - also draggable */}
        <span style={nameStyle}>
          <span style={{ flexShrink: 0, fontSize: "14px" }}>{meta.emoji}</span>
          <strong style={{ lineHeight: "1.3" }}>
            {skill.name}
          </strong>
        </span>
        
        {/* Proficiency selector - stops propagation to prevent drag */}
        <select
          value={skill.proficiency}
          onChange={handleSelectChange}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={selectStyle}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
          <option>Expert</option>
        </select>
        
        {/* Delete button - stops propagation to prevent drag */}
        <button
          onClick={handleRemove}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ff1f1f"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff3b30"}
        >
          🗑
        </button>
      </div>
    </li>
  );
}