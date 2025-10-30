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
  
               showFlash(json.content,"error");

               if (res.status == 400){
                    reset();  
               }          
            
        } 
        else {


                localStorage.setItem("session",json.session_token)
                localStorage.setItem("user_id",json.uuid)
                
                navigate(`/profile`); // make profile later lmao. 

            }

            return;
        };

    const OAuthSubmit = (data) => {


        // send data.credential to backend.
            //if the signature is good...
            // retrieve user token data from other endpoint. then login.
            const res = sendData(data,"verify-google-token"); // Link this account with local non-google account later.
            
            if (!res){
                showFlash("Something went wrong","error")
                return
            }

            if (res.status != 200){
                            
                showFlash(res.content,"error");
                return;
                            
            }

             data = res.json();

            localStorage.setItem("session",data.session_token)
            localStorage.setItem("user_id",data.uuid)
                
                        

            navigate(`/profile`);
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
    
    navigate(`/profile`);
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