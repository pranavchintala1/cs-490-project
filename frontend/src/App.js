import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SkillList from "./skills/SkillList";
import EducationList from "./education/EducationList";
import CertificationList from "./certifications/CertificationList";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/skills">Skills</Link> |{" "}
        <Link to="/education">Education</Link> |{" "}
        <Link to="/certifications">Certifications</Link>
      </nav>
      <Routes>
        <Route path="/skills" element={<SkillList />} />
        <Route path="/education" element={<EducationList />} />
        <Route path="/certifications" element={<CertificationList />} />
      </Routes>
    </Router>
  );
}
