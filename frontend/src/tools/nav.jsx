import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { sendData } from "../tools/db_commands";

const Nav = () => {

   //Also Change with database later.
  const navigate = useNavigate();
  const { flash, showFlash } = useFlash();
  const token = localStorage.getItem("session")


  const logout = async () => {

    const res = await sendData({uuid:localStorage.getItem("uuid")},"/api/auth/logout",token)
    console.log(res.status)
    if(!res || res.status != 200){
        showFlash("Error logging out","error");
        return;
    }
    
    localStorage.removeItem("session")
    localStorage.removeItem("uuid")
    showFlash("Successfully Logged out","success");
    navigate("/") // Home link, maybe change later idk.
    return;

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
          <NavLink to={`/profile`}>Profile</NavLink>
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