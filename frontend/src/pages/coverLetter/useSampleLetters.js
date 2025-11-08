import { useState, useEffect } from "react";
import { useRenderTemplate } from "./renderTemplate";

const styles = ["formal", "creative", "technical", "modern", "casual"];
const industries = [
  "Software_Development",
  "Cybersecurity",
  "Fintech",
  "Healthcare_Administration",
  "Nursing",
  "Education_K-12",
  "Higher_Education",
  "Digital_Marketing",
  "Mechanical_Engineering",
  "Civil_Engineering",
  "Corporate_Law",
  "Employment_Law",
  "Recruiting",
  "B2B_Sales",
  "Graphic_Design",
  "UX_UI_Design",
  "Data_Analytics",
  "Construction_Management",
  "Hotel_Management",
  "Retail_Management",
  "Manufacturing_Operations",
  "Real_Estate_Sales",
  "Financial_Consulting",
  "Public_Sector_Administration",
  "Environmental_Science",
  "Pharmaceutical_Research",
  "Aerospace_Engineering",
  "Automotive_Design",
  "Agricultural_Technology"
];

export function useSampleLetters() {
  const [samples, setSamples] = useState([]);
  const { renderTemplate } = useRenderTemplate();

  useEffect(() => {
    const loadSamples = async () => {
      const loaded = [];
      for (const style of styles) {
        for (const industry of industries) {
          if (industry === "Non-specific_industry") continue; // skip this
          const templatePath = `/templates/${style}_${industry}.mustache`;
          const content = await renderTemplate(templatePath, {});
          loaded.push({
            id: `${style}_${industry}`,
            title: `${style.replace("_", " ")} - ${industry.replace("_", " ")}`,
            style,
            industry,
            content
          });
        }
      }
      setSamples(loaded);
    };
    loadSamples();
  }, []);

  return { samples };
}
