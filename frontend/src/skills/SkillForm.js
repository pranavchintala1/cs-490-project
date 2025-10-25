import React, { useState } from "react";

// UC-26: Add skill form with name, category, proficiency
export default function SkillForm({ addSkill }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Technical");
  const [proficiency, setProficiency] = useState("Beginner");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Enter a skill name");
    addSkill({ name, category, proficiency });
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "16px" }}>
      <input
        placeholder="Skill name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Technical</option>
        <option>Soft Skills</option>
        <option>Languages</option>
        <option>Industry-Specific</option>
      </select>
      <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
        <option>Expert</option>
      </select>
      <button type="submit">Add Skill</button>
    </form>
  );
}
