import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Roles } from 'src/auth/utils/roles.decorator';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { User } from 'src/users/entities/user.entity';
import { JobType } from './carts.processor';
import { CartsService } from './carts.service';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';

@UseGuards(RolesGuard)
@Controller('carts')
export class CartsController {
  private readonly maxWaitingJobs: number;

  constructor(
    private readonly cartsService: CartsService,
    private readonly configService: ConfigService,
    @InjectQueue('cart') private readonly cartQueue: Queue<JobType>,
  ) {
    this.maxWaitingJobs = Number(
      this.configService.get<string>('CART_QUEUE_MAX_WAITING') ?? 5000,
    );
  }

  @Post('add')
  @HttpCode(202)
  async addToCart(@Body() addToCart: AddToCart, @Request() req: { user: User }) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('add', {
      ...addToCart,
      user_id: req.user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Post('remove')
  @HttpCode(202)
  async removeFromCart(
    @Body() removeFromCart: RemoveFromCart,
    @Request() req: { user: User },
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('remove', {
      ...removeFromCart,
      user_id: req.user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Patch('update')
  @HttpCode(202)
  async updateCountForCartProduct(
    @Body() addToCart: AddToCart,
    @Request() req: { user: User },
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('update', {
      ...addToCart,
      user_id: req.user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Roles(['admin'])
  @Get('all_carts')
  findAll() {
    return this.cartsService.findAll();
  }

  private async ensureCartQueueCapacity() {
    const counts = await this.cartQueue.getJobCounts('waiting', 'delayed');
    const waitingJobs = (counts.waiting ?? 0) + (counts.delayed ?? 0);

    if (waitingJobs >= this.maxWaitingJobs) {
      throw new HttpException(
        'Cart queue is temporarily overloaded',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
