import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SkillItem from "./SkillItem";
import SkillForm from "./SkillForm";

const API_URL = process.env.REACT_APP_API_URL + "/skills";
const USER_ID = process.env.REACT_APP_USER_ID;

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState({});

  useEffect(() => {
    fetch(`${API_URL}?user_id=${USER_ID}`)
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);

  const addSkill = async (skill) => {
    if (skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
      return alert("Skill already exists");
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...skill, user_id: USER_ID })
      });
      const addedSkill = await res.json();
      setSkills([...skills, addedSkill]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSkill = async (id, updatedFields) => {
    await fetch(`${API_URL}/${id}?user_id=${USER_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    });
    setSkills(skills.map(s => (s.id === id ? { ...s, ...updatedFields } : s)));
  };

  const removeSkill = async (id) => {
    if (!window.confirm("Remove this skill?")) return;
    await fetch(`${API_URL}/${id}?user_id=${USER_ID}`, { method: "DELETE" });
    setSkills(skills.filter(s => s.id !== id));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const movedSkill = skills.find(s => s.id.toString() === draggableId);
    if (!movedSkill) return;

    const newSkills = [...skills];

    // Remove from old index
    const sourceIndex = newSkills.findIndex(s => s.id === movedSkill.id);
    newSkills.splice(sourceIndex, 1);

    // Insert at new index among destination category
    const destIndices = newSkills
      .map((s, idx) => (s.category === destination.droppableId ? idx : -1))
      .filter(idx => idx !== -1);

    // Calculate insertion index in the full array
    let insertAt = destination.index < destIndices.length
      ? destIndices[destination.index]
      : destIndices[destIndices.length - 1] + 1;

    movedSkill.category = destination.droppableId;
    newSkills.splice(insertAt, 0, movedSkill);

    // Reassign positions for all skills in the same category
    const categoriesToUpdate = Array.from(new Set([source.droppableId, destination.droppableId]));
    for (let cat of categoriesToUpdate) {
      let catSkills = newSkills.filter(s => s.category === cat);
      catSkills.forEach((s, idx) => s.position = idx);
    }

    setSkills(newSkills);

    // Push updates to backend
    for (let s of newSkills.filter(s => categoriesToUpdate.includes(s.category))) {
      await fetch(`${API_URL}/${s.id}?user_id=${USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: s.category, position: s.position })
      });
    }
  };

  // Group skills by category after search
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
          const filteredCatSkills = catSkills.filter(s =>
            s.name.toLowerCase().includes(catSearchTerm.toLowerCase())
          );

          const levelSummary = filteredCatSkills.reduce((acc, s) => {
            acc[s.proficiency] = (acc[s.proficiency] || 0) + 1;
            return acc;
          }, {});

          const exportCategory = () => {
            let text = `${cat} (${filteredCatSkills.length})\n`;
            text += Object.entries(levelSummary)
              .map(([level, count]) => `${level}: ${count}`)
              .join(", ") + "\n\n";
            filteredCatSkills.forEach(s => {
              text += `• ${s.name} - ${s.proficiency}\n`;
            });
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${cat}_skills.txt`;
            link.click();
          };

          return (
            <div key={cat} style={{ marginBottom: "20px" }}>
              <h3>
                {cat} ({filteredCatSkills.length})
                <button onClick={exportCategory} style={{ marginLeft: "10px" }}>Export</button>
              </h3>

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
