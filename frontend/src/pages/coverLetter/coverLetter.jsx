import { useState, useEffect } from "react";
import { renderTemplate } from "./renderTemplate"; 
import { useFlash } from "../../context/flashContext";
import UserAPI from "../../api/user"; // assume you have an API wrapper for user endpoints

const styles = ["formal", "creative", "technical", "modern", "casual"];
const industries = [
  "Software_Development", "Cybersecurity", "Healthcare", "Education", "Marketing", "Non-specific"
];

// Populate template with user data
function populateTemplate(template, data) {
  if (!template || !data) return template || "";

  const { profile = {}, education = [], skills = [], employment = [], certifications = [] } = data;

  const topEducation = education[0] || {};
  const latestEmployment = employment[0] || {};

  return template
    .replace(/\{\{name\}\}/g, profile.full_name || "")
    .replace(/\{\{email\}\}/g, profile.email || "")
    .replace(/\{\{title\}\}/g, profile.title || "")
    .replace(/\{\{industry\}\}/g, profile.industry || "")
    .replace(/\{\{experience_level\}\}/g, profile.experience_level || "")
    .replace(/\{\{skills\}\}/g, skills.map(s => s.name).join(", ") || "")
    .replace(/\{\{latest_employment_title\}\}/g, latestEmployment.title || "")
    .replace(/\{\{latest_employment_company\}\}/g, latestEmployment.company || "")
    .replace(/\{\{latest_employment_location\}\}/g, latestEmployment.location || "")
    .replace(/\{\{top_education_degree\}\}/g, topEducation.degree || "")
    .replace(/\{\{top_education_field\}\}/g, topEducation.field_of_study || "")
    .replace(/\{\{top_education_institution\}\}/g, topEducation.institution_name || "")
    .replace(/\{\{certifications\}\}/g, certifications.map(c => c.name).join(", ") || "");
}

export default function CoverLetterList() {
  const [sampleLetters, setSampleLetters] = useState([]);
  const { showFlash } = useFlash();

  useEffect(() => {
    const loadSamplesWithUserData = async () => {
      try {
        // Fetch all user data
        const userData = await UserAPI.getAllData();

        const loadedSamples = [];

        for (let style of styles) {
          const group = { style, letters: [] };

          for (let industry of industries) {
            const templateFile = `${style}_${industry.replace(/\s/g, "_")}.html`;

            try {
              const rawTemplate = await renderTemplate(templateFile);

              const populatedContent = populateTemplate(rawTemplate, userData);

              group.letters.push({
                id: templateFile,
                title: `${style} - ${industry}`,
                content: populatedContent,
                style,
                industry,
              });
            } catch (err) {
              console.error("Failed to load/populate template:", templateFile, err);
            }
          }

          loadedSamples.push(group);
        }

        setSampleLetters(loadedSamples);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        //showFlash("Could not load personalized sample letters.", "error");
      }
    };

    loadSamplesWithUserData();
  }, [showFlash]);

  return (
    <div>
      <h2>Sample Cover Letters</h2>
      {sampleLetters.map(group => (
        <div key={group.style} style={{ marginBottom: "30px" }}>
          <h3 style={{ textTransform: "capitalize" }}>{group.style}</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {group.letters.map(sample => (
              <div
                key={sample.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "16px",
                  background: "#f9f9f9",
                  width: "calc(33% - 10px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div>
                  <h4>{sample.title}</h4>
                  <iframe
                    title={`sample-${sample.id}`}
                    srcDoc={sample.content || "<html><body></body></html>"}
                    style={{ width: "100%", border: "1px solid #ccc", borderRadius: "6px" }}
                    onLoad={e => {
                      try {
                        const doc = e.target.contentDocument;
                        e.target.style.height = doc.body.scrollHeight + "px";
                      } catch {}
                    }}
                  />
                </div>
                <button
                  onClick={() => console.log("Use this sample", sample.id)} // replace with your handler
                  style={{
                    marginTop: "10px",
                    padding: "6px 12px",
                    background: "#4f8ef7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    alignSelf: "center",
                  }}
                >
                  Use this sample
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
