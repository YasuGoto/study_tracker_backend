import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DailySummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  date: Date;

  @Column()
  totalSeconds: number;
}
