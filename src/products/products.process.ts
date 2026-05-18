import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
<<<<<<< Updated upstream

export type JobType =
  | Job<CreateProductDto & { user_id: number }, any, 'create'>
  | Job<UpdateProductDto & { id: number; user_id: number }, any, 'update'>
  | Job<{ id: number; user_id: number }, any, 'remove'>;

@Processor('product', { concurrency: 8 })
export class ProductConsumer extends WorkerHost {
    constructor(private readonly productsService: ProductsService) {
        super();
    }

=======
export type JobType = Job<CreateProductDto & { user_id: number }, any, 'create'> | Job<UpdateProductDto & { id: number } & { user_id: number }, any, 'update'> | Job<{ id: number } & { user_id: number }, any, 'remove'>
@Processor('product', { concurrency: 64 })
export class ProductConsumer extends WorkerHost {
    constructor(private productsService: ProductsService) { super() }
>>>>>>> Stashed changes
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create':
                return this.productsService.create(job.data, job.data.user_id);

            case 'update':
                return this.productsService.update(job.data.id, job.data, job.data.user_id);

            case 'remove':
                return this.productsService.remove(job.data.id, job.data.user_id);

            default:
                return null;
        }
    }
}