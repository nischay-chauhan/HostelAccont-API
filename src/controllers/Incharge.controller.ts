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
    // role,
    password,
  } = req.body;

  if (
    !name ||
    !email ||
    !hostelNumber ||
    !hostelName ||
    !registrationId ||
    // !role ||
    !password
  ) {
    throw new ApiError(400, "Please add all fields");
  }

  const existedIncharge = await prisma.incharge.findUnique({
    where: { email },
  });

  if (existedIncharge) {
    throw new ApiError(409, "Incharge already exists with the same email id ");
  }

  const existStudent = await prisma.student.findUnique({
    where: { email },
  });

  if (existStudent) {
    throw new ApiError(
      409,
      "An account  already exists with the same email id of an stuednt "
    );
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newIncharge = await prisma.incharge.create({
    data: {
      name,
      email,
      hostelNumber,
      hostelName,
      registrationId,
      //   role,
      password: hashPassword,
    },
  });

  const createdUSer = await prisma.incharge.findUnique({
    where: { email },
  });

  if (!createdUSer) {
    throw new ApiError(500, "Something went wrong while creating the Incharge");
  }

  const token = jwt.sign(
    { userId: createdUSer.id, email: createdUSer.email , role : "admin", },
    process.env.JWT_SECRET || 'asasassasasasasa', 
    { expiresIn: "1h" } 
);

return res.status(200).cookie("token", token).json(new ApiResponse(200, { token }, "Login successful"));
});

const LoginIncharge = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      throw new ApiError(400, "Please provide email and password for incharge login");
  }

  const existingIncharge = await prisma.incharge.findUnique({ where: { email } });

  if (!existingIncharge) {
      throw new ApiError(401, "Invalid email or password for incharge cannot find user");
  }

  const passwordMatch = await bcrypt.compare(password, existingIncharge.password);

  if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
      { userId: existingIncharge.id, email: existingIncharge.email, role: "admin" },
      process.env.JWT_SECRET || "asasassasasasasa",
      { expiresIn: "1h" }
  );

 
  res.cookie("token", token, { httpOnly: true }); 

  return res.status(200).json(new ApiResponse(200, { token }, "Login successful"));
});


const AddItemsToStudentAccount = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { itemName, itemPrice } = req.body;

  
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: { orders: true },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
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

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { student: updatedStudent },
          "Item added successfully"
        )
      );

  
});
export { RegisterIncharge, LoginIncharge, AddItemsToStudentAccount };
