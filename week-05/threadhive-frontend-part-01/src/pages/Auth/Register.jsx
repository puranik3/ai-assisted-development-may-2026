import React, { useState } from 'react';
import "./Auth.css";
import registerImage from '../../assets/register-collaboration.jpg';

function Register() {
  const [form, setForm] = useState(
    {
      name: '',
      email: '',
      password: ''
    }
  );

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Register Attempt:', form);
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-container auth-split-layout">
      <div className="auth-form-section">
        <div className="auth-box">
          <h2>Create an account</h2>
          <p className="auth-subtitle">Sign up and get 30 day free trial</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            <button type="submit">Submit</button>
            <div className="auth-social-buttons">
              <button type="button" className="social-btn apple-btn">
                <span>🍎</span> Apple
              </button>
              <button type="button" className="social-btn google-btn">
                <span>🔍</span> Google
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="auth-image-section">
        <button>
          <img src={registerImage} alt="Business collaboration" className="auth-image" />
        </button>
      </div>
    </div>
  );
}

export default Register;