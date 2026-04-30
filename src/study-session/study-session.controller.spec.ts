import { Test, TestingModule } from '@nestjs/testing';
import { StudySessionController } from './study-session.controller';

describe('StudySessionController', () => {
  let controller: StudySessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudySessionController],
    }).compile();

    controller = module.get<StudySessionController>(StudySessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
