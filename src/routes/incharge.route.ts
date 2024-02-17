import express from "express";
import { AddItemsToStudentAccount, LoginIncharge, RegisterIncharge, getInchargeProfile, getStudentDetailsWithOrders, getStudentLivingInHostel } from "../controllers/Incharge.controller";
import { isUserLoggedIn } from "../middleware/auth";
import isAdmin from "../middleware/IsAdmin";


const router = express.Router();
router.post("/register" , RegisterIncharge );
router.post("/login" , LoginIncharge)
router.post("/:studentId/items", isUserLoggedIn,isAdmin, AddItemsToStudentAccount)
router.get("/:studentId/orders", isUserLoggedIn,isAdmin , getStudentDetailsWithOrders)
router.get("/profile" , isUserLoggedIn,isAdmin , getInchargeProfile)
router.get("/allStudents" , isUserLoggedIn,isAdmin , getStudentLivingInHostel )

export default router