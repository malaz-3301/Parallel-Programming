import { Confirm } from "src/confirms/entities/confirm.entity";
import { User } from "src/users/entities/user.entity";
import { UserProduct } from "src/user-products/entities/user-product.entity";
export declare class Cart {
    id: number;
    user: User;
    userProducts: UserProduct[];
    price: number;
    confirm: Confirm;
}
