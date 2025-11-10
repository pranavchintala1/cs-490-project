import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useMsal } from "@azure/msal-react";
import AuthAPI from "../api/authentication"; 
import "../Styles/login.css"; 
import logo from "../logo.svg.png"; 

function Login() {
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
    try {
      const res = await AuthAPI.login(data);

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate(`/profile`);
      return;
    } catch (error) {
      console.log("ERROR", error);
      showFlash("Invalid Email or Password", "error");
      reset();
    }
  };

  const OAuthSubmit = async (data) => {
    try {
      const res = await AuthAPI.loginGoogle(data);

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate(`/profile`);
    } catch (error) {
      showFlash(error, "error");
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

      const res = await AuthAPI.loginMicrosoft({ token: tokenResponse.idToken });

      if (res.status !== 200) {
        showFlash(res.data.detail, "error");
        return;
      }

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate("/profile");
    } catch (err) {
      console.error("Microsoft login failed:", err);
      showFlash(err.message, "error");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card shadow">
        <div className="login-logo mb-3">
          <img src={logo} alt="Metamorphosis logo" className="login-logo-img" />
        </div>

        <h2 className="fw-bold mb-3">Welcome Back</h2>
        <p className="text-muted mb-4">
          Sign in to access your <strong>Metamorphosis</strong> dashboard.
        </p>

        <form className="Login" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="Email"
            className="form-control mb-3"
          />

          <input
            type="password"
            {...register("password", { required: true })}
            placeholder="Password"
            className="form-control mb-3"
          />

          <input
            type="submit"
            className="btn btn-success w-100 fw-semibold"
            value="Login"
          />
        </form>

        <div className="oauth-buttons mt-3">
          <div className="google-login mb-2">
            <GoogleLogin
              onSuccess={(credentialResponse) => OAuthSubmit(credentialResponse)}
              onError={() => console.log("Login Failed")}
            />
          </div>

          <button
            className="btn btn-outline-dark w-100 fw-semibold microsoft-login"
            onClick={handleMicrosoftLogin}
          >
            <i className="fab fa-microsoft me-2"></i> Login with Microsoft
          </button>
        </div>

        <div className="extra-links mt-3">
          <Link to="/register" className="d-block text-success">
            Register
          </Link>
          <Link to="/forgotPassword" className="d-block text-muted">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
