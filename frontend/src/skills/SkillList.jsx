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
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

const API_URL = process.env.REACT_APP_API_URL + "/skills";
const USER_ID = process.env.REACT_APP_USER_ID;

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}?user_id=${USER_ID}`);
      const data = await res.json();
      setSkills(data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const addSkill = async (skill) => {
    if (
      skills.some(
        (s) =>
          s.name.toLowerCase() === skill.name.toLowerCase() &&
          s.category === skill.category
      )
    ) {
      return alert("Skill already exists in this category");
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...skill, user_id: USER_ID }),
      });
      const addedSkill = await res.json();
      setSkills((prev) => [...prev, addedSkill]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSkill = async (id, updatedFields) => {
    try {
      await fetch(`${API_URL}/${id}?user_id=${USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const removeSkill = async (id) => {
    if (!window.confirm("Remove this skill?")) return;
    try {
      await fetch(`${API_URL}/${id}?user_id=${USER_ID}`, { method: "DELETE" });
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
  const { active, over } = event;
  setActiveId(null);
  if (!active || !over) return;

  const activeSkill = skills.find((s) => s.id === active.id);

  let targetCategory = activeSkill.category;

  // If over.id is a category id, not a skill id, assign that category
  const overSkill = skills.find((s) => s.id === over.id);
  if (overSkill) {
    targetCategory = overSkill.category;
  } else if (["Technical", "Soft Skills", "Languages", "Industry-Specific"].includes(over.id)) {
    targetCategory = over.id;
  }

  // Update category if changed
  if (activeSkill.category !== targetCategory) {
    activeSkill.category = targetCategory;
  }

  // Reorder: move to the end of the category
  const newSkills = skills.filter(s => s.id !== activeSkill.id);
  const categorySkills = newSkills.filter(s => s.category === targetCategory);
  const insertIndex = newSkills.findIndex(s => s.category === targetCategory) + categorySkills.length;
  newSkills.splice(insertIndex, 0, activeSkill);

  // Update positions
  newSkills.forEach((s, idx) => (s.position = idx));

  setSkills(newSkills);
  await updateSkill(activeSkill.id, activeSkill);
};

  const activeSkillObj = skills.find((s) => s.id === activeId);

  // --- Global search ---
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!skill.name.toLowerCase().includes(searchTerm.toLowerCase())) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categories = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

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
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
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
