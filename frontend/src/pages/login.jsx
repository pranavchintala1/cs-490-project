import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../tools/msal";
import { useMsal } from "@azure/msal-react";
import { sendData } from "../tools/db_commands";
import { apiRequest } from "../api";
// import { useSearchParams } from "react-router-dom";

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

//     const [searchParams] = useSearchParams(); //maybe broke
//     useEffect(() => {
//     const errParam = searchParams.get("error");
//     if (errParam === "unauthorized") {
//       setError("You must log in to access that page.");
//     }
//   }, [searchParams]);


    const onSubmit = async (data) => {

        const res = await sendData(data,"/api/auth/login"); // TODO Change localstorage to whatever database is being used later
        
        if (!res){
            showFlash("Something went wrong when registering","error");
            return;

        }

        const json =  await res.json();


        if (res.status != 200) { //If the entered password does NOT match the stored password.
  
               showFlash(json.detail,"error");
                reset();  
    
               return;     
            
        } 
        else {


                localStorage.setItem("session",json.session_token)
                localStorage.setItem("uuid",json.uuid)
                
                navigate(`/profile`); // make profile later lmao. 

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