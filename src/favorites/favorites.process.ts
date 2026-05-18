
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { setTimeout } from 'timers/promises';
import { using } from 'rxjs';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { FavoritesService } from './favorites.service';
export type JobType = Job<CreateFavoriteDto & { user_id: number }, any, 'create'> | Job<UpdateFavoriteDto & { id: number } & { user_id: number }, any, 'update'> | Job<{ id: number } & { user_id: number }, any, 'remove'>
@Processor('favorite', { concurrency: 1})
export class FavoriteConsumer extends WorkerHost {
    constructor(private favoritesService: FavoritesService) { super() }
    async process(job: JobType): Promise<any> {
        console.log("dsfhakdj");
        
        switch (job.name) {
            case 'create': {
                console.log("dfjashdfkhadsfkja");
                
                return await this.favoritesService.create({ ...job.data }, job.data.user_id)
            }
            case 'update': {
                return await this.favoritesService.update(job.data.id, { ...job.data }, job.data.user_id)
            }
            case 'remove': {
                return await this.favoritesService.remove(job.data.id, job.data.user_id)
            }
        }
    }
}
