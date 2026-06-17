import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, EntityManager, QueryBuilder, } from 'typeorm';
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
    return entityManager.findOne(Cart, { where: { user: { id: user_id } }, relations: { userProducts: true } })
  }
  findOne(user_id: number) {
    return this.cartRepository.findOne({ where: { confirm: IsNull(), user: { id: user_id } }, relations: { userProducts: { product: true } } })
  }
  findOneCancelled(confirm_id: number) {
    return this.cartRepository.findOne({ where: { confirm: { id: confirm_id } }, relations: { userProducts: true } })
  }
  update(updateCartDto: UpdateCartDto, user_id: number, version: number, entityManager: EntityManager) {
    return entityManager.update(Cart, { user: { id: user_id }, version }, { confirm: { id: updateCartDto.confirmId }, price: updateCartDto.price })
  }
  async remove(user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOne(user_id)
      if (!cart) {
        throw new NotFoundException();
      }
      console.log("cart", cart)
      await this.userProdutsService.removeAll(cart.userProducts.map(userProduct => ({ productId: userProduct.product.id, productCount: userProduct.count })), entityManager)
      return entityManager.delete(Cart, { user: { id: user_id } })
    });
  }
  async removeAllFromCart(confirm_id: number, entityManager: EntityManager) {
    const cart = await entityManager.findOne(Cart, { where: { confirm: { id: confirm_id } }, relations: { userProducts: true } });
    if (!cart) {
      throw new NotFoundException();
    }
    await this.userProdutsService.removeAll(cart.userProducts.map(userProduct => ({ productId: userProduct.id, productCount: userProduct.count })), entityManager)
    return entityManager.delete(Cart, { confirm: { id: confirm_id } })
  }
  async addToCart(addToCart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      let cart = await this.findOneWithoutProductsByUserId(user_id, entityManager)
      let userProduct;
      if (!cart) {
        console.log("if")
        cart = await this.create(user_id)
        userProduct = await this.userProdutsService.create({ ...addToCart, cartId: cart.id }, entityManager)
      } else {
        console.log("else")
        userProduct = await this.userProdutsService.addToCart({ ...addToCart, cartId: cart.id }, entityManager)
      }
      console.log("update")
      return this.update({ price: cart.price + userProduct.price }, user_id, cart.version, entityManager);
    });
  }
  async updateCountForCartProduct(updatecart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOneWithoutProductsByUserId(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      // if (cart.userProducts.some(userProduct => userProduct.product.id == updatecart.productId))
      // return this.userProdutsService.add, { ...updatecart, cartId: cart.id }, entityManager)
      const userProduct = await this.userProdutsService.updateCountForCartProduct({ ...updatecart, cartId: cart.id }, entityManager)
      // console.log(userProduct, cart, )
      const oldUserProduct = cart.userProducts.find(product => product.id == userProduct.id);
      if (!oldUserProduct) {
        throw new NotFoundException()
      }
      return this.update({ price: cart.price + userProduct.price - oldUserProduct.price },
        user_id, cart.version, entityManager);
      // throw new NotFoundException();
    });
  }

  // updatePrice(cartId: number, entityManager: EntityManager) {
  //   return entityManager.createQueryBuilder()
  //     .update("cart")
  //     .set({
  //       // استخدام استعلام فرعي لحساب المجموع مباشرة داخل التحديث
  //       price: () => `(
  //           SELECT COALESCE(SUM("user_product"."price"), 0) 
  //           FROM "user_product" 
  //           WHERE "user_product"."cartId" = :cartId
  //       )`
  //     })
  //     .where("id = :cartId", { cartId })
  //     .execute();

  // }
  async removeFromCart(removeFromCart: RemoveFromCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOneWithoutProductsByUserId(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      const userProduct = await this.userProdutsService.remove(removeFromCart.productId, cart.id, entityManager)
      await this.update({ price: cart.price - userProduct.price }, user_id, cart.version, entityManager);
    });
  }
}
