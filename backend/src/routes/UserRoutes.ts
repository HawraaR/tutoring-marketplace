import { Router } from "express";
import {
  createUser,
  getMessageContacts,
  getUsers,
  updateUserRoles,
  getUserById,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// 1. Static routes (Must come FIRST)
router.post("/", createUser);
router.get("/", getUsers);
router.get("/me", authenticateToken, getMe);
router.get("/contacts", authenticateToken, getMessageContacts);
router.put("/me", authenticateToken, updateMe);
router.put("/change-password", authenticateToken, changePassword);

// 2. Dynamic parameter routes (Must come LAST)
router.get("/:id", authenticateToken, getUserById);
router.patch("/:id/roles", updateUserRoles);

export default router;
