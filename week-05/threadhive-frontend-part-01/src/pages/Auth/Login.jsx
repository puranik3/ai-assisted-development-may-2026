import React, { useState } from 'react';

import "./Auth.css";

function Login() {
    // Define relevant state variables for login form
    // React maintains state variables for the component (useState hook)
    // UI is derived from state (variables created within the component), and...
    // ...props (like function arguments passed from Parent component)

    // useState() -> [ variable, setVariableFunction ]
    const [ message, setMessage ] = useState('Hello, world');

    const handleSubmit = e => {
        e.preventDefault();
        console.log('Login Attempt:');
        // setForm({ email: '', password: '' });
        setMessage('Login Attempted');
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Login - {message}</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;