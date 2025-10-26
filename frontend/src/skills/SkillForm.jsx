import React, { useState, useEffect } from "react";

// Common skills by category
const commonSkillsByCategory = {
Technical: [
    "Python", "JavaScript", "Java", "C++", "C#", "SQL", "React", "Node.js",
    "Angular", "Vue.js", "TypeScript", "HTML", "CSS", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "Linux", "REST API", "GraphQL", "Machine Learning",
    "Data Analysis", "CI/CD"
  ],
  "Soft Skills": [
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Time Management",
    "Adaptability", "Creativity", "Critical Thinking", "Conflict Resolution",
    "Decision Making", "Empathy", "Networking", "Presentation Skills", "Negotiation",
    "Collaboration", "Mentoring", "Active Listening", "Resilience", "Motivation",
    "Emotional Intelligence", "Organization", "Persuasion", "Stress Management",
    "Customer Service", "Flexibility"
  ],
  Languages: [
    "English", "Spanish", "French", "Mandarin", "German", "Japanese", "Korean",
    "Arabic", "Portuguese", "Russian", "Italian", "Hindi", "Bengali", "Turkish",
    "Vietnamese", "Persian", "Dutch", "Swedish", "Norwegian", "Polish", "Greek",
    "Thai", "Urdu", "Hebrew", "Finnish"
  ],
  "Industry-Specific": [
    "Project Management", "Quality Assurance", "Regulatory Compliance", "Finance",
    "Healthcare", "Marketing", "Sales", "Operations", "Supply Chain", "Logistics",
    "Human Resources", "Legal", "Risk Management", "Engineering", "Construction",
    "Education", "Research", "Customer Experience", "Data Privacy", "Cybersecurity",
    "Pharmaceuticals", "Energy", "Telecommunications", "Real Estate", "Insurance"
  ]
};

export default function SkillForm({ addSkill, existingSkills }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Technical");
  const [proficiency, setProficiency] = useState("Beginner");
  const [suggestions, setSuggestions] = useState([]);

  // Update suggestions whenever name or category changes
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
    if (!name.trim()) return alert("Enter a skill name");
    addSkill({ name: name.trim(), category, proficiency });
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "16px", position: "relative" }}>
      <input
        placeholder="Skill name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "200px" }}
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
