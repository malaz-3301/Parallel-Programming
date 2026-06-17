import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { UserProductsModule } from 'src/user-products/user-products.module';
import { CartsController } from './carts.controller';
import { CartConsumer } from './carts.processor';
import { CartsService } from './carts.service';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    forwardRef(() => UserProductsModule),
    forwardRef(() => UsersModule),
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
export class CartsModule { }
