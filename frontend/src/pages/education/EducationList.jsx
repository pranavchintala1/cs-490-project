import React, { useEffect, useState } from "react";
import EducationForm from "./EducationForm";

export default function EducationList() {
  const [entries, setEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null);

  // Load dummy entries
  useEffect(() => {
    const dummyData = [
      {
        id: "edu1",
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        field_of_study: "Software Engineering",
        graduation_date: "2019-05-15",
        currently_enrolled: false,
        gpa: "3.8",
        gpa_private: false,
        achievements: "Dean's List, Coding Club President"
      },
      {
        id: "edu2",
        degree: "Master of Science in AI",
        institution: "Tech University",
        field_of_study: "Artificial Intelligence",
        graduation_date: "2022-12-20",
        currently_enrolled: false,
        gpa: "3.9",
        gpa_private: false,
        achievements: "Research Assistant, Published 2 papers"
      },
      {
        id: "edu3",
        degree: "Full-Stack Web Development Bootcamp",
        institution: "Online Academy",
        field_of_study: "Web Development",
        graduation_date: null,
        currently_enrolled: true,
        gpa: null,
        gpa_private: true,
        achievements: "Built multiple projects"
      }
    ];

    setEntries(dummyData);
  }, []);

  const addEntry = async (entry) => {
    const newEntry = { id: `edu${Date.now()}`, user_id: "temp_user", ...entry };
    setEntries([newEntry, ...entries]);
  };

  const submitEdit = async (updatedEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setEditEntry(null);
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setEntries(entries.filter((e) => e.id !== id));
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.currently_enrolled && !b.currently_enrolled) return -1;
    if (!a.currently_enrolled && b.currently_enrolled) return 1;
    if (!a.graduation_date) return 1;
    if (!b.graduation_date) return -1;
    return new Date(b.graduation_date) - new Date(a.graduation_date);
  });

  return (
    <div style={{ color: "#000" }}> {/* Set all text to black */}
      <h2>Education</h2>

      <EducationForm
        addEntry={addEntry}
        editEntry={editEntry ? { ...editEntry, submit: submitEdit } : null}
        cancelEdit={() => setEditEntry(null)}
      />

      {sortedEntries.length === 0 && <p>No entries yet</p>}

      <div style={{ position: "relative", marginTop: "20px" }}>
        <div
          style={{
            position: "absolute",
            left: "60px",
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "#ccc",
            zIndex: 0,
          }}
        />

        {sortedEntries.map((entry) => {
          const yearLabel = entry.currently_enrolled
            ? "Curr"
            : entry.graduation_date
            ? new Date(entry.graduation_date).getFullYear()
            : "";

          return (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "20px",
                position: "relative",
                zIndex: 1,
                color: "#000", // ensure each entry text is black
              }}
            >
              <div style={{ width: "60px", display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: entry.currently_enrolled ? "#00bcd4" : "#4caf50",
                    border: "2px solid white",
                    marginTop: "4px",
                  }}
                />
              </div>

              <div
                style={{
                  width: "50px",
                  textAlign: "right",
                  marginRight: "10px",
                  fontSize: "0.9em",
                  marginTop: "2px",
                  color: "#fff", // black year label
                }}
              >
                {yearLabel}
              </div>

              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px",
                  background: entry.currently_enrolled ? "#e0f7fa" : "#f9f9f9",
                  flex: 1,
                  color: "#000", // black entry text
                }}
              >
                <strong>{entry.degree}</strong> at <em>{entry.institution}</em>
                <p>
                  {entry.field_of_study} |{" "}
                  {entry.currently_enrolled
                    ? "Currently Enrolled"
                    : entry.graduation_date
                    ? `Graduated: ${entry.graduation_date}`
                    : ""}
                </p>
                {!entry.gpa_private && entry.gpa && <p>GPA: {entry.gpa}</p>}
                {entry.achievements && <p>Achievements: {entry.achievements}</p>}
                <button onClick={() => setEditEntry(entry)}>✏ Edit</button>
                <button onClick={() => deleteEntry(entry.id)}>🗑 Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
