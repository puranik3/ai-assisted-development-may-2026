import brcypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const login = async ( { email, password } ) => {
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw createAppError("Bad credentials", 401);
  }

  const isPasswordValid = await brcypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw createAppError("Bad credentials", 401);
  }

  const user = existingUser.toObject();
  delete user.password;

  // generate a JWT token
  const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { ...user, token };
};