import { Router } from "express";
import { createUser, getUsers } from "../controllers/UserController";

const router = Router();

// Route definitions mapped to controller functions
router.post("/", createUser);
router.get("/", getUsers);

export default router;