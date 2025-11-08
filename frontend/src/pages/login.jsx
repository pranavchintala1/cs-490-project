import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../tools/msal";
import { useMsal } from "@azure/msal-react";
import AuthAPI from "../api/authentication";
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
  const { flash, showFlash } = useFlash();
  const { instance } = useMsal();

<<<<<<< HEAD
  //     const [searchParams] = useSearchParams(); //maybe broke
  //     useEffect(() => {
  //     const errParam = searchParams.get("error");
  //     if (errParam === "unauthorized") {
  //       setError("You must log in to access that page.");
  //     }
  //   }, [searchParams]);
=======
                localStorage.setItem("session",res.session_token)
                localStorage.setItem("uuid",res.uuid)
                
                navigate(`/dashboard`); // make profile later lmao. 
>>>>>>> origin/dev


  const onSubmit = async (data) => {
    try {

      const res = await AuthAPI.login(data);


      localStorage.setItem("session", res.data.session_token)
      localStorage.setItem("uuid", res.data.uuid)

      navigate(`/profile`); // make profile later lmao. 


      return;
    }
    catch (error) {

      showFlash(error);
      reset();
      return;
    }
  };

  const OAuthSubmit = async (data) => {

    try {
      // Link this account with local non-google account later.
      const res = await AuthAPI.loginGoogle(data);


      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);


      navigate(`/profile`);
      return;
    }
    catch (error) {

      showFlash(error, "error");
      return;

    }
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

      const res = await AuthAPI.loginMicrosoft({token: tokenResponse.idToken});

      if (res.status !== 200) { // please use status codes, don't try to compare strings. thanks
        showFlash(res.data.detail, "error")
        return;
      }

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate("/profile");
    } catch (err) {
      console.error("Microsoft login failed:", err);
      showFlash(err.message, "error");
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