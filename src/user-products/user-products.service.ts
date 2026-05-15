import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';
import { UserProduct } from './entities/user-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository, Transaction } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class UserProductsService {
  constructor(@InjectRepository(UserProduct) private userProductRepository: Repository<UserProduct>, private dataSource: DataSource, private productsService: ProductsService) { }
  async create(createuserProductDto: CreateUserProductDto, user_id: number) {
    const product = await this.productsService.updateForBuy(createuserProductDto.productId, { count: createuserProductDto.count }, user_id);
    if (!product) {
      throw new NotFoundException();
    }
    const userProduct = this.userProductRepository.create({ ...createuserProductDto, price: createuserProductDto.count * product.price });
    return this.userProductRepository.save(userProduct)
  }

  findAll() {
    return this.userProductRepository.find();
  }

  findOne(productId: number, cartId: number) {
    return this.userProductRepository.findOne({ where: { product: { id: productId }, cart: { id: cartId } } })
  }

  async update(createUserProductDto: CreateUserProductDto) {
    try {
      const userProductDto = await this.findOne(createUserProductDto.productId, createUserProductDto.cartId)
      const product = await this.productsService.findOne(userProductDto!.product.id);
      return this.userProductRepository.update(userProductDto!.id, { ...createUserProductDto, price: product!.price * createUserProductDto.count })
    }
    catch (e) {
      throw new NotFoundException();
    }
  }
  async remove(productId: number, cartId: number, user_id: number) {
    try {
      const userProduct = await this.findOne(productId, cartId)
      const product = await this.productsService.update(productId, { count: userProduct!.count }, user_id);
    }
    catch (e) { throw new NotFoundException(); }
    return this.userProductRepository.delete({ product: { id: productId }, cart: { id: cartId } })
  }
}
