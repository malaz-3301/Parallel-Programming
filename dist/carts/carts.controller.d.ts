import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/users/entities/user.entity';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    create(req: {
        user: User;
    }): Promise<import("./entities/cart.entity").Cart>;
    findAll(req: {
        user: User;
    }): Promise<import("./entities/cart.entity").Cart[]>;
    findOne(req: {
        user: User;
    }): Promise<import("./entities/cart.entity").Cart | null>;
    update(updateCartDto: UpdateCartDto, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
    remove(req: {
        user: User;
    }): Promise<import("typeorm").DeleteResult>;
}
