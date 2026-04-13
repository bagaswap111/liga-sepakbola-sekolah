import { Router } from "express";
import { login, registerTeam, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/register", registerTeam);
router.get("/me", authenticate, getMe);

export default router;
