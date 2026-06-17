import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateConfirmDto } from './create-confirm.dto';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { OrderStatus } from '../utils/order-status';

export class UpdateConfirmDto extends PartialType(OmitType(CreateConfirmDto, ['card_password', 'card_number'])) {
    @IsEnum(OrderStatus)
    @IsOptional()
    status!: OrderStatus
}
