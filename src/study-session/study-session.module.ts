import { Module } from '@nestjs/common';
import { StudySessionService } from './study-session.service';
import { StudySessionController } from './study-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySession } from '../entities/studySession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudySession])],
  providers: [StudySessionService],
  controllers: [StudySessionController],
  exports: [StudySessionService],
})
export class StudySessionModule {}
