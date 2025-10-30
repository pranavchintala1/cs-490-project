import React from "react";
import { Routes, Route } from 'react-router-dom';
import Nav from "./tools/nav"
import logo from './logo.svg';
import './App.css';
import Home from "./pages/home";
import Login from "./pages/login"
import Register from "./pages/register"
import Profile from "./pages/profile"
import ForgotPassword from "./pages/forgotPassword"
import ResetPassword from "./pages/resetPassword"
import Dashboard from "./pages/dashboard";
import SkillsList from "./pages/skills/SkillList";
import EducationList from "./pages/education/EducationList";
import CertificationList from "./pages/certifications/CertificationList";
import ProjectsList from "./pages/projects/ProjectList";
import { FlashProvider, FlashMessage } from "./context/flashContext"


export function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <>
    
          <FlashProvider>
            <FlashMessage />
              <Nav />
              <Routes>
                <Route path = "/" element = {<Home />} />
                <Route path = "/register" element = {<Register />} />
                <Route path = "/login" element = {<Login />} />
                <Route path = "/profile" element = {<Profile />} />
                <Route path = "/forgotPassword" element = {<ForgotPassword />} />
                <Route path = "/dashboard" element = {<Dashboard />} />
                <Route path = "/resetPassword/:URL" element = {<ResetPassword />}/>
                <Route path ="*" element={<h2>404 - Page Not Found</h2>} />

                <Route path="/skills" element={<SkillsList />} />
              <Route path="/education" element={<EducationList />} />
              <Route path="/certifications" element={<CertificationList />} />
              <Route path="/projects" element={<ProjectsList />} />
             </Routes>
            </FlashProvider>
          </>

      </header>
    </div>
  );
}
