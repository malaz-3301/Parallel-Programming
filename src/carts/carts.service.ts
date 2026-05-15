import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, EntityManager, } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { RemoveFromCart } from './dto/remove-from-cart';
import { AddToCart } from './dto/add-to-cart';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CartsService {
  constructor(@InjectRepository(Cart) private cartRepository: Repository<Cart>, private userProdutsService: UserProductsService, private dataSource: DataSource) { }
  create(user_id: number, entityManager: EntityManager) {
    const cart = entityManager.create(Cart, { user: { id: user_id }, price: 0 })
    return entityManager.save(cart)
  }

  findAll() {
    return this.cartRepository.find()
  }
  findAllForUser(user_id: number, entityManager: EntityManager) {
    return entityManager.findOne(Cart, { where: { confirm: IsNull(), user: { id: user_id } } })
  }

  findOne(user_id: number, entityManager: EntityManager) {
    return entityManager.findOne(Cart, { where: { confirm: IsNull(), user: { id: user_id } }, relations: { userProducts: { product: true } } })

  }

  update(updateCartDto: UpdateCartDto, user_id: number, entityManager: EntityManager) {
    return entityManager.update(Cart, { user: { id: user_id } }, { confirm: { id: updateCartDto.confirmId } })
  }

  remove(user_id: number, entityManager: EntityManager) {
    return entityManager.delete(Cart, { user: { id: user_id } })
  }
  async removeAllFromCart(user_id: number, entityManager: EntityManager) {
    const cart = await this.findOne(user_id, entityManager)
    if(!cart){
      throw new NotFoundException();
    }
    return this.userProdutsService.removeAll(user_id, cart.id, entityManager)
  }

  addToCart(addToCart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOne(user_id, entityManager)
      if (!cart) {
        const cart = await this.create(user_id, entityManager)
        return this.userProdutsService.create({ ...addToCart, cartId: cart.id },entityManager)
      }
      if (cart.userProducts.some(userProduct => userProduct.product.id == addToCart.productId))
        return this.userProdutsService.updateForUser({ ...addToCart, cartId: cart.id },entityManager)
      return this.userProdutsService.create({ ...addToCart, cartId: cart.id },entityManager)
    })
  }
  updateCountForCartProduct(addToCart: AddToCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOne(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      if (cart.userProducts.some(userProduct => userProduct.product.id == addToCart.productId))
        return this.userProdutsService.update({ ...addToCart, cartId: cart.id },)
      throw new NotFoundException();
    })
  }

  removeFromCart(removeFromCart: RemoveFromCart, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.findOne(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      return this.userProdutsService.remove(removeFromCart.productId, cart.id,)
    })
  }

}


