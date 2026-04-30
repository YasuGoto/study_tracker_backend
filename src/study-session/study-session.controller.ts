import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudySessionService } from './study-session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('study-sessions')
export class StudySessionController {
  constructor(private studySessionService: StudySessionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Request() req: any) {
    return this.studySessionService.start(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('stop')
  async stop(@Request() req: any) {
    return this.studySessionService.stop(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active')
  async active(@Request() req: any) {
    return this.studySessionService.getActiveSession(req.user.sub);
  }
}
