import { register } from "../services/authService.js";

// http://localhost:8000/api/auth/register
// BODY -> { name: 'John', email: 'john@example.com', password: 'Password123' }
export const registerUser = async ( req, res, next ) => {
    // We are writing some bad code intentionally
    const credentials = req.body;

    const newUser = await register( credentials );

    res.status( 201 ).json({
        success: true,
        message: 'User registered successfully',
        data: newUser
    });
};