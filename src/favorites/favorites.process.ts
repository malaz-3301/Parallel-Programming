import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoritesService } from './favorites.service';

export type FavoriteJob =
  | Job<CreateFavoriteDto & { userId: number }, unknown, 'create'>
  | Job<{ id: number; userId: number }, unknown, 'remove'>;

@Processor('favorite', { concurrency: 4 })
export class FavoriteConsumer extends WorkerHost {
  constructor(private readonly favoritesService: FavoritesService) {
    super();
  }

  process(job: FavoriteJob): Promise<unknown> {
    switch (job.name) {
      case 'create':
        return this.favoritesService.create(job.data, job.data.userId);
      case 'remove':
        return this.favoritesService.remove(job.data.id, job.data.userId);
      default:
        return Promise.resolve(null);
    }
  }
}
