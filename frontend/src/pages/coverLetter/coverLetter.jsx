import { useState, useEffect, useRef } from "react";
import { renderTemplate } from "./renderTemplate";
import { useFlash } from "../../context/flashContext";
import UserAPI from "../../api/user";
import CoverLetterAPI from "../../api/coverLetters";
import CoverLetterForm from "./CoverLetterForm";
import { useNavigate } from "react-router-dom"; 

const styles = ["formal", "creative", "technical", "modern", "casual"];
const industries = ["Software_Development","Cybersecurity","Healthcare","Education","Marketing","Non-specific"];


function populateTemplate(template, data) {
  if (!template || !data) return template || "";
  const { profile = {}, education = [], skills = [], employment = [], certifications = [] } = data;
  const topEducation = education[0] || {};
  const latestEmployment = employment[0] || {};

  return template
    .replace(/\{\{name\}\}/g, profile?.full_name || profile?.username || "")
    .replace(/\{\{username\}\}/g, profile?.username || "")
    .replace(/\{\{email\}\}/g, profile?.email || "")
    .replace(/\{\{phone\}\}/g, profile?.phone_number || "")
    .replace(/\{\{address\}\}/g, profile?.address || "")
    .replace(/\{\{title\}\}/g, profile?.title || "")
    .replace(/\{\{biography\}\}/g, profile?.biography || "")
    .replace(/\{\{industry\}\}/g, profile?.industry || "")
    .replace(/\{\{experience_level\}\}/g, profile?.experience_level || "")
    .replace(/\{\{skills\}\}/g, skills?.map(s => s.name).join(", ") || "")
    .replace(/\{\{latest_title\}\}/g, latestEmployment?.title || "")
    .replace(/\{\{latest_company\}\}/g, latestEmployment?.company || "")
    .replace(/\{\{latest_location\}\}/g, latestEmployment?.location || "")
    .replace(/\{\{top_degree\}\}/g, topEducation?.degree || "")
    .replace(/\{\{top_field\}\}/g, topEducation?.field_of_study || "")
    .replace(/\{\{top_institution\}\}/g, topEducation?.institution_name || "")
    .replace(/\{\{certifications\}\}/g, certifications?.map(c => c.name).join(", ") || "");
}

export default function CoverLetterList() {
  const [sampleLetters, setSampleLetters] = useState([]);
  const [userLetters, setUserLetters] = useState([]);
  const [filterStyle, setFilterStyle] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [editingLetter, setEditingLetter] = useState(null); // <-- track which letter is being edited
  const { showFlash } = useFlash();
  const cardRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadLetters = async () => {
      try {
        const userData = await UserAPI.getAllData();

        // Load sample letters
        let allSamples = [];
        for (let style of styles) {
          for (let industry of industries) {
            const templateFile = `${style}_${industry.replace(/\s/g, "_")}.html`;
            try {
              const rawTemplate = await renderTemplate(templateFile);
              const populatedContent = populateTemplate(rawTemplate, userData);
              allSamples.push({ 
                id: templateFile,
                title: `${style} - ${industry}`,
                content: populatedContent,
                style,
                industry
              });
            } catch (err) {
              console.error("Failed to load template:", templateFile, err);
            }
          }
        }

        // Apply filters
        if (filterStyle) allSamples = allSamples.filter(l => l.style === filterStyle);
        if (filterIndustry) allSamples = allSamples.filter(l => l.industry === filterIndustry);

        // Regroup by style
        const groupedSamples = allSamples.reduce((acc, letter) => {
          let group = acc.find(g => g.style === letter.style);
          if (!group) {
            group = { style: letter.style, letters: [] };
            acc.push(group);
          }
          group.letters.push(letter);
          return acc;
        }, []);

        setSampleLetters(groupedSamples);

        // Load user letters
        const uuid = localStorage.getItem("uuid");
        const res = await CoverLetterAPI.getAll(uuid);
        console.log(res);
        setUserLetters(res.data || []);
      } catch (err) {
        console.log("look up");
        console.error("Failed to load letters:", err);
      }
    };

    loadLetters();
  }, [filterStyle, filterIndustry, showFlash]);

  const handleAddSample = async (sample) => {
    try {
      const data = { title: sample.title, company: sample.company || "", position: sample.position || "", content: sample.content };
      const res = await CoverLetterAPI.add(data);
      setUserLetters(prev => [...prev, { ...data, id: res.data.coverletter_id }]);
      showFlash("Cover letter added!", "success");
    } catch (err) {
      console.error("Failed to add sample:", err);
      showFlash("Failed to add cover letter.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await CoverLetterAPI.delete(id);
      setUserLetters(prev => prev.filter(l => l.id !== id));
      showFlash("Cover letter deleted.", "success");
    } catch (err) {
      console.error("Failed to delete letter:", err);
      showFlash("Failed to delete cover letter.", "error");
    }
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter); // open the form
  };

  const handleSave = async (letter) => {
    try {
      if (letter.id) {
        // Existing letter → update
        await CoverLetterAPI.update(letter.id, {
          title: letter.title,
          company: letter.company,
          position: letter.position,
          content: letter.content
        });
        setUserLetters(prev => prev.map(l => l.id === letter.id ? letter : l));
        showFlash("Cover letter updated!", "success");
      } else {
        // New letter → add
        const res = await CoverLetterAPI.add(letter);
        setUserLetters(prev => [...prev, { ...letter, id: res.data.coverletter_id }]);
        showFlash("Cover letter added!", "success");
      }
      setEditingLetter(null);
    } catch (err) {
      console.error("Failed to save letter:", err);
      showFlash("Failed to save cover letter.", "error");
    }
  };

  const autoResizeIframe = (el) => {
    if (!el) return;
    try {
      const doc = el.contentDocument || el.contentWindow.document;
      el.style.height = doc.body.scrollHeight + "px";
    } catch {}
  };

  return (
    <div>
      {editingLetter && (
        <CoverLetterForm 
          editEntry={editingLetter} 
          onAdded={handleSave} 
          cancelEdit={() => setEditingLetter(null)} 
        />
      )}

      {/* User letters first */}
      <h2>Your Cover Letters</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {userLetters.map(letter => (
  <div key={letter.id} ref={el => (cardRefs.current[letter.id] = el)}
       style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "16px", background: "#eaf0ff", width: "calc(33% - 10px)", display: "flex", flexDirection: "column" }}>
    <h4>{letter.title}</h4>
    <iframe 
      title={`user-${letter.id}`} 
      srcDoc={letter.content || "<html><body></body></html>"} 
      style={{ width: "100%", border: "1px solid #ccc", borderRadius: "6px" }} 
      onLoad={e => autoResizeIframe(e.target)} 
    />
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
      {/* EDIT BUTTON */}
      <button
        onClick={() => navigate(`/cover-letter/edit/${letter.id}`)}
        style={{ padding: "6px 12px", background: "#ffa500", color: "white", border: "none", borderRadius: "4px" }}
      >
        Edit
      </button>

      {/* DELETE BUTTON */}
      <button
        onClick={() => handleDelete(letter.id)}
        style={{ padding: "6px 12px", background: "#f44336", color: "white", border: "none", borderRadius: "4px" }}
      >
        Delete
      </button>
    </div>
  </div>
))}
      </div>

      {/* Sample letters */}
      <h2 style={{ marginTop: "40px" }}>Sample Cover Letters</h2>
      <div style={{ marginBottom: "16px" }}>
        <label>Style: <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)}><option value="">All</option>{styles.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
        <label style={{ marginLeft: "16px" }}>Industry: <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}><option value="">All</option>{industries.map(i => <option key={i} value={i}>{i}</option>)}</select></label>
      </div>

      {sampleLetters.map(group => (
        <div key={group.style} style={{ marginBottom: "30px" }}>
          <h3 style={{ textTransform: "capitalize" }}>{group.style}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {group.letters.map(sample => (
              <div key={sample.id} ref={el => (cardRefs.current[sample.id] = el)}
                   style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "16px", background: "#f9f9f9", width: "calc(33% - 10px)", display: "flex", flexDirection: "column" }}>
                <h4>{sample.title}</h4>
                <iframe 
                  title={`sample-${sample.id}`} 
                  srcDoc={sample.content || "<html><body></body></html>"} 
                  style={{ width: "100%", border: "1px solid #ccc", borderRadius: "6px" }} 
                  onLoad={e => autoResizeIframe(e.target)} 
                />
                <button onClick={() => handleAddSample(sample)} style={{ marginTop: "10px", padding: "6px 12px", background: "#4f8ef7", color: "white", border: "none", borderRadius: "4px", alignSelf: "center" }}>Use this sample</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
