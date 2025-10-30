import React, { useEffect, useState } from "react";
import SkillForm from "./SkillForm";
import SkillCategory from "./SkillCategory";
import SkillItem from "./SkillItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  const categories = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

  // --- Dummy data fetch ---
  const fetchSkills = async () => {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500)); // simulate delay

    const dummySkills = [
      { id: "1", name: "JavaScript", category: "Technical", proficiency: "Advanced", position: 0 },
      { id: "2", name: "React", category: "Technical", proficiency: "Advanced", position: 1 },
      { id: "3", name: "Node.js", category: "Technical", proficiency: "Intermediate", position: 2 },
      { id: "4", name: "Python", category: "Technical", proficiency: "Advanced", position: 3 },
      { id: "5", name: "Communication", category: "Soft Skills", proficiency: "Advanced", position: 0 },
      { id: "6", name: "Teamwork", category: "Soft Skills", proficiency: "Intermediate", position: 1 },
      { id: "7", name: "Leadership", category: "Soft Skills", proficiency: "Intermediate", position: 2 },
      { id: "8", name: "English", category: "Languages", proficiency: "Fluent", position: 0 },
      { id: "9", name: "Spanish", category: "Languages", proficiency: "Intermediate", position: 1 },
      { id: "10", name: "Project Management", category: "Industry-Specific", proficiency: "Advanced", position: 0 },
      { id: "11", name: "Agile", category: "Industry-Specific", proficiency: "Intermediate", position: 1 },
    ];

    setSkills(dummySkills);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = (skill) => {
    const newSkill = { ...skill, id: String(Date.now()), position: skills.length };
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
    const overSkill = skills.find((s) => s.id === over.id);
    if (overSkill) newCategory = overSkill.category;

    const oldCategory = activeSkill.category;
    const oldPosition = activeSkill.position;

    const categorySkills = skills
      .filter((s) => s.category === newCategory && s.id !== activeSkill.id)
      .sort((a, b) => a.position - b.position);

    const newPosition = overSkill ? overSkill.position : categorySkills.length;

    const updatedSkills = skills.map((s) => {
      if (s.id === activeSkill.id) return { ...s, category: newCategory, position: newPosition };

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
      return s;
    });

    setSkills(updatedSkills.sort((a, b) => a.position - b.position));
  };

  const activeSkillObj = skills.find((s) => s.id === activeId);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!skill.name || !skill.name.toLowerCase().includes(searchTerm.toLowerCase())) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <h2>Add Skill</h2>
      <SkillForm addSkill={addSkill} existingSkills={skills} />

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search skills globally..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {categories.map((cat) => (
            <SortableContext
              key={cat}
              items={skills.filter((s) => s.category === cat).map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <SkillCategory
                category={cat}
                skills={groupedSkills[cat] || []}
                updateSkill={updateSkill}
                removeSkill={removeSkill}
                activeId={activeId}
              />
            </SortableContext>
          ))}
        </SortableContext>

        <DragOverlay>
          {activeSkillObj && (
            <SkillItem
              skill={activeSkillObj}
              updateSkill={updateSkill}
              removeSkill={removeSkill}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
