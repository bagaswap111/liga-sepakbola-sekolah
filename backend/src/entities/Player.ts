import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Team } from "./Team";

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  jerseyNumber: number;

  @Column()
  position: string; // GK | DF | MF | FW

  @Column({ type: "date" })
  birthDate: string;

  @Column({ nullable: true })
  studentIdCardUrl: string;

  @Column({ nullable: true })
  parentalConsentUrl: string;

  @Column({ nullable: true })
  healthCertificateUrl: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column()
  teamId: number;

  @ManyToOne(() => Team, (team) => team.players, { onDelete: "CASCADE" })
  @JoinColumn({ name: "teamId" })
  team: Team;
}
