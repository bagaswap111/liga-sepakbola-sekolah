import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Team } from "../entities/Team";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, teamId: user.teamId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, teamId: user.teamId },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const registerTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, teamName, schoolAddress, coachName, coachPhone, managerName, managerPhone } = req.body;
    if (!email || !password || !teamName) {
      res.status(400).json({ message: "Required fields missing" });
      return;
    }
    const userRepo = AppDataSource.getRepository(User);
    const teamRepo = AppDataSource.getRepository(Team);

    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const existingTeam = await teamRepo.findOneBy({ name: teamName });
    if (existingTeam) {
      res.status(400).json({ message: "Team name already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const newTeam = teamRepo.create({
      name: teamName,
      schoolAddress: schoolAddress || "",
      coachName: coachName || "",
      coachPhone: coachPhone || "",
      managerName: managerName || "",
      managerPhone: managerPhone || "",
      status: "pending",
    });
    await teamRepo.save(newTeam);

    const newUser = userRepo.create({
      email,
      password: hashed,
      role: "team",
      teamId: newTeam.id,
    });
    await userRepo.save(newUser);

    res.status(201).json({ message: "Pendaftaran berhasil. Menunggu verifikasi admin." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ id: user.id, email: user.email, role: user.role, teamId: user.teamId });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
