import React from "react";
import { Routes, Route } from 'react-router-dom';
import Nav from "../src/tools/nav"
import logo from './logo.svg';
import './App.css';
import Home from "../src/pages/home";
import Login from "../src/pages/login"
import Register from "../src/pages/register"
import Profile from "../src/pages/profile"



export function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <>
          <Nav />
            <Routes>
              <Route path = "/" element = {<Home />} />
              <Route path = "/register" element = {<Register />} />
              <Route path = "/login" element = {<Login />} />
              <Route path = "/profile" element = {<Profile />} />
              <Route path ="*" element={<h2>404 - Page Not Found</h2>} />
            </Routes>
          </>

      </header>
    </div>
  );
}
