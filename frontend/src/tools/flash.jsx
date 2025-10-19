import React, { useState } from "react";



const Flash = (duration = 3000) => {

    const [flash, setFlash] = useState({message:"",type:"error"}); // TODO. Add styling for different messages. for example, flash-error could be red or something.


    const showFlash = (message, type) => {

        setFlash({message,type});
        setTimeout(() => { setFlash(prev => ({ ...prev, message: ""}));}, duration);
    }


    return [flash,showFlash];
 

};


export default Flash;
