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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/users/utils/user-type';
import { JobType } from './carts.processor';
import { CartsService } from './carts.service';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';

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
  async addToCart(
    @Body() addToCart: AddToCart,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('add', {
      ...addToCart,
      user_id: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Post('remove')
  @HttpCode(202)
  async removeFromCart(
    @Body() removeFromCart: RemoveFromCart,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('remove', {
      ...removeFromCart,
      user_id: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Patch('update')
  @HttpCode(202)
  async updateCountForCartProduct(
    @Body() addToCart: AddToCart,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('update', {
      ...addToCart,
      user_id: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
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
