import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// API URL
const API_URL = "http://127.0.0.1:8000/skills";

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Beginner");
  const [searchTerm, setSearchTerm] = useState("");

  // U26: Load skills from backend
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setSkills(data));
  }, []);

  // U26: Add skill
  const addSkill = async () => {
    if (!newSkillName.trim()) return alert("Enter a skill name");

    const skill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.detail);
      }

      const addedSkill = await res.json();
      setSkills([...skills, addedSkill]);
      setNewSkillName("");
    } catch (err) {
      console.error(err);
    }
  };

  // U26: Update skill
  const updateSkill = async (id, updatedFields) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields }),
    });

    setSkills(
      skills.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  // U26: Remove skill
  const removeSkill = async (id) => {
    if (!window.confirm("Remove this skill?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setSkills(skills.filter((s) => s.id !== id));
  };

  // U27: Handle drag-and-drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // reorder within same category
      const categorySkills = skills.filter(
        (s) => s.category === source.droppableId
      );
      const [removed] = categorySkills.splice(source.index, 1);
      categorySkills.splice(destination.index, 0, removed);

      // merge back with other categories
      const otherSkills = skills.filter((s) => s.category !== source.droppableId);
      setSkills([...otherSkills, ...categorySkills]);
    } else {
      // move to different category
      const movedSkill = skills.find((s) => s.id.toString() === draggableId);
      movedSkill.category = destination.droppableId;
      setSkills([...skills]);
    }
  };

  // U27: Group skills by category for rendering
  const groupedSkills = skills
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});

  return (
    <div>
      {/* U26: Add skill form */}
      <h2>Add Skill</h2>
      <input
        placeholder="Skill name"
        value={newSkillName}
        onChange={(e) => setNewSkillName(e.target.value)}
      />
      <select
        value={newSkillCategory}
        onChange={(e) => setNewSkillCategory(e.target.value)}
      >
        <option>Technical</option>
        <option>Soft Skills</option>
        <option>Languages</option>
        <option>Industry-Specific</option>
      </select>
      <select
        value={newSkillProficiency}
        onChange={(e) => setNewSkillProficiency(e.target.value)}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
        <option>Expert</option>
      </select>
      <button onClick={addSkill}>Add Skill</button>

      {/* U27: Search/filter skills globally */}
      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* U27: Render grouped skills with drag-and-drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(groupedSkills).map(([cat, catSkills]) => {
          // U27: Category-based skill level summaries
          const levelSummary = catSkills.reduce((acc, s) => {
            acc[s.proficiency] = (acc[s.proficiency] || 0) + 1;
            return acc;
          }, {});

          // U27: Export per category
          const exportCategory = () => {
            const blob = new Blob(
              [JSON.stringify({ [cat]: catSkills }, null, 2)],
              { type: "application/json" }
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${cat}_skills.json`;
            link.click();
          };

          return (
            <div key={cat} style={{ marginBottom: "20px" }}>
              <h3>
                {cat} ({catSkills.length})
                <button onClick={exportCategory} style={{ marginLeft: "10px" }}>
                  Export
                </button>
              </h3>
              <p>
                {Object.entries(levelSummary)
                  .map(([level, count]) => `${level}: ${count}`)
                  .join(", ")}
              </p>

              <Droppable droppableId={cat}>
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ listStyle: "none", padding: 0 }}
                  >
                    {catSkills.map((skill, index) => (
                      <Draggable
                        key={skill.id}
                        draggableId={skill.id.toString()}
                        index={index}
                      >
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
                              ...provided.draggableProps.style,
                            }}
                          >
                            <span>
                              <strong>{skill.name}</strong> -{" "}
                              <select
                                value={skill.proficiency}
                                onChange={(e) =>
                                  updateSkill(skill.id, {
                                    proficiency: e.target.value,
                                    category: skill.category,
                                  })
                                }
                              >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                                <option>Expert</option>
                              </select>
                            </span>
                            <button onClick={() => removeSkill(skill.id)}>🗑</button>
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