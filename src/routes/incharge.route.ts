import express from "express";
import { AddItemsToStudentAccount, LoginIncharge, RegisterIncharge } from "../controllers/Incharge.controller";
import { isUserLoggedIn } from "../middleware/auth";
import isAdmin from "../middleware/IsAdmin";


const router = express.Router();
router.post("/register" , RegisterIncharge );
router.post("/login" , LoginIncharge)
router.post("/:studentId/items", isUserLoggedIn,isAdmin, AddItemsToStudentAccount)

export default router