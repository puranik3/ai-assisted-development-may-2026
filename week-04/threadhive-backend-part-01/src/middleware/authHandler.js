import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { createAppError } from "../utils/createAppError.js";

dotenv.config();

const authHandler = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createAppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1]; // [ "Bearer", "token" ]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // res.locals can be used instead
    // Store the user ID in the request object for later use
    req.user ={
      userId: decoded.sub
    };

    // req.user = await User.findById(decoded.sub);
    // if (!req.user) {
    //   return next(createAppError("Unauthorized", 401));
    // }

    next();
  } catch (error) {
    throw createAppError("Unauthorized", 401);
  }
};

export default authHandler;
