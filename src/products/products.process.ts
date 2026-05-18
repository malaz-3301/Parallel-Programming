
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export type JobType = Job<CreateProductDto & { user_id: number }, any, 'create'> | Job<UpdateProductDto & { id: number } & { user_id: number }, any, 'update'> | Job<{ id: number } & { user_id: number }, any, 'remove'>
@Processor('cart', { concurrency: 64 })
export class Useronsumer extends WorkerHost {
    constructor(private productsService: ProductsService) { super() }
    async process(job: JobType): Promise<any> {
        switch (job.name) {
            case 'create': {
                return await this.productsService.create({ ...job.data }, job.data.user_id)
            }
            case 'update': {
                return await this.productsService.update(job.data.id, { ...job.data }, job.data.user_id)
            }
            case 'remove': {
                return await this.productsService.remove(job.data.id, job.data.user_id)
            }
        }
    }
}
