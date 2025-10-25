import React from "react";

// UC-26: Skill item with edit and delete functionality
export default function SkillItem({ skill, updateSkill, removeSkill }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <strong>{skill.name}</strong>

      <select
        value={skill.proficiency}
        onChange={(e) => updateSkill(skill.id, { ...skill, proficiency: e.target.value })}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
        <option>Expert</option>
      </select>

      <button onClick={() => removeSkill(skill.id)}>🗑</button>
    </div>
  );
}
