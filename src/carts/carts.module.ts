import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { UserProductsModule } from 'src/user-products/user-products.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), UserProductsModule, UsersModule],
  controllers: [CartsController,],
  providers: [CartsService],
  exports: [CartsService]
})
export class CartsModule { }
