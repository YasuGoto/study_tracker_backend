import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StudySession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  startedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  stoppedDate: Date | null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;
}
