import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Nav = () => {

  const token = localStorage.getItem("session");
  const navigate = useNavigate();


  const logout = () => {

    localStorage.removeItem("session");
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
          <NavLink to="/profile">Profile</NavLink>
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

        </>
        )}
        
      </ul>
    </nav>
  );
};

export default Nav;