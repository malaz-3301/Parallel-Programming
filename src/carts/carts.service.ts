import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Equal, } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { RemoveFromCart } from './dto/remove-from-cart';
import { AddToCart } from './dto/add-to-cart';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CartsService {
  constructor(@InjectRepository(Cart) private cartRepository: Repository<Cart>, private userProdutsService: UserProductsService, private userService: UsersService) { }
  create(user_id: number) {
    const cart = this.cartRepository.create({ user: { id: user_id }, price: 0 });
    return this.cartRepository.save(cart)
  }

  findAll() {
    return this.cartRepository.find()
  }
  findAllForUser(user_id: number) {
    return this.cartRepository.find({ where: { confirm: IsNull(), user: { id: user_id } } })
  }

  findOne(user_id: number) {
    return this.cartRepository.findOne({ where: { confirm: IsNull(), user: { id: user_id } }, relations: { userProducts: { product: true } } })
  }

  update(updateCartDto: UpdateCartDto, user_id: number) {
    return this.cartRepository.update({ user: { id: user_id } }, { confirm: { id: updateCartDto.confirmId } })
  }

  remove(user_id: number) {
    return this.cartRepository.delete({ user: { id: user_id } })
  }

  async addToCart(createCartDto: AddToCart, user_id: number) {
    const cart = await this.findOne(user_id)
    if (!cart) {
      const cart = await this.create(user_id)
      return this.userProdutsService.create({ ...createCartDto, cartId: cart.id }, user_id)
    }
    return this.userProdutsService.create({ ...createCartDto, cartId: cart.id }, user_id)
  }

  async removeFromCart(removeFromCart: RemoveFromCart, user_id: number) {
    const cart = await this.findOne(user_id)
    if (!cart) {
      throw new NotFoundException();
    }
    return this.userProdutsService.remove(removeFromCart.productId, cart.id, user_id)
  }

}



