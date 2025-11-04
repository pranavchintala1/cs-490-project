import React, { useEffect } from 'react';

const Home = ({user, session}) => {
  useEffect(() => {
    // Your logic here
  }, [user, session]);

  return (
    <div className="text-center mt-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <img 
          src="/image.png" 
          alt="Metamorphosis logo"
          style={{ 
            maxWidth: "400px", 
            height: "auto", 
            marginRight: "20px" 
          }}
        />
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0" }}>
          Metamorphosis
        </h1>
      </div>
      <h2>Welcome! Let's start your profile.</h2>
    </div>
  );
}

export default Home;