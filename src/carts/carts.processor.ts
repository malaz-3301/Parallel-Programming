
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { CartsService } from './carts.service';
import { AddToCart } from './dto/add-to-cart';
// type jobType = AddToCart & { user_id: number }
@Processor('cart')
export class CartConsumer extends WorkerHost {
    constructor(private cartsService: CartsService) { super() }
    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case 'add': {
                const ers = await this.cartsService.addToCart({ ...job.data }, job.data.user_id)
                console.log(ers);

                console.log("dkfjlka");
                break
            }
            case 'remove': {
                await this.cartsService.removeFromCart({ ...job.data }, job.data.user_id)
                break
            }
            case 'update': {
                const jgh = await this.cartsService.updateCountForCartProduct({ ...job.data }, job.data.user_id)
                console.log(jgh);
                
                break
            }
        }
    }
}
