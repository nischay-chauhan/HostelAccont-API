import express from "express";
import { RegisterStudent, StudentLogin } from "../controllers/Student.controllers";

const router = express.Router();
router.post("/register" , RegisterStudent);
router.post("/login" , StudentLogin);

export default router