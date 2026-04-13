import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn
} from "typeorm";
import { Team } from "./Team";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
  matchDate: Date;

  @Column()
  venue: string;

  @Column({ default: "Grup A" })
  groupName: string;

  @Column()
  homeTeamId: number;

  @Column()
  awayTeamId: number;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  awayScore: number;

  @Column({ default: "scheduled" })
  status: string; // scheduled | live | finished | postponed

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: "homeTeamId" })
  homeTeam: Team;

  @ManyToOne(() => Team)
  @JoinColumn({ name: "awayTeamId" })
  awayTeam: Team;

  @CreateDateColumn()
  createdAt: Date;
}
