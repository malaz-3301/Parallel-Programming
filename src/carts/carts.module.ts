import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProductsModule } from 'src/user-products/user-products.module';
import { CartsController } from './carts.controller';
import { CartConsumer } from './carts.processor';
import { CartsService } from './carts.service';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    UserProductsModule,
    BullModule.registerQueue({
      name: 'cart',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  controllers: [CartsController],
  providers: [CartsService, CartConsumer],
  exports: [CartsService],
})
export class CartsModule {}
