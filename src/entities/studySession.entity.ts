import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class StudySession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  startedDate: Date;

  @Column({ nullable: true })
  stoppedDate: Date;

  @Column({ nullable: true })
  duration: number;
}
