import React, { useState } from "react";
import { useFlash } from "../context/flashContext";
 


const Flash = (duration = 3000) => {

    const [flash, setFlash] = useState({message:"",type:"error"}); 


    const showFlash = (message, type) => {

        setFlash({message,type});
        setTimeout(() => { setFlash(prev => ({ ...prev, message: ""}));}, duration);
    }


    return { flash,showFlash };
 

};


export default Flash;

export const FlashMessage = () => {
  const { flash } = useFlash();
  if (!flash || !flash.message) return null;

  return (
    <div // Feel free to change this styling if needed.
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 20px",
        backgroundColor: flash.type === "error" ? "red" : "green",
        color: "white",
        borderRadius: 5,
        zIndex: 9999,
      }}
    >
      {flash.message}
    </div>
  );
};