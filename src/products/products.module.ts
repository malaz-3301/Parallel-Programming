import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
<<<<<<< Updated upstream
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from 'src/companies/companies.module';
import { Product } from './entities/product.entity';
import { ProductConsumer } from './products.process';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
=======
import { ProductConsumer } from './products.process';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  exports: [ProductsService],
=======
  exports: [ProductsService]
>>>>>>> Stashed changes
})
export class ProductsModule {}