import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as authController from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import * as roleController from "../controllers/roleContronller.js";
import { authenticateToken, isAdminOrStaff } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/auth/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/auth/login", validateRequest(loginSchema), authController.login);

//Role routers
router.get(
  "/role",
  authenticateToken,
  isAdminOrStaff,
  roleController.getAllRoles,
);
router.post(
  "/role",
  authenticateToken,
  isAdminOrStaff,
  roleController.createRole,
);

export default router;
