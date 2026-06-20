import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/utils/roles.decorator';
import { UserType } from 'src/enums/enums';
import { CartJob } from './carts.processor';
import { CartsService } from './carts.service';
import { CartItemQuantityDto } from './dto/cart-item-quantity.dto';

@Controller('carts')
export class CartsController {
  private readonly maxWaitingJobs: number;

  constructor(
    private readonly cartsService: CartsService,
    private readonly configService: ConfigService,
    @InjectQueue('cart') private readonly cartQueue: Queue<CartJob>,
  ) {
    this.maxWaitingJobs = Number(
      this.configService.get<string>('CART_QUEUE_MAX_WAITING') ?? 5000,
    );
  }

  @Get()
  findMyCart(@CurrentUser() user: JwtPayload) {
    return this.cartsService.findOne(user.id);
  }

  @Post('items/:productId')
  @HttpCode(202)
  async addToCart(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() input: CartItemQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('add', {
      productId,
      count: input.count,
      userId: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Patch('items/:productId')
  @HttpCode(202)
  async updateCountForCartProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() input: CartItemQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('update', {
      productId,
      count: input.count,
      userId: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Delete('items/:productId')
  @HttpCode(202)
  async removeFromCart(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.ensureCartQueueCapacity();
    const job = await this.cartQueue.add('remove', {
      productId,
      userId: user.id,
    });

    return { status: 'queued', jobId: job.id };
  }

  @Roles(UserType.ADMIN)
  @Get('all')
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
