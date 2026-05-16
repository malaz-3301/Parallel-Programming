import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';
import { UserProduct } from './entities/user-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, Repository, Transaction } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { count } from 'console';

@Injectable()
export class UserProductsService {
  constructor(@InjectRepository(UserProduct) private userProductRepository: Repository<UserProduct>, private dataSource: DataSource, private productsService: ProductsService) { }
  async create(createuserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    const product = await this.productsService.updateForBuy(createuserProductDto.productId, { count: createuserProductDto.count }, entityManager);

    if (!product) {
      throw new NotFoundException();
    }
    const userProduct = entityManager.create(UserProduct, { ...createuserProductDto, price: createuserProductDto.count * product.price, product: { id: createuserProductDto.productId }, cart: { id: createuserProductDto.cartId } });
    return entityManager.save(userProduct)
  }

  findAll() {
    return this.userProductRepository.find();
  }
  findAllForUser(cartId: number, entityManager: EntityManager) {
    return entityManager.find(UserProduct, { where: { cart: { id: cartId } }, lock: { mode: 'pessimistic_write' } });
  }

  findOne(productId: number, cartId: number, entityManager: EntityManager) {
    const where = { where: { product: { id: productId }, cart: { id: cartId } }, loadRelationIds: true }
    if (entityManager) {
      return entityManager.findOne(UserProduct, { ...where, lock: { mode: 'pessimistic_write' } })
    }
    return this.userProductRepository.findOne(where)
  }

  async update(createUserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    try {
      const userProduct = await this.findOne(createUserProductDto.productId, createUserProductDto.cartId, entityManager)
      const product = await this.productsService.findOne(userProduct!.product.id, entityManager);
      return entityManager.update(UserProduct, userProduct!.id, { ...createUserProductDto, price: product!.price * createUserProductDto.count })
    }
    catch (e) {
      throw new NotFoundException();
    }
  }
  async updateForUser(createUserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    try {
      const userProduct = await this.findOne(createUserProductDto.productId, createUserProductDto.cartId, entityManager)
      const product = await this.productsService.findOne(userProduct!.product.id, entityManager);
      const newCount = (createUserProductDto.count + userProduct!.count)
      return entityManager.update(UserProduct, userProduct!.id, { price: product!.price * newCount, count: newCount })
    }
    catch (e) {
      throw new NotFoundException();
    }
  }
  async remove(productId: number, cartId: number, entityManager: EntityManager) {
    try {
      const userProduct = await this.findOne(productId, cartId, entityManager)
      const product = await this.productsService.updateForReturn(productId, { count: userProduct!.count }, entityManager)
    }
    catch (e) {

      throw new NotFoundException();
    }
    return entityManager.delete(UserProduct, { product: { id: productId }, cart: { id: cartId } })
  }
  removeAll(userProductsIds: number[], entityManager: EntityManager) {
    return entityManager.delete(UserProduct, userProductsIds)
  }
}
