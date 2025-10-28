import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import feature lists
import SkillsList from "./skills/SkillList";
import EducationList from "./education/EducationList";
import CertificationList from "./certifications/CertificationList";
import ProjectsList from "./projects/ProjectList";

export default function App() {
  return (
    <Router>
      <div>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/skills" style={{ marginRight: "15px" }}>Skills</Link>
          <Link to="/education" style={{ marginRight: "15px" }}>Education</Link>
          <Link to="/certifications" style={{ marginRight: "15px" }}>Certifications</Link>
          <Link to="/projects">Projects</Link>
        </nav>

        <Routes>
          <Route path="/skills" element={<SkillsList />} />
          <Route path="/education" element={<EducationList />} />
          <Route path="/certifications" element={<CertificationList />} />
          <Route path="/projects" element={<ProjectsList />} />

          {/* Default route */}
          <Route path="*" />
        </Routes>
      </div>
    </Router>
  );
}
