import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/Apiresponse";
import jwt from "jsonwebtoken";
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

    const existedIncharge = await prisma.incharge.findUnique({
        where: { email }
      });
    
      if(existedIncharge) {
        throw new ApiError(409, "An Incharge already exists with the same email id soo he cant be a student  ");
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


const StudentLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const student = await prisma.student.findUnique({
        where: { email }
    });

    if (!student) {
        throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = jwt.sign(
        { userId: student.id, email: student.email , role : "student", },
        process.env.JWT_SECRET || 'asasassasasasasa', 
        { expiresIn: "1h" } 
    );

    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json(new ApiResponse(200, { token }, "Login successful"));
});


export { RegisterStudent , StudentLogin };
