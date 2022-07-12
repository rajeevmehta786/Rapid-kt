import { Test, TestingModule } from '@nestjs/testing';
import { NotifyDataService } from './Notify-data.service';

describe('NotifyDataService', () => {
  let service: NotifyDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifyDataService],
    }).compile();

    service = module.get<NotifyDataService>(NotifyDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
