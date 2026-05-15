import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
export declare class FavoritesService {
    private favoriteRepository;
    constructor(favoriteRepository: Repository<Favorite>);
    create(createfavoriteDto: CreateFavoriteDto, user_id: any): Promise<Favorite>;
    findAll(): Promise<Favorite[]>;
    findOne(id: number, user_id: number): Promise<Favorite | null>;
    remove(id: number, user_id: number): Promise<import("typeorm").DeleteResult>;
}
