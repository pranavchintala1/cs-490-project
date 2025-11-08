import { useState, useEffect } from "react";
import CoverLetterForm from "./CoverLetterForm";
import { apiRequest } from "../../api";
import { renderTemplate } from "./renderTemplate"; 
import { useFlash } from "../../context/flashContext"; 

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Styles and industries
const styles = ["formal", "creative", "technical", "modern", "casual"];
const industries = [
  "Software Development", "Cybersecurity", "Fintech", "Healthcare Administration",
  "Nursing", "Education (K-12)", "Higher Education", "Digital Marketing",
  "Mechanical Engineering", "Civil Engineering", "Corporate Law", "Employment Law",
  "Recruiting", "B2B Sales", "Graphic Design", "UX/UI Design", "Data Analytics",
  "Construction Management", "Hotel Management", "Retail Management",
  "Manufacturing Operations", "Real Estate Sales", "Financial Consulting",
  "Public Sector Administration", "Environmental Science", "Pharmaceutical Research",
  "Aerospace Engineering", "Automotive Design", "Agricultural Technology"
];

export default function CoverLetterList() {
  const [letters, setLetters] = useState([]);
  const [editEntry, setEditEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sampleLetters, setSampleLetters] = useState([]);

  const { showFlash } = useFlash(); 

  // Load user's cover letters
  useEffect(() => {
    const loadCoverLetters = async () => {
      try {
        setLoading(true);
        const uuid = localStorage.getItem("uuid");
        if (!uuid) throw new Error("Missing UUID in localStorage");

        const data = await apiRequest(`/api/coverletters/me/${uuid}`);
        const mapped = (data || []).map((item) => ({
          id: item._id,
          title: item.title,
          company: item.company,
          position: item.position,
          content: item.content,
          created_at: item.created_at,
        }));
        setLetters(mapped);
      } catch (err) {
        console.error("Failed to load cover letters:", err);
        setLetters([]);
      } finally {
        setLoading(false);
      }
    };
    loadCoverLetters();
  }, []);

  // Prepare sample letters
  useEffect(() => {
    const prepareSamples = async () => {
      const loadedSamples = [];
      for (let style of styles) {
        const group = { style, letters: [] };
        for (let industry of industries.slice(0, 3)) {
          const id = `${style}_${industry.replace(/\s/g, "_")}`;
          try {
            const content = await renderTemplate(`/templates/${id}.mustache`);
            group.letters.push({ id, title: `${style} - ${industry}`, content });
          } catch (err) {
            console.error("Failed to load template", id, err);
          }
        }
        loadedSamples.push(group);
      }
      setSampleLetters(loadedSamples);
    };
    prepareSamples();
  }, []);

  const onAdded = async (data) => {
    const uuid = localStorage.getItem("uuid");
    if (!uuid) return showFlash("Cannot save cover letter: missing UUID", "error");
    if (!data.title || !data.content) return showFlash("Title and content are required.", "error");

    try {
      if (data.id) {
        // UPDATE
        const putBody = {
          title: data.title,
          company: data.company || "",
          position: data.position || "",
          content: data.content,
        };
        await apiRequest("/api/coverletters/", data.id, {
          method: "PUT",
          body: JSON.stringify(putBody),
        });
        setLetters((prev) => prev.map((l) => (l.id === data.id ? { ...l, ...putBody } : l)));
        showFlash("Cover letter updated successfully!", "success");
      } else {
        // CREATE
        const payload = {
          coverletter: {
            title: data.title,
            company: data.company || "",
            position: data.position || "",
            content: data.content,
          },
          uuid,
        };
        const response = await apiRequest("/api/coverletters", "", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (response?.coverletter_id) {
          const newEntry = {
            id: response.coverletter_id,
            title: payload.coverletter.title,
            company: payload.coverletter.company,
            position: payload.coverletter.position,
            content: payload.coverletter.content,
            created_at: new Date().toISOString(),
          };
          setLetters((prev) => [newEntry, ...prev]);
          showFlash("Cover letter created successfully!", "success");
        } else {
          showFlash("Saved but server didn't return an ID.", "info");
        }
      }
      setShowForm(false);
      setEditEntry(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to save cover letter:", err);
      showFlash("Failed to save cover letter. See console for details.", "error");
    }
  };

  const onDelete = async (id) => {
    if (!id) return showFlash("Cannot delete — invalid ID", "error");
    if (!window.confirm("Are you sure you want to delete this cover letter?")) return;

    try {
      await apiRequest("/api/coverletters/", id, { method: "DELETE" });
      setLetters((prev) => prev.filter((l) => l.id !== id));
      showFlash("Cover letter deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showFlash("Failed to delete cover letter. See console for details.", "error");
    }
  };

  const handleUseSample = (sample) => {
    setEditEntry({ ...sample, id: null });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📝 Cover Letters</h1>
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
            fontSize: "14px",
          }}
        >
          {showForm ? "← Cancel" : "+ Add Cover Letter"}
        </button>
      </div>

      {showForm && (
        <CoverLetterForm
          editEntry={editEntry}
          onAdded={onAdded}
          cancelEdit={() => {
            setEditEntry(null);
            setShowForm(false);
          }}
        />
      )}

      {/* User letters */}
      <section>
        <h2>Your Cover Letters</h2>
        {loading ? (
          <p>Loading cover letters...</p>
        ) : letters.length === 0 ? (
          <p>No cover letters yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {letters.map((letter) => (
              <li
                key={letter.id}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "12px",
                  background: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3>{letter.title}</h3>
                    {letter.company && <p>{letter.company}</p>}
                    {letter.position && <p>Position: {letter.position}</p>}
                    {letter.created_at && (
                      <p style={{ fontSize: "12px", color: "#999" }}>Created: {formatDate(letter.created_at)}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setEditEntry(letter);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#34c759",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(letter.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#ff3b30",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                {letter.content && <pre style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>{letter.content}</pre>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sample templates */}
      <section style={{ marginTop: "40px" }}>
        <h2>Sample Cover Letters</h2>
        {sampleLetters.map((group) => (
          <div key={group.style} style={{ marginBottom: "30px" }}>
            <h3 style={{ textTransform: "capitalize" }}>{group.style}</h3>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {group.letters.map((sample) => (
                <div
                  key={sample.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "12px",
                    background: "#f9f9f9",
                    width: "calc(33% - 10px)",
                    minHeight: "220px",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                  onClick={() => handleUseSample(sample)}
                >
                  <h4>{sample.title}</h4>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "14px",
                      marginTop: "8px",
                      flexGrow: 1,
                    }}
                  >
                    {sample.content}
                  </pre>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSample(sample);
                    }}
                    style={{
                      marginTop: "auto",
                      padding: "6px 12px",
                      background: "#4f8ef7",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Use this sample
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
