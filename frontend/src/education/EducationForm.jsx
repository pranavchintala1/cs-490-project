import React, { useState, useEffect } from "react";

export default function EducationForm({ addEntry, editEntry, cancelEdit }) {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState(""); // start empty to force selection
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [currentlyEnrolled, setCurrentlyEnrolled] = useState(false);
  const [gpa, setGpa] = useState("");
  const [gpaPrivate, setGpaPrivate] = useState(false);
  const [achievements, setAchievements] = useState("");
  const [id, setId] = useState(null);

  const resetForm = () => {
    setInstitution("");
    setDegree("");
    setFieldOfStudy("");
    setGraduationDate("");
    setCurrentlyEnrolled(false);
    setGpa("");
    setGpaPrivate(false);
    setAchievements("");
    setId(null);
  };

  useEffect(() => {
    if (editEntry) {
      setInstitution(editEntry.institution);
      setDegree(editEntry.degree || "");
      setFieldOfStudy(editEntry.field_of_study);
      setGraduationDate(editEntry.graduation_date || "");
      setCurrentlyEnrolled(editEntry.currently_enrolled);
      setGpa(editEntry.gpa || "");
      setGpaPrivate(editEntry.gpa_private || false);
      setAchievements(editEntry.achievements || "");
      setId(editEntry.id);
    } else {
      resetForm();
    }
  }, [editEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!institution.trim() || !degree.trim() || !fieldOfStudy.trim()) {
      return alert("Please fill in all required fields.");
    }

    if (!degree) {
      return alert("Please select an Education Level.");
    }

    if (!currentlyEnrolled && !graduationDate) {
      return alert(
        "Please provide a graduation date or mark as currently enrolled."
      );
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

    resetForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: "20px",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "4px",
      }}
    >
      <h3>{editEntry ? "Edit Education" : "Add Education"}</h3>

      <input
        placeholder="Institution Name"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        required
      />

      <select
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        required
      >
        <option value="" disabled>
          Education Level
        </option>
        <option value="High School">High School</option>
        <option value="Associate">Associate</option>
        <option value="Bachelor's">Bachelor's</option>
        <option value="Master's">Master's</option>
        <option value="PhD">PhD</option>
      </select>

      <input
        placeholder="Field of Study"
        value={fieldOfStudy}
        onChange={(e) => setFieldOfStudy(e.target.value)}
        required
      />

      <div>
        {!currentlyEnrolled && (
          <input
            type="date"
            value={graduationDate}
            onChange={(e) => setGraduationDate(e.target.value)}
            required={!currentlyEnrolled}
          />
        )}
        <label>
          <input
            type="checkbox"
            checked={currentlyEnrolled}
            onChange={(e) => setCurrentlyEnrolled(e.target.checked)}
          />{" "}
          Currently Enrolled
        </label>
      </div>

      <div>
        <input
          placeholder="GPA"
          type="number"
          step="0.1"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={gpaPrivate}
            onChange={(e) => setGpaPrivate(e.target.checked)}
          />{" "}
          GPA Private
        </label>
      </div>

      <textarea
        placeholder="Achievements / Honors"
        value={achievements}
        onChange={(e) => setAchievements(e.target.value)}
      />

      <button type="submit">{editEntry ? "Save" : "Add"}</button>
      {editEntry && (
        <button
          type="button"
          onClick={() => {
            cancelEdit();
            resetForm();
          }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
