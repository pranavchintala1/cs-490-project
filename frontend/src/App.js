import React from "react";
import { Routes, Route } from 'react-router-dom';
import Nav from "./tools/nav";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import logo from './logo.svg';
import './App.css';
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import EmploymentList from "./pages/employment/EmploymentList";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Dashboard from "./pages/dashboard";
import SkillsList from "./pages/skills/SkillList";
import EducationList from "./pages/education/EducationList";
import CertificationList from "./pages/certifications/CertificationList";
import ProjectsList from "./pages/projects/ProjectList";
import JobsList from "./pages/jobs/JobList";
import { FlashProvider, FlashMessage } from "./context/flashContext";
// Resume Feature Imports
import ResumeList from "./pages/resumes/ResumeList";
import ResumeCreate from "./pages/resumes/ResumeCreate";
import ResumeEditor from "./pages/resumes/ResumeEditor";
import ResumePreviewPage from "./pages/resumes/ResumePreviewPage";
import VersionManagementPage from "./pages/resumes/VersionManagementPage";
import ExportResumePage from "./pages/resumes/ExportResumePage";
import SharingAndFeedbackPage from "./pages/resumes/SharingAndFeedbackPage";


export function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <>
    
          <FlashProvider>
            <FlashMessage />
              <Nav />
              <Routes>
                <Route path = "/" element = {<Home />} />
                <Route path = "/register" element = {<Register />} />
                <Route path = "/login" element = {<Login />} />
                <Route path = "/profile" element = {<Profile />} />
                <Route path="/employment-history" element={<EmploymentList />} />
                <Route path = "/forgotPassword" element = {<ForgotPassword />} />
                <Route path = "/dashboard" element = {<Dashboard />} />
                <Route path = "/resetPassword/:URL" element = {<ResetPassword />}/>

              <Route path="/skills" element={<SkillsList />} />
              <Route path="/education" element={<EducationList />} />
              <Route path="/certifications" element={<CertificationList />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/jobs" element={<JobsList />} />

              {/* Resume Feature Routes - UC-046, UC-047, UC-048, UC-049, UC-050, UC-051, UC-052, UC-053, UC-054 */}
              <Route path="/resumes" element={<ResumeList />} />
              <Route path="/resumes/create" element={<ResumeCreate />} />
              <Route path="/resumes/edit/:id" element={<ResumeEditor />} />
              <Route path="/resumes/preview/:id" element={<ResumePreviewPage />} />
              <Route path="/resumes/versions/:id" element={<VersionManagementPage />} />
              <Route path="/resumes/export/:id" element={<ExportResumePage />} />
              <Route path="/resumes/share/:id" element={<SharingAndFeedbackPage />} />

              {/* Catch-all 404 route - must be last */}
              <Route path ="*" element={<h2>404 - Page Not Found</h2>} />
             </Routes>
            </FlashProvider>
          </>

      </header>
    </div>
  );
}
