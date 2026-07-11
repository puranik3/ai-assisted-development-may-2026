import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from '../src/pages/Auth/ResetPassword';

describe('ResetPassword', () => {
    let onResetPassword;

    beforeEach(() => {
        onResetPassword = vi.fn();
    });

    it('renders all form fields and the submit button', () => {
        render(<ResetPassword onResetPassword={onResetPassword} />);

        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Old Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('renders the heading', () => {
        render(<ResetPassword onResetPassword={onResetPassword} />);

        expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    });

    it('does not show error or success message on initial render', () => {
        render(<ResetPassword onResetPassword={onResetPassword} />);

        expect(screen.queryByText(/do not match/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/successfully/i)).not.toBeInTheDocument();
    });

    it('updates field values as the user types', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass456');

        expect(screen.getByPlaceholderText('Email')).toHaveValue('user@example.com');
        expect(screen.getByPlaceholderText('Old Password')).toHaveValue('oldpass123');
        expect(screen.getByPlaceholderText('New Password')).toHaveValue('newpass456');
        expect(screen.getByPlaceholderText('Confirm Password')).toHaveValue('newpass456');
    });

    it('shows an error when new password and confirm password do not match', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'differentpass');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.getByText('New password and confirm password do not match')).toBeInTheDocument();
    });

    it('does not call onResetPassword when passwords do not match', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'differentpass');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(onResetPassword).not.toHaveBeenCalled();
    });

    it('calls onResetPassword with the correct data on valid submission', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass456');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(onResetPassword).toHaveBeenCalledOnce();
        expect(onResetPassword).toHaveBeenCalledWith({
            email: 'user@example.com',
            oldPassword: 'oldpass123',
            newPassword: 'newpass456',
            confirmPassword: 'newpass456',
        });
    });

    it('shows a success message after valid submission', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass456');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.getByText('Password has been reset successfully!')).toBeInTheDocument();
    });

    it('clears all fields after valid submission', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass456');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.getByPlaceholderText('Email')).toHaveValue('');
        expect(screen.getByPlaceholderText('Old Password')).toHaveValue('');
        expect(screen.getByPlaceholderText('New Password')).toHaveValue('');
        expect(screen.getByPlaceholderText('Confirm Password')).toHaveValue('');
    });

    it('clears the error message on a subsequent valid submission', async () => {
        const user = userEvent.setup();
        render(<ResetPassword onResetPassword={onResetPassword} />);

        // First trigger the error
        await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Old Password'), 'oldpass123');
        await user.type(screen.getByPlaceholderText('New Password'), 'newpass456');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'wrong');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('New password and confirm password do not match')).toBeInTheDocument();

        // Fix confirm password and resubmit
        await user.clear(screen.getByPlaceholderText('Confirm Password'));
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass456');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.queryByText('New password and confirm password do not match')).not.toBeInTheDocument();
    });
});
