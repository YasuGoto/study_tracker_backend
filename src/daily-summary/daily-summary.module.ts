import { Module } from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummary } from '../entities/dailySummary.entity';
import { StudySession } from '../entities/studySession.entity';
import { DailySummaryController } from './daily-summary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailySummary, StudySession])],
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
  exports: [DailySummaryService],
})
export class DailySummaryModule {}
