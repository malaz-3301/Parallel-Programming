import { Cart } from "src/carts/entities/cart.entity";
import { OrderStatus } from "../utils/order-status";
export declare class Confirm {
    id: number;
    card_password: string;
    status: OrderStatus;
    card_number: string;
    cart: Cart;
}
