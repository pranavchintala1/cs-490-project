
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";




const ResetPassword = () => {


    const URL = useParams();

    const {
       
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash }  = useFlash();
    const Navigate = useNavigate();

    //Put a query to database here to see if the url token exists. The reset link in the database should be tied to the user account somehow.

    if (!URL){ // if the url to reset does not exist, change later.

        return(
            <>
            <h1>The password reset link you are looking for does not exist.</h1>
            </>


        )

    }



    const onSubmit = (data) => {



        //user.password = data.password => send to backend and update value.
        //delete database entry for password reset link.
        //Set session to user's session.
        const session = "temp";
    
        reset();

        Navigate(`/profile/${session}`);



    };




return (
    <>

    <form className="Reset" onSubmit={handleSubmit(onSubmit)}>

        <input
            type="password"
            minLength="8"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
            {...register("password", { required: true })}
            placeholder="Enter new password"
        />

        <input
            type="password"
            {...register("confirm", { 
                required: true, 
                validate: (value,data) => value === data.password || "Passwords must match."})}
            placeholder="Confirm new password"
        />

        <input type="submit"></input>

    </form>


    </>




);

}



export default ResetPassword;