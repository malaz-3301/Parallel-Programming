import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { UserProductsController } from './user-products.controller';
import { UserProduct } from './entities/user-product.entity';
import { UserProductsService } from './user-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProduct]), ProductsModule],
  controllers: [UserProductsController],
  providers: [UserProductsService],
  exports: [UserProductsService],
})
export class UserProductsModule {}
