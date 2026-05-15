import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { UserProductsService } from 'src/user-products/user-products.service';
import { RemoveFromCart } from './dto/remove-from-cart';
import { AddToCart } from './dto/add-to-cart';
export declare class CartsService {
    private cartRepository;
    private userProdutsService;
    private dataSource;
    constructor(cartRepository: Repository<Cart>, userProdutsService: UserProductsService, dataSource: DataSource);
    create(user_id: number, entityManager: EntityManager): Promise<Cart>;
    findAll(): Promise<Cart[]>;
    findAllForUser(user_id: number, entityManager: EntityManager): Promise<Cart | null>;
    findOne(user_id: number, entityManager: EntityManager): Promise<Cart | null>;
    update(updateCartDto: UpdateCartDto, user_id: number, entityManager: EntityManager): Promise<import("typeorm").UpdateResult>;
    remove(user_id: number, entityManager: EntityManager): Promise<import("typeorm").DeleteResult>;
    addToCart(addToCart: AddToCart, user_id: number): Promise<import("../user-products/entities/user-product.entity").UserProduct | import("typeorm").UpdateResult>;
    updateCountForCartProduct(addToCart: AddToCart, user_id: number): Promise<import("typeorm").UpdateResult>;
    removeFromCart(removeFromCart: RemoveFromCart, user_id: number): Promise<import("typeorm").DeleteResult>;
}
