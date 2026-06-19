import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UserProduct } from './entities/user-product.entity';

@Injectable()
export class UserProductsService {
  constructor(
    @InjectRepository(UserProduct)
    private readonly userProductRepository: Repository<UserProduct>,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createUserProductDto: CreateUserProductDto,
    entityManager: EntityManager,
  ) {
    const product = await this.productsService.findAvailableProduct(
      createUserProductDto.productId,
      createUserProductDto.count,
      entityManager,
    );

    if (!product) {
      throw new ConflictException('The requested quantity is not available');
    }

    const userProduct = entityManager.create(UserProduct, {
      count: createUserProductDto.count,
      price: Number(product.price) * createUserProductDto.count,
      productId: createUserProductDto.productId,
      cartId: createUserProductDto.cartId,
    });

    return entityManager.save(UserProduct, userProduct);
  }

  findAll() {
    return this.userProductRepository.find();
  }

  findAllForCart(cartId: number, entityManager?: EntityManager) {
    const options: FindManyOptions<UserProduct> = {
      where: { cartId },
      relations: { product: true },
    };

    if (entityManager) {
      return entityManager.find(UserProduct, options);
    }

    return this.userProductRepository.find(options);
  }

  findOne(productId: number, cartId: number, entityManager?: EntityManager) {
    const options: FindOneOptions<UserProduct> = {
      where: { productId, cartId },
      relations: { product: true },
    };

    if (entityManager) {
      return entityManager.findOne(UserProduct, options);
    }

    return this.userProductRepository.findOne(options);
  }

  async updateCount(
    id: number,
    createUserProductDto: CreateUserProductDto,
    entityManager: EntityManager,
  ) {
    const existingItem = await entityManager.findOne(UserProduct, {
      where: { id },
      relations: { product: true },
    });

    if (!existingItem) {
      throw new NotFoundException();
    }

    const product = await this.productsService.findAvailableProduct(
      createUserProductDto.productId,
      createUserProductDto.count,
      entityManager,
    );

    if (!product) {
      throw new ConflictException('The requested quantity is not available');
    }

    const price = Number(product.price) * createUserProductDto.count;
    const updateResult = await entityManager.update(
      UserProduct,
      { id: existingItem.id, version: existingItem.version },
      { count: createUserProductDto.count, price },
    );

    if (updateResult.affected !== 1) {
      throw new ConflictException('The cart item was changed by another request');
    }

    return {
      ...existingItem,
      count: createUserProductDto.count,
      price,
      version: existingItem.version + 1,
    };
  }

  async remove(
    productId: number,
    cartId: number,
    entityManager: EntityManager,
  ) {
    const userProduct = await this.findOne(productId, cartId, entityManager);

    if (!userProduct) {
      throw new NotFoundException();
    }

    const deleteResult = await entityManager.delete(UserProduct, {
      id: userProduct.id,
    });

    if (deleteResult.affected !== 1) {
      throw new ConflictException('The cart item was changed by another request');
    }

    return userProduct;
  }

  async deleteByIds(ids: number[], entityManager: EntityManager) {
    if (!ids.length) {
      return;
    }

    const result = await entityManager.delete(UserProduct, ids);
    if (result.affected !== ids.length) {
      throw new ConflictException('One or more cart items changed concurrently');
    }
  }

  async addToCart(
    createUserProductDto: CreateUserProductDto,
    entityManager: EntityManager,
  ) {
    const existingItem = await this.findOne(
      createUserProductDto.productId,
      createUserProductDto.cartId,
      entityManager,
    );

    if (existingItem) {
      throw new BadRequestException('The product is already in the cart');
    }

    return this.create(createUserProductDto, entityManager);
  }

  async updateCountForCartProduct(
    createUserProductDto: CreateUserProductDto,
    entityManager: EntityManager,
  ) {
    const userProduct = await this.findOne(
      createUserProductDto.productId,
      createUserProductDto.cartId,
      entityManager,
    );

    if (!userProduct) {
      throw new NotFoundException();
    }

    return this.updateCount(
      userProduct.id,
      createUserProductDto,
      entityManager,
    );
  }
}
