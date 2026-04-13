import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth";
import { upload } from "../utils/upload";
import {
  getAllTeams, getTeamById, verifyTeam, confirmPayment, deleteTeam,
  getAllPlayers, adminUpdatePlayer, adminDeletePlayer,
  getAllMatches, createMatch, updateMatch, deleteMatch,
  getAllNewsAdmin, createNews, updateNews, deleteNews,
  getDashboardStats,
} from "../controllers/adminController";

const router = Router();

router.use(authenticate, authorizeAdmin);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Teams
router.get("/teams", getAllTeams);
router.get("/teams/:id", getTeamById);
router.put("/teams/verify", verifyTeam);
router.put("/teams/confirm-payment", confirmPayment);
router.delete("/teams/:id", deleteTeam);

// Players
router.get("/players", getAllPlayers);
router.put("/players/:id", adminUpdatePlayer);
router.delete("/players/:id", adminDeletePlayer);

// Matches
router.get("/matches", getAllMatches);
router.post("/matches", createMatch);
router.put("/matches/:id", updateMatch);
router.delete("/matches/:id", deleteMatch);

// News
router.get("/news", getAllNewsAdmin);
router.post("/news", upload.single("image"), createNews);
router.put("/news/:id", upload.single("image"), updateNews);
router.delete("/news/:id", deleteNews);

export default router;
