import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { BullModule } from '@nestjs/bullmq';
import { CompnayConsumer } from './companies.process';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), BullModule.registerQueue({
    name: 'company',
  }),],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompnayConsumer],
  exports: [CompaniesService]
})
export class CompaniesModule { }
