import express from "express";
import { RegisterStudent } from "../controllers/Student.controllers";

const router = express.Router();
router.post("/register" , RegisterStudent);

export default router