import { Product } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";
export declare class Comment {
    id: number;
    description: string;
    rating: number;
    user: User;
    product: Product;
}
