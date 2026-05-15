import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmsService } from './confirms.service';

describe('ConfirmsService', () => {
  let service: ConfirmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfirmsService],
    }).compile();

    service = module.get<ConfirmsService>(ConfirmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
