import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from 'src/companies/companies.module';
import { Product } from './entities/product.entity';
import { ProductConsumer } from './products.process';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CompaniesModule,
    BullModule.registerQueue({
      name: 'product',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductConsumer],
  exports: [ProductsService],
})
export class ProductsModule {}