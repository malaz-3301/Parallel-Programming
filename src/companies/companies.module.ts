import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompanyConsumer } from './companies.process';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    BullModule.registerQueue({ name: 'company' }),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyConsumer],
  exports: [CompaniesService],
})
export class CompaniesModule {}
