import React, { useState } from 'react';
import "./Auth.css";

function ResetPassword({ onResetPassword }) {
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        setError('');

        // Validate that new password and confirm password match
        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        // Call the onResetPassword callback with the form data
        onResetPassword({
            email,
            oldPassword,
            newPassword,
            confirmPassword
        });

        // Show success message and reset form
        setSuccess(true);
        setEmail('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Reset Password</h2>

                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
                        {error}
                    </div>
                )}

                {
                    success && (
                        <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>
                            Password has been reset successfully!
                        </div>
                    )
                }

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="oldPassword">Old Password</label>
                    <input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        required
                    />

                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />

                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
