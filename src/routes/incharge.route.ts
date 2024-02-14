import express from "express";
import { RegisterIncharge } from "../controllers/Incharge.controller";


const router = express.Router();
router.post("/register" , RegisterIncharge );

export default router