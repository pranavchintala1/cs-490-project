import React, { useState } from "react";



export const useFlash = (duration = 3000) => {

    const [flash, setFlash] = useState({message:"",type:"error"});


    const showFlash = (message, type) => {

        setFlash({message,type});
        setTimeout(() => { setFlash(prev => ({ ...prev, message: ""}));}, duration);
    }


    return [flash,showFlash];
 

};
