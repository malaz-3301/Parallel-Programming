import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Confirm } from './entities/confirm.entity';
import { Repository } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
export declare class ConfirmsService {
    private confirmRepository;
    private cartsService;
    constructor(confirmRepository: Repository<Confirm>, cartsService: CartsService);
    create(createconfirmDto: CreateConfirmDto, user_id: any): Promise<Confirm>;
    findAll(): Promise<Confirm[]>;
    findOne(id: number): Promise<Confirm | null>;
    findOneForUser(id: number, user_id: number): Promise<Confirm | null>;
    update(id: number, updateconfirmDto: UpdateConfirmDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number, user_id: number): Promise<import("typeorm").DeleteResult>;
}
