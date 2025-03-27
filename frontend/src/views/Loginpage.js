import React from 'react';
import GamingForm from '../components/GamingForm';
import '../styles/login-page.css';

function Loginpage() {
    return (
        <div className="login-page">
            <GamingForm initialMode="login" />
        </div>
    );
}

export default Loginpage;