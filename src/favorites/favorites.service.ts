import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { Favorite } from './entities/favorite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository, Transaction } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private favoriteRepository: Repository<Favorite>,) { }
  create(createfavoriteDto: CreateFavoriteDto, user_id) {
    const favorite = this.favoriteRepository.create({ product: { id: createfavoriteDto.productId }, user: { id: user_id } });
    return this.favoriteRepository.save(favorite)
  }

  findAll() {
    return this.favoriteRepository.find();
  }

  findOne(id: number, user_id: number) {
    return this.favoriteRepository.findOne({ where: { id, user: { id: user_id } }, relations: { product: true } })
  }

  async update(id: number, updatefavoriteDto: UpdateFavoriteDto, user_id: number) {
    const favorite = await this.favoriteRepository.findOne({ where: { id, user: { id: user_id } } });
    return this.favoriteRepository.update(id, { ...updatefavoriteDto, user: { id: user_id } });
  }

  remove(id: number, user_id: number) {
    return this.favoriteRepository.delete({ id, user: { id: user_id } })
  }
}
