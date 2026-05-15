import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DailySummary } from '../entities/dailySummary.entity';
import { StudySession } from '../entities/studySession.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DailySummaryService {
  private static readonly JST_OFFSET_MS = 9 * 60 * 60 * 1000;

  /**
   * JST基準の「日付キー」(YYYY-MM-DD) を返す。
   * サーバーのタイムゾーンに依存しない。
   */
  private toJstDateKey(date: Date): string {
    const shifted = new Date(
      date.getTime() + DailySummaryService.JST_OFFSET_MS,
    );
    const y = shifted.getUTCFullYear();
    const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const d = String(shifted.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * JST基準でその日の開始/終了(UTC Date)を返す。
   * 例: 2026-05-01(JST) の 00:00:00.000〜23:59:59.999 を表す Date(UTC)。
   */
  private getJstDayRange(date: Date): { dayStart: Date; dayEnd: Date } {
    console.log('input date', date);
    const shifted = new Date(
      date.getTime() + DailySummaryService.JST_OFFSET_MS,
    );
    console.log('shifted', shifted);
    const y = shifted.getUTCFullYear();
    const m = shifted.getUTCMonth();
    const d = shifted.getUTCDate();
    const dayStartMs = Date.UTC(y, m, d) - DailySummaryService.JST_OFFSET_MS;
    console.log('dayStartMs', dayStartMs);
    console.log('Date.UTC(y, m, d)', Date.UTC(y, m, d));
    const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000 - 1;
    console.log('dayEndMs', dayEndMs);
    return { dayStart: new Date(dayStartMs), dayEnd: new Date(dayEndMs) };
  }

  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
    @InjectRepository(DailySummary)
    private dailySummaryRepository: Repository<DailySummary>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * 指定された期間のDailySummaryをDBから取得する
   * @param userId ユーザーID
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns DailySummary[]
   */
  async getPeriodSummary(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySummary[]> {
    const dayStart = this.getJstDayRange(startDate);
    const dayEnd = this.getJstDayRange(endDate);
    const summary = await this.dailySummaryRepository.find({
      where: { userId, date: Between(dayStart.dayStart, dayEnd.dayEnd) },
    });
    return summary;
  }

  /**
   * 指定日のDailySummaryをDBから取得する
   * @param userId ユーザーID
   * @param date 取得したい日付
   * @returns DailySummary または null（データがない場合）
   */
  async getSummary(userId: number, date: Date): Promise<DailySummary | null> {
    const dateKey = this.toJstDateKey(date);
    const cacheKey = `daily-summary:${userId}:${dateKey}`;

    const cached = await this.cacheManager.get<DailySummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const { dayStart, dayEnd } = this.getJstDayRange(date);
    console.log('dayStart', dayStart);
    console.log('dayEnd', dayEnd);

    const summary = await this.dailySummaryRepository.findOne({
      where: { userId, date: Between(dayStart, dayEnd) },
    });
    console.log('summary', summary);

    if (summary) {
      try {
        // cache-manager v7 + Keyv の TTL はミリ秒
        await this.cacheManager.set(cacheKey, summary, 3600 * 1000);
        console.log('キャッシュに保存しました:', cacheKey);
      } catch (error) {
        console.error('キャッシュ保存エラー:', error);
      }
    }

    return summary;
  }

  /**
   * StudySessionを集計してDailySummaryを計算・保存する
   * @param userId ユーザーID
   * @param date 集計したい日付
   * @returns 保存したDailySummary
   */
  async calculateAndSave(userId: number, date: Date): Promise<DailySummary> {
    const { dayStart, dayEnd } = this.getJstDayRange(date);
    console.log('dayStart', dayStart);
    console.log('dayEnd', dayEnd);

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
    await this.dailySummaryRepository.save(summary);
    const dateKey = this.toJstDateKey(date);
    const cacheKey = `daily-summary:${userId}:${dateKey}`;
    await this.cacheManager.del(cacheKey);
    return summary;
  }
}
