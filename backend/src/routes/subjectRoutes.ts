import { Router } from "express";
import { getSubjects, createSubject, getSubjectById } from "../controllers/subjectController";

const router = Router();

router.get("/", getSubjects);
router.post("/", createSubject); // Protect with admin middleware if needed
router.get("/:id", getSubjectById); 

export default router;