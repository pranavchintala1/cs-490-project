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
import { apiRequest } from "../api";


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


        
        const res = await sendData(data,"/api/auth/register");


        if (!res){
            showFlash("Something went wrong when registering","error");
            return;

        }

        const json = await res.json()
        console.log(json)

        if (res.status != 200){
            showFlash(json.detail,"error");
        }
        else{


            showFlash("Successfully Registered!","Success");

            localStorage.setItem("session",res.session_token);
            localStorage.setItem("uuid",res.uuid)
                
            
            navigate(`/profile`);

        }
            return;
            
        };

        const OAuthSubmit = async (data) => {

        

            const res = await sendData(data,"/api/auth/verify-google-token"); // Link this account with local non-google account later.

            if (!res){
                 
            showFlash("Something went wrong when registering","error");
            return;

            }

            const json = await res.json();
            if (res.status != 200){
                
                showFlash(json.detail,"error");
                return;
                
            }

            localStorage.setItem("session",json.session_token)
            localStorage.setItem("uuid",json.uuid)
                

            navigate(`/profile`);
            return;

        };

async function handleMicrosoftLogin() {
  try {

    const loginResponse = await instance.loginPopup({
      scopes: ["user.read", "openid", "profile", "email"],
      prompt: "select_account",
    });

    if (!loginResponse?.account) {
      showFlash("Microsoft login failed. No account found.", "error");
      return;
    }

    const tokenResponse = await instance.acquireTokenSilent({
      scopes: ["user.read", "openid", "profile", "email"],
      account: loginResponse.account,
    });

    if (!tokenResponse?.idToken) {
      showFlash("Unable to acquire Microsoft token.", "error");
      return;
    }

    const res = await apiRequest("/api/login/microsoft", " ", {
      method: "PUT",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({ token: tokenResponse.idToken }),
    });

    if (res.detail !== "success") {
      showFlash(res.detail,"error")
      return;
    }

    localStorage.setItem("session", res.session_token);
    localStorage.setItem("uuid", res.uuid);

    navigate("/profile");
  } catch (err) {
    console.error("Microsoft login failed:", err);
    showFlash(err.message,"error");
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
                    required
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
                    title="Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number"
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
                    required
                    pattern="^[A-Za-z]+$"
                    title="Please enter a valid name only"
                />

                <input
                    type="text"
                    {...register("lastName", { required: true })}
                    placeholder="Last Name"
                    required
                    pattern="^[A-Za-z]+$"
                    title="Please enter a valid name only"
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