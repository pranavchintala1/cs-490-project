// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import JobsList from "./jobs/JobsList";
import ProfilePage from "./profile/ProfilePage" 

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 12, display: "flex", gap: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/jobs">Jobs</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <Routes>
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<div style={{ padding: 16 }}>Choose a page.</div>} />
      </Routes>
    </BrowserRouter>
  );
}
