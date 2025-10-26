import React, { useState, useEffect } from "react";

// UC-028: Education form
export default function EducationForm({ addEntry, editEntry, cancelEdit }) {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("High School");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [currentlyEnrolled, setCurrentlyEnrolled] = useState(false);
  const [gpa, setGpa] = useState("");
  const [gpaPrivate, setGpaPrivate] = useState(false);
  const [achievements, setAchievements] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => {
    if (editEntry) {
      setInstitution(editEntry.institution);
      setDegree(editEntry.degree);
      setFieldOfStudy(editEntry.field_of_study);
      setGraduationDate(editEntry.graduation_date || "");
      setCurrentlyEnrolled(editEntry.currently_enrolled);
      setGpa(editEntry.gpa || "");
      setGpaPrivate(editEntry.gpa_private || false);
      setAchievements(editEntry.achievements || "");
      setId(editEntry.id);
    }
  }, [editEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim() || !fieldOfStudy.trim()) {
      return alert("Please fill in all required fields.");
    }
    if (!currentlyEnrolled && !graduationDate) {
      return alert("Please provide a graduation date or mark as currently enrolled.");
    }

    const entryData = {
      id,
      institution,
      degree,
      field_of_study: fieldOfStudy,
      graduation_date: currentlyEnrolled ? null : graduationDate,
      currently_enrolled: currentlyEnrolled,
      gpa: gpa || null,
      gpa_private: gpaPrivate,
      achievements: achievements || null,
    };

    if (editEntry) {
      editEntry.submit(entryData);
    } else {
      addEntry(entryData);
    }

    // Reset form
    setInstitution("");
    setDegree("High School");
    setFieldOfStudy("");
    setGraduationDate("");
    setCurrentlyEnrolled(false);
    setGpa("");
    setGpaPrivate(false);
    setAchievements("");
    setId(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
      <h3>{editEntry ? "Edit Education" : "Add Education"}</h3>
      <input placeholder="Institution Name" value={institution} onChange={(e) => setInstitution(e.target.value)} required />
      <select value={degree} onChange={(e) => setDegree(e.target.value)}>
        <option>High School</option>
        <option>Associate</option>
        <option>Bachelor's</option>
        <option>Master's</option>
        <option>PhD</option>
      </select>
      <input placeholder="Field of Study" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} required />
      <div>
      <label>Graduation Date </label>
      {!currentlyEnrolled && <input type="date" value={graduationDate} onChange={(e) => setGraduationDate(e.target.value)} />}
      <label>
          <input type="checkbox" checked={currentlyEnrolled} onChange={(e) => setCurrentlyEnrolled(e.target.checked)} /> Currently Enrolled
        </label>
      </div>
      <div>
        <input placeholder="GPA" type="number" step="0.01" value={gpa} onChange={(e) => setGpa(e.target.value)} />
        <label>
          <input type="checkbox" checked={gpaPrivate} onChange={(e) => setGpaPrivate(e.target.checked)} /> GPA Private
        </label>
      </div>
      <textarea placeholder="Achievements / Honors" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
      <button type="submit">{editEntry ? "Save" : "Add"}</button>
      {editEntry && <button type="button" onClick={cancelEdit}>Cancel</button>}
    </form>
  );
}
