import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { Match } from "../entities/Match";
import { News } from "../entities/News";

export const getPublicTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const teams = await teamRepo.find({
      where: { status: "approved" },
      relations: ["players"],
      select: ["id", "name", "coachName", "managerName", "logoUrl", "status", "players"],
    });
    res.json(teams);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const team = await teamRepo.findOne({
      where: { id: parseInt(req.params.id), status: "approved" },
      relations: ["players"],
    });
    if (!team) { res.status(404).json({ message: "Team not found" }); return; }
    res.json(team);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchRepo = AppDataSource.getRepository(Match);
    const matches = await matchRepo.find({
      relations: ["homeTeam", "awayTeam"],
      order: { matchDate: "ASC" },
    });
    res.json(matches);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    const news = await newsRepo.find({
      where: { status: "published" },
      order: { publishedAt: "DESC" },
    });
    res.json(news);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsRepo = AppDataSource.getRepository(News);
    const news = await newsRepo.findOne({ where: { id: parseInt(req.params.id), status: "published" } });
    if (!news) { res.status(404).json({ message: "News not found" }); return; }
    res.json(news);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStandings = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamRepo = AppDataSource.getRepository(Team);
    const matchRepo = AppDataSource.getRepository(Match);

    const teams = await teamRepo.find({ where: { status: "approved" } });
    const finishedMatches = await matchRepo.find({ where: { status: "finished" } });

    const standings = teams.map((team) => {
      let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;
      finishedMatches.forEach((m) => {
        const isHome = m.homeTeamId === team.id;
        const isAway = m.awayTeamId === team.id;
        if (!isHome && !isAway) return;
        played++;
        const ts = isHome ? m.homeScore : m.awayScore;
        const os = isHome ? m.awayScore : m.homeScore;
        gf += ts ?? 0;
        ga += os ?? 0;
        if (ts > os) won++;
        else if (ts === os) drawn++;
        else lost++;
      });
      return {
        team: { id: team.id, name: team.name, logoUrl: team.logoUrl },
        played, won, drawn, lost,
        gf, ga, gd: gf - ga,
        points: won * 3 + drawn,
      };
    });

    standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    res.json(standings);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
