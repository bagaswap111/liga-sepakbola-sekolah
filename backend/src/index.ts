import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";
import adminRoutes from "./routes/adminRoutes";
import publicRoutes from "./routes/publicRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Static file serving (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Initialize DB and start server
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Database connected");

    // Seed default admin account if not exists
    const userRepo = AppDataSource.getRepository("User");
    const existing = await userRepo.findOneBy({ email: process.env.ADMIN_EMAIL || "admin@ligajateng.com" });
    if (!existing) {
      const bcrypt = require("bcryptjs");
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin1234!", 12);
      const admin = userRepo.create({
        email: process.env.ADMIN_EMAIL || "admin@ligajateng.com",
        password: hashed,
        role: "admin",
      });
      await userRepo.save(admin);
      console.log("✅ Default admin account created");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
