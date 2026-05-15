import { CreateConfirmDto } from './create-confirm.dto';
import { OrderStatus } from '../utils/order-status';
declare const UpdateConfirmDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateConfirmDto, "card_number" | "carcd_password">>>;
export declare class UpdateConfirmDto extends UpdateConfirmDto_base {
    status: OrderStatus;
}
export {};
