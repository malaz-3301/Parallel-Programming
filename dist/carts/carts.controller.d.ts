import { CartsService } from './carts.service';
import { User } from 'src/users/entities/user.entity';
import { AddToCart } from './dto/add-to-cart';
import { RemoveFromCart } from './dto/remove-from-cart';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    addToCart(addToCart: AddToCart, req: {
        user: User;
    }): Promise<import("../user-products/entities/user-product.entity").UserProduct | import("typeorm").UpdateResult>;
    removeFromCart(removeFromCart: RemoveFromCart, req: {
        user: User;
    }): Promise<import("typeorm").DeleteResult>;
    updateCountForCartProduct(addToCart: AddToCart, req: {
        user: User;
    }): Promise<import("typeorm").UpdateResult>;
    findAll(req: {
        user: User;
    }): Promise<import("./entities/cart.entity").Cart[]>;
}
