import React from "react";
import { Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from "../src/pages/home";
import Login from "../src/pages/login"
import Register from "../src/pages/register"
import Auth from "../tools/auth"; //Does nothing... yet....



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
    
            <Routes>
              <Route path = "/" element = {<Home />} />
              <Route path = "/register" element = {<Register />} />
              <Route path = "/login" element = {<Login />} />

            </Routes>
       

      </header>
    </div>
  );
}

export default App;
