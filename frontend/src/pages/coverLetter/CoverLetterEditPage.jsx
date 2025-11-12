import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CoverLetterAPI from "../../api/coverLetters";
import AIAPI from "../../api/AI";
import { useFlash } from "../../context/flashContext";
import { Undo2, Redo2, Bold, Italic, Underline, List, Zap, Save, Clock, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

export default function EditCoverLetterPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showFlash } = useFlash();
  const iframeRef = useRef(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const contentRef = useRef("");
  const [letterLoaded, setLetterLoaded] = useState(false);
  const [editorMode, setEditorMode] = useState("visual");
  const [htmlContent, setHtmlContent] = useState("");
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Stats and History
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [versionHistory, setVersionHistory] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [selectedWord, setSelectedWord] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [showSynonyms, setShowSynonyms] = useState(false);

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
        setHtmlContent(letter.content || "");

        setVersionHistory([{ timestamp: new Date(), content: letter.content }]);

        setLetterLoaded(true);
      } catch (err) {
        console.error(err);
        showFlash("Failed to load cover letter.", "error");
        navigate("/coverletter");
      }
    };

    loadLetter();
  }, [id, navigate, showFlash]);

  // Calculate statistics
  const calculateStats = (text) => {
    const plainText = text.replace(/<[^>]*>/g, "");
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = plainText.length;

    setWordCount(words.length);
    setCharCount(chars);

    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence * 5)));
    setReadabilityScore(Math.round(score));
  };

  // Populate iframe
  useEffect(() => {
    if (!iframeRef.current || !letterLoaded || editorMode !== "visual") return;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    doc.open();
    doc.write(contentRef.current);
    doc.close();

    doc.body.contentEditable = "true";

    const onInput = () => {
      const htmlText = doc.documentElement.innerHTML;
      contentRef.current = htmlText;
      setHtmlContent(htmlText);
      calculateStats(htmlText);
      setAutoSaveStatus("unsaved");
    };

    const onMouseUp = () => {
      const selection = doc.getSelection();
      if (selection.toString().length > 0) {
        setSelectedWord(selection.toString().trim());
        setShowSynonyms(true);
        fetchSynonyms(selection.toString().trim());
      }
    };

    doc.body.addEventListener("input", onInput);
    doc.body.addEventListener("mouseup", onMouseUp);

    return () => {
      doc.body.removeEventListener("input", onInput);
      doc.body.removeEventListener("mouseup", onMouseUp);
    };
  }, [letterLoaded, editorMode]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (autoSaveStatus === "unsaved" && contentRef.current) {
        performAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveStatus]);

  const performAutoSave = async () => {
    setAutoSaveStatus("saving");
    try {
      await CoverLetterAPI.update(id, {
        title,
        company,
        position,
        content: contentRef.current,
      });
      setAutoSaveStatus("saved");

      setVersionHistory(prev => [...prev, {
        timestamp: new Date(),
        content: contentRef.current
      }].slice(-10));

    } catch (err) {
      console.error("Auto-save failed:", err);
      setAutoSaveStatus("unsaved");
    }
  };

  const fetchSynonyms = async (word) => {
    try {
      const res = await AIAPI.generateText({
        prompt: `Generate 4 synonyms for the word "${word}" as a comma-separated list. Only return the words, nothing else.`,
        system_message: "You are a helpful assistant that generates synonyms."
      });

      const responseText = res.data.result || res.data.response || res.data.text || "";
      const syns = responseText.split(",").map(s => s.trim()).filter(s => s.length > 0 && s.length < 50);
      setSynonyms(syns);
    } catch (err) {
      console.error("Failed to fetch synonyms:", err);
      setSynonyms([]);
    }
  };

  const replaceSynonym = (synonym) => {
    if (!iframeRef.current || !selectedWord) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    const selection = doc.getSelection();

    if (selection.rangeCount > 0) {
      selection.deleteFromDocument();
      const span = doc.createElement("span");
      span.textContent = synonym;
      selection.getRangeAt(0).insertNode(span);
    }

    setShowSynonyms(false);
    contentRef.current = doc.documentElement.innerHTML;
    calculateStats(doc.documentElement.innerHTML);
  };

  const restoreVersion = (version) => {
    contentRef.current = version.content;
    setHtmlContent(version.content);

    if (editorMode === "visual") {
      setEditorMode("html");
      setTimeout(() => {
        setEditorMode("visual");
        setTimeout(() => {
          if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
            doc.open();
            doc.write(version.content);
            doc.close();
            doc.body.contentEditable = "true";
          }
        }, 50);
      }, 50);
    }

    calculateStats(version.content);
    setAutoSaveStatus("unsaved");
    showFlash("Version restored", "success");
  };

  const applyFormatting = (command, value = null) => {
    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow.document;
    if (!doc) return;
    doc.execCommand(command, false, value);
    doc.body.focus();
  };

  const insertList = (type) => {
    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow.document;
    if (!doc) return;
    doc.execCommand(type === "ul" ? "insertUnorderedList" : "insertOrderedList");
    doc.body.focus();
  };

  const handleSave = async () => {
    try {
      let contentToSave = contentRef.current;
      if (editorMode === "visual" && iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        contentToSave = doc.documentElement.innerHTML;
      } else if (editorMode === "html") {
        contentToSave = htmlContent;
      }

      await CoverLetterAPI.update(id, {
        title,
        company,
        position,
        content: contentToSave,
      });

      setAutoSaveStatus("saved");
      setVersionHistory(prev => [...prev, {
        timestamp: new Date(),
        content: contentToSave
      }].slice(-10));

      showFlash("Cover letter saved!", "success");
      navigate("/coverletter");
    } catch (err) {
      console.error(err);
      showFlash("Failed to save cover letter.", "error");
    }
  };

  // 🔹 Generate improvement ideas
  const generateAISuggestionsList = async () => {
    const plainText = contentRef.current.replace(/<[^>]*>/g, "");
    try {
      const res = await AIAPI.generateText({
        prompt: `Suggest 3 unique, high-quality ways to improve this cover letter. Focus strictly on writing quality, tone, and clarity — not HTML, structure, or CSS. Return only a clean numbered list (e.g., "1. Make it sound more confident"), with no duplicates or explanations.`,
        system_message: `You are an expert writing coach. The user is editing a cover letter that includes HTML markup. 
DO NOT comment on HTML tags, CSS, or formatting.
DO NOT mention removing code.
DO NOT duplicate ideas.
Output exactly 3 unique suggestions as plain text, in numbered list form only.
Here is the user's cover letter text:\n\n${plainText.substring(0, 800)}...`
      });

      const text = res.data.response || res.data.result || res.data.text || "";
      setAiSuggestions(text.split(/\n+/).filter(l => l.trim().length > 0));
    } catch (err) {
      console.error("AI suggestion generation failed:", err);
      showFlash("Failed to get AI suggestions.", "error");
    }
  };

  // 🔹 Apply improvement -> TODO change later with a seperate function that does this instead of just having the prompt in  the jsx...
  const sendAISuggestion = async (userPrompt) => {
    const plainText = contentRef.current.replace(/<[^>]*>/g, "");
    return AIAPI.generateText({
      prompt: `Using this feedback: "${userPrompt}", rewrite the following cover letter to improve it. 
Keep the same HTML structure and tags. 
Do not wrap your response in markdown or code blocks. 
Do not add explanations or commentary. 
Return ONLY the improved HTML.`,
      system_message: `You are a professional cover letter editor. 
The user's cover letter includes HTML markup that defines its layout. 
You must preserve ALL existing HTML structure and tags exactly as-is (do not remove or reformat them). 
Do not alter, critique, or remove CSS or styling.
Do not include markdown fences like '''html.
Do not append any commentary or explanations — return ONLY the improved HTML content.
Maintain the same formatting, section order, and tone.

Here is the user's current letter:\n\n${plainText}`
    });
  };

  const handleAISuggestion = async () => {
    if (!aiPrompt.trim()) {
      showFlash("Please enter a prompt for AI suggestions", "error");
      return;
    }

    setAiLoading(true);
    try {
      const res = await sendAISuggestion(aiPrompt);
      const suggestion = res.data.response || res.data.result || res.data.text || "";

      if (iframeRef.current && editorMode === "visual") {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        doc.body.innerHTML = suggestion;
        contentRef.current = doc.documentElement.innerHTML;
        setHtmlContent(doc.documentElement.innerHTML);
        calculateStats(doc.documentElement.innerHTML);
        setAutoSaveStatus("unsaved");
      }

      setAiPrompt("");
      showFlash("AI improvements applied.", "success");
    } catch (err) {
      console.error("AI suggestion error:", err);
      showFlash("Failed to get AI suggestion.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Edit Cover Letter</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {autoSaveStatus === "saved" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#34c759" }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: "12px" }}>Auto-saved</span>
            </div>
          )}
          {autoSaveStatus === "saving" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#ff9500" }}>
              <Clock size={16} />
              <span style={{ fontSize: "12px" }}>Saving...</span>
            </div>
          )}
          {autoSaveStatus === "unsaved" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#ff3b30" }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: "12px" }}>Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ width: "100%", marginBottom: "10px", padding: "10px", fontSize: "14px" }}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            style={{ flex: 1, padding: "10px", fontSize: "14px" }}
          />
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Position"
            style={{ flex: 1, padding: "10px", fontSize: "14px" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Main Editor */}
        <div>
          {/* Editor Mode Selector */}
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setEditorMode("visual")}
              style={{
                padding: "8px 16px",
                background: editorMode === "visual" ? "#2196f3" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setEditorMode("html")}
              style={{
                padding: "8px 16px",
                background: editorMode === "html" ? "#2196f3" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              HTML Editor
            </button>
          </div>

          {/* Visual Editor */}
          {editorMode === "visual" && (
            <>
              {/* Toolbar */}
              <div style={{
                display: "flex",
                gap: "5px",
                padding: "10px",
                background: "#f5f5f5",
                borderRadius: "4px",
                marginBottom: "10px",
                flexWrap: "wrap",
                alignItems: "center"
              }}>
                <button onClick={() => applyFormatting("undo")} title="Undo" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Undo2 size={16} />
                </button>
                <button onClick={() => applyFormatting("redo")} title="Redo" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Redo2 size={16} />
                </button>

                <div style={{ width: "1px", height: "20px", background: "#ccc", margin: "0 5px" }} />

                <button onClick={() => applyFormatting("bold")} title="Bold" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Bold size={16} />
                </button>
                <button onClick={() => applyFormatting("italic")} title="Italic" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Italic size={16} />
                </button>
                <button onClick={() => applyFormatting("underline")} title="Underline" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Underline size={16} />
                </button>

                <div style={{ width: "1px", height: "20px", background: "#ccc", margin: "0 5px" }} />

                <button onClick={() => insertList("ul")} title="Bullet List" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <List size={16} />
                </button>
                <button onClick={() => insertList("ol")} title="Numbered List" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <List size={16} style={{ transform: "rotate(90deg)" }} />
                </button>

                <div style={{ width: "1px", height: "20px", background: "#ccc", margin: "0 5px" }} />

                <button onClick={() => setShowAIHelper(!showAIHelper)} title="AI Helper" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px", background: showAIHelper ? "#e0f7fa" : "white" }}>
                  <Zap size={16} />
                </button>
                <button onClick={handleSave} title="Save Now" style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "3px" }}>
                  <Save size={16} />
                </button>
              </div>

              {/* Iframe Editor */}
              <iframe
                ref={iframeRef}
                title="Cover Letter Editor"
                style={{ width: "100%", height: "500px", border: "1px solid #ccc", borderRadius: "4px", background: "white" }}
              ></iframe>

              {/* Synonym Popup */}
              {showSynonyms && synonyms.length > 0 && (
                <div style={{
                  position: "absolute",
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                  top: "100px",
                  right: "20px",
                  width: "200px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}>
                  <strong>Synonyms:</strong>
                  <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
                    {synonyms.map((syn, idx) => (
                      <li key={idx} onClick={() => replaceSynonym(syn)} style={{ cursor: "pointer", marginBottom: "4px", color: "#2196f3" }}>
                        {syn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* HTML Editor */}
          {editorMode === "html" && (
            <textarea
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value);
                contentRef.current = e.target.value;
                calculateStats(e.target.value);
                setAutoSaveStatus("unsaved");
              }}
              style={{
                width: "100%",
                height: "500px",
                fontFamily: "monospace",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "10px"
              }}
            />
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* AI Helper */}
          {showAIHelper && (
            <div style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              background: "#fafafa",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Zap size={18} />
                <h4 style={{ margin: 0 }}>AI Helper</h4>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to make improvements..."
                style={{ width: "100%", height: "80px", padding: "8px", marginBottom: "10px", borderRadius: "4px" }}
              />

              <button
                onClick={handleAISuggestion}
                disabled={aiLoading}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: aiLoading ? "not-allowed" : "pointer"
                }}
              >
                {aiLoading ? "Applying..." : "Apply Suggestion"}
              </button>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={generateAISuggestionsList}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  <Lightbulb size={16} /> Generate Ideas
                </button>

                {aiSuggestions.length > 0 && (
                  <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                    {aiSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            background: "#fafafa"
          }}>
            <h4>Stats</h4>
            <p><strong>Words:</strong> {wordCount}</p>
            <p><strong>Characters:</strong> {charCount}</p>
            <p><strong>Readability:</strong> {readabilityScore}/100</p>
          </div>

          {/* Version History */}
          <div style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            background: "#fafafa",
            marginTop: "20px"
          }}>
            <h4>Version History</h4>
            {versionHistory.length === 0 && <p>No versions yet</p>}
            {versionHistory.map((v, idx) => (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <button
                  onClick={() => restoreVersion(v)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "5px",
                    cursor: "pointer"
                  }}
                >
                  {new Date(v.timestamp).toLocaleTimeString()} - Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
