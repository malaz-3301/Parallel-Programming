import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { FavoritesService } from './favorites.service';

export type FavoriteJob =
  | Job<CreateFavoriteDto & { user_id: number }, unknown, 'create'>
  | Job<UpdateFavoriteDto & { id: number; user_id: number }, unknown, 'update'>
  | Job<{ id: number; user_id: number }, unknown, 'remove'>;

@Processor('favorite', { concurrency: 4 })
export class FavoriteConsumer extends WorkerHost {
  constructor(private readonly favoritesService: FavoritesService) {
    super();
  }

  process(job: FavoriteJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.favoritesService.create(job.data, job.data.user_id);
      case 'update':
        return this.favoritesService.update(
          job.data.id,
          job.data,
          job.data.user_id,
        );
      case 'remove':
        return this.favoritesService.remove(job.data.id, job.data.user_id);
      default:
        return Promise.resolve(null);
    }
  }
}
