import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as authController from "../controllers/authController.js";
import {
  registerSchema,
  refreshTokenSchema,
  loginSchema,
} from "../validators/authValidator.js";
import * as roleController from "../controllers/roleContronller.js";
import {
  authenticateToken,
  isAdmin,
  isAdminOrStaff,
} from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/auth/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/auth/login", validateRequest(loginSchema), authController.login);
router.post(
  "/auth/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken,
);

router.post("/auth/logout", authenticateToken, authController.logout);
router.get("/auth/current-user", authenticateToken, authController.currentUser);
router.get(
  "/auth/current-admin",
  authenticateToken,
  isAdmin,
  authController.currentAdmin,
);
router.get(
  "/auth/current-admin-or-staff",
  authenticateToken,
  isAdminOrStaff,
  authController.currentStaffOrAdmin,
);

//Role routers
router.get(
  "/role",
  authenticateToken,
  isAdminOrStaff,
  roleController.getAllRoles,
);
router.post("/role", authenticateToken, isAdmin, roleController.createRole);

export default router;
