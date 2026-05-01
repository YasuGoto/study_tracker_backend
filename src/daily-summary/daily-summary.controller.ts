import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { DailySummary } from '../entities/dailySummary.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('daily-summary')
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':date')
  async getSummary(
    @Param('date') date: string,
    @Request() req: any,
  ): Promise<DailySummary | null> {
    return this.dailySummaryService.getSummary(req.user.sub, new Date(date));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSummary(@Request() req: any): Promise<DailySummary | null> {
    return this.dailySummaryService.calculateAndSave(req.user.sub, new Date());
  }
}
