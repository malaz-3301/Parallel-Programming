import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

export type ProductJob =
  | Job<CreateProductDto & { userId: number }, unknown, 'create'>
  | Job<UpdateProductDto & { id: number; userId: number }, unknown, 'update'>
  | Job<{ id: number; userId: number }, unknown, 'remove'>;

@Processor('product', { concurrency: 8 })
export class ProductConsumer extends WorkerHost {
  constructor(private readonly productsService: ProductsService) {
    super();
  }

  process(job: ProductJob): Promise<unknown> {
    switch (job.name) {
      case 'create': {
        const { userId, ...createProductDto } = job.data;
        return this.productsService.create(createProductDto, userId);
      }
      case 'update': {
        const { id, userId, ...updateProductDto } = job.data;
        return this.productsService.update(id, updateProductDto, userId);
      }
      case 'remove':
        return this.productsService.remove(job.data.id, job.data.userId);
      default:
        return Promise.resolve(null);
    }
  }
}
