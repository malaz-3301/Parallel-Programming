import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly userProductsService: UserProductsService,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.cartRepository.find({
      relations: {
        user: true,
        userProducts: { product: true },
        confirm: true,
      },
    });
  }

  findAllForUser(userId: number) {
    return this.cartRepository.findOne({
      where: { userId, confirmId: IsNull() },
      relations: { userProducts: { product: true } },
    });
  }

  findOne(userId: number) {
    return this.findAllForUser(userId);
  }

  findOneWithoutProductsByUserId(
    userId: number,
    entityManager: EntityManager,
  ) {
    return this.findOpenCartForUpdate(userId, entityManager);
  }

  async findConfirmedCartForUpdate(
    confirmId: number,
    entityManager: EntityManager,
  ) {
    const cart = await entityManager.findOne(Cart, {
      where: { confirmId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!cart) {
      return null;
    }

    cart.userProducts = await this.userProductsService.findAllForCart(
      cart.id,
      entityManager,
    );
    return cart;
  }

  async attachConfirm(
    cart: Cart,
    confirmId: number,
    totalAmount: number,
    entityManager: EntityManager,
  ) {
    const result = await entityManager
      .createQueryBuilder()
      .update(Cart)
      .set({ confirmId, price: totalAmount })
      .where('id = :id', { id: cart.id })
      .andWhere('version = :version', { version: cart.version })
      .andWhere('"confirmId" IS NULL')
      .execute();

    if (result.affected !== 1) {
      throw new ConflictException('The cart was changed by another request');
    }
  }

  async remove(userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOpenCartForUpdate(userId, entityManager);

      if (!cart) {
        throw new NotFoundException();
      }

      await this.userProductsService.deleteByIds(
        cart.userProducts.map((item) => item.id),
        entityManager,
      );

      const result = await entityManager.delete(Cart, { id: cart.id });
      if (result.affected !== 1) {
        throw new ConflictException('The cart was changed by another request');
      }
    });
  }

  async addToCart(addToCart: AddToCart, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.getOrCreateOpenCart(userId, entityManager);
      const userProduct = await this.userProductsService.addToCart(
        { ...addToCart, cartId: cart.id },
        entityManager,
      );

      const newPrice = Number(cart.price) + Number(userProduct.price);
      await this.updateCartPrice(cart, newPrice, entityManager);

      return userProduct;
    });
  }

  async updateCountForCartProduct(updateCart: AddToCart, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOpenCartForUpdate(userId, entityManager);

      if (!cart) {
        throw new NotFoundException();
      }

      const existingItem = cart.userProducts.find(
        (item) => item.productId === updateCart.productId,
      );

      if (!existingItem) {
        throw new NotFoundException();
      }

      const updatedItem =
        await this.userProductsService.updateCountForCartProduct(
          { ...updateCart, cartId: cart.id },
          entityManager,
        );

      const newPrice =
        Number(cart.price) -
        Number(existingItem.price) +
        Number(updatedItem.price);
      await this.updateCartPrice(cart, newPrice, entityManager);

      return updatedItem;
    });
  }

  async removeFromCart(removeFromCart: RemoveFromCart, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOpenCartForUpdate(userId, entityManager);

      if (!cart) {
        throw new NotFoundException();
      }

      const removedItem = await this.userProductsService.remove(
        removeFromCart.productId,
        cart.id,
        entityManager,
      );

      const newPrice = Math.max(
        0,
        Number(cart.price) - Number(removedItem.price),
      );
      await this.updateCartPrice(cart, newPrice, entityManager);

      return removedItem;
    });
  }

  private async getOrCreateOpenCart(
    userId: number,
    entityManager: EntityManager,
  ) {
    const existingCart = await this.findOpenCartForUpdate(
      userId,
      entityManager,
    );
    if (existingCart) {
      return existingCart;
    }

    await entityManager
      .createQueryBuilder()
      .insert()
      .into(Cart)
      .values({ userId, price: 0, confirmId: null })
      .orIgnore()
      .execute();

    const cart = await this.findOpenCartForUpdate(userId, entityManager);
    if (!cart) {
      throw new ConflictException('Could not create an active cart');
    }

    return cart;
  }

  private async findOpenCartForUpdate(
    userId: number,
    entityManager: EntityManager,
  ) {
    const cart = await entityManager.findOne(Cart, {
      where: { userId, confirmId: IsNull() },
      lock: { mode: 'pessimistic_write' },
    });

    if (!cart) {
      return null;
    }

    cart.userProducts = await this.userProductsService.findAllForCart(
      cart.id,
      entityManager,
    );
    return cart;
  }

  private async updateCartPrice(
    cart: Cart,
    price: number,
    entityManager: EntityManager,
  ) {
    const result = await entityManager
      .createQueryBuilder()
      .update(Cart)
      .set({ price })
      .where('id = :id', { id: cart.id })
      .andWhere('version = :version', { version: cart.version })
      .andWhere('"confirmId" IS NULL')
      .execute();

    if (result.affected !== 1) {
      throw new ConflictException('The cart was changed by another request');
    }
  }
}
