import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoritesService } from './favorites.service';
import { FavoriteJob } from './favorites.process';

@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    @InjectQueue('favorite') private readonly favoriteQueue: Queue<FavoriteJob>,
  ) {}

  @Post()
  async create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.favoriteQueue.add('create', {
      ...createFavoriteDto,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.favoritesService.findOne(id, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const job = await this.favoriteQueue.add('remove', {
      id,
      userId: user.id,
    });
    return { status: 'queued', jobId: job.id };
  }
}
