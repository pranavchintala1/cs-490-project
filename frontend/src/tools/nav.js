import React, { useContext } from "react";

const Nav = ({user}) => {
  return (
    <nav>
      <a href="/">Home</a>
      
      {user?.loggedIn ? (
        <>
        <a href="/profile">Profile</a>
        <button> Logout</button>
        </>
      ) : (
        <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        </>
      )}
    </nav>
  );
};

export default Nav;