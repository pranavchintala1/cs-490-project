import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { getData, updateData } from "../tools/db_commands";

const ResetPassword = () => {
  const { token } = useParams(); // assuming your URL param is called "token"
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);

  const { handleSubmit, register, formState: { errors } } = useForm();
  const { flash, showFlash } = useFlash();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getData(token, "/api/auth/resetpassword");
      if (!response) {
        setRes(null);
        return;
      }
      const json = await response.json();
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
        
      const response = await updateData(data, "/api/user/updatepassword");
      if (!response) {
        showFlash("Something went wrong", "error");
        return;
      }
      const json = await response.json();

      if (response.status !== 200) {
        showFlash(json.content || "Error", "error");
        return;
      }

      localStorage.setItem("session", json.session_token);
      localStorage.setItem("user_id", json.uuid);

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
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
        {...register("password", { required: true })}
        placeholder="Enter new password"
        title="Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number"
      />
      <input
        type="password"
        {...register("confirm", {
          required: true,
          validate: (value, data) =>
            value === data.password || "Passwords must match.",
        })}
        placeholder="Confirm new password"
      />
      <input type="submit" />
    </form>
  );
};

export default ResetPassword;
