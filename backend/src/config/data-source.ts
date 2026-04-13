import "reflect-metadata";
import { DataSource } from "typeorm";
import { Team } from "../entities/Team";
import { Player } from "../entities/Player";
import { Match } from "../entities/Match";
import { News } from "../entities/News";
import { User } from "../entities/User";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "liga_jateng",
  synchronize: true,
  logging: false,
  entities: [Team, Player, Match, News, User],
  subscribers: [],
  migrations: [],
});
