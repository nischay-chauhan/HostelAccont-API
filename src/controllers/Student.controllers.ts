import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/Apiresponse";
import jwt from "jsonwebtoken";
import { formatDate } from "../utils/dateUtils";

const prisma = new PrismaClient();

const RegisterStudent = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const {
    name,
    rollNo,
    email,
    password,
    department,
    semester,
    roomNumber,
    hostelName,
    hostelRollNo,
    hostelNumber,
  } = req.body;

  if (
    !name ||
    !rollNo ||
    !email ||
    !password ||
    !department ||
    !semester ||
    !roomNumber ||
    !hostelName ||
    !hostelRollNo ||
    !hostelNumber
  ) {
    return res.status(400).json(new ApiError(400, "Please add all fields"));
  }

  const existedUser = await prisma.student.findUnique({
    where: { email },
  });

  if (existedUser) {
    return res
      .status(409)
      .json(new ApiError(409, "User already exists with the same email id"));
  }

  const existedIncharge = await prisma.incharge.findUnique({
    where: { email },
  });

  if (existedIncharge) {
    return res.status(409).json(new ApiError(409, "An Incharge already exists with the same email id, so he can't be a student"));
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
    },
  });

  if (!newStudent) {
    return res.status(500).json(new ApiError(500, "Something went wrong while making the student register"));
  }

  return res
    .status(201)
    .json(new ApiResponse(200, newStudent, "Student registered successfully"));
});

const StudentLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiError(400, "Please provide email and password"));
  }

  const student = await prisma.student.findUnique({
    where: { email },
  });

  if (!student) {
    return res.status(401).json(new ApiError(401, "Invalid email or password"));
  }

  const passwordMatch = await bcrypt.compare(password, student.password);

  if (!passwordMatch) {
    return res.status(401).json(new ApiError(401, "Invalid email or password"));
  }

  const token = jwt.sign(
    { userId: student.id, email: student.email, role: "student" },
    process.env.JWT_SECRET || "asasassasasasasa",
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true });

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Login successful"));
});

const seeOrderHistory = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const orders = await prisma.orderBill.findMany({
    where: {
      buyerId: {
        equals: parseInt(studentId),
      },
    },
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json(new ApiError(404, "No orders found for the user"));
  }

  const formattedOrders = orders.map(order => {
    return {
      ...order,
      createdAt: formatDate(order.createdAt),
      updatedAt: formatDate(order.updatedAt)
    };
  })

  return res.status(200).json({
    success: true,
    orders: formattedOrders,
  });
});

const getStudentProfile = asyncHandler(async (req, res) => {
  if(!req.user){
    return res.status(401).json(new ApiError(401, "Please login first"));
  }
  const userId = req.user.id
  const student = await prisma.student.findUnique({
    where: { id: userId },
  });
  
  if(!student){
    return res.status(404).json(new ApiError(404, "Student not found"));
  }

  return res.status(200).json(new ApiResponse(200, student, "Profile fetched successfully"));
});

export { RegisterStudent, StudentLogin, seeOrderHistory , getStudentProfile};
