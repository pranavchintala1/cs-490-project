import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../tools/msal";
import { useMsal } from "@azure/msal-react";
import { sendData } from "../tools/db_commands";


function Register() {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const { flash, showFlash } = useFlash();

    const { instance } = useMsal();


    const onSubmit = async (data) => {


        
        const res = sendData(data,"/api/auth/register");

        if (!res){
            showFlash("Something went wrong when registering","error");

        }

        data = res.json()

        if (res.status != 200){
            showFlash(res.content,"error");
        }
        else{


            showFlash("Successfully Registered!","Success");
            
            navigate(`/profile/${data.session_token}`);

        }
            return;
            
        };

        const OAuthSubmit = (data) => {

            const res = sendData(data,"api/auth/verify-google-token"); // Link this account with local non-google account later.

            if (!res){
                 
            showFlash("Something went wrong when registering","error");

            }

            data = res.json();
            if (res.status != 200){
                
                showFlash(data.details,"error");
                return;
                
            }

            navigate(`/profile/${data.session_token}`);
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

    navigate(`/profile/${account.homeAccountId}`);
  } catch (error) {
    console.error("Login failed:", error);
  }
};


    
    return (
        <>
            <h2>Register</h2>

            <form className="Register" onSubmit={handleSubmit(onSubmit)}>

                 <input
                    type="text"
                    {...register("username", { required: true })}
                    placeholder="Username"
                />


                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                />

                <input
                    type="password"
                    minLength="8"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />

                <input
                    type="password"
                    {...register("confirm", { 
                        required: true, 
                        validate: (value,data) => value === data.password || "Passwords must match."})}
                    placeholder="Confirm Password"
                />

                <input
                    type="text"
                    {...register("firstName", { required: true })}
                    placeholder="First Name"
                />

                <input
                    type="text"
                    {...register("lastName", { required: true })}
                    placeholder="Last Name"
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
        </>
    );







}

export default Register;