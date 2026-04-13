import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../utils/upload";
import {
  getMyTeam, updateTeamProfile, addPlayer, updatePlayer, deletePlayer,
  uploadPaymentProof, uploadInsuranceProof, getMyMatches
} from "../controllers/teamController";

const router = Router();

router.use(authenticate);

router.get("/my-team", getMyTeam);
router.put("/my-team", updateTeamProfile);
router.get("/my-matches", getMyMatches);

router.post(
  "/players",
  upload.fields([
    { name: "studentIdCard", maxCount: 1 },
    { name: "parentalConsent", maxCount: 1 },
    { name: "healthCertificate", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  addPlayer
);

router.put(
  "/players/:id",
  upload.fields([
    { name: "studentIdCard", maxCount: 1 },
    { name: "parentalConsent", maxCount: 1 },
    { name: "healthCertificate", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  updatePlayer
);

router.delete("/players/:id", deletePlayer);
router.post("/payment-proof", upload.single("paymentProof"), uploadPaymentProof);
router.post("/insurance-proof", upload.single("insuranceProof"), uploadInsuranceProof);

export default router;
