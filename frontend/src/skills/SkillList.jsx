import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SkillItem from "./SkillItem";
import SkillForm from "./SkillForm";

const API_URL = "http://127.0.0.1:8000/skills";

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState({});

  // Load skills from backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);

  // Add new skill
  const addSkill = async (skill) => {
    // Duplicate check only within category
    if (skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase() && s.category === skill.category)) {
      return alert("Skill already exists in this category");
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill)
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.detail);
      }

      const addedSkill = await res.json();
      setSkills([...skills, addedSkill]);
    } catch (err) {
      console.error(err);
    }
  };

  // Update skill
  const updateSkill = async (id, updatedFields) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields })
    });

    setSkills(skills.map(s => (s.id === id ? { ...s, ...updatedFields } : s)));
  };

  // Remove skill
  const removeSkill = async (id) => {
    if (!window.confirm("Remove this skill?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setSkills(skills.filter(s => s.id !== id));
  };

  // Drag-and-drop handler
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      const categorySkills = skills.filter(s => s.category === source.droppableId);
      const [removed] = categorySkills.splice(source.index, 1);
      categorySkills.splice(destination.index, 0, removed);
      const otherSkills = skills.filter(s => s.category !== source.droppableId);
      setSkills([...otherSkills, ...categorySkills]);
    } else {
      const movedSkill = skills.find(s => s.id.toString() === draggableId);
      movedSkill.category = destination.droppableId;
      setSkills([...skills]);
    }
  };

  // Group skills by category after global search
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!skill.name.toLowerCase().includes(searchTerm.toLowerCase())) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const hasSkills = Object.keys(groupedSkills).length > 0;

  return (
    <div>
      <h2>Add Skill</h2>
      <SkillForm addSkill={addSkill} existingSkills={skills} />

      {/* Global search */}
      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Search skills globally..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {!hasSkills && <p>No skills found</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(groupedSkills).map(([cat, catSkills]) => {
          const catSearchTerm = categoryFilters[cat] || "";

          // Filter skills in this category by category-specific search
          const filteredCatSkills = catSkills.filter(s =>
            s.name.toLowerCase().includes(catSearchTerm.toLowerCase())
          );

          const levelSummary = filteredCatSkills.reduce((acc, s) => {
            acc[s.proficiency] = (acc[s.proficiency] || 0) + 1;
            return acc;
          }, {});

          const exportCategory = () => {
            const blob = new Blob([JSON.stringify({ [cat]: filteredCatSkills }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${cat}_skills.json`;
            link.click();
          };

          return (
            <div key={cat} style={{ marginBottom: "20px" }}>
              <h3>
                {cat} ({filteredCatSkills.length})
                <button onClick={exportCategory} style={{ marginLeft: "10px" }}>Export</button>
              </h3>

              {/* Category-specific filter */}
              <input
                placeholder={`Filter ${cat} skills...`}
                value={catSearchTerm}
                onChange={(e) =>
                  setCategoryFilters({ ...categoryFilters, [cat]: e.target.value })
                }
                style={{ marginBottom: "8px" }}
              />

              <p>
                {Object.entries(levelSummary)
                  .map(([level, count]) => `${level}: ${count}`)
                  .join(", ")}
              </p>

              <Droppable droppableId={cat}>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} style={{ listStyle: "none", padding: 0 }}>
                    {filteredCatSkills.map((skill, index) => (
                      <Draggable key={skill.id} draggableId={skill.id.toString()} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px",
                              marginBottom: "5px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              background: "#f9f9f9",
                              ...provided.draggableProps.style
                            }}
                          >
                            <SkillItem
                              skill={skill}
                              updateSkill={updateSkill}
                              removeSkill={removeSkill}
                            />
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
