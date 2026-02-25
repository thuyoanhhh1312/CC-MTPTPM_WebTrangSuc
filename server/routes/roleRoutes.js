import express from "express";
import { getAllRoles } from "../controllers/roleController";

const router = express.Router();

router.get("/get-all", getAllRoles);

export default router;
