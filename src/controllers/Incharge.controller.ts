import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/Apiresponse";

const prisma = new PrismaClient();

const RegisterIncharge = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    hostelNumber,
    hostelName,
    registrationId,
    password,
  } = req.body;

  if (
    !name ||
    !email ||
    !hostelNumber ||
    !hostelName ||
    !registrationId ||
    !password
  ) {
    return res.status(400).json(new ApiError(400, "Please add all fields"));
  }

  const existedIncharge = await prisma.incharge.findUnique({
    where: { email },
  });

  if (existedIncharge) {
    return res
      .status(409)
      .json(new ApiError(409, "Incharge already exists with the same email id"));
  }

  const existStudent = await prisma.student.findUnique({
    where: { email },
  });

  if (existStudent) {
    return res.status(409).json(new ApiError(409, "An account already exists with the same email id of a student"));
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newIncharge = await prisma.incharge.create({
    data: {
      name,
      email,
      hostelNumber,
      hostelName,
      registrationId,
      password: hashPassword,
    },
  });

  const createdUser = await prisma.incharge.findUnique({
    where: { email },
  });

  if (!createdUser) {
    return res.status(500).json(new ApiError(500, "Something went wrong while creating the Incharge"));
  }

  const token = jwt.sign(
    { userId: createdUser.id, email: createdUser.email, role: "admin" },
    process.env.JWT_SECRET || "asasassasasasasa",
    { expiresIn: "1h" }
  );

  return res
    .status(200)
    .cookie("token", token)
    .json(new ApiResponse(200, { token }, "Login successful"));
});

const LoginIncharge = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiError(400, "Please provide email and password for incharge login"));
  }

  const existingIncharge = await prisma.incharge.findUnique({
    where: { email },
  });

  if (!existingIncharge) {
    return res.status(401).json(new ApiError(401, "Invalid email or password for incharge login"));
  }

  const passwordMatch = await bcrypt.compare(
    password,
    existingIncharge.password
  );

  if (!passwordMatch) {
    return res.status(401).json(new ApiError(401, "Invalid email or password"));
  }

  const token = jwt.sign(
    {
      userId: existingIncharge.id,
      email: existingIncharge.email,
      role: "admin",
    },
    process.env.JWT_SECRET || "asasassasasasasa",
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true });

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Login successful"));
});

const AddItemsToStudentAccount = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { itemName, itemPrice } = req.body;

  try {
    const updatedStudent = await prisma.$transaction(async (prisma) => {
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: { orders: true },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const newOrder = await prisma.orderBill.create({
        data: {
          itemName,
          itemPrice,
          buyer: { connect: { id: parseInt(studentId) } },
        },
      });

      const updatedStudent = await prisma.student.update({
        where: { id: parseInt(studentId) },
        data: {
          orders: {
            set: [...(student.orders || []), { id: newOrder.id }],
          },
        },
        include: { orders: true },
      });

      return updatedStudent;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { student: updatedStudent },
        "Item added successfully"
      )
    );
  } catch (error) {
    console.error("Error adding item to student account:", error);
    return res.status(500).json(new ApiError(500, "Failed to add item. Please try again later."));
  }
});

const getStudentDetailsWithOrders = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await prisma.student.findUnique({
    where: { id: parseInt(studentId) },
    include: { orders: true },
  });

  if(!student){
    return res.status(404).json(new ApiError(404, "Student not found"));
  }

  const studentWithOrders = {
    student : {
      id : student.id,
      name : student.name,
      email : student.email,
      department : student.department,
      semester : student.semester,
      roomNumber : student.roomNumber,
      hostelName : student.hostelName,
      hostelRollNo : student.hostelRollNo,
      hostelNumber : student.hostelNumber,
      
    },
    orders : student.orders
  }

  if(!studentWithOrders){
    return res.status(404).json(new ApiError(404, "Student not found"));
  }

  res.status(200).json(
    new ApiResponse(200, { student: studentWithOrders }, "Student details retrieved successfully")
  )

})
export { RegisterIncharge, LoginIncharge, AddItemsToStudentAccount , getStudentDetailsWithOrders};
