
import { useForm } from "react-hook-form";
import { useFlash } from "../context/flashContext";




const ForgotPassword = () => {

    const {
       
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash }  = useFlash();


    const onSubmit = (data) => {

        //In the future, send data to backend, which will then send it to email via node.js shenanagins (?)

        
        reset();
        showFlash('If your email exists, you will receive a password reset link.',"success",5000);



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