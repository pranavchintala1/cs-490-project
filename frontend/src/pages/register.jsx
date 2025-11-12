import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import AuthAPI from "../api/authentication"; 
import "../styles/register.css"; 
import logo from "../logo.svg.png"; 

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
    const payload = {
      username: data.username,
      password: data.password,
      email: data.email,
      full_name: `${data.firstName} ${data.lastName}`,
    };

    try {
      const res = await AuthAPI.register(payload);
      showFlash("Successfully Registered!", "success");

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate(`/profile`);
      return;
    } catch (error) {
      showFlash(error, "error");
    }
  };

  const OAuthSubmit = async (data) => {
    try {
      const res = await AuthAPI.loginGoogle(data);

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      if (!res.data.has_password){
        navigate(`/set-password`);
        return;
      }

      navigate(`/profile`);
      return;
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


      if (!res.data.has_password){
        navigate(`/set-password`);
        return;
      }

      navigate("/profile");
      return;
    } catch (err) {
      console.error("Microsoft login failed:", err);
      showFlash(err.message, "error");
    }
  }

  return (
    <div className="register-page">
      <div className="register-card shadow">
        <div className="login-logo mb-3">
          <img src={logo} alt="Metamorphosis logo" className="login-logo-img" />
        </div>

        <h2 className="fw-bold mb-2">Create Your Account</h2>
        <p className="text-muted mb-4">
          Join <strong>Metamorphosis</strong> and start your journey today.
        </p>

        <form className="Register" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            {...register("username", { required: true })}
            placeholder="Username"
            className="form-control mb-3"
          />

          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="Email"
            className="form-control mb-3"
          />

          <input
            type="password"
            minLength="8"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
            {...register("password", { required: true })}
            placeholder="Password"
            title="Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number"
            className="form-control mb-3"
          />

          <input
            type="password"
            {...register("confirm", {
              required: true,
              validate: (value, data) =>
                value === data.password || "Passwords must match.",
            })}
            placeholder="Confirm Password"
            className="form-control mb-3"
          />

          <input
            type="text"
            {...register("firstName", { required: true })}
            placeholder="First Name"
            pattern="^[A-Za-z]+$"
            title="Please enter a valid name only"
            className="form-control mb-3"
          />

          <input
            type="text"
            {...register("lastName", { required: true })}
            placeholder="Last Name"
            pattern="^[A-Za-z]+$"
            title="Please enter a valid name only"
            className="form-control mb-3"
          />

          <input
            type="submit"
            className="btn btn-success w-100 fw-semibold"
            value="Register"
          />
        </form>

        <div className="oauth-buttons mt-3">
          <div className="google-login mb-2">
            <GoogleLogin
              onSuccess={(credentialResponse) =>
                OAuthSubmit({ credential: credentialResponse.credential })
              }
              onError={() => console.log("Login Failed")}
            />
          </div>

          <button
            className="btn btn-outline-dark w-100 fw-semibold"
            onClick={handleMicrosoftLogin}
          >
            <i className="fab fa-microsoft me-2"></i> Login with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
