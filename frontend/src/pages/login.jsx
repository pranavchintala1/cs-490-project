import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";

function Login() {
    // I left all the stylings in the below html blank for whoever needs to look at that (?)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const [flash, showFlash] = useFlash();


    const onSubmit = (data) => {
        const userData = JSON.parse(localStorage.getItem(data.email)); // TODO Change localstorage to whatever database is being used later

            if (userData && userData.password === data.password) { //If the entered password matches the stored password.
                localStorage.setItem("session","temp") // TODo change localstorage session to something else later.
                navigate("/profile"); // make profile later lmao. 
            } 
            else {
                showFlash('Invalid email or password',"error");
                reset();
                
        
            }
        };
    

    return (
        <>
            <h2>Login</h2>

            {flash.message && ( <div className={`flash-${flash.type}`}>{flash.message}</div> )}

            <form className="Login" onSubmit={handleSubmit(onSubmit)}>

                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                />

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />

                <input type="submit" style={{}} /> 
            </form>
        </>
    );
}



export default Login;