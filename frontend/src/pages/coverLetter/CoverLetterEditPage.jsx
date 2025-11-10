import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CoverLetterAPI from "../../api/coverLetters";
import { useFlash } from "../../context/flashContext";

export default function EditCoverLetterPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showFlash } = useFlash();
  const iframeRef = useRef(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const contentRef = useRef(""); // store content in ref
  const [letterLoaded, setLetterLoaded] = useState(false);

  // Load letter data from API
  useEffect(() => {
    if (!id) return;

    const loadLetter = async () => {
      try {
        const res = await CoverLetterAPI.get(id);
        const letter = res.data;

        setTitle(letter.title || "");
        setCompany(letter.company || "");
        setPosition(letter.position || "");
        contentRef.current = letter.content || "";

        setLetterLoaded(true); // data loaded, iframe can now be populated
      } catch (err) {
        console.error(err);
        showFlash("Failed to load cover letter.", "error");
        navigate("/coverletter");
      }
    };

    loadLetter();
  }, [id, navigate, showFlash]);

  // Populate iframe once it's mounted and data is loaded
  useEffect(() => {
    if (!iframeRef.current || !letterLoaded) return;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    doc.open();
    doc.write(`<html><head></head><body>${contentRef.current}</body></html>`);
    doc.close();

    doc.body.contentEditable = "true";
    doc.body.style.padding = "20px";
    doc.body.style.minHeight = "500px";

    // Update contentRef on user edits
    const onInput = () => {
      contentRef.current = doc.body.innerHTML;
    };
    doc.body.addEventListener("input", onInput);

    // Cleanup listener on unmount
    return () => {
      doc.body.removeEventListener("input", onInput);
    };
  }, [letterLoaded]);

  const handleSave = async () => {
    try {
      await CoverLetterAPI.update(id, {
        title,
        company,
        position,
        content: contentRef.current,
      });
      showFlash("Cover letter saved!", "success");
      navigate("/coverletter");
    } catch (err) {
      console.error(err);
      showFlash("Failed to save cover letter.", "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Cover Letter</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="text"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Position"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          minHeight: "500px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          marginBottom: "10px",
        }}
      />
      <div>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 16px",
            background: "#34c759",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
          }}
        >
          Save
        </button>
        <button
          onClick={() => navigate("/coverletter")}
          style={{
            padding: "8px 16px",
            background: "#ff3b30",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
