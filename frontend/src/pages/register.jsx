import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/flashContext";



function Register() {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const [flash, showFlash] = useFlash();


    const onSubmit = (data) => {
        const duplicateData = JSON.parse(localStorage.getItem(data.email));

            if (duplicateData){
                showFlash('Email is taken, choose again.',"error");
                return;
            }            

            const newData = {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                token: "temp",

            };

            localStorage.setItem(data.email,JSON.stringify(newData)); //replace this with sending data to database.
            localStorage.setItem("session",newData.session);

            showFlash("Successfully Registered!","Success")
            
            navigate("/profile")
            
        };


    
    return (
        <>
            <h2>Register</h2>

            {flash.message && ( <div className={`flash-${flash.type}`}>{flash.message}</div> )}

            <form className="Register" onSubmit={handleSubmit(onSubmit)}>

                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                />

                <input
                    type="password"
                    minLength="8"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />

                <input
                    type="password"
                    {...register("confirm", { 
                        required: true, 
                        validate: (value,data) => value === data.password || "Passwords must match."})}
                    placeholder="Confirm Password"
                />

                <input
                    type="text"
                    {...register("firstName", { required: true })}
                    placeholder="First Name"
                />

                <input
                    type="text"
                    {...register("lastName", { required: true })}
                    placeholder="Last Name"
                />

                <input type="submit" style={{}} /> 
            </form>
        </>
    );







}

export default Register;