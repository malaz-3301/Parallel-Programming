import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CartsService } from './carts.service';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';

export type CartJob =
  | Job<AddToCart & { user_id: number }, unknown, 'add'>
  | Job<RemoveFromCart & { user_id: number }, unknown, 'remove'>
  | Job<AddToCart & { user_id: number }, unknown, 'update'>;

@Processor('cart', { concurrency: 8 })
export class CartConsumer extends WorkerHost {
  constructor(private readonly cartsService: CartsService) {
    super();
  }

  process(job: CartJob): Promise<unknown> {
    switch (job.name) {
      case 'add':
        return this.cartsService.addToCart(job.data, job.data.user_id);
      case 'remove':
        return this.cartsService.removeFromCart(job.data, job.data.user_id);
      case 'update':
        return this.cartsService.updateCountForCartProduct(
          job.data,
          job.data.user_id,
        );
      default:
        return Promise.resolve(null);
    }
  }
}
