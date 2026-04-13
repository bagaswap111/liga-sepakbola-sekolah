import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { Player } from "../entities/Player";
import { Match } from "../entities/Match";
import { News } from "../entities/News";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

// ===================== TEAMS =====================
export const getAllTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const teams = await teamRepo.find({ relations: ["players"], order: { createdAt: "DESC" } });
    res.json(teams);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const team = await teamRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["players"]
    });
    if (!team) { res.status(404).json({ message: "Team not found" }); return; }
    res.json(team);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teamId, status, rejectionReason } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    const teamRepo = AppDataSource.getRepository(Team);
    await teamRepo.update(teamId, { status, rejectionReason: rejectionReason || null });
    res.json({ message: `Tim ${status === "approved" ? "disetujui" : "ditolak"}` });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teamId, type } = req.body;
    const teamRepo = AppDataSource.getRepository(Team);
    if (type === "registration") {
      await teamRepo.update(teamId, { paymentCompleted: true });
    } else if (type === "insurance") {
      await teamRepo.update(teamId, { insurancePaid: true });
    } else {
      res.status(400).json({ message: "Invalid type" });
      return;
    }
    res.json({ message: "Pembayaran dikonfirmasi" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ teamId: parseInt(req.params.id) });
    await teamRepo.delete(req.params.id);
    res.json({ message: "Tim dihapus" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== PLAYERS =====================
export const getAllPlayers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const playerRepo = AppDataSource.getRepository(Player);
    const players = await playerRepo.find({ relations: ["team"] });
    res.json(players);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminUpdatePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const playerRepo = AppDataSource.getRepository(Player);
    await playerRepo.update(id, req.body);
    res.json({ message: "Pemain diperbarui" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeletePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const playerRepo = AppDataSource.getRepository(Player);
    await playerRepo.delete(req.params.id);
    res.json({ message: "Pemain dihapus" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== MATCHES =====================
export const getAllMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchRepo = AppDataSource.getRepository(Match);
    const matches = await matchRepo.find({
      relations: ["homeTeam", "awayTeam"],
      order: { matchDate: "ASC" }
    });
    res.json(matches);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchRepo = AppDataSource.getRepository(Match);
    const match = matchRepo.create(req.body);
    await matchRepo.save(match);
    const saved = await matchRepo.findOne({ where: { id: match.id }, relations: ["homeTeam", "awayTeam"] });
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchRepo = AppDataSource.getRepository(Match);
    await matchRepo.update(req.params.id, req.body);
    const updated = await matchRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["homeTeam", "awayTeam"]
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchRepo = AppDataSource.getRepository(Match);
    await matchRepo.delete(req.params.id);
    res.json({ message: "Pertandingan dihapus" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== NEWS =====================
export const getAllNewsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    const news = await newsRepo.find({ order: { publishedAt: "DESC" } });
    res.json(news);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    const news = newsRepo.create(req.body);
    if (req.file) news.imageUrl = `/uploads/${req.file.filename}`;
    await newsRepo.save(news);
    res.status(201).json(news);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    const updates: any = req.body;
    if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
    await newsRepo.update(req.params.id, updates);
    res.json({ message: "Berita diperbarui" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    await newsRepo.delete(req.params.id);
    res.json({ message: "Berita dihapus" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== STATS =====================
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const playerRepo = AppDataSource.getRepository(Player);
    const matchRepo = AppDataSource.getRepository(Match);
    const newsRepo = AppDataSource.getRepository(News);

    const [totalTeams, pendingTeams, approvedTeams, totalPlayers, totalMatches, totalNews] = await Promise.all([
      teamRepo.count(),
      teamRepo.count({ where: { status: "pending" } }),
      teamRepo.count({ where: { status: "approved" } }),
      playerRepo.count(),
      matchRepo.count(),
      newsRepo.count(),
    ]);

    res.json({ totalTeams, pendingTeams, approvedTeams, totalPlayers, totalMatches, totalNews });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
