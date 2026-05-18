import { Module } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { UserProductsController } from './user-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProduct } from './entities/user-product.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserProduct]), ProductsModule],
  controllers: [UserProductsController],
  providers: [UserProductsService, UserProductsController],
  exports: [UserProductsService]
})
export class UserProductsModule { }
