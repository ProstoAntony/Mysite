import React from "react";
import GamingForm from "../components/GamingForm";
import '../styles/register-page.css';

function Registerpage() {
    return (
        <div className="register-page">
            <GamingForm initialMode="register" />
        </div>
    );
}

export default Registerpage;
