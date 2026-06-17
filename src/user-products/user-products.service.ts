import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UserProduct } from './entities/user-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
@Injectable()
export class UserProductsService {
  constructor(
    @InjectRepository(UserProduct) private userProductRepository: Repository<UserProduct>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) { }
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
  findAllForUser(cartId: number, entityManager: EntityManager | null = null) {
    const where = { where: { cart: { id: cartId } } };
    if (entityManager) {
      return entityManager.find(UserProduct, { ...where, lock: { mode: 'pessimistic_write' as const } });
    }
    return this.userProductRepository.find(where);
  }
  findOne(productId: number, cartId: number, entityManager: EntityManager | null = null) {
    const where = { where: { product: { id: productId }, cart: { id: cartId } } }
    if (entityManager)
      return entityManager.findOne(UserProduct, where)
    return this.userProductRepository.findOne(where)
  }
  async update(id: number, createUserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    let existingUserProduct = await entityManager.findOne(UserProduct, { where: { id }, relations: { product: true } });
    if (!existingUserProduct) throw new NotFoundException();
    const countDiff = createUserProductDto.count - existingUserProduct.count;
    let product;
    console.log("countDiff", countDiff)
    if (countDiff > 0) {
      product = await this.productsService.updateForBuy(createUserProductDto.productId, { count: countDiff }, entityManager);
    } else if (countDiff < 0) {
      await this.productsService.updateForReturn([{ productId: createUserProductDto.productId, productCount: -countDiff }], entityManager);
      product = existingUserProduct.product;
    } else {
      product = existingUserProduct.product;
    }
    if (!product)
      throw new NotFoundException();
    existingUserProduct = { ...existingUserProduct, count: createUserProductDto.count, price: product.price * createUserProductDto.count }
    await entityManager.update(UserProduct, { id: existingUserProduct.id, version: existingUserProduct.version }, { count: createUserProductDto.count, price: product.price * createUserProductDto.count });
    return existingUserProduct
  }
  async remove(productId: number, cartId: number, entityManager: EntityManager) {
    const userProduct = await this.findOne(productId, cartId, entityManager);
    if (!userProduct) {
      throw new NotFoundException();
    }
    await this.productsService.updateForReturn([{ productId, productCount: userProduct.count }], entityManager);
    await entityManager.delete(UserProduct, userProduct.id);
    return userProduct
  }
  async removeAll(products: { productId: number, productCount: number }[], entityManager: EntityManager) {
    console.log("products", products)
    await this.productsService.updateForReturn(products, entityManager);
    return entityManager.delete(UserProduct, products.map(product => product.productId));
  }
  async addToCart(createuserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    const userProduct = await this.findOne(createuserProductDto.productId, createuserProductDto.cartId);
    console.log(userProduct)
    if (userProduct) {
      throw new BadRequestException();
    }
    return this.create(createuserProductDto, entityManager);
  }
  async updateCountForCartProduct(createuserProductDto: CreateUserProductDto, entityManager: EntityManager) {
    const userProduct = await this.findOne(createuserProductDto.productId, createuserProductDto.cartId);
    console.log(userProduct)
    if (!userProduct) {
      throw new NotFoundException();
    }
    return this.update(userProduct.id, { ...createuserProductDto, count: createuserProductDto.count }, entityManager)
  }
}
