import { Router } from "express";
import { createUser, getMessageContacts, getUsers, updateUserRoles } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Route definitions mapped to controller functions
router.post("/", createUser);
router.get("/", getUsers);
router.get("/contacts", authenticateToken, getMessageContacts);
router.patch("/:id/roles", updateUserRoles); // Handles role toggles from UserManagement.tsx

export default router;