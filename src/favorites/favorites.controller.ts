import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobType } from './favorites.process';
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService, @InjectQueue('favorite') private favoriteQueue: Queue<JobType>) { }
  @Post()
  async create(@Body() createfavoriteDto: CreateFavoriteDto, @Request() req: { user: User }) {
    await this.favoriteQueue.add('create', { ...createfavoriteDto, user_id: req.user.id });
  }
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.favoritesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.favoritesService.findOne(+id, req.user.id);
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    await this.favoriteQueue.add('remove', { id: +id, user_id: req.user.id });
  }
}
