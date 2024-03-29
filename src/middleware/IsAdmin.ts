import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Please provide a token");
        }

        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'asasassasasasasa');
        
        if (!decodedToken) {
            throw new ApiError(401, "Invalid token");
        }

        if (decodedToken.role !== "admin") {
            throw new ApiError(403, "You are not authorized to access this route");
        }

        next();
    } catch (error) {
        next(error); 
    }
};

export default isAdmin;
