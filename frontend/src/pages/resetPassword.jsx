import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import AuthAPI from "../api/authentication";

const ResetPassword = () => {
  const { token } = useParams();
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  const { handleSubmit, register, formState: { errors } } = useForm();
  const { flash, showFlash } = useFlash();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AuthAPI.resetPassword(token)
        if (!res) {
          setRes(null);
          console.log("NO OR NULL RESPONSE")
          return;
        }
        const json = await res.data;
        setRes(json);
      } catch (err) {
        console.error(err);
        setRes(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  if (!res) {
    return <h1>The password reset link has expired or does not exist.</h1>;
  }

  const onSubmit = async (data) => {
    try {
      data.old_token = token;
      const res = await AuthAPI.updatePassword(data);
      if (!res) {
        showFlash("Something went wrong", "error");
        return;
      }

      if (res.status !== 200) {
        showFlash(res.data.detail || "Error", "error");
        return;
      }

      localStorage.setItem("session", res.data.session_token);
      localStorage.setItem("uuid", res.data.uuid);

      navigate(`/profile`);
    } catch (err) {
      console.error(err);
      showFlash("Something went wrong", "error");
    }
  };

  return (
    <form className="Reset" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" value={res.uuid} {...register("token")} />
      
      <input
        type="password"
        minLength="8"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
        {...register("password", { required: true })}
        placeholder="Enter new password"
        title="Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number"
      />
      {errors.password && (
        <p style={{ color: "red" }}>Password is required</p>
      )}
      
      <input
        type="password"
        {...register("confirm", {
          required: true,
          validate: (value, data) =>
            value === data.password || "Passwords must match.",
        })}
        placeholder="Confirm new password"
      />
      {errors.confirm && (
        <p style={{ color: "red" }}>{errors.confirm.message || "Confirmation is required"}</p>
      )}
      
      <input type="submit" />
    </form>
  );
};

export default ResetPassword;