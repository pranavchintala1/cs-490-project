import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SkillList from "./skills/SkillList";
import EducationList from "./education/EducationList";

export default function App() {
  return (
    <Router>
      <div>
        {/* Navigation */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/skills" style={{ marginRight: "10px" }}>Skills</Link>
          <Link to="/education">Education</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/skills" element={<SkillList />} />
          <Route path="/education" element={<EducationList />} />
          <Route path="*" element={<SkillList />} /> {/* default  Change Later*/}
        </Routes>
      </div>
    </Router>
  );
}
