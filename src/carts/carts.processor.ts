import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CartsService } from './carts.service';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';

export type JobType =
  | Job<AddToCart & { user_id: number }, any, 'add'>
  | Job<RemoveFromCart & { user_id: number }, any, 'remove'>
  | Job<AddToCart & { user_id: number }, any, 'update'>;

@Processor('cart', { concurrency: 16 })
export class CartConsumer extends WorkerHost {
  constructor(private readonly cartsService: CartsService) {
    super();
  }

  async process(job: JobType): Promise<any> {
    switch (job.name) {
      case 'add':
        return this.cartsService.addToCart({ ...job.data }, job.data.user_id);
      case 'remove':
        return this.cartsService.removeFromCart({ ...job.data }, job.data.user_id);
      case 'update':
        return this.cartsService.updateCountForCartProduct({ ...job.data }, job.data.user_id);
      default:
        return null;
    }
  }
}
