import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { OAuth } from "../tools/OAUTH";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../tools/msal";
import { useMsal } from "@azure/msal-react";

function Login() {
    // I left all the stylings in the below html blank for whoever needs to look at that (?)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const { flash, showFlash }  = useFlash();
    const { instance } = useMsal();


    const onSubmit = (data,JWT = false) => {

        const userData = JSON.parse(localStorage.getItem(data.email)); // TODO Change localstorage to whatever database is being used later

            if (userData && userData.password === data.password) { //If the entered password matches the stored password.
                localStorage.setItem("session",userData.token) // TODO change localstorage session to something else later.
                navigate(`/profile/${userData.token}`); // make profile later lmao. 
            } 
            else {
                showFlash('Invalid email or password',"error");
                reset();
                
        
            }
        };

    const OAuthSubmit = (data) => {


        // send data.credential to backend.
            //if the signature is good...
            // retrieve user token data from other endpoint. then login.
            const token = "temp"
            navigate(`/profile/${token}`)
            return;



    };

const handleMicrosoftLogin = async () => {
  try {
    const response = await instance.loginPopup({
      scopes: ["user.read", "openid", "profile", "email"],
    });

    const { account, idToken } = response;
    console.log("Logged in user:", account);

    /* update l8r with actual api implementation 
    await fetch("/api/login/microsoft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });*/

    // Navigate or update app state
    localStorage.setItem("session",idToken)
    navigate(`/profile/${account.homeAccountId}`);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
    

    return (
        <>
            <h2>Login</h2>


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
            
            <GoogleLogin
                onSuccess={credentialResponse => {
                    OAuthSubmit(credentialResponse);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />

            <button onClick={handleMicrosoftLogin}>
            Login with Microsoft
            </button>


            <Link to="/forgotPassword">Forgot password</Link>
        </>
    );

}



export default Login;