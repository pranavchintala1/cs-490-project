import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";

const Nav = () => {

  const token = localStorage.getItem("session"); //Also Change with database later.
  const navigate = useNavigate();
  const { flash, showFlash } = useFlash();


  const logout = () => {

    localStorage.removeItem("session"); // Change with database later.
    showFlash("Successfully Logged out","success");
    navigate("/") // Home link, maybe change later idk.

  };

  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>

        {token ? ( // Shows login and register when person is not logged in, and profile and logout when they are.
        <>

        <li>
          <NavLink to={`/profile/${token}`}>Profile</NavLink>
        </li>
        <li>
          <button onClick ={logout}>Logout</button>
        </li> 
        
        </>
        ) : ( 
        <>

        <li>
          <NavLink to="/login">Login</NavLink>
        </li>
        <li>
          <NavLink to="/register">Register</NavLink>
        </li> 
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li> 

        </>
        )}
        
      </ul>
    </nav>
  );
};

export default Nav;