import { useState, useEffect } from "react";

export default function CoverLetterForm({ onAdded, editEntry, cancelEdit }) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    position: "",
    content: ""
  });

  useEffect(() => {
    if (editEntry) setForm(editEntry);
  }, [editEntry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Please fill out at least a title and content.");
      return;
    }
    onAdded(form);
    setForm({ title: "", company: "", position: "", content: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          name="content"
          placeholder="Your cover letter content..."
          value={form.content}
          onChange={handleChange}
          rows={6}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          style={{ padding: "8px 16px", background: "#4f8ef7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {editEntry ? "Update" : "Add"} Cover Letter
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          style={{ padding: "8px 16px", background: "#ccc", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
