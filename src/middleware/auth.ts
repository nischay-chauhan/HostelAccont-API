import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { Incharge, PrismaClient, Student } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: Student | Incharge;
    }
  }
}

const isUserLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Please login first");
    }

    let decodedToken: JwtPayload;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'asasassasasasasa') as JwtPayload;
    } catch (error: any) {
      throw new ApiError(401, "Invalid token");
    }

    if (!decodedToken) {
      throw new ApiError(401, "Please login first");
    }

    const { role, email } = decodedToken;

    let userInfo: Student | Incharge | null = null;
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
    next(new ApiError(401, error.message || "Invalid Access Token"));
  }
};

export { isUserLoggedIn };
