import brcypt from 'bcryptjs';
import User from '../models/User.js';
import { createAppError } from '../utils/createAppError.js';

export const register = async ( { name, email, password } ) => {
    const existingUser = await User.findOne( { email } );

    if ( existingUser ) {
        throw createAppError('User already exists', 409);
    }

    // hash the password
    const hashedPassword = await brcypt.hash( password, 10 );

    let newUser = await User.create( { name, email, password: hashedPassword } );

    // remove the password
    newUser = newUser.toObject()
    delete newUser.password;

    return newUser;
};