import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Patch, Post, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from 'src/users/entities/user.entity';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';
import { CartsService } from './carts.service';
import { JobType } from './carts.processor';

@Controller('carts')
export class CartsController {
<<<<<<< Updated upstream
  private readonly maxWaitingJobs: number;

  constructor(
    private readonly cartsService: CartsService,
    private readonly configService: ConfigService,
    @InjectQueue('cart') private readonly cartQueue: Queue<JobType>,
  ) {
    this.maxWaitingJobs = Number(this.configService.get<string>('CART_QUEUE_MAX_WAITING') ?? 5000);
=======
  constructor(private readonly cartsService: CartsService, @InjectQueue('cart') private cartQueue: Queue<JobType>) { }
  @Post('add')
  @HttpCode(200)
  async addToCart(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    console.log("dfjsak");
    
      // await this.cartQueue.add('add', { ...addToCart, user_id: req.user.id })

    // const job = await this.foregroundQueue.add('addToCart', { body: addToCart, user: req.user.id })
    // const result = await job.waitUntilFinished(this.queueEvents);
    // return result
    return this.cartsService.addToCart(addToCart, req.user.id)
    // return { success: true }
>>>>>>> Stashed changes
  }

  @Post('add')
  @HttpCode(202)
  async addToCart(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    await this.ensureCartQueueCapacity();
    await this.cartQueue.add('add', { ...addToCart, user_id: req.user.id });

    return { status: 'queued' };
  }

  @Post('remove')
  @HttpCode(202)
  async removeFromCart(@Body() removeFromCart: RemoveFromCart, @Request() req: { user: User }) {
    await this.ensureCartQueueCapacity();
    await this.cartQueue.add('remove', { ...removeFromCart, user_id: req.user.id });

    return { status: 'queued' };
  }

  @Patch('update')
  @HttpCode(202)
  async updateCountForCartProduct(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    await this.ensureCartQueueCapacity();
    await this.cartQueue.add('update', { ...addToCart, user_id: req.user.id });

    return { status: 'queued' };
  }

  @Get('all_carts')
  findAll() {
    return this.cartsService.findAll();
  }

  private async ensureCartQueueCapacity() {
    const counts = await this.cartQueue.getJobCounts('waiting', 'delayed');
    const waitingJobs = (counts.waiting ?? 0) + (counts.delayed ?? 0);

    if (waitingJobs >= this.maxWaitingJobs) {
      throw new HttpException('Cart queue is temporarily overloaded', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
