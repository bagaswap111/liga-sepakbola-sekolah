import { Router } from "express";
import {
  getPublicTeams, getPublicTeamById, getPublicMatches,
  getPublicNews, getPublicNewsById, getStandings
} from "../controllers/publicController";

const router = Router();

router.get("/teams", getPublicTeams);
router.get("/teams/:id", getPublicTeamById);
router.get("/matches", getPublicMatches);
router.get("/news", getPublicNews);
router.get("/news/:id", getPublicNewsById);
router.get("/standings", getStandings);

export default router;
