import { Test, TestingModule } from '@nestjs/testing';
import { NotifyDataResolver } from './notify-data.resolver';
import { NotifyDataService } from './notify-data.service';

describe('NotifyDataResolver', () => {
  let resolver: NotifyDataResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifyDataResolver, NotifyDataService],
    }).compile();

    resolver = module.get<NotifyDataResolver>(NotifyDataResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
