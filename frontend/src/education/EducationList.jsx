import React, { useEffect, useState } from "react";
import EducationForm from "./EducationForm";

const API_URL = process.env.REACT_APP_API_URL + "/education/";

export default function EducationList() {
  const [entries, setEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null);

  // Load entries
  useEffect(() => {
    fetch(`${API_URL}?user_id=temp_user`)
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  // Add entry
  const addEntry = async (entry) => {
    try {
      const entryWithUser = { user_id: "temp_user", ...entry };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryWithUser),
      });
      const newEntry = await res.json();
      setEntries([newEntry, ...entries]);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit edit
  const submitEdit = async (updatedEntry) => {
    try {
      const { id, ...body } = updatedEntry;
      const res = await fetch(`${API_URL}${id}?user_id=temp_user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
      setEditEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete entry
  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await fetch(`${API_URL}${id}?user_id=temp_user`, { method: "DELETE" });
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Sort entries
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.currently_enrolled && !b.currently_enrolled) return -1;
    if (!a.currently_enrolled && b.currently_enrolled) return 1;
    if (!a.graduation_date) return 1;
    if (!b.graduation_date) return -1;
    return new Date(b.graduation_date) - new Date(a.graduation_date);
  });

  return (
    <div>
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
            ? "Present"
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
                  color: "#555",
                  marginTop: "2px",
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
