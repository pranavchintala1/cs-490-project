
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";
import { getData,updateData } from "../tools/db_commands"




const ResetPassword = async () => {


    const URL = useParams();

    const {
       
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm();

    const { flash, showFlash }  = useFlash();
    const Navigate = useNavigate();

    const res = await getData(URL,"api/auth/resetpassword")

    //Put a query to database here to see if the url token exists. The reset link in the database should be tied to the user account somehow.

    if (!res){ // if the url to reset does not exist, change later.

        return(
            <>
            <h1>The password reset link you are looking for has expired or does not exist.</h1>
            </>


        )

    };

    res = res.json()



    const onSubmit = (data) => {



        //user.password = data.password => send to backend and update value.
        //delete database entry for password reset link.
        //Set session to user's session.

        res = updateData(data,"api/user/updatepassword")

        if(!res){
            showFlash("Something went wrong when registering","error");
            return;
        }

        data = res.json()

        if (res.status != 200 ){
    
            showFlash(data.content,"error");
            return;
        }

        Navigate(`/profile/${data.session_token}`);
        return;



    };




return (
    <>

    <form  className="Reset" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" value={res.uuid} {...register("token")} />
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