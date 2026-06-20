import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CartsService } from './carts.service';

type CartItemJobData = {
  productId: number;
  count: number;
  userId: number;
};

export type CartJob =
  | Job<CartItemJobData, unknown, 'add'>
  | Job<{ productId: number; userId: number }, unknown, 'remove'>
  | Job<CartItemJobData, unknown, 'update'>;

@Processor('cart', { concurrency: 8 })
export class CartConsumer extends WorkerHost {
  constructor(private readonly cartsService: CartsService) {
    super();
  }

  process(job: CartJob): Promise<unknown> {
    switch (job.name) {
      case 'add':
        return this.cartsService.addToCart(
          job.data.productId,
          job.data.count,
          job.data.userId,
        );
      case 'remove':
        return this.cartsService.removeFromCart(
          job.data.productId,
          job.data.userId,
        );
      case 'update':
        return this.cartsService.updateCountForCartProduct(
          job.data.productId,
          job.data.count,
          job.data.userId,
        );
      default:
        return Promise.resolve(null);
    }
  }
}
