import express from "express";
import { RegisterStudent, StudentLogin, seeOrderHistory } from "../controllers/Student.controllers";
import { isUserLoggedIn } from "../middleware/auth";

const router = express.Router();
router.post("/register" , RegisterStudent);
router.post("/login" , StudentLogin);
router.get("/:studentId/orders" ,isUserLoggedIn , seeOrderHistory)

export default router