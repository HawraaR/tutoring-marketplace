import { Router } from "express";
import { createUser, getMessageContacts, getUsers } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Route definitions mapped to controller functions
router.post("/", createUser);
router.get("/", getUsers);
router.get("/contacts", authenticateToken, getMessageContacts);

export default router;