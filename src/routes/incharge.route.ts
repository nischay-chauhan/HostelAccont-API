import express from "express";
import { AddItemsToStudentAccount, LoginIncharge, RegisterIncharge, getStudentDetailsWithOrders } from "../controllers/Incharge.controller";
import { isUserLoggedIn } from "../middleware/auth";
import isAdmin from "../middleware/IsAdmin";


const router = express.Router();
router.post("/register" , RegisterIncharge );
router.post("/login" , LoginIncharge)
router.post("/:studentId/items", isUserLoggedIn,isAdmin, AddItemsToStudentAccount)
router.get("/:studentId/orders", isUserLoggedIn,isAdmin , getStudentDetailsWithOrders)

export default router