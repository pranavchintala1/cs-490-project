
import { useForm } from "react-hook-form";
import { useFlash } from "../context/flashContext";
import { sendData } from "../tools/db_commands";
import "../Styles/forgot.css";
import logo from "../logo.svg.png";





const ForgotPassword = () => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash }  = useFlash();


    const onSubmit = (data) => {


        sendData({email:data.email},"/api/auth/password/forgot")
        
        showFlash('If your email exists, you will receive a password reset link.',"success",5000);

        reset();



    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-page">
                <div className="forgot-card shadow">
                <div className="login-logo mb-3">
                    <img
                    src={logo}
                    alt="Metamorphosis logo"
                    className="login-logo-img"
                    />
                </div>

                <h2 className="fw-bold mb-2">Forgot Password?</h2>
                <p className="text-muted mb-4">
                    Enter the email address associated with your account and we’ll send
                    you a password reset link.
                </p>

                <form className="Reset" onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="email"
                        {...register("email", { required: true })}
                        placeholder="Email"
                        className="form-control mb-3"
                    />
                    <input
                        type="submit"
                        className="btn btn-success w-100 fw-semibold"
                        value="Send Reset Link"
                    />
                </form>
                </div>
            </div>
        </div>
    );

}



export default ForgotPassword;