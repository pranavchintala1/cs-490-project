import React, { useEffect, useState } from "react";
import EducationForm from "./EducationForm";

const API_URL = "http://127.0.0.1:8000/education";

export default function EducationList() {
  const [entries, setEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null);

  // Load entries
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
        else setEntries([]);
      })
      .catch((err) => console.error(err));
  }, []);

  // Add entry
  const addEntry = async (entry) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
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
      await fetch(`${API_URL}/${updatedEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });
      setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
      setEditEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete entry
  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Sort entries: currently enrolled first, then by graduation date descending
  const sortedEntries = Array.isArray(entries)
    ? [...entries].sort((a, b) => {
        if (a.currently_enrolled && !b.currently_enrolled) return -1;
        if (!a.currently_enrolled && b.currently_enrolled) return 1;
        if (!a.graduation_date) return 1;
        if (!b.graduation_date) return -1;
        return new Date(b.graduation_date) - new Date(a.graduation_date);
      })
    : [];

  return (
    <div>
      <h2>Education</h2>

      <EducationForm
        addEntry={addEntry}
        editEntry={editEntry ? { ...editEntry, submit: submitEdit } : null}
        cancelEdit={() => setEditEntry(null)}
      />

      {sortedEntries.length === 0 && <p>No entries yet</p>}

      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            marginBottom: "8px",
            background: entry.currently_enrolled ? "#e0f7fa" : "#f9f9f9",
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
      ))}
    </div>
  );
}
