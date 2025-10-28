import React, { useState } from "react";
import { SortableItem } from "./SortableItem";
import { useDroppable } from "@dnd-kit/core";

export default function SkillCategory({ category, skills, updateSkill, removeSkill, activeId }) {
  const [filterTerm, setFilterTerm] = useState("");

  // Register the category as a droppable
  const { setNodeRef: droppableRef } = useDroppable({ id: category });

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
        marginBottom: "20px",
        padding: "10px",
        border: "1px dashed #ccc",
        borderRadius: "8px",
        minHeight: "60px",
      }}
    >
      <h3>
        {category} ({skills.length})
        <button onClick={exportCategory} style={{ marginLeft: "10px" }}>
          Export
        </button>
      </h3>

      <input
        placeholder={`Filter ${category} skills...`}
        value={filterTerm}
        onChange={(e) => setFilterTerm(e.target.value)}
        style={{ marginBottom: "8px", width: "100%" }}
      />

      <p>
        {Object.entries(proficiencySummary)
          .map(([l, c]) => `${l}: ${c}`)
          .join(", ")}
      </p>

      <ul
        ref={droppableRef} // register droppable here
        style={{ padding: 0, listStyle: "none", minHeight: "40px" }}
      >
        {filteredSkills.length ? (
          filteredSkills.map((skill) => (
            <SortableItem
              key={skill.id}
              skill={skill}
              updateSkill={updateSkill}
              removeSkill={removeSkill}
            />
          ))
        ) : (
          <li
            style={{
              padding: "20px 0",
              color: "#aaa",
              textAlign: "center",
              minHeight: "40px",
            }}
          >
            Drop skills here
          </li>
        )}
      </ul>
    </div>
  );
}
