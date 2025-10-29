// src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import JobsPage from "./jobs/JobsPage";
import ProfilePage from "./profile/ProfilePage";

export default function App() {
  const userId = "temp_user";
  return (
    <BrowserRouter>
      <nav style={{ padding: 8 }}>
        <Link to="/jobs" style={{ marginRight: 12 }}>Jobs</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/jobs" element={<JobsPage userId={userId} />} />
        <Route path="/profile" element={<ProfilePage userId={userId} />} />
        <Route path="*" element={<JobsPage userId={userId} />} />
      </Routes>
    </BrowserRouter>
  );
}
