import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { StudySession } from '../entities/studySession.entity';

@Injectable()
export class StudySessionService {
  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
  ) {}

  async start(userId: number): Promise<StudySession> {
    const studySession = this.studySessionRepository.create({
      userId,
      startedDate: new Date(),
    });
    return this.studySessionRepository.save(studySession);
  }

  async stop(userId: number): Promise<StudySession> {
    const studySession = await this.studySessionRepository.findOne({
      where: { userId, stoppedDate: IsNull() },
    });
    if (!studySession) throw new Error('Study session not found');
    studySession.stoppedDate = new Date();
    studySession.duration = Math.floor(
      (studySession.stoppedDate.getTime() -
        studySession.startedDate.getTime()) /
        1000,
    );
    return this.studySessionRepository.save(studySession);
  }

  async getActiveSession(userId: number): Promise<StudySession | null> {
    return (
      this.studySessionRepository.findOne({
        where: { userId, stoppedDate: IsNull() },
      }) ?? null
    );
  }
}
