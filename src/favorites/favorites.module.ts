import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from './entities/favorite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { FavoriteConsumer } from './favorites.process';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), BullModule.registerQueue({
    name: 'favorite',
  }),],
  controllers: [FavoritesController],
  providers: [FavoritesService,FavoriteConsumer],
})
export class FavoritesModule { }
