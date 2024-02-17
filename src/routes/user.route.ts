import express from "express";
import { RegisterStudent, StudentLogin, getStudentProfile, seeOrderHistory } from "../controllers/Student.controllers";
import { isUserLoggedIn } from "../middleware/auth";

const router = express.Router();
router.post("/register" , RegisterStudent);
router.post("/login" , StudentLogin);
router.get("/:studentId/orders" ,isUserLoggedIn , seeOrderHistory)
router.get("/profile", isUserLoggedIn ,getStudentProfile )

export default router