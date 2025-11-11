import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CoverLetterAPI from "../../api/coverLetters";
import AIAPI from "../../api/AI";
import { useFlash } from "../../context/flashContext";
import { Undo2, Redo2, Bold, Italic, Underline, List, Zap, Save, Clock, AlertCircle, CheckCircle } from "lucide-react";

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

  // Stats and History
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [versionHistory, setVersionHistory] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [grammarIssues, setGrammarIssues] = useState([]);
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

    checkGrammar(plainText);
  };

  const checkGrammar = (text) => {
    const issues = [];
    const patterns = [
      { regex: /\b(their|there|they're)\b/gi, msg: "Check usage of their/there/they're" },
      { regex: /\b(your|you're)\b/gi, msg: "Check usage of your/you're" },
      { regex: /\b(its|it's)\b/gi, msg: "Check usage of its/it's" },
      { regex: /\s{2,}/g, msg: "Multiple spaces detected" },
      { regex: /([.!?])\s+([a-z])/g, msg: "Sentence should start with capital" },
    ];

    patterns.forEach(pattern => {
      if (pattern.regex.test(text)) {
        issues.push(pattern.msg);
      }
    });

    setGrammarIssues([...new Set(issues)].slice(0, 5));
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

      const syns = res.data.result
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      setSynonyms(syns);
    } catch (err) {
      console.error("Failed to fetch synonyms:", err);
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
    
    if (iframeRef.current && editorMode === "visual") {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(version.content);
      doc.close();
      doc.body.contentEditable = "true";
    }
    
    calculateStats(version.content);
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

  const sendAISuggestion = async (userPrompt) => {
    const plainText = contentRef.current.replace(/<[^>]*>/g, "");
    
    return AIAPI.generateText({
      prompt: userPrompt,
      system_message: `You are a professional cover letter editor. Here is the current cover letter:\n\n${plainText.substring(0, 500)}...\n\nThe user is applying for a ${position} position at ${company}. Help them improve their cover letter based on their request.`
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
      const suggestion = res.data.response;

      
      if (iframeRef.current && editorMode === "visual") {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        doc.body.focus();
        const para = doc.createElement("p");
        para.innerHTML = `<em style="color: #9c27b0;">💡 Suggestion: ${suggestion}</em>`;
        doc.body.appendChild(para);
        
        // Update the content reference to preserve state
        contentRef.current = doc.documentElement.innerHTML;
        setHtmlContent(doc.documentElement.innerHTML);
        setAutoSaveStatus("unsaved");
      }
      
      setAiPrompt("");
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
                  1.
                </button>

                <select
                  onChange={(e) => applyFormatting("formatBlock", e.target.value)}
                  defaultValue="p"
                  style={{ padding: "6px 10px", cursor: "pointer", borderRadius: "3px", border: "1px solid #ccc" }}
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>

                <button
                  onClick={() => setShowAIHelper(!showAIHelper)}
                  style={{
                    marginLeft: "auto",
                    padding: "8px 12px",
                    background: "#9c27b0",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Zap size={16} />
                  AI Helper
                </button>
              </div>

              {/* AI Helper Panel */}
              {showAIHelper && (
                <div style={{
                  background: "#f9f3f0",
                  border: "2px solid #9c27b0",
                  borderRadius: "6px",
                  padding: "15px",
                  marginBottom: "15px"
                }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>✨ AI Assistant</h4>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'Make this section more impactful' or 'Add a line about leadership skills'"
                    style={{
                      width: "100%",
                      minHeight: "60px",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}
                  />
                  <button
                    onClick={handleAISuggestion}
                    disabled={aiLoading}
                    style={{
                      padding: "8px 16px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: aiLoading ? "not-allowed" : "pointer",
                      opacity: aiLoading ? 0.6 : 1
                    }}
                  >
                    {aiLoading ? "Generating..." : "Get Suggestions"}
                  </button>
                </div>
              )}

              {/* WYSIWYG Editor */}
              <iframe
                ref={iframeRef}
                style={{
                  width: "100%",
                  minHeight: "600px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginBottom: "15px"
                }}
              />
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
                minHeight: "600px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                marginBottom: "15px",
                fontFamily: "monospace",
                fontSize: "12px"
              }}
            />
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "10px 20px",
                background: "#34c759",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={() => navigate("/coverletter")}
              style={{
                padding: "10px 20px",
                background: "#ff3b30",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Statistics */}
          <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "6px" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>📊 Statistics</h4>
            <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
              <div>Words: <strong>{wordCount}</strong></div>
              <div>Characters: <strong>{charCount}</strong></div>
              <div>Readability: <strong>{readabilityScore}%</strong></div>
            </div>
          </div>

          {/* Grammar Issues */}
          {grammarIssues.length > 0 && (
            <div style={{ background: "#fff3cd", padding: "15px", borderRadius: "6px", border: "1px solid #ffc107" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>⚠️ Grammar Check</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                {grammarIssues.map((issue, i) => (
                  <li key={i} style={{ color: "#856404", marginBottom: "5px" }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Synonyms */}
          {showSynonyms && selectedWord && (
            <div style={{ background: "#e3f2fd", padding: "15px", borderRadius: "6px", border: "1px solid #2196f3" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>🔤 Synonyms for "{selectedWord}"</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {synonyms.length > 0 ? (
                  synonyms.map((syn, i) => (
                    <button
                      key={i}
                      onClick={() => replaceSynonym(syn)}
                      style={{
                        padding: "8px 12px",
                        background: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        textAlign: "left"
                      }}
                    >
                      {syn}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: "12px", margin: 0, color: "#666" }}>No synonyms found</p>
                )}
              </div>
            </div>
          )}

          {/* Version History */}
          {versionHistory.length > 1 && (
            <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "6px" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>⏱️ Version History</h4>
              <div style={{ fontSize: "11px", maxHeight: "200px", overflowY: "auto" }}>
                {versionHistory.map((version, i) => (
                  <button
                    key={i}
                    onClick={() => restoreVersion(version)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "5px",
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "3px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "11px"
                    }}
                  >
                    {version.timestamp.toLocaleTimeString()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}