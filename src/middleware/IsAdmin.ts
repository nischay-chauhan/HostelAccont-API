import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from cookie or headers
        const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Please provide a token");
        }

        // Decode token to get user information
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'asasassasasasasa');
        
        if (!decodedToken) {
            throw new ApiError(401, "Invalid token");
        }

        // Check if user role is admin
        if (decodedToken.role !== "admin") {
            throw new ApiError(403, "You are not authorized to access this route");
        }

        // If user is admin, proceed to the next middleware
        next();
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
};

export default isAdmin;
