import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt"
import { ApiResponse } from "../utils/Apiresponse";
const prisma = new PrismaClient()
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

  if(
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
    where: { email }
  });

  if(existedIncharge) {
    throw new ApiError(409, "Incharge already exists with the same email id ");
  }

  const existStudent = await prisma.student.findUnique({
    where: { email }
  });
  

  if(existStudent) {
    throw new ApiError(409, "An account  already exists with the same email id of an stuednt ");
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
      password: hashPassword
    }
  })

  const createdUSer = await prisma.incharge.findUnique({
    where: { email }
  });
  
  if(!createdUSer) {
    throw new ApiError(500, "Something went wrong while creating the Incharge");
  }

  return res.status(201).json(new ApiResponse(201, createdUSer, "Incharge created successfully"));

});


export { RegisterIncharge,  }