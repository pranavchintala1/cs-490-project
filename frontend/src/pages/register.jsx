import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { OAuth } from "../tools/OAUTH";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../tools/msal";
import { useMsal } from "@azure/msal-react";


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


    const onSubmit = (data) => {


        
        const duplicateData= JSON.parse(localStorage.getItem(data.email)); // method to send credentials to backend.
 
            if (duplicateData){
                
                showFlash('Email is taken, choose again.',"error");
                return;

            }            

            const newData = {
                email: data.email,
                password: data.password, // replace this when database gets updated.
                firstName: data.firstName,
                lastName: data.lastName,
                session: "temp",

            };
        

            localStorage.setItem(data.email,JSON.stringify(newData)); //replace this with sending data to database.
            localStorage.setItem("session",newData.session);

            showFlash("Successfully Registered!","Success");
            
            navigate(`/profile/${newData.session}`);
            
        };

        const OAuthSubmit = (data) => {

            const token = OAuth(data); // Link this account with local non-google account later.


            if (!token){
                //POST data.credentials to backend to register, then log in.
                
                showFlash("Successfully Registered!","Success");
                return;
                
            }

            if (token == "error"){

                showFlash('Error authentication user',"error");
                return;

            }

            localStorage.setItem("session",token)

            navigate(`/profile/${token}`);
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
            <h2>Register</h2>

            <form className="Register" onSubmit={handleSubmit(onSubmit)}>

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