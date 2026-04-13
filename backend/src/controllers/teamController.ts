import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { Player } from "../entities/Player";
import { Match } from "../entities/Match";
import { In } from "typeorm";

export const getMyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    if (!teamId) {
      res.status(404).json({ message: "No team associated" });
      return;
    }
    const teamRepo = AppDataSource.getRepository(Team);
    const team = await teamRepo.findOne({ where: { id: teamId }, relations: ["players"] });
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }
    res.json(team);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTeamProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const { coachName, coachPhone, managerName, managerPhone, schoolAddress, notes } = req.body;
    const teamRepo = AppDataSource.getRepository(Team);
    await teamRepo.update(teamId, { coachName, coachPhone, managerName, managerPhone, schoolAddress, notes });
    res.json({ message: "Profil tim berhasil diperbarui" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const addPlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const { name, jerseyNumber, position, birthDate } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const studentIdCardUrl = files?.["studentIdCard"]
      ? `/uploads/${files["studentIdCard"][0].filename}` : null;
    const parentalConsentUrl = files?.["parentalConsent"]
      ? `/uploads/${files["parentalConsent"][0].filename}` : null;
    const healthCertificateUrl = files?.["healthCertificate"]
      ? `/uploads/${files["healthCertificate"][0].filename}` : null;
    const photoUrl = files?.["photo"]
      ? `/uploads/${files["photo"][0].filename}` : null;

    const playerRepo = AppDataSource.getRepository(Player);

    // Cek nomor punggung sudah dipakai di tim ini?
    const existingNumber = await playerRepo.findOne({
      where: { teamId, jerseyNumber: parseInt(jerseyNumber) }
    });
    if (existingNumber) {
      res.status(400).json({ message: `Nomor punggung ${jerseyNumber} sudah dipakai` });
      return;
    }

    const player: Player = playerRepo.create({
      name,
      jerseyNumber: parseInt(jerseyNumber),
      position,
      birthDate,
      studentIdCardUrl,
      parentalConsentUrl,
      healthCertificateUrl,
      photoUrl,
      teamId,
    });
    await playerRepo.save(player);
    res.status(201).json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const { id } = req.params;
    const playerRepo = AppDataSource.getRepository(Player);

    const player = await playerRepo.findOne({ where: { id: parseInt(id), teamId } });
    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    const { name, jerseyNumber, position, birthDate } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updates: any = { name, position, birthDate };
    if (jerseyNumber) updates.jerseyNumber = parseInt(jerseyNumber);
    if (files?.["studentIdCard"]) updates.studentIdCardUrl = `/uploads/${files["studentIdCard"][0].filename}`;
    if (files?.["parentalConsent"]) updates.parentalConsentUrl = `/uploads/${files["parentalConsent"][0].filename}`;
    if (files?.["healthCertificate"]) updates.healthCertificateUrl = `/uploads/${files["healthCertificate"][0].filename}`;
    if (files?.["photo"]) updates.photoUrl = `/uploads/${files["photo"][0].filename}`;

    await playerRepo.update(id, updates);
    res.json({ message: "Pemain diperbarui" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const { id } = req.params;
    const playerRepo = AppDataSource.getRepository(Player);
    const player = await playerRepo.findOne({ where: { id: parseInt(id), teamId } });
    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }
    await playerRepo.delete(id);
    res.json({ message: "Pemain dihapus" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadPaymentProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "File tidak ditemukan" });
      return;
    }
    const teamRepo = AppDataSource.getRepository(Team);
    await teamRepo.update(teamId, { paymentProof: `/uploads/${file.filename}` });
    res.json({ message: "Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadInsuranceProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "File tidak ditemukan" });
      return;
    }
    const teamRepo = AppDataSource.getRepository(Team);
    await teamRepo.update(teamId, { insuranceProof: `/uploads/${file.filename}` });
    res.json({ message: "Bukti asuransi berhasil diupload. Menunggu konfirmasi admin." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamId = req.user.teamId;
    const matchRepo = AppDataSource.getRepository(Match);
    const matches = await matchRepo
      .createQueryBuilder("match")
      .leftJoinAndSelect("match.homeTeam", "homeTeam")
      .leftJoinAndSelect("match.awayTeam", "awayTeam")
      .where("match.homeTeamId = :teamId OR match.awayTeamId = :teamId", { teamId })
      .orderBy("match.matchDate", "ASC")
      .getMany();
    res.json(matches);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
