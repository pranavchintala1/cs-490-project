import React, { useState } from "react";
import SkillForm from "./SkillForm";
import SkillCategory from "./SkillCategory";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SkillItem from "./SkillItem";

export default function SkillList() {
  const [skills, setSkills] = useState([
    { id: "1", name: "JavaScript", category: "Technical", proficiency: "Advanced", position: 0 },
    { id: "2", name: "React", category: "Technical", proficiency: "Advanced", position: 1 },
    { id: "3", name: "Node.js", category: "Technical", proficiency: "Intermediate", position: 2 },
    { id: "4", name: "Python", category: "Technical", proficiency: "Advanced", position: 3 },
    { id: "5", name: "Communication", category: "Soft Skills", proficiency: "Advanced", position: 0 },
    { id: "6", name: "Teamwork", category: "Soft Skills", proficiency: "Intermediate", position: 1 },
    { id: "7", name: "Leadership", category: "Soft Skills", proficiency: "Intermediate", position: 2 },
    { id: "8", name: "English", category: "Languages", proficiency: "Expert", position: 0 },
    { id: "9", name: "Spanish", category: "Languages", proficiency: "Intermediate", position: 1 },
    { id: "10", name: "Project Management", category: "Industry-Specific", proficiency: "Advanced", position: 0 },
    { id: "11", name: "Agile", category: "Industry-Specific", proficiency: "Intermediate", position: 1 },
  ]);

  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  const categories = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

  const addSkill = (skill) => {
    const categorySkills = skills.filter(s => s.category === skill.category);
    const newPosition = categorySkills.length;
    const newSkill = { ...skill, id: String(Date.now()), position: newPosition };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id, updatedFields) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const removeSkill = (id) => {
    if (!window.confirm("Remove this skill?")) return;
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!active || !over) return;

    const activeSkill = skills.find((s) => s.id === active.id);
    if (!activeSkill) return;

    let newCategory = activeSkill.category;
    let newPosition = 0;

    if (over.id.toString().startsWith('droppable-')) {
      newCategory = over.id.toString().replace('droppable-', '');
      const categorySkills = skills.filter((s) => s.category === newCategory && s.id !== activeSkill.id);
      newPosition = categorySkills.length;
    } else {
      const overSkill = skills.find((s) => s.id === over.id);
      if (overSkill) {
        newCategory = overSkill.category;
        newPosition = overSkill.position;
      }
    }

    const oldCategory = activeSkill.category;
    const oldPosition = activeSkill.position;

    if (oldCategory === newCategory && oldPosition === newPosition) return;

    const updatedSkills = skills.map((s) => {
      if (s.id === activeSkill.id) {
        return { ...s, category: newCategory, position: newPosition };
      }

      if (s.category === newCategory) {
        if (oldCategory === newCategory) {
          if (oldPosition < newPosition && s.position > oldPosition && s.position <= newPosition)
            return { ...s, position: s.position - 1 };
          if (oldPosition > newPosition && s.position >= newPosition && s.position < oldPosition)
            return { ...s, position: s.position + 1 };
        } else {
          if (s.position >= newPosition) return { ...s, position: s.position + 1 };
        }
      }

      if (s.category === oldCategory && oldCategory !== newCategory) {
        if (s.position > oldPosition) return { ...s, position: s.position - 1 };
      }

      return s;
    });

    setSkills(updatedSkills);
  };

  const activeSkillObj = skills.find((s) => s.id === activeId);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!skill.name || !skill.name.toLowerCase().includes(searchTerm.toLowerCase())) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  Object.keys(groupedSkills).forEach(cat => {
    groupedSkills[cat].sort((a, b) => a.position - b.position);
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 20px 0", color: "#333" }}>Skills Tracker</h1>

      <SkillForm addSkill={addSkill} existingSkills={skills} />

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="🔍 Search all skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "12px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxSizing: "border-box"
          }}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: "16px",
            marginBottom: "20px"
          }}>
            {categories.map((cat) => (
              <SkillCategory
                key={cat}
                category={cat}
                skills={groupedSkills[cat] || []}
                updateSkill={updateSkill}
                removeSkill={removeSkill}
                activeId={activeId}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeSkillObj && (
            <div style={{ cursor: "grabbing", width: "300px" }}>
              <SkillItem
                skill={activeSkillObj}
                updateSkill={() => {}}
                removeSkill={() => {}}
                isOverlay={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}