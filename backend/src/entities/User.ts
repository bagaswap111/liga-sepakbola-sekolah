import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Team } from "./Team";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: "team" })
  role: string; // admin | team

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => Team, { nullable: true, eager: false })
  @JoinColumn({ name: "teamId" })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;
}
