import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { RemoveFromCart } from './dto/remove-from-cart';
import { AddToCart } from './dto/add-to-cart';
import { UsersService } from 'src/users/users.service';
export declare class CartsService {
    private cartRepository;
    private userProdutsService;
    private userService;
    constructor(cartRepository: Repository<Cart>, userProdutsService: UserProductsService, userService: UsersService);
    create(user_id: number): Promise<Cart>;
    findAll(): Promise<Cart[]>;
    findAllForUser(user_id: number): Promise<Cart[]>;
    findOne(user_id: number): Promise<Cart | null>;
    update(updateCartDto: UpdateCartDto, user_id: number): Promise<import("typeorm").UpdateResult>;
    remove(user_id: number): Promise<import("typeorm").DeleteResult>;
    addToCart(createCartDto: AddToCart, user_id: number): Promise<import("../user-products/entities/user-product.entity").UserProduct>;
    removeFromCart(removeFromCart: RemoveFromCart, user_id: number): Promise<import("typeorm").DeleteResult>;
}
