import { Test, TestingModule } from '@nestjs/testing';
import { DailySummaryController } from './daily-summary.controller';

describe('DailySummaryController', () => {
  let controller: DailySummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailySummaryController],
    }).compile();

    controller = module.get<DailySummaryController>(DailySummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
