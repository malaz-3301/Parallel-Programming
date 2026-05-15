import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmsController } from './confirms.controller';
import { ConfirmsService } from './confirms.service';

describe('ConfirmsController', () => {
  let controller: ConfirmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmsController],
      providers: [ConfirmsService],
    }).compile();

    controller = module.get<ConfirmsController>(ConfirmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
