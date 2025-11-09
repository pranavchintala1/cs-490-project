
import { useForm } from "react-hook-form";
import { useFlash } from "../context/flashContext";
import AuthAPI from "../api/authentication";

const ForgotPassword = () => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash } = useFlash();

    const onSubmit = async (data) => {

        try {
            await AuthAPI.forgotPassword({ email: data.email })
            showFlash('If your email exists, you will receive a password reset link.', "success", 5000);
            reset();
        } catch (err) {
            showFlash("Something went wrong, please try again with a different email or at a later time", "fail", 5000)
        }
    };

    return (
        <>
            <p>Enter email address associated with your account.</p>
            <form className="Reset" onSubmit={handleSubmit(onSubmit)}>

                <input type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                ></input>

                <input type="submit"></input>
            </form>
        </>
    );

}

export default ForgotPassword;