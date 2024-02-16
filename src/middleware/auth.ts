import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isUserLoggedIn = async (req: any, res: any, next: any) => {
    try {
        const token = req.cookies?.token || req.headers['authorization']?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Please login first");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'asasassasasasasa') as JwtPayload;

        if (!decodedToken) {
            throw new ApiError(401, "Please login first cannot decode token ");
        }

        const role = decodedToken.role;
        const email = decodedToken.email; 

        let userInfo;

        if (role === "admin") {
            userInfo = await prisma.incharge.findUnique({ where: { email } });
        } else if (role === "student") {
            userInfo = await prisma.student.findUnique({ where: { email } });
        }

        if (!userInfo) {
            throw new ApiError(404, "User not found");
        }

        req.user = userInfo; 
        next(); 
    } catch (error: any) {
        throw new ApiError(401, error.message || "Invalid Access Token in the catch");
    }
};


export { isUserLoggedIn };
