import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from 'src/users/entities/user.entity';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(createfavoriteDto: CreateFavoriteDto, user: User): Promise<import("./entities/favorite.entity").Favorite>;
    findAll(user: User): Promise<import("./entities/favorite.entity").Favorite[]>;
    findOne(id: string, user: User): Promise<import("./entities/favorite.entity").Favorite | null>;
    remove(id: string, user: User): Promise<import("typeorm").DeleteResult>;
}
