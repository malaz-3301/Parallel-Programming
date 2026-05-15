import { Cart } from "src/carts/entities/cart.entity";
import { Product } from "src/products/entities/product.entity";
export declare class UserProduct {
    id: number;
    product: Product;
    cart: Cart;
    count: number;
    price: number;
}
