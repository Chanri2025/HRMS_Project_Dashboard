import React from "react";
import SignInForm from "@/Component/auth/SignInForm";
import Logo from "@/assets/logo.svg";

const LandingPage = ({setIsAuthenticated}) => {
    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden flex-col justify-center items-center">
            <div className="bg-white p-10 rounded-lg shadow-lg border w-[450px] text-center">
                <img src={Logo} alt="SM Logo" className="mb-4 w-40 h-50 mx-auto"/>
                <h1 className="text-xl font-bold mb-4 pt-3">Welcome to Appynitty HRMS Portal</h1>
                <SignInForm setIsAuthenticated={setIsAuthenticated}/>
            </div>
        </div>
    );
};

export default LandingPage;
