import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { Request as Req } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @Post()
  create(@Body() createfavoriteDto: CreateFavoriteDto, @Request() req: { user: User }) {
    return this.favoritesService.create(createfavoriteDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: { user: User }) {
    return this.favoritesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.favoritesService.findOne(+id, req.user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatefavoriteDto: UpdateFavoriteDto, @Request() req :{user: User}) {
  //   return this.favoritesService.update(+id, updatefavoriteDto,user.id);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.favoritesService.remove(+id, req.user.id);
  }
}
