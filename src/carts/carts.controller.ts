import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/users/entities/user.entity';
import { Request as Req } from 'express';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) { }
  @Post('add')
  addToCart(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    return this.cartsService.addToCart(addToCart, req.user.id)
  }
  @Post('remove')
  removeFromCart(@Body() removeFromCart: RemoveFromCart, @Request() req: { user: User }) {
    return this.cartsService.removeFromCart(removeFromCart, req.user.id)
  }
  @Patch('update')
  updateCountForCartProduct(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    return this.cartsService.updateCountForCartProduct(addToCart, req.user.id)
  }
  // @Post()
  // create(@Request() req: { user: User }) {
  //   return this.cartsService.create(req.user.id);
  // }

  @Get('all_carts')
  findAll(@Request() req: { user: User }) {
    return this.cartsService.findAll();
  }

  // @Get()
  // findOne(@Request() req: { user: User }) {
  //   return this.cartsService.findOne(req.user.id);
  // }

  // @Patch()
  // update(@Body() updateCartDto: UpdateCartDto, @Request() req: { user: User }) {
  //   return this.cartsService.update(updateCartDto, req.user.id);
  // }

  // @Delete()
  // remove(@Request() req: { user: User }) {
  //   return this.cartsService.remove(req.user.id);
  // }
}
