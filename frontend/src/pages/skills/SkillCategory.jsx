import React, { useState } from "react";
import SkillItem from "./SkillItem";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function SkillCategory({ category, skills, updateSkill, removeSkill, activeId }) {
  const [filterTerm, setFilterTerm] = useState("");

  // Register the category as a droppable with the category name as ID
  const { setNodeRef: droppableRef, isOver } = useDroppable({ 
    id: `droppable-${category}` 
  });

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(filterTerm.toLowerCase())
  );

  const proficiencySummary = skills.reduce((acc, s) => {
    acc[s.proficiency] = (acc[s.proficiency] || 0) + 1;
    return acc;
  }, {});

  const exportCategory = () => {
    let text = `${category} (${skills.length})\n`;
    text += Object.entries(proficiencySummary)
      .map(([level, count]) => `${level}: ${count}`)
      .join(", ") + "\n\n";
    skills.forEach((s) => {
      text += `• ${s.name} - ${s.proficiency}\n`;
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${category}_skills.txt`;
    link.click();
  };

  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "10px", fontSize: "18px" }}>
        {category} ({skills.length})
        <button onClick={exportCategory} style={{ marginLeft: "10px", fontSize: "12px", padding: "4px 8px" }}>
          Export
        </button>
      </h3>

      <input
        placeholder={`Filter ${category} skills...`}
        value={filterTerm}
        onChange={(e) => setFilterTerm(e.target.value)}
        style={{ marginBottom: "8px", padding: "6px", width: "100%", boxSizing: "border-box" }}
      />

      <p style={{ fontSize: "20px", marginBottom: "10px" }}>
        {Object.entries(proficiencySummary)
          .map(([l, c]) => `${l}: ${c}`)
          .join(", ") || "No skills yet"}
      </p>

      <SortableContext 
        items={filteredSkills.map(s => s.id)} 
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={droppableRef}
          style={{ 
            padding: "10px", 
            margin: 0,
            listStyle: "none", 
            minHeight: "100px",
            backgroundColor: isOver ? "#e8f4f8" : (filteredSkills.length === 0 ? "#f8f8f8" : "transparent"),
            borderRadius: "4px",
            transition: "background-color 0.2s",
            border: isOver ? "2px dashed #4f8ef7" : "2px dashed transparent",
            flexGrow: 1,
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                updateSkill={updateSkill}
                removeSkill={removeSkill}
              />
            ))
          ) : (
            <li style={{ 
              padding: "20px", 
              color: "#999", 
              textAlign: "center",
              pointerEvents: "none",
              listStyle: "none",
            }}>
              {isOver ? "Drop here" : "No skills - drag items here or add new ones"}
            </li>
          )}
        </ul>
      </SortableContext>
    </div>
  );
}