import { Module } from '@nestjs/common';
import { ValidateService } from './validate.service';
import { ValidateController } from './validate.controller';

@Module({
  controllers: [ValidateController],
  providers: [ValidateService],
})
export class ValidateModule {}
