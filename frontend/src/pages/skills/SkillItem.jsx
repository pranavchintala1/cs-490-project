import React from "react";

// Category color + emoji mapping
const categoryMeta = {
  Technical: { color: "#4f8ef7", emoji: "💻" },
  "Soft Skills": { color: "#34c759", emoji: "🗣️" },
  Languages: { color: "#ff9500", emoji: "🈯" },
  "Industry-Specific": { color: "#af52de", emoji: "🏭" }
};

export default function SkillItem({
  skill,
  updateSkill,
  removeSkill,
  listeners,
  attributes,
  setNodeRef,
  transform,
  transition
}) {
  const meta = categoryMeta[skill.category] || { color: "#ccc", emoji: "" };
  const style = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "8px",
  backgroundColor: meta.color + "33",
  marginBottom: "4px",
  width: "100%",
};

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <span style={{ flexGrow: 1 }}>{meta.emoji} <strong>{skill.name}</strong></span>
      <select
        value={skill.proficiency}
        onChange={(e) => updateSkill(skill.id, { ...skill, proficiency: e.target.value })}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
        <option>Expert</option>
      </select>
      <button
        onPointerDown={(e) => e.preventDefault()} // prevents drag start
        onClick={() => removeSkill(skill.id)}
        style={{ cursor: "pointer" }}
      >
        🗑
      </button>
    </div>
  );
}
