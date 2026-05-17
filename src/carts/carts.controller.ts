import { Controller, Get, Post, Body, Patch, Param, Delete, Request, HttpCode } from '@nestjs/common';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/users/entities/user.entity';
import { Request as Req } from 'express';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './carts.processor';
// import { InjectQueue, } from '@nestjs/bullmq';
// import { Queue, QueueEvents , } from 'bullmq';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService, @InjectQueue('cart') private cartQueue: Queue<JobType>) { }
  @Post('add')
  @HttpCode(200)
  async addToCart(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
      await this.cartQueue.add('add', { ...addToCart, user_id: req.user.id })

    // const job = await this.foregroundQueue.add('addToCart', { body: addToCart, user: req.user.id })
    // const result = await job.waitUntilFinished(this.queueEvents);
    // return result
    // return this.cartsService.addToCart(addToCart, req.user.id)
    // return { success: true }
  }
  @Post('remove')
  async removeFromCart(@Body() removeFromCart: RemoveFromCart, @Request() req: { user: User }) {
    await this.cartQueue.add('remove', { ...removeFromCart, user_id: req.user.id })
    // const job = await this.foregroundQueue.add('removeFromCart', { body: removeFromCart, user: req.user.id })
    // const result = await job.waitUntilFinished(this.queueEvents);
    // return result
    // return this.cartsService.removeFromCart(removeFromCart, req.user.id)
  }
  @Patch('update')
  async updateCountForCartProduct(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    await this.cartQueue.add('update', { ...addToCart, user_id: req.user.id })
    // const job = await this.foregroundQueue.add('updateCountForCartProduct', { body: addToCart, user: req.user.id })
    // const result = await job.waitUntilFinished(this.queueEvents);
    // return result
    // return this.cartsService.updateCountForCartProduct(addToCart, req.user.id)
  }
  // @Post()
  // create(@Request() req: { user: User }) {
  //   return this.cartsService.create(req.user.id);
  // }

  @Get('all_carts')
  findAll(@Request() req: { user: User }) {
    // const job = await this.foregroundQueue.add('findAll', { body: () }), user: req.user.id
    // const result = await job.waitUntilFinished(this.queueEvents);
    // return result
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
