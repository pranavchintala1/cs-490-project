import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { GoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
<<<<<<< HEAD
import { apiRequest } from "../api";
import "../Styles/register.css";
import logo from "../logo.svg.png"; 
=======
import AuthAPI from "../api/authentication";
>>>>>>> origin/dev

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
            full_name: `${data.firstName} ${data.lastName}`
        };

        try {
            const res = await AuthAPI.register(payload);

            showFlash("Successfully Registered!", "Success");

            localStorage.setItem("session", res.data.session_token);
            localStorage.setItem("uuid", res.data.uuid)

            navigate(`/profile`);
            return;
        }
        catch (error) {
            showFlash(error, "error");
            return;
        }
    };

    const OAuthSubmit = async (data) => {
        try {
            // Link this account with local non-google account later.
            const res = await AuthAPI.loginGoogle(data);

            localStorage.setItem("session", res.data.session_token)
            localStorage.setItem("uuid", res.data.uuid)

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

            if (res.status !== 200) { 
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

<<<<<<< HEAD
    const res = await apiRequest("/api/auth/login/microsoft", " ", {
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
=======
    return (
        <>
            <h2>Register</h2>
            <form className="Register" onSubmit={handleSubmit(onSubmit)}>
>>>>>>> origin/dev
                <input
                    type="text"
                    {...register("username", { required: true })}
                    placeholder="Username"
                    className="form-control mb-3"
                />
<<<<<<< HEAD

=======
>>>>>>> origin/dev
                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                    className="form-control mb-3"
                />
                <input
                    type="password"
                    minLength="8"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
                    {...register("password", { required: true })}
                    placeholder="Password"
                    title="Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number"
                    className="form-control mb-3"
                />
                <input
                    type="password"
                    {...register("confirm", {
<<<<<<< HEAD
                    required: true,
                    validate: (value, data) =>
                    value === data.password || "Passwords must match.",
=======
                        required: true,
                        validate: (value, data) => value === data.password || "Passwords must match."
>>>>>>> origin/dev
                    })}
                    placeholder="Confirm Password"
                    className="form-control mb-3"
                />
<<<<<<< HEAD

=======
>>>>>>> origin/dev
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
<<<<<<< HEAD

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
                    OAuthSubmit(credentialResponse)
                    }
                    onError={() => console.log("Login Failed")}
                />
            </div>

            <button
                className="btn btn-outline-dark w-100 fw-semibold"
                onClick={handleMicrosoftLogin}
            >
                <i className="fab fa-microsoft me-2"></i> Login with Microsoft
=======
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
>>>>>>> origin/dev
            </button>
            </div>
        </div>
        </div>
    );
}


export default Register;