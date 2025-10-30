
import { useForm } from "react-hook-form";
import { useFlash } from "../context/flashContext";
import { sendData } from "../tools/db_commands";




const ForgotPassword = () => {

    const {
       
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash }  = useFlash();


    const onSubmit = (data) => {

        sendData({email:data.email},"/api/auth/forgotpassword")
        
        showFlash('If your email exists, you will receive a password reset link.',"success",5000);

        reset();



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