import React, { useState, useEffect } from "react";

const commonSkillsByCategory = {
  Technical: [
    "Python", "JavaScript", "Java", "C++", "C#", "SQL", "React", "Node.js",
    "Angular", "Vue.js", "TypeScript", "HTML", "CSS", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "Linux", "REST API", "GraphQL", "Machine Learning",
    "Data Analysis", "CI/CD"
  ],
  "Soft Skills": [
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Time Management",
    "Adaptability", "Creativity", "Critical Thinking", "Conflict Resolution", "Decision Making",
    "Empathy", "Networking", "Presentation Skills", "Negotiation", "Collaboration",
    "Mentoring", "Active Listening", "Resilience", "Motivation", "Emotional Intelligence",
    "Organization", "Persuasion", "Stress Management", "Customer Service", "Flexibility"
  ],
  Languages: [
    "English", "Spanish", "French", "Mandarin", "German", "Japanese", "Korean",
    "Arabic", "Portuguese", "Russian", "Italian", "Hindi", "Bengali", "Turkish",
    "Vietnamese", "Persian", "Dutch", "Swedish", "Norwegian", "Polish", "Greek",
    "Thai", "Urdu", "Hebrew", "Finnish", "Cantonese"
  ],
  "Industry-Specific": [
    "Project Management", "Finance", "Healthcare", "Quality Assurance", "Regulatory Compliance",
    "Marketing", "Sales", "Operations", "Supply Chain", "Logistics",
    "Human Resources", "Legal", "Risk Management", "Engineering", "Construction",
    "Education", "Research", "Customer Experience", "Data Privacy", "Cybersecurity",
    "Pharmaceuticals", "Energy", "Telecommunications", "Real Estate", "Insurance"
  ]
};

const USER_ID = process.env.REACT_APP_USER_ID;

export default function SkillForm({ addSkill, existingSkills }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const categorySkills = commonSkillsByCategory[category] || [];
    const filtered = categorySkills.filter(skill =>
      skill.toLowerCase().startsWith(name.toLowerCase()) &&
      skill.toLowerCase() !== name.toLowerCase() &&
      !existingSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
    );
    setSuggestions(name.trim() ? filtered : []);
  }, [name, category, existingSkills]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return alert("Please enter a skill name");
    if (!category) return alert("Please select a skill category");
    if (!proficiency) return alert("Please select a proficiency level");

    // Prevent duplicates globally
    if (existingSkills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      return alert("Skill already exists");
    }

    addSkill({
      user_id: USER_ID,
      name: trimmedName,
      category,
      proficiency
    });

    setName("");
    setCategory("");
    setProficiency("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "16px", position: "relative" }}>
      <input
        placeholder="Skill name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "200px" }}
        required
      />
      {suggestions.length > 0 && (
        <ul style={{
          border: "1px solid #ccc",
          maxHeight: "120px",
          overflowY: "auto",
          marginTop: "0",
          paddingLeft: "5px",
          listStyle: "none",
          position: "absolute",
          backgroundColor: "white",
          zIndex: 10,
          width: "200px"
        }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: "4px", cursor: "pointer" }}
              onClick={() => setName(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
        <option value="" disabled>Skill Category</option>
        <option value="Technical">Technical</option>
        <option value="Soft Skills">Soft Skills</option>
        <option value="Languages">Languages</option>
        <option value="Industry-Specific">Industry-Specific</option>
      </select>
      <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} required>
        <option value="" disabled>Proficiency Level</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="Expert">Expert</option>
      </select>
      <button type="submit">Add Skill</button>
    </form>
  );
}
