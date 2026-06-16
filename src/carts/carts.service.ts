import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, EntityManager, } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { RemoveFromCart } from './dto/remove-from-cart';
import { AddToCart } from './dto/add-to-cart';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @Inject(forwardRef(() => UserProductsService)) private userProdutsService: UserProductsService,
    private dataSource: DataSource,
  ) { }
  create(user_id: number) {
    const cart = this.cartRepository.create({ user: { id: user_id }, price: 0 })
    return this.cartRepository.save(cart)
  }
  findAll() {
    return this.cartRepository.find()
  }
  findAllForUser(user_id: number) {
    return this.cartRepository.findOne({ where: { confirm: IsNull(), user: { id: user_id } } },)
  }
  findOneWithoutProductsByUserId(user_id: number, entityManager: EntityManager) {
    return entityManager.findOne(Cart, { where: { user: { id: user_id } }, lock: { mode: 'pessimistic_write' } })
  }
  findOne(user_id: number) {
    return this.cartRepository.findOne({ where: { confirm: IsNull(), user: { id: user_id } }, relations: { userProducts: { product: true } } })
  }
  findOneCancelled(confirm_id: number) {
    return this.cartRepository.findOne({ where: { confirm: { id: confirm_id } }, relations: { userProducts: true } })
  }
  update(updateCartDto: UpdateCartDto, user_id: number, entityManager: EntityManager) {
    return entityManager.update(Cart, { user: { id: user_id } }, { confirm: { id: updateCartDto.confirmId } })
  }
  remove(user_id: number) {
    return this.cartRepository.delete({ user: { id: user_id } })
  }
  async removeAllFromCart(confirm_id: number, entityManager: EntityManager) {
      const cart = await entityManager.findOne(Cart, { where: { confirm: { id: confirm_id } }, relations: { userProducts: true } });
      if (!cart) {
        throw new NotFoundException();
      }
      return this.userProdutsService.removeAll(cart.userProducts.map(userProduct => ({ productId: userProduct.id, productCount: userProduct.count })), entityManager)
  }
  async addToCart(addToCart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOneWithoutProductsByUserId(user_id, entityManager)
      if (!cart) {
        const cart = await this.create(user_id)
        return this.userProdutsService.create({ ...addToCart, cartId: cart.id }, entityManager)
      }
      return this.userProdutsService.addToCart({ ...addToCart, cartId: cart.id }, entityManager)
    });
  }
  async updateCountForCartProduct(addToCart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOne(user_id)
      if (!cart) {
        throw new NotFoundException();
      }
      if (cart.userProducts.some(userProduct => userProduct.product.id == addToCart.productId))
        return this.userProdutsService.addToCart({ ...addToCart, cartId: cart.id }, entityManager)
      throw new NotFoundException();
    });
  }
  async removeFromCart(removeFromCart: RemoveFromCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOneWithoutProductsByUserId(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      return this.userProdutsService.remove(removeFromCart.productId, cart.id, entityManager)
    });
  }
}
