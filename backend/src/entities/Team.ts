import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
  CreateDateColumn, UpdateDateColumn
} from "typeorm";
import { Player } from "./Player";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  schoolAddress: string;

  @Column()
  coachName: string;

  @Column()
  coachPhone: string;

  @Column()
  managerName: string;

  @Column()
  managerPhone: string;

  @Column({ default: "pending" })
  status: string; // pending | approved | rejected

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ default: false })
  paymentCompleted: boolean;

  @Column({ default: false })
  insurancePaid: boolean;

  @Column({ nullable: true })
  paymentProof: string;

  @Column({ nullable: true })
  insuranceProof: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: "" })
  notes: string;

  @OneToMany(() => Player, (player) => player.team, { cascade: true })
  players: Player[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
