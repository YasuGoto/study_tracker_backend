import { Test, TestingModule } from '@nestjs/testing';
import { StudySessionService } from './study-session.service';

describe('StudySessionService', () => {
  let service: StudySessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudySessionService],
    }).compile();

    service = module.get<StudySessionService>(StudySessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
