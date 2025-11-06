import React, { useEffect, useState } from "react";
import EducationForm from "./EducationForm";

const degreeEmojis = {
  "High School": "🏫",
  "Associate": "📘",
  "Bachelor's": "🎓",
  "Master's": "📚",
  "PhD": "🔬",
  "Certificate": "📜",
  "Bootcamp": "💻"
};

const degreeColors = {
  "High School": "#9e9e9e",
  "Associate": "#2196f3",
  "Bachelor's": "#4caf50",
  "Master's": "#ff9800",
  "PhD": "#af52de",
  "Certificate": "#34c759",
  "Bootcamp": "#ff3b30"
};

export default function EducationList() {
  const [entries, setEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const dummyData = [
      {
        id: "edu1",
        degree: "Bachelor's",
        institution: "University of Technology",
        field_of_study: "Computer Science",
        graduation_date: "2019-05-15",
        currently_enrolled: false,
        gpa: "3.8",
        gpa_private: false,
        achievements: "Dean's List, Coding Club President, Graduated with Honors"
      },
      {
        id: "edu2",
        degree: "Master's",
        institution: "Tech University",
        field_of_study: "Artificial Intelligence",
        graduation_date: "2022-12-20",
        currently_enrolled: false,
        gpa: "3.9",
        gpa_private: false,
        achievements: "Research Assistant, Published 2 papers in ML conferences"
      },
      {
        id: "edu3",
        degree: "Bootcamp",
        institution: "Online Academy",
        field_of_study: "Full-Stack Web Development",
        graduation_date: null,
        currently_enrolled: true,
        gpa: null,
        gpa_private: true,
        achievements: "Built multiple full-stack projects, Top 5% of cohort"
      }
    ];

    setEntries(dummyData);
  }, []);

  const addEntry = async (entry) => {
    const newEntry = { id: `edu${Date.now()}`, user_id: "temp_user", ...entry };
    setEntries([newEntry, ...entries]);
    setShowForm(false);
    alert("✅ Education added successfully!");
  };

  const submitEdit = async (updatedEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setEditEntry(null);
    setShowForm(false);
    alert("✅ Education updated successfully!");
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this education entry?")) return;
    setEntries(entries.filter((e) => e.id !== id));
    alert("✅ Education deleted successfully!");
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.currently_enrolled && !b.currently_enrolled) return -1;
    if (!a.currently_enrolled && b.currently_enrolled) return 1;
    if (!a.graduation_date) return 1;
    if (!b.graduation_date) return -1;
    return new Date(b.graduation_date) - new Date(a.graduation_date);
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px" 
      }}>
        <h1 style={{ margin: 0, color: "#333" }}>🎓 Education History</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditEntry(null);
          }}
          style={{
            padding: "12px 24px",
            background: "#4f8ef7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {showForm ? "← Cancel" : "+ Add Education"}
        </button>
      </div>

      {showForm && (
        <EducationForm
          addEntry={addEntry}
          editEntry={editEntry ? { ...editEntry, submit: submitEdit } : null}
          cancelEdit={() => {
            setEditEntry(null);
            setShowForm(false);
          }}
        />
      )}

      {sortedEntries.length === 0 ? (
        <div style={{
          background: "#f9f9f9",
          padding: "40px",
          borderRadius: "8px",
          textAlign: "center",
          color: "#999"
        }}>
          <p style={{ fontSize: "16px" }}>No education entries yet. Add your first one!</p>
        </div>
      ) : (
        <div style={{ position: "relative", marginTop: "40px" }}>
          {/* Timeline vertical line */}
          <div
            style={{
              position: "absolute",
              left: "30px",
              top: "8px",
              bottom: 0,
              width: "3px",
              background: "linear-gradient(to bottom, #4f8ef7, #e0e0e0)",
              zIndex: 0,
            }}
          />

          {sortedEntries.map((entry, index) => {
            const yearLabel = entry.currently_enrolled
              ? "Present"
              : entry.graduation_date
              ? new Date(entry.graduation_date).getFullYear()
              : "N/A";

            const emoji = degreeEmojis[entry.degree] || "🎓";
            const color = degreeColors[entry.degree] || "#4f8ef7";

            return (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: "30px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Timeline dot */}
                <div style={{ 
                  width: "60px", 
                  display: "flex", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "3px solid white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px"
                    }}
                  />
                </div>

                {/* Year label */}
                <div
                  style={{
                    width: "80px",
                    textAlign: "right",
                    marginRight: "20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    marginTop: "6px",
                    color: entry.currently_enrolled ? "#4f8ef7" : "#666",
                    flexShrink: 0
                  }}
                >
                  {yearLabel}
                </div>

                {/* Content card */}
                <div
                  style={{
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    background: entry.currently_enrolled 
                      ? "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)" 
                      : "white",
                    flex: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    borderLeft: `4px solid ${color}`
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "start",
                    marginBottom: "12px" 
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        marginBottom: "4px"
                      }}>
                        <span style={{ fontSize: "24px" }}>{emoji}</span>
                        <h3 style={{ 
                          margin: 0, 
                          color: "#333",
                          fontSize: "18px"
                        }}>
                          {entry.degree}
                        </h3>
                      </div>
                      <p style={{ 
                        margin: "4px 0", 
                        fontSize: "16px", 
                        fontWeight: "600",
                        color: "#4f8ef7"
                      }}>
                        {entry.institution}
                      </p>
                      <p style={{ 
                        margin: "4px 0", 
                        fontSize: "14px", 
                        color: "#666"
                      }}>
                        📚 {entry.field_of_study}
                      </p>
                    </div>

                    {entry.currently_enrolled && (
                      <span style={{
                        background: "#4f8ef7",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}>
                        In Progress
                      </span>
                    )}
                  </div>

                  {!entry.gpa_private && entry.gpa && (
                    <div style={{ 
                      marginBottom: "8px",
                      padding: "8px 12px",
                      background: "#f0f7ff",
                      borderRadius: "4px",
                      display: "inline-block"
                    }}>
                      <strong style={{ color: "#333" }}>GPA:</strong>{" "}
                      <span style={{ 
                        color: "#4f8ef7", 
                        fontWeight: "600",
                        fontSize: "15px"
                      }}>
                        {entry.gpa}
                      </span>
                    </div>
                  )}

                  {entry.achievements && (
                    <div style={{ 
                      marginTop: "12px",
                      padding: "12px",
                      background: "#fffbea",
                      borderRadius: "6px",
                      borderLeft: "3px solid #ffc107"
                    }}>
                      <strong style={{ color: "#333", fontSize: "14px" }}>
                        🏆 Achievements:
                      </strong>
                      <p style={{ 
                        margin: "6px 0 0 0", 
                        color: "#555",
                        fontSize: "13px",
                        lineHeight: "1.6"
                      }}>
                        {entry.achievements}
                      </p>
                    </div>
                  )}

                  <div style={{ 
                    display: "flex", 
                    gap: "10px", 
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #eee"
                  }}>
                    <button
                      onClick={() => {
                        setEditEntry(entry);
                        setShowForm(true);
                      }}
                      style={{
                        padding: "8px 16px",
                        background: "#34c759",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#ff3b30",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}