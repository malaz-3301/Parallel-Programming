import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CompaniesModule, BullModule.registerQueue({
    name: 'product',
  }),],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule { }
