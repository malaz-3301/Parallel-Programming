import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, userId: number) {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId: createFavoriteDto.productId },
    });

    if (existing) {
      throw new ConflictException('The product is already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      userId,
      productId: createFavoriteDto.productId,
    });
    return this.favoriteRepository.save(favorite);
  }

  findAll(userId: number) {
    return this.favoriteRepository.find({
      where: { userId },
      relations: { product: true },
    });
  }

  findOne(id: number, userId: number) {
    return this.favoriteRepository.findOne({
      where: { id, userId },
      relations: { product: true },
    });
  }

  async remove(id: number, userId: number) {
    const result = await this.favoriteRepository.delete({ id, userId });

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return { id, deleted: true };
  }
}
