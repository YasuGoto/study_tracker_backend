import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DailySummary } from '../entities/dailySummary.entity';
import { StudySession } from '../entities/studySession.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DailySummaryService {
  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
    @InjectRepository(DailySummary)
    private dailySummaryRepository: Repository<DailySummary>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * 指定日のDailySummaryをDBから取得する
   * @param userId ユーザーID
   * @param date 取得したい日付
   * @returns DailySummary または null（データがない場合）
   */
  async getSummary(userId: number, date: Date): Promise<DailySummary | null> {
    const cacheKey = `daily-summary:${userId}:${date.toISOString().split('T')[0]}`;

    const cached = await this.cacheManager.get<DailySummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const summary = await this.dailySummaryRepository.findOne({
      where: { userId, date: Between(dayStart, dayEnd) },
    });

    if (summary) {
      await this.cacheManager.set(cacheKey, summary, 60 * 60);
    }

    return summary;
  }

  /**
   * StudySessionを集計してDailySummaryを計算・保存する
   * @param userId ユーザーID
   * @param date 集計したい日付
   * @returns 保存したDailySummary
   */
  async calculateAndSave(
    userId: number,
    date: Date,
  ): Promise<DailySummary | null> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const studySessions = await this.studySessionRepository.find({
      where: { userId },
    });

    const totalSeconds = studySessions.reduce((sum, session) => {
      if (session.stoppedDate == null) {
        return sum;
      }
      const startedMs = session.startedDate.getTime();
      if (startedMs < dayStart.getTime() || startedMs > dayEnd.getTime()) {
        return sum;
      }
      const stoppedMs = session.stoppedDate.getTime();
      return sum + Math.max(0, Math.floor((stoppedMs - startedMs) / 1000));
    }, 0);

    let summary = await this.dailySummaryRepository.findOne({
      where: { userId, date: Between(dayStart, dayEnd) },
    });
    if (!summary) {
      summary = this.dailySummaryRepository.create({
        userId,
        date: dayStart,
        totalSeconds,
      });
    } else {
      summary.totalSeconds = totalSeconds;
    }
    return this.dailySummaryRepository.save(summary);
  }
}
