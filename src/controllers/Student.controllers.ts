import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/Apiresponse";

const prisma = new PrismaClient();

const RegisterStudent = asyncHandler(async (req, res) => {
    // console.log(req.body);
    const { name, rollNo, email, password, department, semester, roomNumber, hostelName, hostelRollNo, hostelNumber } = req.body;

    if (!name || !rollNo || !email || !password || !department || !semester || !roomNumber || !hostelName || !hostelRollNo || !hostelNumber) {
        throw new ApiError(400, "Please add all fields");
    }

    const existedUser = await prisma.student.findUnique({
        where: { email }
    });
    
    if (existedUser) {
        throw new ApiError(409, "User already exists with the same email id ");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newStudent = await prisma.student.create({
        data: {
            name,
            rollNo,
            email,
            password: hashPassword,
            department,
            semester,
            roomNumber,
            hostelName,
            hostelRollNo,
            hostelNumber,
        }
    });

    if (!newStudent) {
        throw new ApiError(500, "Something went wrong while making the student register");
    }

    return res.status(201).json(new ApiResponse(200, newStudent, "Student registered successfully"));
});

export { RegisterStudent };
